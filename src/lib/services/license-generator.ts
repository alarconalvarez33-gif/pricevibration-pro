import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function makeCode(): string {
  let part = ''
  const bytes = randomBytes(12)
  for (let i = 0; i < 12; i++) {
    part += CHARS[bytes[i] % CHARS.length]
  }
  return `SL-ML-${part}`
}

export async function generateMetaLevelsCode({
  userId,
  paymentId,
}: {
  userId: string
  paymentId?: string
}): Promise<string> {
  const code = makeCode()

  const existing = await prisma.license.findUnique({ where: { code } })
  if (existing) {
    // Collision (astronomically rare) — recurse
    return generateMetaLevelsCode({ userId, paymentId })
  }

  await prisma.license.create({
    data: {
      code,
      productType: 'metalevels',
      userId,
      paymentId: paymentId ?? null,
      status: 'active',
      pineScriptVersion: 'v1.0',
    },
  })

  return code
}

export async function getUserMetaLevelsLicense(userId: string) {
  return prisma.license.findFirst({
    where: { userId, productType: 'metalevels', status: 'active' },
    orderBy: { issuedAt: 'desc' },
  })
}
