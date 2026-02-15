import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // If user is premium, they have unlimited access
    if (user.isPremium) {
      return NextResponse.json({
        success: true,
        isPremium: true,
        remainingUses: -1 // Indicates unlimited
      })
    }

    // Check if trial is already expired
    if (user.trialUses >= 2) {
      return NextResponse.json(
        {
          error: 'Trial expired',
          remainingUses: 0,
          trialExpired: true
        },
        { status: 403 }
      )
    }

    // Increment trial uses
    const newTrialUses = user.trialUses + 1
    const isNowExpired = newTrialUses >= 2

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        trialUses: newTrialUses,
        trialExpired: isNowExpired
      }
    })

    return NextResponse.json({
      success: true,
      isPremium: false,
      remainingUses: 2 - newTrialUses,
      trialExpired: isNowExpired
    })
  } catch (error) {
    console.error('Trial API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
