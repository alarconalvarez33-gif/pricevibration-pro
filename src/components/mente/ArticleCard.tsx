import Link from 'next/link'
import { isNewArticle } from '@/lib/mente/utils'
import { MENTE_TOPICS } from '@/lib/mente/topics'

const CYAN = '#00D4FF'
const CYAN_DARK = '#0EA5E9'

interface ArticleCardProps {
  article: {
    id: string
    slug: string
    title: string
    topic: string
    description: string
    imageUrl?: string | null
    imageData?: string | null
    readingTime?: number | null
    viewCount: number
    publishedAt?: string | Date | null
    _count?: { comments: number }
  }
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const topicInfo = MENTE_TOPICS.find(t => t.id === article.topic)
  const isNew = isNewArticle(article.publishedAt ? new Date(article.publishedAt) : null)

  const imgSrc = article.imageData
    ? `/api/mente/image/${article.id}`
    : article.imageUrl || null

  const pubDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('es-PY', { day: '2-digit', month: 'short', year: 'numeric' })
    : ''

  return (
    <Link
      href={`/la-mente-del-trader/${article.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: '16/10', backgroundColor: '#0F172A', flexShrink: 0 }}
      >
        {imgSrc ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imgSrc}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {topicInfo?.icon || '🧠'}
          </div>
        )}

        {/* NEW badge */}
        {isNew && (
          <span
            className="absolute top-3 left-3 text-[10px] font-bold uppercase px-2 py-1 rounded"
            style={{ backgroundColor: '#FFD700', color: '#000', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            🆕 NUEVO
          </span>
        )}

        {/* Topic badge */}
        <span
          className="absolute bottom-3 left-3 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: 'rgba(0,212,255,0.15)',
            color: CYAN,
            border: '1px solid rgba(0,212,255,0.3)',
            backdropFilter: 'blur(8px)',
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {topicInfo?.icon} {article.topic}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h3
          className="text-base font-black mb-2 leading-snug line-clamp-2"
          style={{ color: '#0F172A', fontFamily: "'Montserrat', sans-serif" }}
        >
          {article.title}
        </h3>

        <p
          className="text-sm leading-relaxed mb-4 line-clamp-3 flex-1"
          style={{ color: '#475569', fontFamily: "'Inter', sans-serif" }}
        >
          {article.description}
        </p>

        {/* Meta */}
        <div
          className="flex items-center gap-3 text-xs pt-3"
          style={{ borderTop: '1px solid #F1F5F9', color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}
        >
          {pubDate && <span>📅 {pubDate}</span>}
          {article.readingTime && <span>⏱️ {article.readingTime} min</span>}
          <span>👁️ {article.viewCount}</span>
          {article._count !== undefined && <span>💬 {article._count.comments}</span>}

          <span
            className="ml-auto text-xs font-bold"
            style={{ color: CYAN_DARK, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Leer →
          </span>
        </div>
      </div>
    </Link>
  )
}
