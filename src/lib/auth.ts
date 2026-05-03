import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

const isProduction = process.env.NODE_ENV === 'production'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          throw new Error('User not found')
        }

        if (!user.password) {
          throw new Error('Esta cuenta usa Google. Iniciá sesión con Google.')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error('Invalid password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isPremium: user.isPremium,
          premiumUntil: user.premiumUntil?.toISOString() || null,
          plan: user.plan,
          role: user.role,
          trialUses: user.trialUses,
          trialExpired: user.trialExpired,
          cursoPurchased: user.cursoPurchased,
          subscriptionStatus: user.subscriptionStatus,
          autoRenew: user.autoRenew,
          nextBillingDate: user.nextBillingDate?.toISOString() || null,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: isProduction ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const existing = await prisma.user.findUnique({ where: { email: user.email! } })
        if (!existing) {
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name || '',
              password: null,
            },
          })
        }
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      if (url.includes('/login') || url.includes('/register') || url.includes('/api/auth')) {
        return `${baseUrl}/dashboard`
      }
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (url.startsWith(baseUrl)) return url
      return `${baseUrl}/dashboard`
    },
    async jwt({ token, user, account }) {
      if (user && account?.provider === 'google') {
        // For Google OAuth, fetch the DB user to get custom fields
        const dbUser = await prisma.user.findUnique({ where: { email: token.email! } })
        if (dbUser) {
          token.sub = dbUser.id
          token.isPremium = dbUser.isPremium
          token.premiumUntil = dbUser.premiumUntil?.toISOString() || null
          token.plan = dbUser.plan
          token.role = dbUser.role
          token.trialUses = dbUser.trialUses
          token.trialExpired = dbUser.trialExpired
          token.cursoPurchased = dbUser.cursoPurchased
          token.subscriptionStatus = dbUser.subscriptionStatus
          token.autoRenew = dbUser.autoRenew
          token.nextBillingDate = dbUser.nextBillingDate?.toISOString() || null
        }
      } else if (user) {
        token.isPremium = (user as any).isPremium
        token.premiumUntil = (user as any).premiumUntil
        token.plan = (user as any).plan
        token.role = (user as any).role
        token.trialUses = (user as any).trialUses
        token.trialExpired = (user as any).trialExpired
        token.cursoPurchased = (user as any).cursoPurchased
        token.subscriptionStatus = (user as any).subscriptionStatus
        token.autoRenew = (user as any).autoRenew
        token.nextBillingDate = (user as any).nextBillingDate
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const user = session.user as any
        user.id = token.sub ?? ''
        user.isPremium = token.isPremium
        user.premiumUntil = token.premiumUntil
        user.plan = token.plan
        user.role = token.role
        user.trialUses = token.trialUses
        user.trialExpired = token.trialExpired
        user.cursoPurchased = token.cursoPurchased
        user.subscriptionStatus = token.subscriptionStatus
        user.autoRenew = token.autoRenew
        user.nextBillingDate = token.nextBillingDate
      }
      return session
    }
  }
}
