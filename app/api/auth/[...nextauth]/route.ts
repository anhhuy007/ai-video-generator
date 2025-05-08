// import NextAuth, { NextAuthOptions } from 'next-auth'
// import GoogleProvider from 'next-auth/providers/google'
// import { Session, User, DefaultSession } from 'next-auth'
// import { JWT } from 'next-auth/jwt'
// // app/api/auth/[...nextauth]/route.ts
// declare module 'next-auth' {
//   interface Session extends DefaultSession {
//     user: {
//       id: string
//     } & DefaultSession['user']
//   }
// }

// export const authOptions: NextAuthOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!
//     })
//   ],
//   callbacks: {
//     async signIn({ user }: { user: User }) {
//       await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signin`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           googleId: user.id,
//           email: user.email,
//           name: user.name,
//           avatarUrl: user.image
//         })
//       })

//       return true
//     },
//     async session({ session, token }: { session: Session; token: JWT }) {
//       if (session.user) {
//         session.user.id = token.sub!
//       }
//       return session
//     },
//     async jwt({ token, user }: { token: JWT; user: User }) {
//       if (user) {
//         token.sub = user.id
//       }
//       return token
//     },
//     async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
//       return baseUrl
//     }
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   pages: {
//     signIn: '/auth/signin',
//     error: '/auth/signin'
//   }
// }

// const handler = NextAuth(authOptions)
// export { handler as GET, handler as POST }
import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { Session, User, DefaultSession } from 'next-auth'
import { JWT } from 'next-auth/jwt'
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
    } & DefaultSession['user']
    accessToken?: string
    refreshToken?: string
    error?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub: string
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    error?: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // Scope cho YouTube API và các scope hiện tại
          scope:
            'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }: { user: User; account: any }) {
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
    async jwt({
      token,
      account,
      user
    }: {
      token: JWT
      account: any
      user: User
    }) {
      if (account && user) {
        token.sub = user.id
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at ? account.expires_at * 1000 : 0
      }

      if (token.expiresAt && Date.now() > token.expiresAt) {
        try {
          const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID!,
              client_secret: process.env.GOOGLE_CLIENT_SECRET!,
              grant_type: 'refresh_token',
              refresh_token: token.refreshToken as string
            })
          })

          const tokens = await response.json()
          if (!response.ok) throw tokens

          token.accessToken = tokens.access_token
          token.expiresAt = Date.now() + tokens.expires_in * 1000
        } catch (error) {
          console.error('Error refreshing access token', error)
          token.error = 'RefreshAccessTokenError'
        }
      }

      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.sub
      }

      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      session.error = token.error

      return session
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
