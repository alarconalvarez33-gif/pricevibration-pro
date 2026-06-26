import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const FREE_TRIAL_USES = 3

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Premium users always pass
    if (user.isPremium || user.plan === 'quantum' || user.plan === 'pro') {
      return NextResponse.json({ success: true, isPremium: true, remainingUses: -1 })
    }

    // Trial already expired
    if (user.trialExpired || user.trialUses >= FREE_TRIAL_USES) {
      if (!user.trialExpired) {
        await prisma.user.update({ where: { id: user.id }, data: { trialExpired: true } })
      }
      return NextResponse.json(
        { error: 'Trial expired', remainingUses: 0, trialExpired: true },
        { status: 403 }
      )
    }

    // Consume one use
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { trialUses: user.trialUses + 1 },
    })

    const remaining = FREE_TRIAL_USES - updated.trialUses

    // If this was the last use, mark as expired
    if (remaining <= 0) {
      await prisma.user.update({ where: { id: user.id }, data: { trialExpired: true } })
    }

    return NextResponse.json({
      success: true,
      isPremium: false,
      remainingUses: Math.max(0, remaining),
      trialExpired: remaining <= 0,
    })
  } catch (error) {
    console.error('Trial API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
