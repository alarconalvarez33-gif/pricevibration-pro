import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function isAdmin(user: any) {
  return user?.email === 'raul@sacredlevels.com' || user?.role === 'admin'
}

export async function GET() {
  const levels = await prisma.priceLevel.findMany({
    where: { isActive: true },
    orderBy: [{ asset: 'asc' }, { price: 'desc' }],
  })
  return NextResponse.json(levels)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session?.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const { asset, price, type, note } = body

  if (!asset || !price || !type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const level = await prisma.priceLevel.create({
    data: {
      asset,
      price: parseFloat(price),
      type,
      note: note || null,
    },
  })

  return NextResponse.json(level, { status: 201 })
}
