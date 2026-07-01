// apps/web/src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// LeetTrack uses the NestJS backend's own Google OAuth flow (apps/api/src/auth)
// rather than NextAuth's Google provider, because the backend needs to own
// user creation, role assignment, and JWT issuance. This NextAuth instance
// simply stores the backend-issued JWT in the session so client components
// can read it via useSession().

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'LeetTrack',
      credentials: {
        accessToken: { label: 'Access Token', type: 'text' },
        refreshToken: { label: 'Refresh Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.accessToken) return null;

        // Validate token against backend and fetch user profile
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${credentials.accessToken}` },
        });
        if (!res.ok) return null;

        const user = await res.json();
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatarUrl,
          role: user.role,
          accessToken: credentials.accessToken,
          refreshToken: credentials.refreshToken,
        } as any;
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 7 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.role = token.role as string;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
