'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ArticleCard from '@/components/mente/ArticleCard'

const CYAN_DARK = '#0EA5E9'
const DARK_BG   = '#0F172A'
const LIGHT_BG  = '#F5F7FA'

interface Article {
  id: string; slug: string; title: string; topic: string; description: string
  imageUrl: string | null; imageData: string | null
  readingTime: number | null; viewCount: number; publishedAt: string | null
  _count: { comments: number }
}

export default function MenteTraderPreview() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loaded, setLoaded]     = useState(false)

  useEffect(() => {
    fetch('/api/mente/articles?page=1')
      .then(r => r.json())
      .then(d => { if (d.articles) setArticles(d.articles.slice(0, 3)) })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  if (loaded && articles.length === 0) return null

  return (
    <section style={{ backgroundColor: LIGHT_BG, borderTop: '1px solid #E2E8F0' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span
              className="text-[10px] font-bold uppercase px-2.5 py-1 rounded"
              style={{ backgroundColor: '#FFD700', color: '#000', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              NUEVO
            </span>
            <span
              className="text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: CYAN_DARK, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              🧠 La Mente del Trader
            </span>
          </div>

          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4"
            style={{ color: DARK_BG, fontFamily: "'Montserrat', sans-serif", letterSpacing: '-1px' }}
          >
            Aprendé trading con nuestros{' '}
            <span style={{ color: CYAN_DARK }}>artículos gratuitos</span>
          </h2>

          <p
            className="text-base max-w-2xl mx-auto"
            style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}
          >
            Conocimiento profesional sobre forex, análisis técnico, psicología del trader y más.
          </p>
        </div>

        {/* Articles */}
        {!loaded ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse"
                style={{ height: '340px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div className="bg-gray-200" style={{ aspectRatio: '16/10' }} />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/la-mente-del-trader"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.1em] rounded-lg transition-all hover:-translate-y-0.5"
            style={{
              backgroundColor: CYAN_DARK,
              color: '#fff',
              fontFamily: "'Space Grotesk', sans-serif",
              boxShadow: '0 4px 16px rgba(14,165,233,0.3)',
            }}
          >
            Ver todos los artículos →
          </Link>
        </div>
      </div>
    </section>
  )
}
