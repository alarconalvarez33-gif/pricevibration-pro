import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAIL = 'raul@sacredlevels.com'
const SIGNAL_LIMIT = 3
const FEATURE = 'signal-hub'

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

function hashIp(ip: string): string {
  let h = 0
  for (let i = 0; i < ip.length; i++) {
    h = ((h << 5) - h) + ip.charCodeAt(i)
    h |= 0
  }
  return 'sig_' + Math.abs(h).toString(36)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  // ── Guest: increment via IP in FreeUsage ─────────────────────────────────
  if (!session?.user?.email) {
    const ip = getIp(req)
    const fingerprint = hashIp(ip)
    try {
      const existing = await prisma.freeUsage.findUnique({
        where: { fingerprint_feature: { fingerprint, feature: FEATURE } },
      })
      if (!existing) {
        await prisma.freeUsage.create({ data: { fingerprint, ip, feature: FEATURE, usageCount: 1 } })
      } else if (existing.usageCount < SIGNAL_LIMIT) {
        await prisma.freeUsage.update({
          where: { fingerprint_feature: { fingerprint, feature: FEATURE } },
          data: { usageCount: { increment: 1 }, lastUsedAt: new Date() },
        })
      }
    } catch { /* non-critical */ }
    return NextResponse.json({ success: true })
  }

  // ── Logged-in user ────────────────────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, plan: true, role: true, signalsViewed: true, isPremium: true, premiumUntil: true, subscriptionStatus: true, email: true },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (user.email === ADMIN_EMAIL || user.role === 'admin') {
    return NextResponse.json({ success: true, viewed: user.signalsViewed })
  }

  const hasPlanFlag = ['quantum', 'signal_hub', 'pro', 'whale', 'ser', 'ser-plus'].includes(user.plan)
  const isStillValid = user.premiumUntil ? user.premiumUntil > new Date() : false
  const isNotExpired = user.subscriptionStatus !== 'expired' && user.subscriptionStatus !== 'inactive'
  const isPro = (hasPlanFlag || user.isPremium === true) && isStillValid && isNotExpired

  if (isPro) return NextResponse.json({ success: true, viewed: user.signalsViewed })

  if (user.signalsViewed >= SIGNAL_LIMIT) return NextResponse.json({ success: true, viewed: user.signalsViewed })

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { signalsViewed: { increment: 1 } },
    select: { signalsViewed: true },
  })

  return NextResponse.json({ success: true, viewed: updated.signalsViewed })
}
