import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const productType = searchParams.get('productType') || ''
  const status = searchParams.get('status') || ''

  const where: Record<string, unknown> = {}
  if (productType) where.productType = productType
  if (status) where.status = status

  const [licenses, total, active, revoked] = await Promise.all([
    prisma.license.findMany({
      where,
      include: { user: { select: { email: true, name: true } } },
      orderBy: { issuedAt: 'desc' },
      take: 200,
    }),
    prisma.license.count(),
    prisma.license.count({ where: { status: 'active' } }),
    prisma.license.count({ where: { status: 'revoked' } }),
  ])

  return NextResponse.json({ licenses, stats: { total, active, revoked } })
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { licenseId, action, reason } = body

  if (!licenseId || !action) {
    return NextResponse.json({ error: 'licenseId and action required' }, { status: 400 })
  }

  if (action === 'revoke') {
    await prisma.license.update({
      where: { id: licenseId },
      data: {
        status: 'revoked',
        revokedAt: new Date(),
        revokedReason: reason || 'Revocado por administrador',
      },
    })
    return NextResponse.json({ success: true, message: 'Licencia revocada' })
  }

  if (action === 'reactivate') {
    await prisma.license.update({
      where: { id: licenseId },
      data: {
        status: 'active',
        revokedAt: null,
        revokedReason: null,
      },
    })
    return NextResponse.json({ success: true, message: 'Licencia reactivada' })
  }

  return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
}
