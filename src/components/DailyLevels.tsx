'use client'

import { useState, useEffect, useCallback } from 'react'

const ASSET_ICONS: Record<string, string> = {
  'XAU/USD': '🥇', 'BTC/USD': '₿', 'EUR/USD': '💶', 'GBP/USD': '💷',
  'USD/JPY': '💴', 'XAG/USD': '🥈', 'US30': '📊', 'NAS100': '📈',
}

const TYPE_ORDER = ['strong_resistance', 'resistance', 'pivot', 'support', 'strong_support']

const LEVEL_STYLE: Record<string, { icon: string; label: string; color: string }> = {
  strong_resistance: { icon: '🔴', label: 'Strong Resistance / Resistencia Fuerte', color: 'text-red-400' },
  resistance:        { icon: '🟠', label: 'Resistance / Resistencia',               color: 'text-orange-400' },
  pivot:             { icon: '⚪', label: 'Pivot / Pivote',                          color: 'text-gray-300' },
  support:           { icon: '🟢', label: 'Support / Soporte',                       color: 'text-green-400' },
  strong_support:    { icon: '💚', label: 'Strong Support / Soporte Fuerte',         color: 'text-emerald-400' },
}

type PriceLevel = {
  id: string; asset: string; price: number; type: string; note: string | null
}

export default function DailyLevels() {
  const [levels, setLevels] = useState<PriceLevel[]>([])
  const [lastUpdate, setLastUpdate] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchLevels = useCallback(async () => {
    try {
      const res = await fetch('/api/levels', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setLevels(Array.isArray(data) ? data : [])
        setLastUpdate(new Date().toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' }))
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchLevels()
    const interval = setInterval(fetchLevels, 60000)
    return () => clearInterval(interval)
  }, [fetchLevels])

  if (!loading && levels.length === 0) return null

  const grouped = levels.reduce<Record<string, PriceLevel[]>>((acc, l) => {
    if (!acc[l.asset]) acc[l.asset] = []
    acc[l.asset].push(l)
    return acc
  }, {})
  Object.values(grouped).forEach(arr =>
    arr.sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type))
  )

  return (
    <section className="py-12 px-4 relative z-10 border-t border-[#c9a227]/10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              📊 <span className="text-[#c9a227]">Daily Key Levels</span>{' '}
              <span className="text-gray-600 font-normal text-base">/ Niveles Clave</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-red-400 text-sm font-medium">LIVE / EN VIVO</span>
            </div>
            {lastUpdate && (
              <span className="text-gray-600 text-xs hidden sm:block">Updated / Actualizado: {lastUpdate}</span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#111120] border border-gray-800 rounded-xl p-5 animate-pulse">
                <div className="h-5 bg-gray-800 rounded mb-4 w-1/2"></div>
                {[1, 2, 3].map(j => <div key={j} className="h-4 bg-gray-800 rounded mb-2"></div>)}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(grouped).map(([asset, assetLevels]) => (
              <div key={asset} className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-[#c9a227]/20 rounded-xl p-4 hover:border-[#c9a227]/40 transition-colors">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-800">
                  <span className="text-xl">{ASSET_ICONS[asset] || '📊'}</span>
                  <span className="text-base font-bold text-white">{asset}</span>
                </div>
                <div className="space-y-2">
                  {assetLevels.map(level => {
                    const style = LEVEL_STYLE[level.type] || LEVEL_STYLE.pivot
                    return (
                      <div key={level.id} className="flex items-center justify-between py-1 border-b border-gray-800/40 last:border-0">
                        <div className="flex items-center gap-2">
                          <span>{style.icon}</span>
                          <span className="text-white font-mono font-bold text-sm">
                            {level.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                          </span>
                          {level.note && (
                            <span className="text-gray-600 text-xs hidden md:inline truncate max-w-[80px]">— {level.note}</span>
                          )}
                        </div>
                        <span className={`text-xs font-medium text-right ${style.color}`}>{style.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-gray-600 text-xs mt-5">
          ⏰ Updated / Actualizado: {lastUpdate || '—'} · Educational purposes only / Solo con fines educativos. Not financial advice / No es asesoría financiera.
        </p>
      </div>
    </section>
  )
}
