'use client'

import { useState, useEffect } from 'react'

const TV_SYMBOL: Record<string, string> = {
  'XAU/USD': 'OANDA:XAUUSD',
  'BTC/USD': 'BITSTAMP:BTCUSD',
  'EUR/USD': 'FX:EURUSD',
  'GBP/USD': 'FX:GBPUSD',
  'USD/JPY': 'FX:USDJPY',
  'XAG/USD': 'OANDA:XAGUSD',
  'US30':    'FOREXCOM:DJI',
  'NAS100':  'FOREXCOM:NAS100',
}

type QuantumLevel = {
  n: number
  price: number
  probability: number
  type: 'accumulation' | 'equilibrium' | 'distribution'
  strength: 'extreme' | 'strong' | 'moderate'
}

type Touch = {
  level: string
  time: string
  type: 'bounce' | 'break'
  pips?: number
}

type QuantumData = {
  id: string
  asset: string
  maxPrice: number
  minPrice: number
  levels: QuantumLevel[]
  touches: Touch[] | null
  createdAt: string
}

export default function QuantumLiveWidget() {
  const [data, setData] = useState<QuantumData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchLevels = async () => {
    try {
      const res = await fetch('/api/quantum-live', { cache: 'no-store' })
      if (!res.ok) { setData(null); return }
      const json = await res.json()
      setData(json)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLevels()
    const interval = setInterval(fetchLevels, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <section className="py-12 px-4 bg-gradient-to-b from-[#0a1628] to-[#0a0a0a]">
      <div className="max-w-6xl mx-auto flex items-center justify-center h-32">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </section>
  )

  if (!data) return null

  const tvSymbol = TV_SYMBOL[data.asset] || data.asset.replace('/', '')
  const touches = Array.isArray(data.touches) ? data.touches : []

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-[#0a1628] to-[#0a0a0a] border-t border-purple-500/10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              🔬 <span className="text-purple-400">Quantum Levels</span>{' '}
              <span className="text-[#c9a227] font-bold">{data.asset}</span>
            </h2>
            <p className="text-gray-500 text-xs mt-1">
              Distribución E=n² · Min: {data.minPrice.toLocaleString()} — Max: {data.maxPrice.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <span className="text-red-400 text-sm font-bold">LIVE</span>
            </div>
            <a
              href="/quantum"
              className="text-xs text-purple-400 hover:text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-full transition-colors"
            >
              Calcular mis propios →
            </a>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* TradingView chart */}
          <div className="bg-[#1a1a2e] rounded-xl overflow-hidden h-[400px] border border-purple-500/20">
            <iframe
              src={`https://s.tradingview.com/widgetembed/?frameElementId=tv&symbol=${tvSymbol}&interval=15&theme=dark&style=1&locale=es&hide_side_toolbar=0&allow_symbol_change=0`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title={`TradingView ${data.asset}`}
            />
          </div>

          {/* Levels list */}
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-purple-500/30 rounded-xl p-5 flex flex-col">
            <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[320px] pr-1">
              {data.levels.map((level) => (
                <div
                  key={level.n}
                  className={`flex justify-between items-center px-3 py-2 rounded-lg border ${
                    level.type === 'distribution'
                      ? 'bg-red-900/20 border-red-500/30'
                      : level.type === 'accumulation'
                      ? 'bg-green-900/20 border-green-500/30'
                      : 'bg-yellow-900/20 border-yellow-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">
                      {level.type === 'distribution' ? '🔴' : level.type === 'accumulation' ? '🟢' : '🟡'}
                    </span>
                    <span className="text-white font-mono font-bold text-sm">
                      {level.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    {(level.strength === 'extreme') && (
                      <span className="text-purple-400 text-xs font-bold">⚡</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 text-xs">Q{level.n}</span>
                    <span className="text-gray-600 text-xs ml-2">{level.probability}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Toques registrados */}
            {touches.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-[#c9a227] font-bold text-sm mb-2">✅ Toques registrados:</p>
                <div className="space-y-1">
                  {touches.map((touch, i) => (
                    <p key={i} className={`text-xs ${touch.type === 'bounce' ? 'text-green-400' : 'text-red-400'}`}>
                      {touch.level} — {touch.type === 'bounce' ? '↩' : '↗'}{touch.type}
                      {touch.pips ? ` +${touch.pips} pips` : ''}
                      <span className="text-gray-600 ml-2">{touch.time}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-gray-800">
              <p className="text-gray-600 text-xs">
                ⏰ Establecido: {new Date(data.createdAt).toLocaleString('es-PY')} por The Mentor
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm mb-4">
            🔒 ¿Querés calcular tus propios Niveles Cuánticos con cualquier rango?
          </p>
          <a
            href="/#fisica-cuantica"
            className="bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 text-white font-bold px-8 py-3 rounded-xl inline-block transition-all hover:scale-105"
          >
            🔬 Adquirir acceso — Gs. 650.000
          </a>
        </div>

      </div>
    </section>
  )
}
