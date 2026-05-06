import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const SIGNAL_LIMIT = 3
const ADMIN_EMAIL = 'raul@sacredlevels.com'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ canView: false, reason: 'unauthenticated', viewed: 0, limit: SIGNAL_LIMIT })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { plan: true, role: true, signalsViewed: true, isPremium: true, premiumUntil: true, subscriptionStatus: true, email: true },
  })

  if (!user) {
    return NextResponse.json({ canView: false, reason: 'unauthenticated', viewed: 0, limit: SIGNAL_LIMIT })
  }

  // Admin bypass
  if (user.email === ADMIN_EMAIL || user.role === 'admin') {
    return NextResponse.json({ canView: true, isPro: true, viewed: user.signalsViewed, limit: SIGNAL_LIMIT })
  }

  // Verificar si tiene Quantum Access activo:
  // 1. plan === 'quantum' (o signal_hub / pro / whale)
  // 2. isPremium === true
  // 3. premiumUntil es futuro
  // 4. subscriptionStatus === 'active' (o cancelled pero aún vigente)
  const hasPlanFlag = ['quantum', 'signal_hub', 'pro', 'whale'].includes(user.plan)
  const hasPremiumFlag = user.isPremium === true
  const isStillValid = user.premiumUntil ? user.premiumUntil > new Date() : false
  const isNotExpired = user.subscriptionStatus !== 'expired' && user.subscriptionStatus !== 'inactive'

  const isPro = (hasPlanFlag || hasPremiumFlag) && isStillValid && isNotExpired

  if (isPro) {
    return NextResponse.json({
      canView: true,
      isPro: true,
      viewed: user.signalsViewed,
      limit: SIGNAL_LIMIT,
      subscriptionExpiresAt: user.premiumUntil?.toISOString(),
    })
  }

  // Usuario free: 3 vistas gratuitas
  const canView = user.signalsViewed < SIGNAL_LIMIT

  return NextResponse.json({
    canView,
    isPro: false,
    viewed: user.signalsViewed,
    limit: SIGNAL_LIMIT,
    reason: canView ? undefined : 'limit_reached',
  })
}
