import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function isAdmin(user: any) {
  return user?.email === 'raul@sacredlevels.com' || user?.role === 'admin'
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session?.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const { status, result } = body

  const signal = await prisma.tradeSignal.update({
    where: { id: params.id },
    data: {
      status,
      ...(result !== undefined ? { result: parseFloat(result) } : {}),
    },
  })

  return NextResponse.json(signal)
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session?.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  await prisma.tradeSignal.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
