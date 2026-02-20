'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const ASSETS = ['XAU/USD', 'BTC/USD', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'XAG/USD', 'US30', 'NAS100']
const ASSET_ICONS: Record<string, string> = {
  'XAU/USD': '🥇', 'BTC/USD': '₿', 'EUR/USD': '💶', 'GBP/USD': '💷',
  'USD/JPY': '💴', 'XAG/USD': '🥈', 'US30': '📊', 'NAS100': '📈',
}
const LEVEL_TYPES = [
  { value: 'strong_resistance', label: '🔴 Strong Resistance' },
  { value: 'resistance', label: '🟠 Resistance' },
  { value: 'pivot', label: '⚪ Pivot' },
  { value: 'support', label: '🟢 Support' },
  { value: 'strong_support', label: '💚 Strong Support' },
]
const TYPE_LABEL: Record<string, string> = {
  strong_resistance: '🔴 Strong Resistance',
  resistance: '🟠 Resistance',
  pivot: '⚪ Pivot',
  support: '🟢 Support',
  strong_support: '💚 Strong Support',
}
const TYPE_ORDER = ['strong_resistance', 'resistance', 'pivot', 'support', 'strong_support']

type PriceLevel = {
  id: string; asset: string; price: number; type: string; note: string | null; createdAt: string
}
type TradeSignal = {
  id: string; asset: string; direction: string; entry: number; tp: number; sl: number
  status: string; result: number | null; note: string | null; createdAt: string
}

const inputCls = 'bg-[#0d0d0d] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#c9a227] w-full'

