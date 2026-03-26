import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const TRIAL_DAYS = 7

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

    if (user.isPremium) {
      return NextResponse.json({ success: true, isPremium: true, remainingUses: -1 })
    }

    // 7-day trial from account creation
    const trialExpiry = new Date(user.createdAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
    const now = new Date()
    const isExpired = now >= trialExpiry
    const daysLeft = isExpired ? 0 : Math.ceil((trialExpiry.getTime() - now.getTime()) / 86400000)

    if (isExpired) {
      // Keep trialExpired flag in sync
      if (!user.trialExpired) {
        await prisma.user.update({ where: { id: session.user.id }, data: { trialExpired: true } })
      }
      return NextResponse.json(
        { error: 'Trial expired', remainingUses: 0, trialExpired: true, daysLeft: 0 },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      isPremium: false,
      remainingUses: daysLeft,
      daysLeft,
      trialExpired: false,
    })
  } catch (error) {
    console.error('Trial API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
