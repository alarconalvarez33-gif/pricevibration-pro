import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Helper function to extract IP address from request
function getClientIp(headersList: Headers): string {
  // Try various headers in order of preference
  const forwardedFor = headersList.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = headersList.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  const cfConnectingIp = headersList.get('cf-connecting-ip') // Cloudflare
  if (cfConnectingIp) {
    return cfConnectingIp.trim()
  }

  return 'unknown'
}

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

    // Get client IP address
    const headersList = await headers()
    const clientIp = getClientIp(headersList)

    // Check if this IP has already been used by another account
    const ipUsageByOtherUsers = await prisma.trialUsage.findMany({
      where: {
        ipAddress: clientIp,
        userId: { not: session.user.id }
      }
    })

    // If another account has used trial from this IP, deny access
    if (ipUsageByOtherUsers.length > 0) {
      return NextResponse.json(
        {
          error: 'Trial already used from this network',
          remainingUses: 0,
          trialExpired: true,
          message: 'Free trial has already been used from this IP address. Please subscribe to continue.'
        },
        { status: 403 }
      )
    }

    // Check if trial is already expired for this user
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

    // Update user trial status
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        trialUses: newTrialUses,
        trialExpired: isNowExpired
      }
    })

    // Track IP usage
    await prisma.trialUsage.upsert({
      where: {
        ipAddress_userId: {
          ipAddress: clientIp,
          userId: session.user.id
        }
      },
      update: {
        useCount: { increment: 1 },
        lastUsed: new Date()
      },
      create: {
        ipAddress: clientIp,
        userId: session.user.id,
        useCount: 1
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
