import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const proofs = await prisma.proof.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: { id: true, imageUrl: true, caption: true, order: true },
    })
    return NextResponse.json(proofs)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  const { imageUrl, caption, order } = await req.json()
  if (!imageUrl || !caption) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  const proof = await prisma.proof.create({ data: { imageUrl, caption, order: order ?? 0 } })
  return NextResponse.json(proof)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  const { id } = await req.json()
  await prisma.proof.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
