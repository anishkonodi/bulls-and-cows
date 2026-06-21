import { auth } from './auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Protect admin dashboard pages and administrative API endpoints
  if (nextUrl.pathname.startsWith('/admin') || nextUrl.pathname.startsWith('/api/admin')) {
    if (!isLoggedIn) {
      if (nextUrl.pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/', nextUrl));
    }

    // Authorization check: Verify email is present in the admin list
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase());
    
    const userEmail = req.auth?.user?.email?.toLowerCase();

    if (!userEmail || !adminEmails.includes(userEmail)) {
      console.warn(`Unauthorized access attempt by ${userEmail || 'unknown user'} on ${nextUrl.pathname}`);
      if (nextUrl.pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/', nextUrl));
    }
  }

  // Protect internal game session API endpoints
  if (nextUrl.pathname.startsWith('/api/game')) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
});

// Match all requests except static files, favicon, and NextAuth routes
export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
