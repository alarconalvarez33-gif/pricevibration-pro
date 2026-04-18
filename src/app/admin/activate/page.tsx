'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'

const ADMIN_EMAILS = ['raul@sacredlevels.com', 'alarconalvarez33@gmail.com']

const BG     = '#0A0A0B'
const CARD   = '#141415'
const BORDER = '#222222'
const MUTED  = '#555555'
const AMBER  = '#fbbf24'
const RED    = '#FF4757'
const GREEN  = '#00D26A'
const CYAN   = '#00E5FF'

const PRODUCTS = [
  { key: 'genesis',           label: 'Genesis — Gs. 500.000',            badge: '👑' },
  { key: 'canal-paralelo',    label: 'Canal Paralelo — Gs. 320.000',     badge: '🎓' },
  { key: 'fibonacci',         label: 'Fibonacci Avanzado — Gs. 320.000', badge: '📊' },
  { key: 'super-estrategia',  label: 'Super Estrategia — Gs. 65.000',    badge: '🏆' },
  { key: 'quantum-access',    label: 'Quantum Access — Gs. 180.000',     badge: '⚡' },
]

const PRODUCT_LABEL: Record<string, string> = {
  'expansion-matematica': 'Genesis',
  'canal-paralelo':       'Canal Paralelo',
  'fibonacci':            'Fibonacci Avanzado',
  'super-estrategia':     'Super Estrategia',
  'quantum-access':       'Quantum Access',
  'quantum':              'Quantum Access',
  'adx':                  'Estrategia ADX',
}

interface Activation {
  id: string
  date: string
  email: string
  product: string
  type: string
  source: 'manual' | 'pagopar'
}

interface PendingItem {
  id: string
  type: 'subscription' | 'product'
  email: string
  name: string | null
  product: string
  amount: number
  currency: string
  pagoparHash: string | null
  orderId: string
  createdAt: string
  isOld: boolean
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('es-PY', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtGs(n: number) {
  return 'Gs. ' + n.toLocaleString('es-PY')
}

export default function AdminActivatePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Quick activation form
  const [email, setEmail]         = useState('')
  const [productKey, setProductKey] = useState('genesis')
  const [suggestions, setSuggestions] = useState<{ email: string; name: string | null; plan: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState<{ type: 'success' | 'warning' | 'error'; msg: string } | null>(null)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // History
  const [activations, setActivations] = useState<Activation[]>([])
  const [logsLoading, setLogsLoading] = useState(true)

  // Pending payments
  const [pending, setPending]         = useState<PendingItem[]>([])
  const [pendingLoading, setPendingLoading] = useState(true)
  const [failedWebhooks, setFailedWebhooks] = useState(0)
  const [oldCount, setOldCount]       = useState(0)

  // Per-row activation state
  const [activatingId, setActivatingId] = useState<string | null>(null)
  const [verifyingId,  setVerifyingId]  = useState<string | null>(null)
  const [rowResult, setRowResult] = useState<Record<string, { ok: boolean; msg: string }>>({})

  const userEmail = session?.user?.email

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated' && userEmail && !ADMIN_EMAILS.includes(userEmail)) router.push('/dashboard')
  }, [status, userEmail, router])

  const loadLogs = useCallback(() => {
    setLogsLoading(true)
    fetch('/api/admin/activate')
      .then(r => r.json())
      .then(d => { if (d.activations) setActivations(d.activations) })
      .catch(() => {})
      .finally(() => setLogsLoading(false))
  }, [])

  const loadPending = useCallback(() => {
    setPendingLoading(true)
    fetch('/api/admin/pending-payments')
      .then(r => r.json())
      .then(d => {
        setPending(d.pending ?? [])
        setFailedWebhooks(d.failedWebhooks24h ?? 0)
        setOldCount(d.oldCount ?? 0)
      })
      .catch(() => {})
      .finally(() => setPendingLoading(false))
  }, [])

  useEffect(() => {
    if (status === 'authenticated' && userEmail && ADMIN_EMAILS.includes(userEmail)) {
      loadLogs()
      loadPending()
    }
  }, [status, userEmail, loadLogs, loadPending])

