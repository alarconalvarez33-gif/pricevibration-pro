import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const FREE_LIMIT = 3

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fingerprint } = body

    if (!fingerprint || typeof fingerprint !== 'string' || fingerprint.length < 4) {
      return NextResponse.json({ allowed: false, remaining: 0 }, { status: 400 })
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Check by fingerprint first (catches same device, different network)
    const byFingerprint = await prisma.freeUsage.findFirst({
      where: { fingerprint },
      orderBy: { usageCount: 'desc' },
    })

    if (byFingerprint && byFingerprint.usageCount >= FREE_LIMIT) {
      // Sync IP if it changed
      if (byFingerprint.ip !== ip && ip !== 'unknown') {
        await prisma.freeUsage.update({
          where: { id: byFingerprint.id },
          data: { ip, lastUsedAt: new Date() },
        }).catch(() => {}) // non-critical
      }
      return NextResponse.json({ allowed: false, remaining: 0 })
    }

    // Check by IP (catches same network, cleared browser data)
    if (ip !== 'unknown') {
      const byIp = await prisma.freeUsage.findFirst({
        where: { ip },
        orderBy: { usageCount: 'desc' },
      })
      if (byIp && byIp.usageCount >= FREE_LIMIT) {
        return NextResponse.json({ allowed: false, remaining: 0 })
      }
    }

    // Create or update record
    if (!byFingerprint) {
      await prisma.freeUsage.create({
        data: { fingerprint, ip, usageCount: 1 },
      })
      return NextResponse.json({ allowed: true, remaining: FREE_LIMIT - 1 })
    }

    const newCount = byFingerprint.usageCount + 1
    await prisma.freeUsage.update({
      where: { id: byFingerprint.id },
      data: { usageCount: newCount, lastUsedAt: new Date(), ip },
    })

    return NextResponse.json({
      allowed: true,
      remaining: Math.max(0, FREE_LIMIT - newCount),
    })
  } catch (error) {
    console.error('[free-usage] error:', error)
    // On DB failure, allow the calculation (graceful degradation)
    return NextResponse.json({ allowed: true, remaining: 1 })
  }
}
