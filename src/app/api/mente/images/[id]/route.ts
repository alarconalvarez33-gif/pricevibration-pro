import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const image = await prisma.menteImage.findUnique({ where: { id: params.id } })
    if (!image) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    const raw = image.imageData.includes(',') ? image.imageData.split(',')[1] : image.imageData
    const buf = Buffer.from(raw, 'base64')

    return new NextResponse(buf, {
      headers: {
        'Content-Type': image.imageMime,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err) {
    console.error('GET /api/mente/images/[id]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