  // Autocomplete
  const handleEmailChange = (val: string) => {
    setEmail(val)
    setResult(null)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (val.length < 3) { setSuggestions([]); setShowSuggestions(false); return }
    searchTimeout.current = setTimeout(() => {
      fetch(`/api/admin/users-search?q=${encodeURIComponent(val)}`)
        .then(r => r.json())
        .then(d => { setSuggestions(d.users ?? []); setShowSuggestions(true) })
        .catch(() => {})
    }, 250)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true); setResult(null)
    try {
      const res = await fetch('/api/admin/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), productKey }),
      })
      const data = await res.json()
      if (data.success)       { setResult({ type: 'success', msg: data.message }); loadLogs() }
      else if (data.warning)  { setResult({ type: 'warning', msg: data.warning }) }
      else                    { setResult({ type: 'error',   msg: data.error || 'Error desconocido.' }) }
    } catch { setResult({ type: 'error', msg: 'Error de conexión.' }) }
    setLoading(false)
  }

  // Activate a pending payment with 1 click
  const handleActivatePending = async (item: PendingItem) => {
    setActivatingId(item.id)
    try {
      const res = await fetch('/api/admin/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingId: item.id, pendingType: item.type }),
      })
      const data = await res.json()
      if (data.success || data.warning) {
        setRowResult(prev => ({ ...prev, [item.id]: { ok: true, msg: data.message || data.warning } }))
        loadPending(); loadLogs()
      } else {
        setRowResult(prev => ({ ...prev, [item.id]: { ok: false, msg: data.error || 'Error' } }))
      }
    } catch {
      setRowResult(prev => ({ ...prev, [item.id]: { ok: false, msg: 'Error de conexión' } }))
    }
    setActivatingId(null)
  }

  // Verify a pending payment directly with PagoPar
  const handleVerifyPagopar = async (item: PendingItem) => {
    if (!item.pagoparHash) return
    setVerifyingId(item.id)
    try {
      const res = await fetch('/api/pagopar/check-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash_pedido: item.pagoparHash }),
      })
      const data = await res.json()
      const r = data?.data?.resultado?.[0]
      if (r) {
        const pagado    = r.pagado
        const fechaPago = r.fecha_pago
        const msg = pagado
          ? `✅ PagoPar confirma PAGADO${fechaPago ? ' — ' + fechaPago : ''}`
          : `⏳ PagoPar: aún NO pagado`
        setRowResult(prev => ({ ...prev, [item.id]: { ok: !!pagado, msg } }))
        if (pagado) { loadPending(); loadLogs() }
      } else {
        setRowResult(prev => ({ ...prev, [item.id]: { ok: false, msg: 'Sin respuesta de PagoPar' } }))
      }
    } catch {
      setRowResult(prev => ({ ...prev, [item.id]: { ok: false, msg: 'Error al consultar PagoPar' } }))
    }
    setVerifyingId(null)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: AMBER, borderTopColor: 'transparent' }} />
      </div>
    )
  }
  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) return null

  const hasAlerts = failedWebhooks > 0 || oldCount > 0

  return (
    <div className="min-h-screen px-4 py-10" style={{ backgroundColor: BG, fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Panel de Activaciones</h1>
            <p className="text-xs mt-1" style={{ color: MUTED }}>Gestión de accesos y pagos PagoPar</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/activate/logs"
              className="text-xs uppercase tracking-widest px-4 py-2 border rounded transition-colors hover:text-white"
              style={{ borderColor: '#333', color: MUTED }}
            >
              Logs Webhook
            </Link>
            <Link
              href="/admin/results"
              className="text-xs uppercase tracking-widest px-4 py-2 border rounded transition-colors hover:text-white"
              style={{ borderColor: '#333', color: MUTED }}
            >
              Resultados
            </Link>
            <Link
              href="/dashboard"
              className="text-xs uppercase tracking-widest px-4 py-2 border rounded transition-colors hover:text-white"
              style={{ borderColor: '#333', color: MUTED }}
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Alerts */}
        {hasAlerts && (
          <div className="flex flex-wrap gap-3">
            {failedWebhooks > 0 && (
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold"
                style={{ borderColor: `${RED}40`, backgroundColor: `${RED}08`, color: RED }}
              >
                ⚠️ {failedWebhooks} webhook{failedWebhooks > 1 ? 's' : ''} fallido{failedWebhooks > 1 ? 's' : ''} en las últimas 24 h
              </div>
            )}
            {oldCount > 0 && (
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold"
                style={{ borderColor: `${AMBER}40`, backgroundColor: `${AMBER}08`, color: AMBER }}
              >
                🕐 {oldCount} pago{oldCount > 1 ? 's' : ''} pendiente{oldCount > 1 ? 's' : ''} hace +48 h
              </div>
            )}
          </div>
        )}

        {/* Pending payments */}
        <div className="border rounded-xl overflow-hidden" style={{ backgroundColor: CARD, borderColor: BORDER }}>
          <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: BORDER, backgroundColor: '#0d0d0e' }}>
            <span className="text-white font-bold text-sm">
              Pagos pendientes de activación
              {!pendingLoading && pending.length > 0 && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${AMBER}20`, color: AMBER }}>
                  {pending.length}
                </span>
              )}
            </span>
            <button onClick={loadPending} className="text-xs uppercase tracking-widest transition-colors hover:text-white" style={{ color: MUTED }}>
              Actualizar
            </button>
          </div>

          {pendingLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: AMBER, borderTopColor: 'transparent' }} />
            </div>
          ) : pending.length === 0 ? (
            <div className="py-8 text-center" style={{ color: MUTED }}>
              <p className="text-sm">✓ No hay pagos pendientes</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: '#111' }}>
              {pending.map(item => (
                <div key={item.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white text-sm font-semibold truncate">{item.email}</span>
                        {item.name && <span className="text-xs" style={{ color: MUTED }}>{item.name}</span>}
                        {item.isOld && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ backgroundColor: `${RED}18`, color: RED }}>
                            +48h
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs" style={{ color: CYAN }}>
                          {PRODUCT_LABEL[item.product] ?? item.product}
                        </span>
                        <span className="text-xs font-mono" style={{ color: MUTED }}>{fmtGs(item.amount)}</span>
                        <span className="text-xs font-mono" style={{ color: '#333' }}>{fmtDate(item.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {rowResult[item.id] ? (
                        <span
                          className="text-xs px-3 py-1.5 rounded font-semibold"
                          style={{
                            backgroundColor: rowResult[item.id].ok ? `${GREEN}15` : `${RED}15`,
                            color: rowResult[item.id].ok ? GREEN : RED,
                          }}
                        >
                          {rowResult[item.id].msg}
                        </span>
                      ) : (
                        <>
                          {item.pagoparHash && (
                            <button
                              onClick={() => handleVerifyPagopar(item)}
                              disabled={verifyingId === item.id}
                              className="text-xs px-3 py-1.5 border rounded transition-all hover:border-white/30 disabled:opacity-40"
                              style={{ borderColor: '#333', color: MUTED }}
                            >
                              {verifyingId === item.id ? '...' : 'Verificar'}
                            </button>
                          )}
                          <button
                            onClick={() => handleActivatePending(item)}
                            disabled={activatingId === item.id}
                            className="text-xs px-4 py-1.5 rounded font-bold uppercase tracking-wider transition-opacity hover:opacity-90 disabled:opacity-40"
                            style={{ backgroundColor: AMBER, color: '#000' }}
                          >
                            {activatingId === item.id ? 'Activando...' : 'Activar'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick activation form */}
        <div className="border rounded-xl p-6" style={{ backgroundColor: CARD, borderColor: BORDER }}>
          <h2 className="text-white font-bold text-sm mb-5 uppercase tracking-widest">Activación rápida por email</h2>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email with autocomplete */}
            <div className="relative">
              <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: MUTED }}>
                Email del usuario
              </label>
              <input
                type="email"
                value={email}
                onChange={e => handleEmailChange(e.target.value)}
                onFocus={e  => { e.currentTarget.style.borderColor = `${AMBER}60`; if (suggestions.length > 0) setShowSuggestions(true) }}
                onBlur={e   => { e.currentTarget.style.borderColor = BORDER; setTimeout(() => setShowSuggestions(false), 150) }}
                placeholder="usuario@email.com"
                className="w-full border rounded-lg px-4 py-3 text-white text-sm focus:outline-none transition-colors min-h-[52px]"
                style={{ backgroundColor: BG, borderColor: BORDER }}
                autoComplete="off"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 z-20 border rounded-lg overflow-hidden shadow-xl mt-1"
                  style={{ backgroundColor: '#1a1a1b', borderColor: '#333' }}
                >
                  {suggestions.map(u => (
                    <button
                      key={u.email}
                      type="button"
                      onClick={() => { setEmail(u.email); setShowSuggestions(false); setSuggestions([]) }}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors border-b last:border-0"
                      style={{ borderColor: '#2a2a2a' }}
                    >
                      <div>
                        <p className="text-white text-sm">{u.email}</p>
                        {u.name && <p className="text-xs" style={{ color: MUTED }}>{u.name}</p>}
                      </div>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded border uppercase font-bold"
                        style={{
                          color: u.plan === 'quantum' ? CYAN : MUTED,
                          borderColor: u.plan === 'quantum' ? `${CYAN}30` : '#333',
                        }}
                      >
                        {u.plan}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product selector */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: MUTED }}>Producto</label>
              <div className="grid grid-cols-1 gap-2">
                {PRODUCTS.map(p => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setProductKey(p.key)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all min-h-[52px]"
                    style={{
                      borderColor: productKey === p.key ? AMBER : '#2a2a2a',
                      backgroundColor: productKey === p.key ? `${AMBER}08` : 'transparent',
                    }}
                  >
                    <span className="text-lg">{p.badge}</span>
                    <span className="text-sm font-semibold" style={{ color: productKey === p.key ? AMBER : '#aaa' }}>
                      {p.label}
                    </span>
                    {productKey === p.key && <span className="ml-auto text-xs" style={{ color: AMBER }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {result && (
              <div
                className="px-4 py-3 rounded-lg border text-sm font-semibold"
                style={{
                  borderColor: result.type === 'success' ? `${GREEN}40` : result.type === 'warning' ? `${AMBER}40` : `${RED}40`,
                  backgroundColor: result.type === 'success' ? `${GREEN}08` : result.type === 'warning' ? `${AMBER}08` : `${RED}08`,
                  color: result.type === 'success' ? GREEN : result.type === 'warning' ? AMBER : RED,
                }}
              >
                {result.msg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full min-h-[52px] font-bold text-sm uppercase tracking-wider rounded-lg transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: AMBER, color: '#000' }}
            >
              {loading ? 'Activando...' : 'Activar Acceso'}
            </button>
          </form>
        </div>

        {/* Activations history */}
        <div className="border rounded-xl overflow-hidden" style={{ backgroundColor: CARD, borderColor: BORDER }}>
          <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: BORDER, backgroundColor: '#0d0d0e' }}>
            <span className="text-white font-bold text-sm">Últimas activaciones</span>
            <button onClick={loadLogs} className="text-xs uppercase tracking-widest transition-colors hover:text-white" style={{ color: MUTED }}>
              Actualizar
            </button>
          </div>

          {logsLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: AMBER, borderTopColor: 'transparent' }} />
            </div>
          ) : activations.length === 0 ? (
            <div className="py-10 text-center" style={{ color: MUTED }}>
              <p className="text-sm">Sin activaciones aún</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: BORDER }}>
                    {['Fecha', 'Email', 'Producto', 'Origen', ''].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#111' }}>
                  {activations.map(a => (
                    <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-xs font-mono" style={{ color: MUTED }}>{fmtDate(a.date)}</td>
                      <td className="px-4 py-3 text-white text-xs">{a.email}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#aaa' }}>{PRODUCT_LABEL[a.product] ?? a.product}</td>
                      <td className="px-4 py-3">
                        <span
                          className="text-[10px] px-2 py-0.5 border rounded font-bold uppercase"
                          style={{
                            color: a.source === 'manual' ? AMBER : CYAN,
                            borderColor: a.source === 'manual' ? `${AMBER}30` : `${CYAN}30`,
                          }}
                        >
                          {a.source === 'manual' ? 'manual' : 'pagopar'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] px-2 py-0.5 border rounded font-bold uppercase" style={{ color: GREEN, borderColor: `${GREEN}30` }}>
                          activo
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
