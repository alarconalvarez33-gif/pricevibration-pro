'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

const tools: Record<string, { name: string; icon: string }> = {
  hexagono:  { name: 'Hexágono de Gann', icon: '⬡' },
  serie144:  { name: 'Serie 144',         icon: '🔢' },
  cuadrado9: { name: 'Cuadrado de 9',     icon: '⬜' },
  quantum:   { name: 'Niveles Cuánticos', icon: '🔬' },
  gann:      { name: 'Calculadora Gann',  icon: '📐' },
}

type GalleryResult = {
  id: string
  title: string
  description: string | null
  imageUrl: string
  tool: string
  asset: string
  date: string
  accuracy: string | null
}

export default function GalleryPage() {
  const [results, setResults] = useState<GalleryResult[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/gallery')
      .then(r => r.json())
      .then(data => setResults(Array.isArray(data) ? data : []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? results : results.filter(r => r.tool === filter)

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-[110px] pb-20 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              📊 <span className="text-[#c9a227]">Resultados Reales</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Capturas reales de cómo nuestras herramientas predijeron movimientos del mercado.
              Sin edición, sin trucos.
            </p>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-[#c9a227] text-black'
                  : 'bg-[#1a1a2e] text-gray-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            {Object.entries(tools).map(([key, tool]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === key
                    ? 'bg-[#c9a227] text-black'
                    : 'bg-[#1a1a2e] text-gray-400 hover:text-white'
                }`}
              >
                {tool.icon} {tool.name}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center text-gray-400 py-12">Cargando resultados...</div>
          )}

          {/* Sin resultados */}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📈</span>
              <p className="text-gray-400">Próximamente más resultados...</p>
            </div>
          )}

          {/* Galería */}
          {!loading && filtered.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(result => (
                <div
                  key={result.id}
                  className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-[#c9a227]/20 rounded-xl overflow-hidden hover:border-[#c9a227]/50 transition-all group"
                >
                  {/* Imagen */}
                  <div className="relative h-48 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={result.imageUrl}
                      alt={result.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                        {tools[result.tool]?.icon} {tools[result.tool]?.name}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-[#c9a227] text-black text-xs font-bold px-2 py-1 rounded-full">
                        {result.asset}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="text-white font-bold text-lg mb-2">{result.title}</h3>
                    {result.description && (
                      <p className="text-gray-400 text-sm mb-3">{result.description}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs">
                        {new Date(result.date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      {result.accuracy && (
                        <span className="bg-green-600/20 text-green-400 text-xs px-2 py-1 rounded-full">
                          ✅ {result.accuracy}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-[#1a1a2e] to-[#0d0d0d] border border-[#c9a227]/30 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-3">
                ¿Querés calcular tus propios niveles?
              </h3>
              <p className="text-gray-400 mb-6">
                Accedé a todas las herramientas y recibí los niveles del día
              </p>
              <Link
                href="/billing"
                className="inline-block bg-[#c9a227] hover:bg-[#d4af37] text-black font-bold px-8 py-4 rounded-lg transition-colors"
              >
                Ver Planes →
              </Link>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </main>
  )
}
