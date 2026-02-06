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
    }
  }

  interface User {
    isPremium: boolean
    premiumUntil?: string | null
    plan: string
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isPremium: boolean
    premiumUntil?: string | null
    plan: string
    role: string
  }
}
