import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { apiError } from '@/src/lib/apiErrors';
import { checkRateLimit } from '@/src/lib/rateLimit';
import { headers } from 'next/headers';

export async function GET(_req: NextRequest) {
  const session = await auth();
  const reqHeaders = await headers();
  const ipAddress = reqHeaders.get('x-forwarded-for')?.split(',')[0] || reqHeaders.get('x-real-ip') || '127.0.0.1';

  // 1. Rate Limiting: Max 30 requests per minute per IP
  const rateLimitResult = checkRateLimit(ipAddress, 30, 60 * 1000);
  if (!rateLimitResult.success) {
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
    console.warn(`Unauthorized attempt to query admin recent activity by ${session.user.email}`);
    return apiError('Forbidden', 403);
  }

  try {
    const response = NextResponse.json({ recentActivity: [] });
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
    return response;
  } catch (error) {
    console.error('Error fetching admin recent activity:', error);
    return apiError('Internal Server Error', 500);
  }
}

