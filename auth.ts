import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import { z } from 'zod'
import { getStringFromBuffer } from './lib/utils'
import { getUser } from './app/login/actions'
import Google from "next-auth/providers/google"
import { fetchCalendarEvents } from './lib/calendar'
import { ensureAccountCreated } from './lib/accounts'

export const { handlers: {GET, POST}, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar',
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    }),
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6)
          })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const user = await getUser(email)

          if (!user) return null

          const encoder = new TextEncoder()
          const saltedPassword = encoder.encode(password + user.salt)
          const hashedPasswordBuffer = await crypto.subtle.digest(
            'SHA-256',
            saltedPassword
          )
          const hashedPassword = getStringFromBuffer(hashedPasswordBuffer)

          if (hashedPassword === user.password) {
            return user
          } else {
            return null
          }
        }

        return null
      }
    })
  ],
  callbacks: {
    async signIn({ account }) {
      if (account?.provider === 'google' && account?.access_token) {
        ensureAccountCreated(account)
        // saveSession(account)
        
        // await fetchCalendarEvents(account.access_token);

        // // Calculate and log the access token expiration date
        // if (account.expires_at) {
        //   const expirationDate = new Date(account.expires_at * 1000);
        //   const currentDate = new Date();
        //   const daysUntilExpiration = Math.ceil((expirationDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
          

        //   // Get the refresh token
        //   console.log('Account:', account);

        //   // Decode and print the payload of the ID token
        //   if (account.id_token) {
        //     const [, payloadBase64] = account.id_token.split('.');
        //     const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
        //     const payload = JSON.parse(payloadJson);
        //     console.log('ID Token Payload:', payload);
        //   } else {
        //     console.log('No ID token available');
        //   }


        //   // Store the refresh token.
        //   // const refreshToken = account.refresh_token;
        //   if (account.refresh_token) {
        //     console.log('Updated access token:', await getUpdatedAccessToken(account.refresh_token));
        //   } else {
        //     console.log('No refresh token available');
        //   }
        // }
      }
      return true;
    },
  }
})
