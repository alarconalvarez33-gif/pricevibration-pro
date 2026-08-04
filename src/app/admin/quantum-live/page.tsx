'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/lib/constants'

const ASSETS = ['XAU/USD', 'BTC/USD', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'XAG/USD', 'US30', 'NAS100']
const ASSET_ICONS: Record<string, string> = {
  'XAU/USD': '🥇', 'BTC/USD': '₿', 'EUR/USD': '💶', 'GBP/USD': '💷',
  'USD/JPY': '💴', 'XAG/USD': '🥈', 'US30': '📊', 'NAS100': '📈',
}

type QuantumLevel = {
  n: number; price: number; probability: number
  type: 'accumulation' | 'equilibrium' | 'distribution'
  strength: 'extreme' | 'strong' | 'moderate'
}

type Touch = { level: string; time: string; type: 'bounce' | 'break'; pips?: number }

type QLRecord = {
  id: string; asset: string; maxPrice: number; minPrice: number
  levels: QuantumLevel[]; isActive: boolean; touches: Touch[] | null
  createdAt: string
}

const inputCls = 'bg-[#0d0d0d] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 w-full'

export default function AdminQuantumLivePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = session?.user as any
  const adminAccess = isAdmin(user?.email)

  const [records, setRecords] = useState<QLRecord[]>([])
  const [form, setForm] = useState({ asset: 'XAU/USD', maxPrice: '', minPrice: '' })
  const [touchForm, setTouchForm] = useState<{ id: string; level: string; type: 'bounce' | 'break'; pips: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && !adminAccess) router.push('/')
  }, [status, adminAccess, router])

  const fetchRecords = useCallback(async () => {
    try {
      // Fetch all (active + inactive) via admin view
      const res = await fetch('/api/quantum-live/all')
      if (res.ok) setRecords(await res.json())
    } catch {}
  }, [])

  useEffect(() => { if (adminAccess) fetchRecords() }, [adminAccess, fetchRecords])

  function flash(text: string, ok = true) {
    setMsg({ text, ok })
    setTimeout(() => setMsg(null), 3500)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.asset || !form.maxPrice || !form.minPrice) return flash('Completá todos los campos', false)
    setSubmitting(true)
    try {
      const res = await fetch('/api/quantum-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        flash('Niveles cuánticos publicados ✓')
        setForm({ asset: 'XAU/USD', maxPrice: '', minPrice: '' })
        fetchRecords()
      } else {
        const err = await res.json()
        flash(err.error || 'Error al publicar', false)
      }
    } catch {
      flash('Error de conexión', false)
    }
    setSubmitting(false)
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch('/api/quantum-live', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !current }),
    })
    fetchRecords()
  }

  async function addTouch(id: string) {
    if (!touchForm) return
    await fetch('/api/quantum-live', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        touch: {
          level: touchForm.level,
          type: touchForm.type,
          pips: touchForm.pips ? parseInt(touchForm.pips) : undefined,
          time: new Date().toLocaleString('es-PY'),
        },
      }),
    })
    setTouchForm(null)
    fetchRecords()
    flash('Toque registrado ✓')
  }

  if (status === 'loading' || !adminAccess) return null

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-[#0a0a0f]/95 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔬</span>
            <div>
              <h1 className="text-lg font-bold text-white">Quantum Live Admin</h1>
              <p className="text-xs text-purple-400">Publicar niveles cuánticos en vivo</p>
            </div>
          </div>
          <div className="flex gap-4">
            <a href="/admin/levels" className="text-sm text-gray-400 hover:text-white transition-colors">← Volver</a>
          </div>
        </div>
      </div>

      {/* Flash */}
      {msg && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-lg font-medium text-sm ${msg.ok ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          {msg.text}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* New levels form */}
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-purple-500/30 rounded-xl p-6 mb-10">
          <h2 className="text-xl font-bold text-purple-400 mb-5">➕ Publicar Nuevos Niveles Cuánticos</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-gray-400 text-sm block mb-2">Activo</label>
              <select value={form.asset} onChange={e => setForm(p => ({ ...p, asset: e.target.value }))} className={inputCls}>
                {ASSETS.map(a => <option key={a} value={a}>{ASSET_ICONS[a]} {a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-2">Máximo (High)</label>
              <input
                type="number" step="0.01" placeholder="ej: 4180"
                value={form.maxPrice}
                onChange={e => setForm(p => ({ ...p, maxPrice: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-2">Mínimo (Low)</label>
              <input
                type="number" step="0.01" placeholder="ej: 4080"
                value={form.minPrice}
                onChange={e => setForm(p => ({ ...p, minPrice: e.target.value }))}
                className={inputCls}
              />
            </div>
          </div>
          <p className="text-gray-600 text-xs mb-4">Al publicar, los niveles anteriores del mismo activo se desactivan automáticamente.</p>
          <button
            type="submit" disabled={submitting}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-lg transition-colors"
          >
            {submitting ? '⏳ Publicando...' : '🔬 Calcular y Publicar'}
          </button>
        </form>

        {/* Existing records */}
        <h2 className="text-xl font-bold text-[#c9a227] mb-5">📋 Niveles publicados</h2>

        {records.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No hay niveles publicados aún.</p>
        ) : (
          <div className="space-y-6">
            {records.map(rec => (
              <div key={rec.id} className={`rounded-xl border p-5 ${rec.isActive ? 'border-purple-500/40 bg-purple-900/10' : 'border-gray-800 bg-[#111120] opacity-60'}`}>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="text-xl">{ASSET_ICONS[rec.asset] || '📊'}</span>
                  <span className="font-bold text-white text-lg">{rec.asset}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${rec.isActive ? 'bg-green-900/50 text-green-300 border border-green-700/50' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
                    {rec.isActive ? '✅ ACTIVO' : '⏸ INACTIVO'}
                  </span>
                  <span className="text-gray-600 text-xs ml-auto">
                    {new Date(rec.createdAt).toLocaleString('es-PY')}
                  </span>
                  <button
                    onClick={() => toggleActive(rec.id, rec.isActive)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${rec.isActive ? 'bg-red-900/40 text-red-300 border-red-700/50 hover:bg-red-800/60' : 'bg-green-900/40 text-green-300 border-green-700/50 hover:bg-green-800/60'}`}
                  >
                    {rec.isActive ? '⏸ Desactivar' : '▶ Activar'}
                  </button>
                </div>

                <div className="text-gray-500 text-sm mb-4">
                  Min: <span className="text-white font-mono">{rec.minPrice.toLocaleString()}</span>
                  {' · '}
                  Max: <span className="text-white font-mono">{rec.maxPrice.toLocaleString()}</span>
                </div>

                {/* Levels grid */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                  {Array.isArray(rec.levels) && rec.levels.map((lv) => (
                    <div
                      key={lv.n}
                      className={`text-center p-2 rounded-lg text-xs border ${
                        lv.type === 'distribution' ? 'bg-red-900/20 border-red-500/30 text-red-300' :
                        lv.type === 'accumulation' ? 'bg-green-900/20 border-green-500/30 text-green-300' :
                        'bg-yellow-900/20 border-yellow-500/30 text-yellow-300'
                      }`}
                    >
                      <div className="font-bold text-white font-mono">{lv.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                      <div>Q{lv.n}</div>
                    </div>
                  ))}
                </div>

                {/* Touches */}
                {Array.isArray(rec.touches) && rec.touches.length > 0 && (
                  <div className="mb-4 text-xs space-y-1">
                    <p className="text-[#c9a227] font-bold mb-1">Toques:</p>
                    {rec.touches.map((t, i) => (
                      <p key={i} className={t.type === 'bounce' ? 'text-green-400' : 'text-red-400'}>
                        {t.level} — {t.type} {t.pips ? `+${t.pips}p` : ''} · {t.time}
                      </p>
                    ))}
                  </div>
                )}

                {/* Add touch */}
                {rec.isActive && (
                  touchForm?.id === rec.id ? (
                    <div className="flex flex-wrap gap-2 items-end">
                      <select
                        value={touchForm.level}
                        onChange={e => setTouchForm(p => p ? { ...p, level: e.target.value } : p)}
                        className="bg-[#0d0d0d] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                      >
                        {Array.isArray(rec.levels) && rec.levels.map(lv => (
                          <option key={lv.n} value={`Q${lv.n} (${lv.price})`}>Q{lv.n} — {lv.price.toFixed(2)}</option>
                        ))}
                      </select>
                      <select
                        value={touchForm.type}
                        onChange={e => setTouchForm(p => p ? { ...p, type: e.target.value as 'bounce' | 'break' } : p)}
                        className="bg-[#0d0d0d] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                      >
                        <option value="bounce">↩ Bounce</option>
                        <option value="break">↗ Break</option>
                      </select>
                      <input
                        type="number" placeholder="pips"
                        value={touchForm.pips}
                        onChange={e => setTouchForm(p => p ? { ...p, pips: e.target.value } : p)}
                        className="bg-[#0d0d0d] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none w-20"
                      />
                      <button onClick={() => addTouch(rec.id)} className="bg-green-700 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg text-sm">✅ Guardar</button>
                      <button onClick={() => setTouchForm(null)} className="text-gray-500 hover:text-white text-sm px-3 py-2">✕</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setTouchForm({ id: rec.id, level: `Q4 (${rec.levels[4]?.price})`, type: 'bounce', pips: '' })}
                      className="text-xs text-purple-400 hover:text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      + Registrar toque
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
