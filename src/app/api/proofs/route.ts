import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/constants'

export const dynamic = 'force-dynamic'

const MAX_PROOFS = 3

export async function GET() {
  try {
    const proofs = await prisma.proof.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true, imageUrl: true, caption: true },
    })
    return NextResponse.json(proofs)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { imageUrl, caption } = await req.json()
  if (!imageUrl || !caption) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })

  // Auto-delete oldest if at max capacity
  const all = await prisma.proof.findMany({ orderBy: { createdAt: 'asc' }, select: { id: true } })
  if (all.length >= MAX_PROOFS) {
    const toDelete = all.slice(0, all.length - MAX_PROOFS + 1)
    await prisma.proof.deleteMany({ where: { id: { in: toDelete.map(p => p.id) } } })
  }

  const proof = await prisma.proof.create({ data: { imageUrl, caption, order: 0 } })
  return NextResponse.json(proof)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  const { id } = await req.json()
  await prisma.proof.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
