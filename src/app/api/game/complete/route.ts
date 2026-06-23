import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { prisma } from '@/src/lib/prisma';
import { Prisma } from '@prisma/client';
import { headers } from 'next/headers';
import { z } from 'zod';
import { apiError } from '@/src/lib/apiErrors';
import { checkRateLimit } from '@/src/lib/rateLimit';

// Schema for input validation
const guessSchema = z.object({
  guess: z.string().regex(/^\d{4}$/, 'Each guess must be exactly a 4-digit numeric string.'),
  bulls: z.number().int().min(0).max(4),
  cows: z.number().int().min(0).max(4),
});

const gameCompleteSchema = z.object({
  isWinner: z.boolean(),
  durationSeconds: z.number().int().min(1, 'Duration must be at least 1 second.').max(86400, 'Duration cannot exceed 24 hours.'),
  guesses: z.array(guessSchema).min(1, 'At least one guess must be submitted.'),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return apiError('Unauthorized', 401);
  }

  const userId = session.user.id;
  const reqHeaders = await headers();
  const ipAddress = reqHeaders.get('x-forwarded-for')?.split(',')[0] || reqHeaders.get('x-real-ip') || '127.0.0.1';

  // 1. Rate Limiting: Max 20 submissions per minute per IP
  const rateLimitResult = checkRateLimit(ipAddress, 20, 60 * 1000);
  if (!rateLimitResult.success) {
    const response = apiError('Too Many Requests. Rate limit exceeded.', 429);
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
    return response;
  }

  try {
    const rawBody = await req.json();
    
    // 2. Input validation using Zod
    const parsedBody = gameCompleteSchema.safeParse(rawBody);
    if (!parsedBody.success) {
      return apiError('Invalid request parameters', 400, parsedBody.error.format());
    }

    const { isWinner, durationSeconds, guesses } = parsedBody.data;

    // 3. Game state verification (tamper protection)
    const lastGuess = guesses[guesses.length - 1];
    if (isWinner && lastGuess.bulls !== 4) {
      console.warn(`Game state conflict: user ${userId} marked as winner but last guess is not 4 bulls.`);
      return apiError('Game state conflict: Marked as winner but last guess was not correct.', 400);
    }
    
    if (!isWinner && guesses.some((g) => g.bulls === 4)) {
      console.warn(`Game state conflict: user ${userId} marked as loser but a guess had 4 bulls.`);
      return apiError('Game state conflict: Marked as loser but a correct guess exists in history.', 400);
    }

    // 4. Secure DB updates in transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Create the GameSession
      const gameSession = await tx.gameSession.create({
        data: {
          userId,
          attempts: guesses.length,
          durationSeconds,
          isCompleted: true,
          isWinner,
          startedAt: new Date(Date.now() - durationSeconds * 1000),
          completedAt: new Date(),
        },
      });

      // 2. Create the Guess records
      if (guesses.length > 0) {
        await tx.guess.createMany({
          data: guesses.map((g) => ({
            sessionId: gameSession.id,
            guessedNumber: g.guess,
            bulls: g.bulls,
            cows: g.cows,
          })),
        });
      }

      // 3. Update User statistics
      const dbUser = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!dbUser) {
        throw new Error('User not found');
      }

      const newGamesPlayed = dbUser.gamesPlayed + 1;
      const newGamesWon = isWinner ? dbUser.gamesWon + 1 : dbUser.gamesWon;
      const newTotalAttempts = dbUser.totalAttempts + guesses.length;
      
      let newBestAttempts = dbUser.bestAttempts;
      if (isWinner) {
        if (dbUser.bestAttempts === null || guesses.length < dbUser.bestAttempts) {
          newBestAttempts = guesses.length;
        }
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          gamesPlayed: newGamesPlayed,
          gamesWon: newGamesWon,
          totalAttempts: newTotalAttempts,
          bestAttempts: newBestAttempts,
        },
      });

      return gameSession;
    });

    const response = NextResponse.json({ success: true, sessionId: result.id });
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
    return response;
  } catch (error) {
    console.error('Error completing game:', error);
    return apiError('Internal Server Error', 500);
  }
}

