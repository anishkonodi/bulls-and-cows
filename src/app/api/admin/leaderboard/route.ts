import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { prisma } from '@/src/lib/prisma';
import { apiError } from '@/src/lib/apiErrors';
import { checkRateLimit } from '@/src/lib/rateLimit';
import { logAudit } from '@/src/lib/audit';
import { headers } from 'next/headers';

export async function GET(req: NextRequest) {
  const session = await auth();
  const reqHeaders = await headers();
  const ipAddress = reqHeaders.get('x-forwarded-for')?.split(',')[0] || reqHeaders.get('x-real-ip') || '127.0.0.1';
  const userAgent = reqHeaders.get('user-agent') || 'Unknown';

  // 1. Rate Limiting: Max 30 request per minute per IP
  const rateLimitResult = checkRateLimit(ipAddress, 30, 60 * 1000);
  if (!rateLimitResult.success) {
    await logAudit({
      userId: session?.user?.id,
      action: 'RATE_LIMIT_VIOLATION',
      ipAddress,
      userAgent,
      metadata: { endpoint: '/api/admin/leaderboard' },
    });
    const response = apiError('Too Many Requests', 429);
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
    return response;
  }

  // 2. Authentication Check
  if (!session || !session.user || !session.user.email) {
    return apiError('Unauthorized', 401);
  }

  // 3. Authorization Check
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase());

  if (!adminEmails.includes(session.user.email.toLowerCase())) {
    await logAudit({
      userId: session.user.id,
      action: 'SUSPICIOUS_ACTIVITY',
      ipAddress,
      userAgent,
      metadata: { reason: 'Unauthorized attempt to query admin leaderboard.' },
    });
    return apiError('Forbidden', 403);
  }

  try {
    // Get winning game sessions, ordered by lowest attempts and then fastest duration
    const leaderboard = await prisma.gameSession.findMany({
      where: {
        isWinner: true,
        isCompleted: true,
        durationSeconds: { not: null },
      },
      orderBy: [
        { attempts: 'asc' },
        { durationSeconds: 'asc' },
      ],
      take: 50,
      select: {
        id: true,
        attempts: true,
        durationSeconds: true,
        startedAt: true,
        user: {
          select: {
            name: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    });

    const response = NextResponse.json({ leaderboard });
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
    return response;
  } catch (error) {
    console.error('Error fetching admin leaderboard:', error);
    return apiError('Internal Server Error', 500);
  }
}
