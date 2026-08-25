import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const email = 'borisalexandercolinagonzalez@gmail.com'
const DAYS = 30
const AMOUNT_PYG = 180000
const AMOUNT_USD = 30 // 30 USDT

const user = await prisma.user.findUnique({ where: { email } })
if (!user) {
  console.log('❌ Usuario no encontrado:', email)
  process.exit(1)
}

const now = new Date()
// Renovación: si aún le queda tiempo, se suma sobre la fecha vigente
const base = user.premiumUntil && user.premiumUntil > now ? user.premiumUntil : now
const premiumUntil = new Date(base.getTime() + DAYS * 24 * 60 * 60 * 1000)

const orderId = `MANUAL-USDT-${user.id.slice(-6)}-${now.getTime()}`

const payment = await prisma.payment.create({
  data: {
    orderId,
    userId: user.id,
    planType: 'quantum',
    billingPeriod: 'monthly',
    amount: AMOUNT_PYG,
    currency: 'PYG',
    amountUsd: AMOUNT_USD,
    status: 'paid',
    paidAt: now,
  },
})

await prisma.user.update({
  where: { id: user.id },
  data: {
    isPremium: true,
    premiumUntil,
    plan: 'quantum',
    subscriptionStatus: 'active',
    nextBillingDate: premiumUntil,
    cancelledAt: null,
    autoRenew: true,
  },
})

await prisma.subscriptionLog.create({
  data: {
    userId: user.id,
    event: 'activated',
    plan: 'quantum',
    note: `orderId: ${orderId} | source: admin_manual | pago 30 USDT | ${DAYS} dias`,
  },
})

await prisma.activationLog.create({
  data: {
    paymentId: payment.id,
    userId: user.id,
    product: 'quantum',
    source: 'admin_manual',
    triggeredBy: 'buyfelshop@gmail.com',
    success: true,
  },
})

console.log('✅ Quantum activado')
console.log('   Usuario:      ', user.email, `(${user.name})`)
console.log('   Desde:        ', now.toISOString())
console.log('   premiumUntil: ', premiumUntil.toISOString())
console.log('   orderId:      ', orderId)

await prisma.$disconnect()
