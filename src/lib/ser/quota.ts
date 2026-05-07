import { prisma } from '@/lib/prisma'

const ADMIN_EMAIL = 'raul@sacredlevels.com'

export async function canUserAskQuestion(userId: string): Promise<{
  allowed: boolean
  remaining: number
  reason?: string
  upgradeUrl?: string
}> {
  const subscription = await prisma.serSubscription.findUnique({ where: { userId } })

  if (!subscription || !subscription.isActive) {
    return {
      allowed: false,
      remaining: 0,
      reason: 'Necesitas Quantum Access para usar SER',
      upgradeUrl: '/billing',
    }
  }

  if (subscription.expiresAt && subscription.expiresAt < new Date()) {
    return {
      allowed: false,
      remaining: 0,
      reason: 'Tu suscripción SER ha expirado',
      upgradeUrl: '/billing',
    }
  }

  const dailyLimit = subscription.plan === 'SER_PLUS' ? 20 : 10
  const today = new Date().toISOString().split('T')[0]

  const quota = await prisma.serDailyQuota.findUnique({
    where: { userId_date: { userId, date: today } },
  })

  const used = quota?.questionsUsed || 0

  const activePacks = await prisma.serQuestionPack.findMany({
    where: { userId, isExpired: false, expiresAt: { gte: new Date() } },
  })
  const extraAvailable = activePacks.reduce(
    (sum, pack) => sum + (pack.questionsAdded - pack.questionsUsed),
    0
  )

  const remaining = Math.max(0, dailyLimit - used) + extraAvailable

  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      reason: `Alcanzaste tu límite de ${dailyLimit} preguntas diarias`,
      upgradeUrl: '/ser/planes',
    }
  }

  return { allowed: true, remaining }
}

export async function decrementQuota(userId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  const subscription = await prisma.serSubscription.findUnique({ where: { userId } })
  const dailyLimit = subscription?.plan === 'SER_PLUS' ? 20 : 10

  const quota = await prisma.serDailyQuota.upsert({
    where: { userId_date: { userId, date: today } },
    update: { questionsUsed: { increment: 1 } },
    create: { userId, date: today, questionsUsed: 1, questionsLimit: dailyLimit },
  })

  // If over daily limit, consume from active pack
  if (quota.questionsUsed > dailyLimit) {
    const activePack = await prisma.serQuestionPack.findFirst({
      where: { userId, isExpired: false, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: 'asc' },
    })
    if (activePack) {
      const newUsed = activePack.questionsUsed + 1
      await prisma.serQuestionPack.update({
        where: { id: activePack.id },
        data: { questionsUsed: newUsed, isExpired: newUsed >= activePack.questionsAdded },
      })
    }
  }
}

export async function isAdminUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } })
  return user?.email === ADMIN_EMAIL
}
