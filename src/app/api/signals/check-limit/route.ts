import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTrialState } from '@/lib/services/trial-access'

const SIGNAL_LIMIT = 3
const ADMIN_EMAIL = 'raul@sacredlevels.com'
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

async function getGuestViewed(ip: string, fingerprint: string): Promise<number> {
  const [byFp, byIp] = await Promise.all([
    prisma.freeUsage.findUnique({ where: { fingerprint_feature: { fingerprint, feature: FEATURE } } }),
    ip !== 'unknown'
      ? prisma.freeUsage.findFirst({ where: { ip, feature: FEATURE }, orderBy: { usageCount: 'desc' } })
      : Promise.resolve(null),
  ])
  return Math.max(byFp?.usageCount ?? 0, byIp?.usageCount ?? 0)
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  // ── 24h trial fast-path: anyone (anonymous or registered) inside the
  //    trial window gets unlimited signal access.
  const trial = await getTrialState(req)
  if (trial.inTrial && !trial.isPremium) {
    return NextResponse.json({
      canView: true,
      isPro: true,           // treat trial as pro for UI-gating purposes
      inTrial: true,
      trialEndsAt: trial.trialEndsAt,
      viewed: 0,
      limit: SIGNAL_LIMIT,
    })
  }

  // ── Logged-in user ────────────────────────────────────────────────────────
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { plan: true, role: true, signalsViewed: true, isPremium: true, premiumUntil: true, subscriptionStatus: true, email: true },
    })

    if (!user) {
      return NextResponse.json({ canView: false, reason: 'unauthenticated', viewed: 0, limit: SIGNAL_LIMIT })
    }

    if (user.email === ADMIN_EMAIL || user.role === 'admin') {
      return NextResponse.json({ canView: true, isPro: true, viewed: user.signalsViewed, limit: SIGNAL_LIMIT })
    }

    const hasPlanFlag = ['quantum', 'signal_hub', 'pro', 'whale', 'ser', 'ser-plus'].includes(user.plan)
    const isStillValid = user.premiumUntil ? user.premiumUntil > new Date() : false
    const isNotExpired = user.subscriptionStatus !== 'expired' && user.subscriptionStatus !== 'inactive'
    const isPro = (hasPlanFlag || user.isPremium === true) && isStillValid && isNotExpired

    if (isPro) {
      return NextResponse.json({ canView: true, isPro: true, viewed: user.signalsViewed, limit: SIGNAL_LIMIT, subscriptionExpiresAt: user.premiumUntil?.toISOString() })
    }

    const canView = user.signalsViewed < SIGNAL_LIMIT
    return NextResponse.json({ canView, isPro: false, viewed: user.signalsViewed, limit: SIGNAL_LIMIT, reason: canView ? undefined : 'limit_reached' })
  }

  // ── Guest (no session) — track by IP via FreeUsage ───────────────────────
  const ip = getIp(req)
  const fingerprint = hashIp(ip)
  const viewed = await getGuestViewed(ip, fingerprint).catch(() => 0)

  const canView = viewed < SIGNAL_LIMIT
  return NextResponse.json({
    canView,
    isPro: false,
    viewed,
    limit: SIGNAL_LIMIT,
    reason: canView ? 'guest' : 'limit_reached',
    isGuest: true,
  })
}
