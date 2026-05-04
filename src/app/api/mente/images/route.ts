import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAILS = ['raul@sacredlevels.com', 'alarconalvarez33@gmail.com']

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { imageData, imageMime } = await req.json()
    if (!imageData) return NextResponse.json({ error: 'Sin datos de imagen' }, { status: 400 })

    const image = await prisma.menteImage.create({
      data: { imageData, imageMime: imageMime || 'image/png' },
    })

    return NextResponse.json({ id: image.id, url: `/api/mente/images/${image.id}` })
  } catch (err) {
    console.error('POST /api/mente/images', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
