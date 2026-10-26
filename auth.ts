import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    ...(googleClientId && googleClientSecret
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
    Credentials({
      id: 'demo-login',
      name: 'Open Source Demo / Guest',
      credentials: {
        personaId: { label: 'Persona ID', type: 'text' },
        name: { label: 'Full Name', type: 'text' },
        email: { label: 'Email Address', type: 'email' },
        role: { label: 'Campus Role', type: 'text' },
        avatar: { label: 'Avatar URL', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const personaId = (credentials.personaId as string) || 'aman';
        const name = (credentials.name as string) || 'Aman Sharma';
        const email = (credentials.email as string) || `${personaId}@campus.squadpulse.org`;
        const role = (credentials.role as string) || 'CSE 3rd Year • Flatmate';
        
        let avatar = (credentials.avatar as string) || '';
        if (!avatar) {
          if (personaId === 'rhea') {
            avatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150';
          } else if (personaId === 'dev') {
            avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
          } else if (personaId === 'tanvi') {
            avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
          } else {
            avatar = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150';
          }
        }

        return {
          id: personaId,
          name,
          email,
          image: avatar,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.provider = account?.provider || 'demo-login';
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id || token.sub;
        (session.user as any).provider = token.provider || 'demo-login';
      }
      return session;
    },
  },
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'squadpulse-free-open-source-secure-auth-secret-key-32chars',
});