export default function AdminLevelsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [levels, setLevels] = useState<PriceLevel[]>([])
  const [signals, setSignals] = useState<TradeSignal[]>([])
  const [levelForm, setLevelForm] = useState({ asset: '', price: '', type: '', note: '' })
  const [signalForm, setSignalForm] = useState({ asset: '', direction: 'BUY', entry: '', tp: '', sl: '', note: '' })
  const [levelLoading, setLevelLoading] = useState(false)
  const [signalLoading, setSignalLoading] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  const user = session?.user as any
  const isAdmin = user?.email === 'raul@sacredlevels.com' || user?.role === 'admin'

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && !isAdmin) router.push('/')
  }, [status, isAdmin, router])

  const fetchData = useCallback(async () => {
    const [l, s] = await Promise.all([
      fetch('/api/levels').then(r => r.json()),
      fetch('/api/signals').then(r => r.json()),
    ])
    setLevels(Array.isArray(l) ? l : [])
    setSignals(Array.isArray(s) ? s : [])
  }, [])

  useEffect(() => { if (isAdmin) fetchData() }, [isAdmin, fetchData])

  function flash(text: string, ok = true) {
    setMsg({ text, ok })
    setTimeout(() => setMsg(null), 3500)
  }

  async function addLevel(e: React.FormEvent) {
    e.preventDefault()
    if (!levelForm.asset || !levelForm.price || !levelForm.type) return flash('Completá todos los campos', false)
    setLevelLoading(true)
    const res = await fetch('/api/levels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(levelForm),
    })
    setLevelLoading(false)
    if (res.ok) {
      flash('Nivel agregado ✓')
      setLevelForm({ asset: '', price: '', type: '', note: '' })
      fetchData()
    } else {
      flash('Error al agregar nivel', false)
    }
  }

  async function deleteLevel(id: string) {
    await fetch(`/api/levels/${id}`, { method: 'DELETE' })
    setLevels(prev => prev.filter(l => l.id !== id))
  }

  async function clearAllLevels() {
    if (!confirm('¿Borrar TODOS los niveles? Esto no se puede deshacer.')) return
    const res = await fetch('/api/levels/clear', { method: 'DELETE' })
    if (res.ok) { flash('Todos los niveles eliminados'); setLevels([]) }
  }

  async function addSignal(e: React.FormEvent) {
    e.preventDefault()
    if (!signalForm.asset || !signalForm.entry || !signalForm.tp || !signalForm.sl) return flash('Completá todos los campos', false)
    setSignalLoading(true)
    const res = await fetch('/api/signals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signalForm),
    })
    setSignalLoading(false)
    if (res.ok) {
      flash('Señal publicada ✓')
      setSignalForm({ asset: '', direction: 'BUY', entry: '', tp: '', sl: '', note: '' })
      fetchData()
    } else {
      flash('Error al publicar señal', false)
    }
  }

  async function updateSignal(id: string, status: string, result?: number) {
    await fetch(`/api/signals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, result }),
    })
    fetchData()
  }

  async function deleteSignal(id: string) {
    await fetch(`/api/signals/${id}`, { method: 'DELETE' })
    setSignals(prev => prev.filter(s => s.id !== id))
  }

  // Group levels by asset, sorted by type order
  const groupedLevels = levels.reduce<Record<string, PriceLevel[]>>((acc, l) => {
    if (!acc[l.asset]) acc[l.asset] = []
    acc[l.asset].push(l)
    return acc
  }, {})
  Object.values(groupedLevels).forEach(arr =>
    arr.sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type))
  )

  if (status === 'loading' || !isAdmin) return null

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-[#c9a227]/20 bg-[#0a0a0f]/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <div>
              <h1 className="text-lg font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-[#c9a227]">Price Levels & Trade Signals</p>
            </div>
          </div>
          <a href="/" className="text-sm text-gray-400 hover:text-white transition-colors">← Home</a>
        </div>
      </div>

      {/* Flash message */}
      {msg && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-lg font-medium text-sm ${msg.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {msg.text}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* ── KEY LEVELS ── */}
        <h2 className="text-2xl font-bold text-[#c9a227] mb-6">📊 Key Levels</h2>

        {/* Add Level Form */}
        <form onSubmit={addLevel} className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-[#c9a227]/30 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-[#c9a227] mb-4">➕ Add Key Level</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <select value={levelForm.asset} onChange={e => setLevelForm(p => ({ ...p, asset: e.target.value }))} className={inputCls}>
              <option value="">Select Asset</option>
              {ASSETS.map(a => <option key={a} value={a}>{ASSET_ICONS[a]} {a}</option>)}
            </select>
            <input
              type="number" step="0.01" placeholder="Price Level"
              value={levelForm.price}
              onChange={e => setLevelForm(p => ({ ...p, price: e.target.value }))}
              className={inputCls}
            />
            <select value={levelForm.type} onChange={e => setLevelForm(p => ({ ...p, type: e.target.value }))} className={inputCls}>
              <option value="">Level Type</option>
              {LEVEL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <input
              type="text" placeholder="Note (optional)"
              value={levelForm.note}
              onChange={e => setLevelForm(p => ({ ...p, note: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={levelLoading} className="bg-[#c9a227] hover:bg-[#d4af37] disabled:opacity-60 text-black font-bold px-6 py-3 rounded-lg transition-colors">
              {levelLoading ? '⏳ Adding...' : '➕ Add Level'}
            </button>
            <button type="button" onClick={clearAllLevels} className="bg-red-900/50 hover:bg-red-800 border border-red-700/50 text-red-300 font-bold px-6 py-3 rounded-lg transition-colors">
              🗑️ Clear All Levels
            </button>
            <span className="text-gray-500 text-sm">{levels.length} active levels</span>
          </div>
        </form>

        {/* Levels list grouped by asset */}
        {Object.keys(groupedLevels).length === 0 ? (
          <p className="text-gray-600 text-center py-8">No hay niveles activos. Agrega el primero.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {Object.entries(groupedLevels).map(([asset, assetLevels]) => (
              <div key={asset} className="bg-[#111120] border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-800">
                  <span className="text-xl">{ASSET_ICONS[asset] || '📊'}</span>
                  <span className="font-bold text-white">{asset}</span>
                  <span className="ml-auto text-xs text-gray-600">{assetLevels.length} levels</span>
                </div>
                <div className="space-y-2">
                  {assetLevels.map(level => (
                    <div key={level.id} className="flex items-center justify-between group">
                      <div className="flex-1 min-w-0">
                        <span className="text-white font-mono font-semibold">{level.price.toLocaleString()}</span>
                        <span className="text-gray-500 text-xs ml-2">{TYPE_LABEL[level.type]}</span>
                        {level.note && <p className="text-gray-600 text-xs truncate">{level.note}</p>}
                      </div>
                      <button
                        onClick={() => deleteLevel(level.id)}
                        className="ml-2 text-red-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-lg flex-shrink-0"
                        title="Delete"
                      >🗑️</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TRADE SIGNALS ── */}
        <h2 className="text-2xl font-bold text-[#c9a227] mb-6">📡 Trade Signals</h2>

        {/* Add Signal Form */}
        <form onSubmit={addSignal} className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-[#c9a227]/30 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-[#c9a227] mb-4">🚀 Publish Signal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <select value={signalForm.asset} onChange={e => setSignalForm(p => ({ ...p, asset: e.target.value }))} className={inputCls}>
              <option value="">Select Asset</option>
              {ASSETS.map(a => <option key={a} value={a}>{ASSET_ICONS[a]} {a}</option>)}
            </select>
            <select value={signalForm.direction} onChange={e => setSignalForm(p => ({ ...p, direction: e.target.value }))} className={inputCls}>
              <option value="BUY">📈 BUY</option>
              <option value="SELL">📉 SELL</option>
            </select>
            <input type="number" step="0.01" placeholder="Entry" value={signalForm.entry} onChange={e => setSignalForm(p => ({ ...p, entry: e.target.value }))} className={inputCls} />
            <input type="number" step="0.01" placeholder="Take Profit (TP)" value={signalForm.tp} onChange={e => setSignalForm(p => ({ ...p, tp: e.target.value }))} className={inputCls} />
            <input type="number" step="0.01" placeholder="Stop Loss (SL)" value={signalForm.sl} onChange={e => setSignalForm(p => ({ ...p, sl: e.target.value }))} className={inputCls} />
            <input type="text" placeholder="Note (optional)" value={signalForm.note} onChange={e => setSignalForm(p => ({ ...p, note: e.target.value }))} className={inputCls} />
          </div>
          <button type="submit" disabled={signalLoading} className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-lg transition-colors">
            {signalLoading ? '⏳ Publishing...' : '🚀 Publish Signal'}
          </button>
        </form>

        {/* Signals list */}
        {signals.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No hay señales. Publica la primera.</p>
        ) : (
          <div className="space-y-3">
            {signals.map(signal => {
              const statusBadge: Record<string, string> = {
                active: 'bg-blue-900/50 text-blue-300 border-blue-700/50',
                hit_tp: 'bg-green-900/50 text-green-300 border-green-700/50',
                hit_sl: 'bg-red-900/50 text-red-300 border-red-700/50',
                closed: 'bg-gray-800 text-gray-400 border-gray-700',
              }
              const statusLabel: Record<string, string> = {
                active: '🔵 ACTIVE', hit_tp: '✅ HIT TP', hit_sl: '❌ HIT SL', closed: '🔴 CLOSED'
              }
              return (
                <div key={signal.id} className="bg-[#111120] border border-gray-800 rounded-xl p-4">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="text-white font-bold text-lg">{ASSET_ICONS[signal.asset] || '📊'} {signal.asset}</span>
                    <span className={`font-bold text-sm px-3 py-1 rounded-full ${signal.direction === 'BUY' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                      {signal.direction === 'BUY' ? '📈 BUY' : '📉 SELL'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full border ${statusBadge[signal.status] || statusBadge.closed}`}>
                      {statusLabel[signal.status] || signal.status}
                    </span>
                    {signal.result !== null && (
                      <span className={`text-sm font-bold ${signal.result >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {signal.result >= 0 ? '+' : ''}{signal.result}%
                      </span>
                    )}
                    <span className="text-gray-600 text-xs ml-auto">{new Date(signal.createdAt).toLocaleString('es-PY')}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3 text-center">
                    <div className="bg-[#0d0d0d] rounded-lg p-2">
                      <div className="text-gray-500 text-xs mb-1">ENTRY</div>
                      <div className="text-white font-mono font-bold">{signal.entry.toLocaleString()}</div>
                    </div>
                    <div className="bg-[#0d0d0d] rounded-lg p-2">
                      <div className="text-green-500 text-xs mb-1">TP</div>
                      <div className="text-green-400 font-mono font-bold">{signal.tp.toLocaleString()}</div>
                    </div>
                    <div className="bg-[#0d0d0d] rounded-lg p-2">
                      <div className="text-red-500 text-xs mb-1">SL</div>
                      <div className="text-red-400 font-mono font-bold">{signal.sl.toLocaleString()}</div>
                    </div>
                  </div>

                  {signal.note && <p className="text-gray-500 text-sm mb-3 italic">{signal.note}</p>}

                  {signal.status === 'active' && (
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => updateSignal(signal.id, 'hit_tp')} className="bg-green-900/50 hover:bg-green-800 text-green-300 text-sm font-bold px-3 py-1.5 rounded-lg border border-green-700/50 transition-colors">
                        ✅ Hit TP
                      </button>
                      <button onClick={() => updateSignal(signal.id, 'hit_sl')} className="bg-red-900/50 hover:bg-red-800 text-red-300 text-sm font-bold px-3 py-1.5 rounded-lg border border-red-700/50 transition-colors">
                        ❌ Hit SL
                      </button>
                      <button onClick={() => updateSignal(signal.id, 'closed')} className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-bold px-3 py-1.5 rounded-lg border border-gray-700 transition-colors">
                        🔴 Close
                      </button>
                    </div>
                  )}
                  <button onClick={() => deleteSignal(signal.id)} className="mt-2 text-red-700 hover:text-red-400 text-sm transition-colors">
                    🗑️ Delete
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
