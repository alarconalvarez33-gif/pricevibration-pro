import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function makeCode(): string {
  let part = ''
  const bytes = randomBytes(12)
  for (let i = 0; i < 12; i++) part += CHARS[bytes[i] % CHARS.length]
  return `SL-ML-${part}`
}

async function activateMetaLevels(email: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) { console.error(`❌ Usuario no encontrado: ${email}`); return }

  console.log(`👤 Usuario: ${user.id} — ${user.email}`)

  // Check existing license
  const existingLicense = await prisma.license.findFirst({
    where: { userId: user.id, productType: 'metalevels', status: 'active' },
  })
  if (existingLicense) {
    console.log(`✅ Ya tiene licencia: ${existingLicense.code}`)
    return
  }

  // Ensure paid purchase exists
  let purchase = await prisma.productPurchase.findFirst({
    where: { userId: user.id, productId: 'metalevels', status: 'paid' },
  })
  if (!purchase) {
    purchase = await prisma.productPurchase.create({
      data: {
        userId:    user.id,
        productId: 'metalevels',
        orderId:   `MANUAL-ADMIN-${Date.now()}`,
        price:     150000,
        status:    'paid',
        paidAt:    new Date(),
      },
    })
    console.log(`📦 Purchase creada: ${purchase.id}`)
  } else {
    console.log(`📦 Purchase ya existe: ${purchase.id}`)
  }

  // Create license
  const code = makeCode()
  await prisma.license.create({
    data: {
      code,
      productType:       'metalevels',
      userId:            user.id,
      paymentId:         purchase.id,
      status:            'active',
      pineScriptVersion: 'v1.0',
    },
  })

  console.log(`🔑 Licencia creada: ${code}`)
  console.log(`✅ ${email} activado correctamente`)
}

async function main() {
  await activateMetaLevels('cabreracardozomarcos@gmail.com')
  await activateMetaLevels('pedroredecop81@gmail.com')
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
