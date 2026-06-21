import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './lib/prisma';
import { env } from './lib/env';
import { logAudit } from './lib/audit';
import { headers } from 'next/headers';
import { userAgent } from 'next/server';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutes inactivity timeout
    updateAge: 5 * 60, // Update token frequency (5 minutes)
  },
  cookies: {
    sessionToken: {
      name: env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: env.NODE_ENV === 'production',
        // By NOT setting maxAge here, it is a session cookie that expires on browser/tab close
      },
    },
  },
  events: {
    async signOut(message) {
      // Log user logout audit event
      if ('token' in message && message.token) {
        const token = message.token as { id?: string };
        if (token.id) {
          try {
            const reqHeaders = await headers();
            const ipAddress = reqHeaders.get('x-forwarded-for')?.split(',')[0] || reqHeaders.get('x-real-ip') || '127.0.0.1';
            const userAgentStr = reqHeaders.get('user-agent') || 'Unknown';

            await logAudit({
              userId: token.id,
              action: 'USER_LOGOUT',
              ipAddress,
              userAgent: userAgentStr,
              metadata: {
                method: 'Google Sign Out',
              },
            });
          } catch (err) {
            console.error('Error logging user logout:', err);
          }
        }
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      // Security Check: Enforce email verification status from Google profile
      if (profile && 'email_verified' in profile && !profile.email_verified) {
        console.warn(`Sign-in rejected: Email is not verified for Google user ${user.email}`);
        return false;
      }

      try {
        const reqHeaders = await headers();
        const ipAddress = reqHeaders.get('x-forwarded-for')?.split(',')[0] || reqHeaders.get('x-real-ip') || '127.0.0.1';
        const userAgentStr = reqHeaders.get('user-agent') || '';

        const ua = userAgent({ headers: reqHeaders });
        const browser = ua.browser.name || null;
        const operatingSystem = ua.os.name || null;
        const deviceType = ua.device.type || 'desktop';

        const country = reqHeaders.get('x-vercel-ip-country') || null;
        const region = reqHeaders.get('x-vercel-ip-country-region') || null;
        const city = reqHeaders.get('x-vercel-ip-city') || null;
        const timezone = reqHeaders.get('x-vercel-ip-timezone') || null;

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        let dbUser;
        const nameParts = user.name ? user.name.split(' ') : [];
        const firstName = nameParts[0] || null;
        const lastName = nameParts.slice(1).join(' ') || null;

        if (existingUser) {
          dbUser = await prisma.user.update({
            where: { email: user.email },
            data: {
              googleId: account?.providerAccountId || existingUser.googleId,
              name: user.name || existingUser.name,
              firstName: firstName || existingUser.firstName,
              lastName: lastName || existingUser.lastName,
              profilePicture: user.image || existingUser.profilePicture,
              emailVerified: true,
              lastLoginAt: new Date(),
              ipAddress,
              userAgent: userAgentStr,
              browser,
              operatingSystem,
              deviceType,
              country,
              region,
              city,
              timezone,
            },
          });
        } else {
          dbUser = await prisma.user.create({
            data: {
              googleId: account?.providerAccountId,
              email: user.email,
              name: user.name,
              firstName,
              lastName,
              profilePicture: user.image,
              emailVerified: true,
              firstLoginAt: new Date(),
              lastLoginAt: new Date(),
              ipAddress,
              userAgent: userAgentStr,
              browser,
              operatingSystem,
              deviceType,
              country,
              region,
              city,
              timezone,
            },
          });
        }

        // Log USER_LOGIN using centralized logger
        await logAudit({
          userId: dbUser.id,
          action: 'USER_LOGIN',
          ipAddress,
          userAgent: userAgentStr,
          metadata: {
            method: 'Google OAuth',
            email: user.email,
          },
        });

        // Mutate the user object so the id propagates to jwt callback
        user.id = dbUser.id;
        return true;
      } catch (error) {
        console.error('Error during sign in:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
