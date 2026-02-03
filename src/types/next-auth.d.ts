import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      isPremium: boolean
      premiumUntil?: string | null
    }
  }

  interface User {
    isPremium: boolean
    premiumUntil?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isPremium: boolean
    premiumUntil?: string | null
  }
}
