import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const article = await prisma.menteArticle.findUnique({
      where: { id: params.id },
      select: { imageData: true, imageMime: true },
    })

    if (!article?.imageData) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    const base64 = article.imageData.includes(',')
      ? article.imageData.split(',')[1]
      : article.imageData

    const buffer = Buffer.from(base64, 'base64')
    const mime = article.imageMime || 'image/jpeg'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (err) {
    console.error('GET /api/mente/image/[id]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
