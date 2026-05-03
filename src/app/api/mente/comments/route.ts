import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const articleId = searchParams.get('articleId')
    if (!articleId) return NextResponse.json({ error: 'articleId requerido' }, { status: 400 })

    const comments = await prisma.menteComment.findMany({
      where: { articleId, isApproved: true },
      include: {
        user: { select: { id: true, name: true, email: true, isPremium: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ comments })
  } catch (err) {
    console.error('GET /api/mente/comments', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Debés iniciar sesión para comentar' }, { status: 401 })
    }

    const { articleId, content } = await req.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'El comentario no puede estar vacío' }, { status: 400 })
    }
    if (content.length > 2000) {
      return NextResponse.json({ error: 'Máximo 2000 caracteres' }, { status: 400 })
    }

    // Rate limit: max 5 comentarios por hora
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentCount = await prisma.menteComment.count({
      where: { userId: session.user.id, createdAt: { gte: oneHourAgo } },
    })
    if (recentCount >= 5) {
      return NextResponse.json({ error: 'Límite de comentarios alcanzado (5 por hora)' }, { status: 429 })
    }

    // Sanitize: strip HTML
    const sanitized = content.replace(/<[^>]+>/g, '').trim()

    const comment = await prisma.menteComment.create({
      data: { articleId, userId: session.user.id, content: sanitized },
      include: {
        user: { select: { id: true, name: true, email: true, isPremium: true } },
      },
    })

    return NextResponse.json(comment)
  } catch (err) {
    console.error('POST /api/mente/comments', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
