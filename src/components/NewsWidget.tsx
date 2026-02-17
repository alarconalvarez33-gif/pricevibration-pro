'use client'

import { useState, useEffect, useCallback } from 'react'

interface NewsArticle {
  id: number
  headline: string
  summary: string
  source: string
  url: string
  image: string
  datetime: number
  category: string
}

type NewsCategory = 'general' | 'forex' | 'crypto'

const CATEGORIES: { value: NewsCategory; label: string; emoji: string }[] = [
  { value: 'general', label: 'General', emoji: '📊' },
  { value: 'forex', label: 'Forex', emoji: '💱' },
  { value: 'crypto', label: 'Crypto', emoji: '₿' },
]

const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

export default function NewsWidget() {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('general')
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNews = useCallback(async (category: NewsCategory) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/news?category=${category}`)

      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Limit to 8 articles
      setNews(data.slice(0, 8))
    } catch (err) {
      console.error('Error fetching news:', err)
      setError('News temporarily unavailable')
      setNews([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNews(selectedCategory)

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchNews(selectedCategory)
    }, REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [selectedCategory, fetchNews])

  const getRelativeTime = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  return (
    <div className="card-terminal h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-terminal-border">
        <h3 className="text-gold-500 font-semibold text-lg flex items-center gap-2">
          📰 Market News
        </h3>
        <button
          onClick={() => fetchNews(selectedCategory)}
          disabled={loading}
          className="text-terminal-muted hover:text-gold-500 transition-colors disabled:opacity-50"
          title="Refresh news"
        >
          <svg
            className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === cat.value
                ? 'bg-gold-500 text-black'
                : 'bg-terminal-bg border border-terminal-border text-terminal-muted hover:border-gold-500 hover:text-gold-500'
            }`}
          >
            <span className="mr-1">{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* News Content */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-2 custom-scrollbar">
        {loading && news.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <div className="flex flex-col items-center gap-2">
              <svg
                className="animate-spin h-8 w-8 text-gold-500"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-terminal-muted text-sm">Loading news...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <svg
                className="w-12 h-12 text-red-500 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        ) : news.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-terminal-muted text-sm">No news available</p>
          </div>
        ) : (
          news.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-terminal-bg border border-terminal-border rounded-lg hover:border-gold-500 transition-all group"
            >
              <div className="flex gap-3">
                {/* Thumbnail */}
                {article.image ? (
                  <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded overflow-hidden bg-terminal-border">
                    <img
                      src={article.image}
                      alt={article.headline}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded bg-terminal-border flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-terminal-muted"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      />
                    </svg>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-medium leading-snug line-clamp-2 group-hover:text-gold-500 transition-colors mb-1">
                    {article.headline}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-terminal-muted">
                    <span className="font-medium">{article.source}</span>
                    <span>•</span>
                    <span>{getRelativeTime(article.datetime)}</span>
                  </div>
                </div>

                {/* External link icon */}
                <div className="flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-terminal-muted group-hover:text-gold-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>
              </div>
            </a>
          ))
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.5);
        }
      `}</style>
    </div>
  )
}
