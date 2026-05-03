'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/Footer'
import ArticleCard from '@/components/mente/ArticleCard'
import { MENTE_TOPICS } from '@/lib/mente/topics'

const CYAN      = '#00D4FF'
const CYAN_DARK = '#0EA5E9'
const DARK_BG   = '#0F172A'
const LIGHT_BG  = '#F5F7FA'

interface Article {
  id: string; slug: string; title: string; topic: string; description: string
  imageUrl: string | null; imageData: string | null
  readingTime: number | null; viewCount: number; publishedAt: string | null
  _count: { comments: number }
}

interface Pagination { page: number; totalPages: number; total: number }

export default function MenteDelTraderPage() {
  const [articles, setArticles]     = useState<Article[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, totalPages: 1, total: 0 })
  const [topic, setTopic]           = useState('all')
  const [q, setQ]                   = useState('')
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)
  const [loading, setLoading]       = useState(true)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (topic !== 'all') params.set('topic', topic)
      if (search) params.set('q', search)

      const res = await fetch(`/api/mente/articles?${params}`)
      const data = await res.json()
      setArticles(data.articles || [])
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 })
    } catch {
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [page, topic, search])

  useEffect(() => { fetchArticles() }, [fetchArticles])

  const handleTopicChange = (t: string) => { setTopic(t); setPage(1) }
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); setSearch(q); setPage(1)
  }

  return (
    <main style={{ backgroundColor: LIGHT_BG, minHeight: '100vh' }}>
      <Header />

      {/* Hero */}
      <section style={{ background: `linear-gradient(180deg, ${DARK_BG} 0%, #0c1529 100%)`, paddingTop: '96px' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-5">
              <span
                className="text-[10px] font-bold uppercase px-2.5 py-1 rounded"
                style={{ backgroundColor: '#FFD700', color: '#000', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                🆕 NUEVO
              </span>
              <span
                className="text-xs font-bold uppercase tracking-[0.3em]"
                style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                🧠 La Mente del Trader
              </span>
            </div>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-5 leading-tight"
              style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-1px' }}
            >
              Conocimiento profesional para traders que{' '}
              <span style={{ color: CYAN }}>piensan diferente</span>
            </h1>

            <p className="text-lg mb-8" style={{ color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>
              Artículos educativos gratuitos sobre forex, acciones, análisis técnico, psicología y más.
              Actualizado constantemente por Raúl Alarcón.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
              <input
                type="text"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Buscar artículos..."
                className="w-full py-3.5 pl-5 pr-14 rounded-xl text-sm text-white"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  fontFamily: "'Inter', sans-serif",
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-lg"
              >
                🔍
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Topic filters */}
      <section style={{ backgroundColor: '#fff', borderBottom: '1px solid #E2E8F0' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => handleTopicChange('all')}
              className="shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
              style={{
                backgroundColor: topic === 'all' ? CYAN_DARK : 'transparent',
                color: topic === 'all' ? '#fff' : '#64748B',
                border: `1px solid ${topic === 'all' ? CYAN_DARK : '#E2E8F0'}`,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Todos
            </button>
            {MENTE_TOPICS.map(t => (
              <button
                key={t.id}
                onClick={() => handleTopicChange(t.id)}
                className="shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
                style={{
                  backgroundColor: topic === t.id ? CYAN_DARK : 'transparent',
                  color: topic === t.id ? '#fff' : '#64748B',
                  border: `1px solid ${topic === t.id ? CYAN_DARK : '#E2E8F0'}`,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles grid */}
      <section style={{ backgroundColor: LIGHT_BG }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">

          {/* Stats bar */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
              {loading ? 'Cargando...' : `${pagination.total} artículo${pagination.total !== 1 ? 's' : ''}`}
              {search && ` para "${search}"`}
              {topic !== 'all' && ` en ${topic}`}
            </p>
            {search && (
              <button
                onClick={() => { setQ(''); setSearch(''); setPage(1) }}
                className="text-xs font-semibold"
                style={{ color: CYAN_DARK, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Limpiar ×
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse"
                  style={{ height: '360px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                  <div className="bg-gray-200" style={{ aspectRatio: '16/10' }} />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">📭</p>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#0F172A', fontFamily: "'Montserrat', sans-serif" }}>
                {search || topic !== 'all' ? 'Sin resultados' : 'Próximamente'}
              </h3>
              <p className="text-sm" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
                {search || topic !== 'all'
                  ? 'Probá con otros términos o categorías'
                  : 'Los primeros artículos están en camino. ¡Volvé pronto!'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {articles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-bold rounded-lg transition-all disabled:opacity-40"
                style={{ border: '1px solid #E2E8F0', color: '#475569', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                ← Anterior
              </button>
              <span className="text-sm px-4" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-4 py-2 text-sm font-bold rounded-lg transition-all disabled:opacity-40"
                style={{ border: '1px solid #E2E8F0', color: '#475569', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: `linear-gradient(135deg, ${DARK_BG} 0%, #1A2845 100%)`, borderTop: '1px solid #1a1a1a' }}>
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 text-center">
          <h2
            className="text-2xl sm:text-3xl font-black text-white mb-3"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            ¿Querés profundizar en el trading profesional?
          </h2>
          <p className="text-sm mb-6" style={{ color: '#CBD5E1', fontFamily: "'Inter', sans-serif" }}>
            Nuestros cursos te dan el conocimiento completo y la metodología probada.
          </p>
          <a
            href="/cursos"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.1em] rounded-lg transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: CYAN, color: '#000', fontFamily: "'Space Grotesk', sans-serif", boxShadow: '0 8px 24px rgba(0,212,255,0.35)' }}
          >
            VER CURSOS DISPONIBLES →
          </a>
        </div>
      </section>

      <Footer />
    </main>
  )
}
