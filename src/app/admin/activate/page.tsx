'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
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
  { key: 'genesis',           label: 'Genesis — Gs. 500.000',           badge: '👑' },
  { key: 'canal-paralelo',    label: 'Canal Paralelo — Gs. 320.000',    badge: '🎓' },
  { key: 'fibonacci',         label: 'Fibonacci Avanzado — Gs. 320.000', badge: '📊' },
  { key: 'super-estrategia',  label: 'Super Estrategia — Gs. 65.000',   badge: '🏆' },
  { key: 'quantum-access',    label: 'Quantum Access — Gs. 180.000',    badge: '⚡' },
]

interface Activation {
  id: string
  date: string
  email: string
  product: string
  type: string
  source: 'manual' | 'pagopar'
}

const PRODUCT_LABEL: Record<string, string> = {
  'expansion-matematica': 'Genesis',
  'canal-paralelo':       'Canal Paralelo',
  'fibonacci':            'Fibonacci Avanzado',
  'super-estrategia':     'Super Estrategia',
  'quantum-access':       'Quantum Access',
}

export default function AdminActivatePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [productKey, setProductKey] = useState('genesis')
  const [suggestions, setSuggestions] = useState<{ email: string; name: string | null; plan: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'warning' | 'error'; msg: string } | null>(null)
  const [activations, setActivations] = useState<Activation[]>([])
  const [logsLoading, setLogsLoading] = useState(true)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)

  const userEmail = session?.user?.email

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated' && userEmail && !ADMIN_EMAILS.includes(userEmail)) {
      router.push('/dashboard')
    }
  }, [status, userEmail, router])

  const loadLogs = () => {
    setLogsLoading(true)
    fetch('/api/admin/activate')
      .then(r => r.json())
      .then(d => { if (d.activations) setActivations(d.activations) })
      .catch(() => {})
      .finally(() => setLogsLoading(false))
  }

  useEffect(() => {
    if (status === 'authenticated' && userEmail && ADMIN_EMAILS.includes(userEmail)) {
      loadLogs()
    }
  }, [status, userEmail])

  // Autocomplete search
  const handleEmailChange = (val: string) => {
    setEmail(val)
    setResult(null)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (val.length < 3) { setSuggestions([]); setShowSuggestions(false); return }
    searchTimeout.current = setTimeout(() => {
      fetch(`/api/admin/users-search?q=${encodeURIComponent(val)}`)
        .then(r => r.json())
        .then(d => {
          setSuggestions(d.users ?? [])
          setShowSuggestions(true)
        })
        .catch(() => {})
    }, 250)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), productKey }),
      })
      const data = await res.json()
      if (data.success) {
        setResult({ type: 'success', msg: data.message })
        loadLogs()
      } else if (data.warning) {
        setResult({ type: 'warning', msg: data.warning })
      } else {
        setResult({ type: 'error', msg: data.error || 'Error desconocido.' })
      }
    } catch {
      setResult({ type: 'error', msg: 'Error de conexión.' })
    }
    setLoading(false)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: AMBER, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) return null

  return (
    <div className="min-h-screen px-4 py-10" style={{ backgroundColor: BG, fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Activar Acceso</h1>
            <p className="text-xs mt-1" style={{ color: MUTED }}>Activación manual de cursos y suscripciones</p>
          </div>
          <div className="flex items-center gap-3">
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

        {/* Form */}
        <div className="border rounded-xl p-6 mb-8" style={{ backgroundColor: CARD, borderColor: BORDER }}>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email with autocomplete */}
            <div className="relative">
              <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: MUTED }}>
                Email del usuario
              </label>
              <input
                ref={emailInputRef}
                type="email"
                value={email}
                onChange={e => handleEmailChange(e.target.value)}
                onFocus={e => { e.currentTarget.style.borderColor = `${AMBER}60`; if (suggestions.length > 0) setShowSuggestions(true) }}
                onBlur={e  => { e.currentTarget.style.borderColor = BORDER; setTimeout(() => setShowSuggestions(false), 150) }}
                placeholder="usuario@email.com"
                className="w-full border rounded-lg px-4 py-3 text-white text-sm focus:outline-none transition-colors min-h-[52px]"
                style={{ backgroundColor: BG, borderColor: BORDER }}
                autoComplete="off"
              />

              {/* Suggestions dropdown */}
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
              <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: MUTED }}>
                Producto
              </label>
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
                    <span
                      className="text-sm font-semibold"
                      style={{ color: productKey === p.key ? AMBER : '#aaa' }}
                    >
                      {p.label}
                    </span>
                    {productKey === p.key && (
                      <span className="ml-auto text-xs" style={{ color: AMBER }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Result feedback */}
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

        {/* Activations log */}
        <div className="border rounded-xl overflow-hidden" style={{ backgroundColor: CARD, borderColor: BORDER }}>
          <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: BORDER, backgroundColor: '#0d0d0e' }}>
            <span className="text-white font-bold text-sm">Últimas compras y activaciones</span>
            <button
              onClick={loadLogs}
              className="text-xs uppercase tracking-widest transition-colors hover:text-white"
              style={{ color: MUTED }}
            >
              Actualizar
            </button>
          </div>

          {logsLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: AMBER, borderTopColor: 'transparent' }} />
            </div>
          ) : activations.length === 0 ? (
            <div className="py-10 text-center" style={{ color: MUTED }}>
              <p className="text-sm">Sin activaciones manuales aún</p>
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
                      <td className="px-4 py-3 text-xs font-mono" style={{ color: MUTED }}>
                        {new Date(a.date).toLocaleDateString('es-PY', {
                          day: '2-digit', month: '2-digit', year: '2-digit',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 text-white text-xs">{a.email}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#aaa' }}>
                        {PRODUCT_LABEL[a.product] ?? a.product}
                      </td>
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
                        <span
                          className="text-[10px] px-2 py-0.5 border rounded font-bold uppercase"
                          style={{ color: GREEN, borderColor: `${GREEN}30` }}
                        >
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
