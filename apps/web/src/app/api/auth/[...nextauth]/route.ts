// apps/web/src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// LeetTrack uses the NestJS backend's own Google OAuth flow (apps/api/src/auth)
// rather than NextAuth's Google provider, because the backend needs to own
// user creation, role assignment, and JWT issuance. This NextAuth instance
// simply stores the backend-issued JWT in the session so client components
// can read it via useSession().

// ─── Dev Bypass Users (only used in development) ───────────────────────────
// These match the seeded users from apps/api/src/prisma/seed.ts
const DEV_USERS: Record<string, { id: string; name: string; email: string; image: string; role: string }> = {
  TEACHER: {
    id: 'dev-teacher-001',
    name: 'Demo Teacher',
    email: 'teacher@demo.com',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher',
    role: 'TEACHER',
  },
  STUDENT: {
    id: 'dev-student-001',
    name: 'Demo Student',
    email: 'student@demo.com',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student',
    role: 'STUDENT',
  },
};

const providers: NextAuthOptions['providers'] = [
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
];

// In development, add a bypass provider that skips Google OAuth entirely
if (process.env.NODE_ENV === 'development') {
  providers.push(
    CredentialsProvider({
      id: 'dev-bypass',
      name: 'Dev Bypass',
      credentials: {
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        const role = credentials?.role as string;
        const devUser = DEV_USERS[role];
        if (!devUser) return null;
        return {
          ...devUser,
          accessToken: 'dev-bypass-token',
          refreshToken: 'dev-bypass-refresh',
        } as any;
      },
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
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
