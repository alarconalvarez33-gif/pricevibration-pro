import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  // Security: require secret key
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Create demo user (free)
    const demoPassword = await bcrypt.hash('demo123', 12)
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@pricevibration.com' },
      update: {},
      create: {
        email: 'demo@pricevibration.com',
        name: 'Demo User',
        password: demoPassword,
        isPremium: false,
      },
    })

    // Create premium demo user
    const premiumPassword = await bcrypt.hash('premium123', 12)
    const premiumUntil = new Date()
    premiumUntil.setFullYear(premiumUntil.getFullYear() + 1)

    const premiumUser = await prisma.user.upsert({
      where: { email: 'premium@pricevibration.com' },
      update: {},
      create: {
        email: 'premium@pricevibration.com',
        name: 'Premium Trader',
        password: premiumPassword,
        isPremium: true,
        premiumUntil,
      },
    })

    // Create subscription plans
    const plans = [
      {
        name: 'Pro Monthly',
        price: 29,
        duration: 30,
        features: JSON.stringify([
          'Unlimited Gann calculations',
          'Interactive cosmogram',
          'Save & export calculations',
          'Priority support',
        ]),
        isPopular: true,
      },
      {
        name: 'Pro Yearly',
        price: 199,
        duration: 365,
        features: JSON.stringify([
          'Everything in Pro Monthly',
          '2 months free',
          'Early access to new features',
          'Dedicated support',
        ]),
        isPopular: false,
      },
    ]

    for (const plan of plans) {
      await prisma.subscription.upsert({
        where: { id: plan.name.toLowerCase().replace(' ', '-') },
        update: plan,
        create: {
          id: plan.name.toLowerCase().replace(' ', '-'),
          ...plan,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      users: [demoUser.email, premiumUser.email],
      plans: plans.map(p => p.name),
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    )
  }
}
