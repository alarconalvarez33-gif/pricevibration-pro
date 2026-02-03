import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateGannLevels } from '@/lib/gann'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is premium
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user?.isPremium) {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { centerPrice } = body

    if (!centerPrice || isNaN(centerPrice) || centerPrice <= 0) {
      return NextResponse.json(
        { error: 'Invalid center price' },
        { status: 400 }
      )
    }

    // Calculate Gann levels
    const levels = calculateGannLevels(centerPrice)

    // Save calculation
    const calculation = await prisma.calculation.create({
      data: {
        userId: session.user.id,
        centerPrice,
        resistances: JSON.stringify(levels.resistances),
        supports: JSON.stringify(levels.supports),
      },
    })

    return NextResponse.json({
      id: calculation.id,
      ...levels,
    })
  } catch (error) {
    console.error('Calculation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const calculations = await prisma.calculation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return NextResponse.json(
      calculations.map((calc) => ({
        id: calc.id,
        centerPrice: calc.centerPrice,
        resistances: JSON.parse(calc.resistances),
        supports: JSON.parse(calc.supports),
        createdAt: calc.createdAt,
      }))
    )
  } catch (error) {
    console.error('Fetch calculations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
