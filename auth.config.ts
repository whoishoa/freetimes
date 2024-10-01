import type { NextAuthConfig } from 'next-auth'
import { User } from '@/lib/types'
import { kv } from '@vercel/kv'

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login',
    newUser: '/signup'
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnLoginPage = nextUrl.pathname.startsWith('/login')
      const isOnSignupPage = nextUrl.pathname.startsWith('/signup')
      
      if (isLoggedIn) {
        if (isOnLoginPage || isOnSignupPage) {
          // if (auth.user && auth.user.email) {
          //   const user = await kv.hgetall<User>(`user:${auth.user.email}`)
          //   if (user && !user.hasCalSetup ) {
          //     return Response.redirect(new URL('/s/connect', nextUrl))
          //   }
          // }
          return Response.redirect(new URL('/', nextUrl))
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token = { ...token, id: user.id }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        const { id } = token as { id: string }
        const { user } = session
        session = { ...session, user: { ...user, id } }
      }
      return session
    }
  },
  providers: []
} satisfies NextAuthConfig
