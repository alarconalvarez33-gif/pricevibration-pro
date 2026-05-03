import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAILS = ['raul@sacredlevels.com', 'alarconalvarez33@gmail.com']

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Login requerido' }, { status: 401 })
    }

    const comment = await prisma.menteComment.findUnique({ where: { id: params.id } })
    if (!comment) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    const isOwner = comment.userId === session.user.id
    const isAdmin = ADMIN_EMAILS.includes(session.user.email ?? '')

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    await prisma.menteComment.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/mente/comments/[id]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
