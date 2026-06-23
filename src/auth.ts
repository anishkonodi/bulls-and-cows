import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './lib/prisma';
import { env } from './lib/env';

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
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      // Security Check: Enforce email verification status from Google profile
      if (profile && 'email_verified' in profile && !profile.email_verified) {
        console.warn(`Sign-in rejected: Email is not verified for Google user ${user.email}`);
        return false;
      }

      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        let dbUser;

        if (existingUser) {
          dbUser = await prisma.user.update({
            where: { email: user.email },
            data: {
              name: user.name || existingUser.name,
            },
          });
        } else {
          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
            },
          });
        }

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

