import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      isPremium: boolean
      premiumUntil?: string | null
      plan: string
      role: string
      trialUses: number
      trialExpired: boolean
    }
  }

  interface User {
    isPremium: boolean
    premiumUntil?: string | null
    plan: string
    role: string
    trialUses: number
    trialExpired: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isPremium: boolean
    premiumUntil?: string | null
    plan: string
    role: string
    trialUses: number
    trialExpired: boolean
  }
}
