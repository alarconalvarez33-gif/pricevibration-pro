import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const LIMITS: Record<string, number> = {
  'gann':         3,
  'gann-aurea':   3,
  'gann-quantum': 3,
  'signal-hub':   3,
  'ser':          5,
}

// Read-only: returns remaining uses without incrementing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fingerprint, feature = 'gann' } = body

    if (!fingerprint || typeof fingerprint !== 'string' || fingerprint.length < 4) {
      return NextResponse.json({ allowed: true, remaining: LIMITS[feature] ?? 3 })
    }

    const limit = LIMITS[feature] ?? 3

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const [byFp, byIp] = await Promise.all([
      prisma.freeUsage.findUnique({ where: { fingerprint_feature: { fingerprint, feature } } }),
      ip !== 'unknown'
        ? prisma.freeUsage.findFirst({ where: { ip, feature }, orderBy: { usageCount: 'desc' } })
        : Promise.resolve(null),
    ])

    const maxUsed = Math.max(byFp?.usageCount ?? 0, byIp?.usageCount ?? 0)
    const remaining = Math.max(0, limit - maxUsed)

    return NextResponse.json({ allowed: remaining > 0, remaining })
  } catch {
    return NextResponse.json({ allowed: true, remaining: 3 })
  }
}
