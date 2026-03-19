import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const SIGNAL_LIMIT = 3

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ canView: false, reason: 'unauthenticated', viewed: 0, limit: SIGNAL_LIMIT })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { plan: true, role: true, signalsViewed: true },
  })

  if (!user) {
    return NextResponse.json({ canView: false, reason: 'unauthenticated', viewed: 0, limit: SIGNAL_LIMIT })
  }

  const isPro = user.plan === 'quantum' || user.plan === 'signal_hub' || user.plan === 'pro' || user.plan === 'whale' || user.role === 'admin'

  if (isPro) {
    return NextResponse.json({ canView: true, isPro: true, viewed: user.signalsViewed, limit: SIGNAL_LIMIT })
  }

  const canView = user.signalsViewed < SIGNAL_LIMIT

  return NextResponse.json({
    canView,
    isPro: false,
    viewed: user.signalsViewed,
    limit: SIGNAL_LIMIT,
    reason: canView ? undefined : 'limit_reached',
  })
}
