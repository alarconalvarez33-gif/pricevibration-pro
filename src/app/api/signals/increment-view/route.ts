import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAIL = 'raul@sacredlevels.com'

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, plan: true, role: true, signalsViewed: true, isPremium: true, premiumUntil: true, subscriptionStatus: true, email: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // No incrementar para admin
  if (user.email === ADMIN_EMAIL || user.role === 'admin') {
    return NextResponse.json({ success: true, viewed: user.signalsViewed })
  }

  // No incrementar para usuarios Quantum Access activos
  const hasPlanFlag = ['quantum', 'signal_hub', 'pro', 'whale'].includes(user.plan)
  const hasPremiumFlag = user.isPremium === true
  const isStillValid = user.premiumUntil ? user.premiumUntil > new Date() : false
  const isNotExpired = user.subscriptionStatus !== 'expired' && user.subscriptionStatus !== 'inactive'
  const isPro = (hasPlanFlag || hasPremiumFlag) && isStillValid && isNotExpired

  if (isPro) {
    return NextResponse.json({ success: true, viewed: user.signalsViewed })
  }

  // No incrementar si ya llegó al límite
  if (user.signalsViewed >= 3) {
    return NextResponse.json({ success: true, viewed: user.signalsViewed })
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { signalsViewed: { increment: 1 } },
    select: { signalsViewed: true },
  })

  return NextResponse.json({ success: true, viewed: updated.signalsViewed })
}
