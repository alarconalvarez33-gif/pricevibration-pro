import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calcReadingTime } from '@/lib/mente/utils'

const ADMIN_EMAILS = ['raul@sacredlevels.com', 'alarconalvarez33@gmail.com']

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  try {
    const article = await prisma.menteArticle.findUnique({
      where: { slug: params.slug },
      include: {
        comments: {
          where: { isApproved: true },
          include: {
            user: { select: { id: true, name: true, email: true, isPremium: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!article || !article.isPublished) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    // Increment view count async (non-blocking)
    prisma.menteArticle.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {})

    return NextResponse.json(article)
  } catch (err) {
    console.error('GET /api/mente/articles/[slug]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const data = await req.json()

    const existing = await prisma.menteArticle.findUnique({ where: { slug: params.slug } })
    if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    const readingTime = data.content ? calcReadingTime(data.content) : existing.readingTime

    // If publishing for the first time, set publishedAt
    const publishedAt = data.isPublished && !existing.publishedAt
      ? new Date()
      : existing.publishedAt

    const updated = await prisma.menteArticle.update({
      where: { slug: params.slug },
      data: {
        ...data,
        readingTime,
        publishedAt,
        tags: Array.isArray(data.tags) ? data.tags : existing.tags,
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('PATCH /api/mente/articles/[slug]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    await prisma.menteArticle.delete({ where: { slug: params.slug } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/mente/articles/[slug]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
