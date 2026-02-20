'use client'

import { useState, useEffect, useCallback } from 'react'

const ASSET_ICONS: Record<string, string> = {
  'XAU/USD': '🥇', 'BTC/USD': '₿', 'EUR/USD': '💶', 'GBP/USD': '💷',
  'USD/JPY': '💴', 'XAG/USD': '🥈', 'US30': '📊', 'NAS100': '📈',
}

type TradeSignal = {
  id: string; asset: string; direction: string; entry: number; tp: number; sl: number
  status: string; result: number | null; note: string | null; createdAt: string
}

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  active: { label: 'ACTIVE / ACTIVO',       cls: 'bg-blue-900/40 text-blue-300 border border-blue-700/40' },
  hit_tp: { label: 'HIT TP / TP LOGRADO',  cls: 'bg-green-900/40 text-green-300 border border-green-700/40' },
  hit_sl: { label: 'HIT SL / SL TOCADO',   cls: 'bg-red-900/40 text-red-300 border border-red-700/40' },
  closed: { label: 'CLOSED / CERRADO',      cls: 'bg-gray-800 text-gray-400 border border-gray-700' },
}

export default function TradeSignals() {
  const [signals, setSignals] = useState<TradeSignal[]>([])
  const [lastUpdate, setLastUpdate] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch('/api/signals', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setSignals(Array.isArray(data) ? data : [])
        setLastUpdate(new Date().toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' }))
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSignals()
    const interval = setInterval(fetchSignals, 60000)
    return () => clearInterval(interval)
  }, [fetchSignals])

  if (!loading && signals.length === 0) return null

  const active = signals.filter(s => s.status === 'active')
  const closed = signals.filter(s => s.status !== 'active')

  return (
    <section className="py-12 px-4 relative z-10 border-t border-[#c9a227]/10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              📡 <span className="text-[#c9a227]">Trade Signals</span>{' '}
              <span className="text-gray-600 font-normal text-base">/ Señales de Trading</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {active.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-green-400 text-sm font-medium">
                  {active.length} active / activa{active.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            {lastUpdate && (
              <span className="text-gray-600 text-xs hidden sm:block">Updated / Actualizado: {lastUpdate}</span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-[#111120] border border-gray-800 rounded-xl p-5 animate-pulse">
                <div className="h-5 bg-gray-800 rounded mb-4 w-1/3"></div>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map(j => <div key={j} className="h-12 bg-gray-800 rounded"></div>)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {[...active, ...closed].map(signal => {
              const statusStyle = STATUS_STYLE[signal.status] || STATUS_STYLE.closed
              const isBuy = signal.direction === 'BUY'
              const date = new Date(signal.createdAt).toLocaleDateString('es-PY', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
              })

              return (
                <div
                  key={signal.id}
                  className={`bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] rounded-xl p-5 border ${
                    signal.status === 'active'
                      ? isBuy ? 'border-green-700/40' : 'border-red-700/40'
                      : 'border-gray-800'
                  } ${signal.status !== 'active' ? 'opacity-70' : ''}`}
                >
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="text-xl">{ASSET_ICONS[signal.asset] || '📊'}</span>
                    <span className="text-white font-bold text-lg">{signal.asset}</span>

                    <span className={`font-bold text-sm px-3 py-1 rounded-full flex items-center gap-1 ${
                      isBuy ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                    }`}>
                      {isBuy ? '📈 BUY / COMPRA' : '📉 SELL / VENTA'}
                    </span>

                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusStyle.cls}`}>
                      {statusStyle.label}
                    </span>

                    {signal.result !== null && (
                      <span className={`text-sm font-bold ${signal.result >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {signal.result >= 0 ? '+' : ''}{signal.result}%
                      </span>
                    )}

                    <span className="text-gray-600 text-xs ml-auto">{date}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-[#0d0d0d] border border-gray-800 rounded-lg p-3 text-center">
                      <div className="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-wide">Entry / Entrada</div>
                      <div className="text-white font-mono font-bold text-base">
                        {signal.entry.toLocaleString(undefined, { maximumFractionDigits: 5 })}
                      </div>
                    </div>
                    <div className="bg-[#0d0d0d] border border-green-900/30 rounded-lg p-3 text-center">
                      <div className="text-green-500 text-xs font-semibold mb-1 uppercase tracking-wide">Take Profit / TP</div>
                      <div className="text-green-400 font-mono font-bold text-base">
                        {signal.tp.toLocaleString(undefined, { maximumFractionDigits: 5 })}
                      </div>
                    </div>
                    <div className="bg-[#0d0d0d] border border-red-900/30 rounded-lg p-3 text-center">
                      <div className="text-red-500 text-xs font-semibold mb-1 uppercase tracking-wide">Stop Loss / SL</div>
                      <div className="text-red-400 font-mono font-bold text-base">
                        {signal.sl.toLocaleString(undefined, { maximumFractionDigits: 5 })}
                      </div>
                    </div>
                  </div>

                  {signal.note && (
                    <p className="text-gray-500 text-sm italic">💬 {signal.note}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <p className="text-center text-gray-600 text-xs mt-5">
          ⏰ Updated / Actualizado: {lastUpdate || '—'} · Educational purposes only / Solo con fines educativos. Not financial advice / No es asesoría financiera.
        </p>
      </div>
    </section>
  )
}
