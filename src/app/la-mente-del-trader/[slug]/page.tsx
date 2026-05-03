'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/Footer'
import { renderMarkdown, formatFullDate, formatRelativeDate } from '@/lib/mente/utils'
import { MENTE_TOPICS, TOPIC_TO_COURSE, TOPIC_TO_COURSE_HREF } from '@/lib/mente/topics'

const CYAN      = '#00D4FF'
const CYAN_DARK = '#0EA5E9'
const DARK_BG   = '#0F172A'
const LIGHT_BG  = '#F5F7FA'

const ADMIN_EMAILS = ['raul@sacredlevels.com', 'alarconalvarez33@gmail.com']

interface UserInfo { id: string; name: string | null; email: string | null; isPremium: boolean }
interface Comment  { id: string; content: string; createdAt: string; userId: string; user: UserInfo }
interface Article  {
  id: string; slug: string; title: string; topic: string; description: string
  content: string; imageUrl: string | null; imageData: string | null
  authorName: string; readingTime: number | null; viewCount: number
  publishedAt: string | null; tags: string[]; comments: Comment[]
  metaTitle: string | null; metaDescription: string | null
}

function Avatar({ user }: { user: UserInfo }) {
  const initials = (user.name || user.email || '?').slice(0, 2).toUpperCase()
  return (
    <div className="rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white"
      style={{ width: '40px', height: '40px', backgroundColor: CYAN_DARK }}>
      {initials}
    </div>
  )
}

