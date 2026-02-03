import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

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
  console.log('Created demo user:', demoUser.email)

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
  console.log('Created premium user:', premiumUser.email)

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
    console.log('Created subscription plan:', plan.name)
  }

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
