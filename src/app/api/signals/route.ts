import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function isAdmin(user: any) {
  return user?.email === 'raul@sacredlevels.com' || user?.role === 'admin'
}

export async function GET() {
  const signals = await prisma.tradeSignal.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(signals)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session?.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const { asset, direction, entry, tp, sl, note } = body

  if (!asset || !direction || !entry || !tp || !sl) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const signal = await prisma.tradeSignal.create({
    data: {
      asset,
      direction,
      entry: parseFloat(entry),
      tp: parseFloat(tp),
      sl: parseFloat(sl),
      note: note || null,
    },
  })

  return NextResponse.json(signal, { status: 201 })
}
