import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateSlug, calcReadingTime } from '@/lib/mente/utils'

const ADMIN_EMAILS = ['raul@sacredlevels.com', 'alarconalvarez33@gmail.com']

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const topic   = searchParams.get('topic') || ''
    const q       = searchParams.get('q') || ''
    const page    = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit   = 12
    const adminView = searchParams.get('admin') === '1'

    // Admin view (all articles, published or not)
    const session = adminView ? await getServerSession(authOptions) : null
    const isAdmin = adminView && !!session?.user?.email && ADMIN_EMAILS.includes(session.user.email)

    const where: Record<string, unknown> = isAdmin ? {} : { isPublished: true }
    if (topic && topic !== 'all') where.topic = topic
    if (q) {
      where.OR = [
        { title:       { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [articles, total] = await Promise.all([
      prisma.menteArticle.findMany({
        where,
        orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, slug: true, title: true, topic: true,
          description: true, imageUrl: true, imageData: true, imageMime: true,
          authorName: true, isPublished: true, isFeatured: true,
          tags: true, viewCount: true, readingTime: true,
          publishedAt: true, createdAt: true,
          _count: { select: { comments: true } },
        },
      }),
      prisma.menteArticle.count({ where }),
    ])

    return NextResponse.json({
      articles,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    console.error('GET /api/mente/articles', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const data = await req.json()
    const { title, topic, description, content, imageUrl, imageData, imageMime,
            tags, isPublished, isFeatured, metaTitle, metaDescription } = data

    if (!title || !topic || !description || !content) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const slug = data.slug?.trim() || generateSlug(title)
    const readingTime = calcReadingTime(content)

    const article = await prisma.menteArticle.create({
      data: {
        slug, title, topic, description, content,
        imageUrl: imageUrl || null,
        imageData: imageData || null,
        imageMime: imageMime || null,
        tags: Array.isArray(tags) ? tags : [],
        isPublished: !!isPublished,
        isFeatured: !!isFeatured,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        readingTime,
        publishedAt: isPublished ? new Date() : null,
      },
    })

    return NextResponse.json(article)
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'El slug ya existe, cambialo' }, { status: 409 })
    }
    console.error('POST /api/mente/articles', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
