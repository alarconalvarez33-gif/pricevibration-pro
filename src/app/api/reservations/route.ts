import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { email, whatsapp } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
  await prisma.reservation.upsert({
    where: { email },
    update: { whatsapp: whatsapp || null },
    create: { email, whatsapp: whatsapp || null },
  })
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  const reservations = await prisma.reservation.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(reservations)
}
