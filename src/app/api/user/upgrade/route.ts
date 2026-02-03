import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { plan } = body // 'monthly' or 'yearly'

    // Calculate premium end date
    const premiumUntil = new Date()
    if (plan === 'yearly') {
      premiumUntil.setFullYear(premiumUntil.getFullYear() + 1)
    } else {
      premiumUntil.setMonth(premiumUntil.getMonth() + 1)
    }

    // Update user to premium
    // In a real app, this would happen after successful payment
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        isPremium: true,
        premiumUntil,
      },
    })

    return NextResponse.json({
      message: 'Upgrade successful',
      premiumUntil: user.premiumUntil,
    })
  } catch (error) {
    console.error('Upgrade error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
