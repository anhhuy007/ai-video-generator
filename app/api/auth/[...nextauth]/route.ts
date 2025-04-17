import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { Session, User, DefaultSession } from 'next-auth'
import { JWT } from 'next-auth/jwt'
// app/api/auth/[...nextauth]/route.ts
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
    } & DefaultSession['user']
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  callbacks: {
    async signIn({ user }: { user: User }) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleId: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.image
        })
      })
      
      return true
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.sub!
      }
      return session
    },
    async jwt({ token, user }: { token: JWT; user: User }) {
      if (user) { 
          
          token.sub = user.id
        }
      return token
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      return baseUrl
    }

  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin'
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
