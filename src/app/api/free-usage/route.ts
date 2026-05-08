import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const LIMITS: Record<string, number> = {
  'gann':         3,
  'gann-aurea':   3,
  'gann-quantum': 3,
  'signal-hub':   3,
  'ser':          5,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fingerprint, feature = 'gann' } = body

    if (!fingerprint || typeof fingerprint !== 'string' || fingerprint.length < 4) {
      return NextResponse.json({ allowed: false, remaining: 0 }, { status: 400 })
    }

    const limit = LIMITS[feature] ?? 3

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Check by fingerprint + feature (primary: same device)
    const byFingerprint = await prisma.freeUsage.findUnique({
      where: { fingerprint_feature: { fingerprint, feature } },
    })

    if (byFingerprint && byFingerprint.usageCount >= limit) {
      return NextResponse.json({ allowed: false, remaining: 0 })
    }

    // Check by IP + feature (secondary: same network, cleared storage)
    if (ip !== 'unknown') {
      const byIp = await prisma.freeUsage.findFirst({
        where: { ip, feature },
        orderBy: { usageCount: 'desc' },
      })
      if (byIp && byIp.usageCount >= limit) {
        return NextResponse.json({ allowed: false, remaining: 0 })
      }
    }

    // Create or increment
    if (!byFingerprint) {
      await prisma.freeUsage.create({ data: { fingerprint, ip, feature, usageCount: 1 } })
      return NextResponse.json({ allowed: true, remaining: limit - 1 })
    }

    const newCount = byFingerprint.usageCount + 1
    await prisma.freeUsage.update({
      where: { fingerprint_feature: { fingerprint, feature } },
      data: { usageCount: newCount, lastUsedAt: new Date(), ip },
    })

    return NextResponse.json({ allowed: true, remaining: Math.max(0, limit - newCount) })
  } catch (error) {
    console.error('[free-usage] error:', error)
    return NextResponse.json({ allowed: true, remaining: 1 })
  }
}