export default function ArticlePage() {
  const params   = useParams()
  const slug     = params?.slug as string
  const { data: session } = useSession()

  const [article, setArticle]   = useState<Article | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [commentError, setCommentError] = useState('')
  const [deletingId, setDeletingId]   = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/mente/articles/${slug}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null }
        return r.json()
      })
      .then(data => {
        if (!data) return
        setArticle(data)
        setComments(data.comments || [])
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true); setCommentError('')
    try {
      const res = await fetch('/api/mente/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: article?.id, content: commentText }),
      })
      const data = await res.json()
      if (!res.ok) { setCommentError(data.error || 'Error al publicar'); return }
      setComments(prev => [...prev, data])
      setCommentText('')
    } catch { setCommentError('Error de red') }
    finally { setSubmitting(false) }
  }

  const handleDeleteComment = async (id: string) => {
    if (!confirm('¿Eliminar este comentario?')) return
    setDeletingId(id)
    try {
      await fetch(`/api/mente/comments/${id}`, { method: 'DELETE' })
      setComments(prev => prev.filter(c => c.id !== id))
    } finally { setDeletingId(null) }
  }

  const isAdmin = ADMIN_EMAILS.includes(session?.user?.email ?? '')

  if (loading) {
    return (
      <main style={{ backgroundColor: LIGHT_BG, minHeight: '100vh' }}>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: CYAN_DARK }} />
        </div>
      </main>
    )
  }

  if (notFound || !article) {
    return (
      <main style={{ backgroundColor: LIGHT_BG, minHeight: '100vh' }}>
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-32 text-center">
          <p className="text-5xl mb-4">📭</p>
          <h1 className="text-3xl font-black mb-3" style={{ color: '#0F172A', fontFamily: "'Montserrat', sans-serif" }}>
            Artículo no encontrado
          </h1>
          <Link href="/la-mente-del-trader" className="text-sm font-bold" style={{ color: CYAN_DARK }}>
            ← Volver al blog
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  const topicInfo = MENTE_TOPICS.find(t => t.id === article.topic)
  const imgSrc = article.imageData ? `/api/mente/image/${article.id}` : article.imageUrl

  return (
    <main style={{ backgroundColor: LIGHT_BG }}>
      <Header />

      {/* Article hero */}
      <section style={{ background: `linear-gradient(180deg, ${DARK_BG} 0%, #0c1529 100%)`, paddingTop: '96px' }}>
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/la-mente-del-trader" className="hover:text-white transition-colors">La Mente del Trader</Link>
            <span>/</span>
            <span style={{ color: CYAN }}>{article.topic}</span>
          </nav>

          {/* Topic tag */}
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase mb-5"
            style={{ backgroundColor: 'rgba(0,212,255,0.12)', color: CYAN, border: '1px solid rgba(0,212,255,0.25)', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {topicInfo?.icon} {article.topic}
          </span>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight"
            style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-1px' }}
          >
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
            <span>👤 {article.authorName}</span>
            {article.publishedAt && <span>📅 {formatFullDate(article.publishedAt)}</span>}
            {article.readingTime && <span>⏱️ {article.readingTime} min lectura</span>}
            <span>👁️ {article.viewCount} vistas</span>
            <span>💬 {comments.length} comentarios</span>
          </div>
        </div>
      </section>

      {/* Main image */}
      {imgSrc && (
        <div style={{ backgroundColor: '#080F1A' }}>
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgSrc}
              alt={article.title}
              className="w-full rounded-2xl"
              style={{ maxHeight: '480px', objectFit: 'cover', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
            />
          </div>
        </div>
      )}

      {/* Article content */}
      <section style={{ backgroundColor: '#fff' }}>
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div
            className="mente-content"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
          />

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-12 pt-8" style={{ borderTop: '1px solid #F1F5F9' }}>
              {article.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: LIGHT_BG, color: '#64748B', border: '1px solid #E2E8F0', fontFamily: "'Inter', sans-serif" }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Exness banner — between content and course CTA */}
      <section style={{ backgroundColor: LIGHT_BG, borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <a
            href="https://one.exnessonelink.com/intl/es/a/xwx0gc598n"
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://d3dpet1g0ty5ed.cloudfront.net/ES_ES_GOOGLE_GOOGLE_C1_PRODUCTSUP_C2_T1_NBP_NEGATIVE_T2_PERFORMANCE_D-3-13_STATIC_320x480.jpg"
              width={320}
              height={480}
              alt="Exness"
              style={{ display: 'block', maxWidth: '100%', height: 'auto', borderRadius: '12px' }}
            />
          </a>
        </div>
      </section>

      {/* CTA curso relacionado */}
      <section style={{ backgroundColor: LIGHT_BG, borderTop: '1px solid #E2E8F0' }}>
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
          <div
            className="flex flex-col sm:flex-row items-center gap-5 p-6 rounded-2xl"
            style={{ backgroundColor: '#fff', border: `1px solid rgba(14,165,233,0.2)`, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
          >
            <div className="text-4xl">📚</div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: CYAN_DARK, fontFamily: "'Space Grotesk', sans-serif" }}>
                Curso recomendado para este tema
              </p>
              <h3 className="text-lg font-black mb-0.5" style={{ color: '#0F172A', fontFamily: "'Montserrat', sans-serif" }}>
                {TOPIC_TO_COURSE[article.topic] || 'Ver todos los cursos'}
              </h3>
              <p className="text-sm" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
                Aprendé la metodología completa con acceso de por vida.
              </p>
            </div>
            <Link
              href={TOPIC_TO_COURSE_HREF[article.topic] || '/cursos'}
              className="shrink-0 px-6 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: CYAN_DARK, color: '#fff', fontFamily: "'Space Grotesk', sans-serif", boxShadow: '0 4px 12px rgba(14,165,233,0.3)' }}
            >
              Ver curso →
            </Link>
          </div>
        </div>
      </section>

      {/* Comments */}
      <section style={{ backgroundColor: '#fff', borderTop: '1px solid #E2E8F0' }}>
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-12">
          <h2
            className="text-2xl font-black mb-8"
            style={{ color: '#0F172A', fontFamily: "'Montserrat', sans-serif" }}
          >
            💬 Comentarios ({comments.length})
          </h2>

          {/* Comment form */}
          {session ? (
            <form onSubmit={handleComment} className="mb-10">
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Escribí tu comentario..."
                rows={4}
                maxLength={2000}
                className="w-full rounded-xl p-4 text-sm resize-none"
                style={{
                  backgroundColor: LIGHT_BG,
                  border: '2px solid #E2E8F0',
                  color: '#0F172A',
                  fontFamily: "'Inter', sans-serif",
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = CYAN_DARK)}
                onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs" style={{ color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>
                  {commentText.length}/2000 · Sé respetuoso
                </span>
                <button
                  type="submit"
                  disabled={submitting || !commentText.trim()}
                  className="px-5 py-2 text-sm font-bold uppercase rounded-lg transition-all disabled:opacity-50"
                  style={{ backgroundColor: CYAN_DARK, color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {submitting ? 'Publicando...' : 'Publicar comentario'}
                </button>
              </div>
              {commentError && <p className="text-xs mt-2" style={{ color: '#FF4757' }}>{commentError}</p>}
            </form>
          ) : (
            <div
              className="text-center p-8 rounded-2xl mb-10"
              style={{ backgroundColor: LIGHT_BG, border: '1px solid #E2E8F0' }}
            >
              <p className="text-sm mb-4" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
                Iniciá sesión para dejar tu comentario
              </p>
              <div className="flex justify-center gap-3">
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-sm font-bold uppercase rounded-lg"
                  style={{ backgroundColor: CYAN_DARK, color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 text-sm font-bold uppercase rounded-lg"
                  style={{ border: '1px solid #E2E8F0', color: '#475569', fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Registrarse
                </Link>
              </div>
            </div>
          )}

          {/* Comments list */}
          <div className="space-y-5">
            {comments.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>
                Sé el primero en comentar este artículo.
              </p>
            ) : (
              comments.map(comment => {
                const isAuthor = ADMIN_EMAILS.includes(comment.user.email ?? '')
                const isPremium = comment.user.isPremium
                const canDelete = session?.user?.id === comment.userId || isAdmin

                return (
                  <div
                    key={comment.id}
                    className="flex gap-4 p-5 rounded-2xl"
                    style={{ backgroundColor: LIGHT_BG, border: '1px solid #E2E8F0' }}
                  >
                    <Avatar user={comment.user} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <span className="text-sm font-bold" style={{ color: '#0F172A', fontFamily: "'Montserrat', sans-serif" }}>
                          {comment.user.name || comment.user.email || 'Usuario'}
                        </span>
                        {isAuthor && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: CYAN_DARK, color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>
                            AUTOR
                          </span>
                        )}
                        {isPremium && !isAuthor && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: '#FFD700', color: '#000', fontFamily: "'Space Grotesk', sans-serif" }}>
                            ⚡ QUANTUM
                          </span>
                        )}
                        <span className="text-xs" style={{ color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>
                          {formatRelativeDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: '#475569', fontFamily: "'Inter', sans-serif" }}>
                        {comment.content}
                      </p>
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deletingId === comment.id}
                          className="mt-2 text-xs transition-colors hover:text-red-600 disabled:opacity-50"
                          style={{ color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}
                        >
                          {deletingId === comment.id ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* Markdown content styles */}
      <style>{`
        .mente-content .mente-h1 { font-family: 'Montserrat', sans-serif; font-weight: 900; font-size: 2rem; color: #0F172A; margin: 2rem 0 1rem; letter-spacing: -0.5px; }
        .mente-content .mente-h2 { font-family: 'Montserrat', sans-serif; font-weight: 800; font-size: 1.5rem; color: #0F172A; margin: 2rem 0 0.75rem; letter-spacing: -0.3px; }
        .mente-content .mente-h3 { font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 1.2rem; color: #0F172A; margin: 1.5rem 0 0.5rem; }
        .mente-content .mente-p  { font-family: 'Inter', sans-serif; font-size: 1.05rem; color: #334155; line-height: 1.8; margin: 1rem 0; }
        .mente-content .mente-ul { list-style: disc; padding-left: 1.5rem; margin: 1rem 0; }
        .mente-content .mente-ol { list-style: decimal; padding-left: 1.5rem; margin: 1rem 0; }
        .mente-content .mente-ul li, .mente-content .mente-ol li { font-family: 'Inter', sans-serif; font-size: 1.05rem; color: #334155; line-height: 1.7; margin: 0.4rem 0; }
        .mente-content .mente-blockquote { border-left: 4px solid #0EA5E9; padding: 0.75rem 1rem; background: #F0F9FF; margin: 1.5rem 0; border-radius: 0 8px 8px 0; font-style: italic; color: #0369A1; font-family: 'Inter', sans-serif; }
        .mente-content .mente-pre { background: #0F172A; color: #94A3B8; padding: 1.25rem; border-radius: 12px; overflow-x: auto; margin: 1.5rem 0; font-family: 'JetBrains Mono', monospace; font-size: 0.875rem; line-height: 1.6; }
        .mente-content .mente-inline-code { background: #F1F5F9; color: #0EA5E9; padding: 2px 6px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.9em; }
        .mente-content .mente-hr { border: none; border-top: 2px solid #E2E8F0; margin: 2rem 0; }
        .mente-content .mente-link { color: #0EA5E9; text-decoration: underline; }
        .mente-content .mente-link:hover { color: #00D4FF; }
        .mente-content .mente-img { width: 100%; border-radius: 12px; margin: 1.5rem 0; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
        .mente-content strong { font-weight: 700; color: #0F172A; }
        .mente-content em { font-style: italic; }
      `}</style>

      <Footer />
    </main>
  )
}
