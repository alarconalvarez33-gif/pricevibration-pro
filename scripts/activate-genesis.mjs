import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const email = 'admonluis@hotmail.com'
const productId = 'expansion-matematica' // Genesis

async function run() {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.log('❌ Usuario no encontrado:', email)
    process.exit(1)
  }
  console.log('👤 Usuario encontrado:', user.id, user.email)

  const existing = await prisma.productPurchase.findFirst({
    where: { userId: user.id, productId, status: 'paid' },
  })
  if (existing) {
    console.log('ℹ️  Ya tiene acceso a Genesis (purchase ID:', existing.id + ')')
    await prisma.$disconnect()
    return
  }

  const purchase = await prisma.productPurchase.create({
    data: {
      userId: user.id,
      productId,
      orderId: 'MANUAL-ADMIN-' + Date.now(),
      price: 500000,
      status: 'paid',
      paidAt: new Date(),
    },
  })
  console.log('✅ Acceso a Genesis activado exitosamente.')
  console.log('   Purchase ID:', purchase.id)
  console.log('   Usuario:', email)
  await prisma.$disconnect()
}

run().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
