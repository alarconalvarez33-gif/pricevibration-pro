'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import GannCalculator from '@/components/GannCalculator'
import GannAurea from '@/components/GannAurea'
import QuantumCalcDash from '@/components/QuantumCalcDash'
import CalcGuide from '@/components/CalcGuide'
import { GUIDE_CLASICA } from '@/lib/calcGuides'
import { GannLevels } from '@/lib/gann'
import Link from 'next/link'
import PersonalizedGreeting from '@/components/PersonalizedGreeting'

type ModuleType = 'quantica' | 'clasica' | 'aurea'

interface PendingItem {
  id: string
  type: 'subscription' | 'product'
  email: string
  name: string | null
  product: string
  amount: number
  currency: string
  orderId: string
  createdAt: string
  isOld: boolean
}

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
  'fibonacci':            'Fibonacci',
  'super-estrategia':     'Super Estrategia',
  'quantum-access':       'Acceso Pro',
  'quantum':              'Acceso Pro',
  'adx':                  'ADX',
  'metalevels':           'MetaLevels',
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [levels, setLevels] = useState<GannLevels | null>(null)
  const [activeModule, setActiveModule] = useState<ModuleType>('quantica')
  type CourseItem = { productId: string; title: string; url: string; icon: string; pricePYG: number; priceUSD: number; paidAt: string | null }
  const [ownedCourses,     setOwnedCourses]     = useState<CourseItem[]>([])
  const [availableCourses, setAvailableCourses] = useState<CourseItem[]>([])
  const [purchasesLoaded,  setPurchasesLoaded]  = useState(false)
  const [clasicaGuideOpen, setClasicaGuideOpen] = useState(false)

  // Admin state
  const [pending,          setPending]          = useState<PendingItem[]>([])
  const [activations,      setActivations]      = useState<Activation[]>([])
  const [failedWebhooks,   setFailedWebhooks]   = useState(0)
  const [adminLoading,     setAdminLoading]     = useState(false)
  const [activatingId,     setActivatingId]     = useState<string | null>(null)
  const [activateMsg,      setActivateMsg]      = useState<{ id: string; ok: boolean; msg: string } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user/purchases')
        .then((r) => r.json())
        .then((data) => {
          if (data.owned)     setOwnedCourses(data.owned)
          if (data.available) setAvailableCourses(data.available)
          setPurchasesLoaded(true)
        })
        .catch(() => { setPurchasesLoaded(true) })
    }
  }, [status])

  // Load admin data if admin
  useEffect(() => {
    const role = (session?.user as any)?.role
    if (status === 'authenticated' && role === 'admin') {
      setAdminLoading(true)
      Promise.all([
        fetch('/api/admin/pending-payments').then(r => r.json()),
        fetch('/api/admin/activate').then(r => r.json()),
      ]).then(([p, a]) => {
        setPending(p.pending ?? [])
        setFailedWebhooks(p.failedWebhooks24h ?? 0)
        setActivations((a.activations ?? []).slice(0, 5))
      }).catch(() => {}).finally(() => setAdminLoading(false))
    }
  }, [status, session])

  const handleAdminActivate = async (item: PendingItem) => {
    setActivatingId(item.id)
    setActivateMsg(null)
    try {
      const res = await fetch('/api/admin/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingId: item.id, pendingType: item.type }),
      })
      const data = await res.json()
      setActivateMsg({ id: item.id, ok: res.ok, msg: data.message || data.error || '' })
      if (res.ok) {
        setPending(prev => prev.filter(p => p.id !== item.id))
        // refresh activations
        fetch('/api/admin/activate').then(r => r.json()).then(a => {
          setActivations((a.activations ?? []).slice(0, 5))
        }).catch(() => {})
      }
    } catch {
      setActivateMsg({ id: item.id, ok: false, msg: 'Error de red' })
    }
    setActivatingId(null)
  }

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-terminal-bg">
        <Navbar />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-gold-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-terminal-muted">Loading TMT Dashboard...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!session?.user) {
    router.push('/login')
    return null
  }

  const isPremium = session.user.isPremium
  const email = session.user.email || ''
  const plan = session.user.plan || 'free'
  const role = session.user.role || 'user'
  const isAdmin = role === 'admin'
  const isQuantum = plan === 'quantum' || plan === 'pro' || isAdmin
  const isWhale = plan === 'whale' || isAdmin
  const isPro = plan === 'pro' || isAdmin
  const tier = isQuantum ? 'quantum' : isWhale ? 'whale' : isPro ? 'pro' : 'free'
  const trialUses = session.user.trialUses || 0
  const trialExpired = session.user.trialExpired || false

  // Trial system for non-premium users — skip block if they have paid products
  const hasPaidProducts = ownedCourses.length > 0
  if (!isPremium && !hasPaidProducts && purchasesLoaded) {
    if (trialExpired || trialUses >= 3) {
      return (
        <main className="min-h-screen bg-terminal-bg">
          <Navbar />
          <div className="pt-20 pb-20 px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="card-terminal">
                <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-4">Pruebas gratuitas agotadas</h1>
                <p className="text-terminal-muted mb-2">Ya utilizaste tus 3 cálculos gratuitos.</p>
                <p className="text-terminal-muted mb-8">
                  Suscribite a Señales para seguir usando la calculadora sin límites.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/billing" className="btn-gold">Ver Planes</Link>
                  <Link href="/" className="btn-outline-gold">Inicio</Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      )
    }
  }

  const modules = [
    {
      id: 'quantica' as ModuleType,
      name: 'SER PRO',
      sub: 'Distribución E=n²',
      icon: '⚡',
      accent: '#00D4FF',
      glow: 'rgba(0,212,255,0.35)',
      bg: 'rgba(0,212,255,0.06)',
    },
    {
      id: 'clasica' as ModuleType,
      name: 'SER SUPER',
      sub: 'Raíz cuadrada algorítmica',
      icon: '◆',
      accent: '#fbbf24',
      glow: 'rgba(251,191,36,0.35)',
      bg: 'rgba(251,191,36,0.06)',
    },
    {
      id: 'aurea' as ModuleType,
      name: 'SER AUREX',
      sub: 'Proporción áurea φ',
      icon: '✦',
      accent: '#a855f7',
      glow: 'rgba(168,85,247,0.35)',
      bg: 'rgba(168,85,247,0.06)',
    },
  ]

  return (
    <main className="min-h-screen bg-terminal-bg">
      <Navbar />

      <div className="pt-[110px] pb-20 px-4">
        <div className="max-w-7xl mx-auto">

          {/* ══ LAYOUT PRINCIPAL: Sidebar + Calculadora ══ */}
          <div className="flex gap-5 items-start">

            {/* ── SIDEBAR DE CALCULADORAS ── */}
            <div className="hidden lg:flex flex-col gap-3 shrink-0" style={{ width: '200px' }}>
              <p className="text-[9px] uppercase tracking-[0.3em] font-bold mb-1" style={{ color: '#333', fontFamily: "'Space Grotesk', sans-serif" }}>
                Calculadoras
              </p>
              {modules.map((mod) => {
                const active = activeModule === mod.id
                return (
                  <button
                    key={mod.id}
                    onClick={() => { setActiveModule(mod.id); setLevels(null) }}
                    className="w-full text-left transition-all duration-200 rounded-xl"
                    style={{
                      padding: '14px 16px',
                      backgroundColor: active ? mod.bg : '#0e0e0f',
                      border: `1.5px solid ${active ? mod.accent : '#1e1e1e'}`,
                      boxShadow: active ? `0 0 20px ${mod.glow}, inset 0 0 20px ${mod.bg}` : 'none',
                      transform: active ? 'translateX(4px)' : 'none',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-1.5">
                      <span
                        className="flex items-center justify-center rounded-lg shrink-0"
                        style={{
                          width: 34, height: 34,
                          fontSize: 16,
                          backgroundColor: active ? `${mod.accent}20` : '#1a1a1a',
                          border: `1px solid ${active ? mod.accent : '#2a2a2a'}`,
                          color: active ? mod.accent : '#444',
                        }}
                      >
                        {mod.icon}
                      </span>
                      <div className="min-w-0">
                        <p
                          className="font-bold text-xs leading-tight truncate"
                          style={{
                            color: active ? mod.accent : '#777',
                            fontFamily: "'Space Grotesk', sans-serif",
                            letterSpacing: '0.04em',
                          }}
                        >
                          {mod.name}
                        </p>
                        <p className="text-[9px] mt-0.5 truncate" style={{ color: active ? `${mod.accent}99` : '#333' }}>
                          {mod.sub}
                        </p>
                      </div>
                    </div>
                    {active && (
                      <div
                        className="h-0.5 rounded-full mt-1"
                        style={{ background: `linear-gradient(90deg, ${mod.accent}, transparent)` }}
                      />
                    )}
                  </button>
                )
              })}

              {/* Guía de la calculadora */}
              {activeModule === 'clasica' && (
                <button
                  onClick={() => setClasicaGuideOpen(true)}
                  className="w-full py-2 rounded-lg text-[10px] font-bold transition-colors"
                  style={{ border: '1px solid #2a2a2a', color: '#555', fontFamily: "'Space Grotesk', sans-serif" }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = '#fff'; (e.target as HTMLElement).style.borderColor = '#444' }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = '#555'; (e.target as HTMLElement).style.borderColor = '#2a2a2a' }}
                >
                  ? Guía de uso
                </button>
              )}
            </div>

            {/* ── SELECTOR MOBILE (se oculta en lg) ── */}
            <div className="lg:hidden w-full mb-4">
              <div className="grid grid-cols-3 gap-2">
                {modules.map((mod) => {
                  const active = activeModule === mod.id
                  return (
                    <button
                      key={mod.id}
                      onClick={() => { setActiveModule(mod.id); setLevels(null) }}
                      className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all"
                      style={{
                        backgroundColor: active ? mod.bg : '#0e0e0f',
                        border: `1.5px solid ${active ? mod.accent : '#1e1e1e'}`,
                        boxShadow: active ? `0 0 16px ${mod.glow}` : 'none',
                      }}
                    >
                      <span style={{ fontSize: 20, color: active ? mod.accent : '#444' }}>{mod.icon}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider leading-tight text-center" style={{ color: active ? mod.accent : '#555', fontFamily: "'Space Grotesk', sans-serif" }}>
                        {mod.name.split(' ')[1]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── ÁREA DE CALCULADORA ── */}
            <div className="flex-1 min-w-0">

          {/* Calculadora Cuántica */}
          {activeModule === 'quantica' && (
            <QuantumCalcDash isPremium={isPremium} />
          )}

          {/* Calculadora algorítmica */}
          {activeModule === 'clasica' && (
            <GannCalculator
              onCalculate={setLevels}
              isPremium={isPremium}
              userEmail={email}
              trialUses={trialUses}
              trialExpired={trialExpired}
            />
          )}

          {/* Calculadora Áurea */}
          {activeModule === 'aurea' && (
            <GannAurea isPremium={isPremium} />
          )}

            </div>{/* fin área calculadora */}
          </div>{/* fin layout sidebar+calc */}

          {/* Quick Stats (resultados de la calculadora) */}
          {levels && activeModule === 'clasica' && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card-terminal text-center">
                <div className="text-terminal-muted text-sm mb-1">Nearest Resistance</div>
                <div className="text-red-400 font-bold text-xl">${levels.resistances[0].toFixed(2)}</div>
              </div>
              <div className="card-terminal text-center">
                <div className="text-terminal-muted text-sm mb-1">Nearest Support</div>
                <div className="text-green-400 font-bold text-xl">${levels.supports[0].toFixed(2)}</div>
              </div>
              <div className="card-terminal text-center">
                <div className="text-terminal-muted text-sm mb-1">Range High (R8)</div>
                <div className="text-white font-bold text-xl">${levels.resistances[7].toFixed(2)}</div>
              </div>
              <div className="card-terminal text-center">
                <div className="text-terminal-muted text-sm mb-1">Range Low (S8)</div>
                <div className="text-white font-bold text-xl">${levels.supports[7].toFixed(2)}</div>
              </div>
            </div>
          )}

          {/* ══ Resto del dashboard ══ */}
          <div className="mt-10 pt-8 border-t border-[#1a1a1a] space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">TMT Dashboard</h1>
                <p className="mt-1">
                  <PersonalizedGreeting userName={session.user.name || session.user.email?.split('@')[0]} />
                </p>
              </div>
              <div className="flex items-center gap-3">
                {(tier === 'pro' || tier === 'whale' || tier === 'quantum') && (
                  <Link
                    href="/guide"
                    className="px-4 py-2 rounded-lg bg-terminal-card border border-gold-500/30 hover:border-gold-500 text-gold-500 hover:bg-gold-500/10 transition-all flex items-center gap-2 text-sm font-medium"
                  >
                    <span>📖</span>
                    <span className="hidden sm:inline">Guía del Usuario</span>
                    <span className="sm:hidden">Guide</span>
                  </Link>
                )}
                {tier === 'quantum' ? (
                  <span className="px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-purple-600 to-purple-400 text-white flex items-center gap-2">
                    <span>⚡</span> Acceso completo
                  </span>
                ) : tier === 'whale' ? (
                  <span className="px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center gap-2">
                    <span>🐋</span> WHALE ACCESS
                  </span>
                ) : (
                  <span className="status-premium">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    PRO Member
                  </span>
                )}
              </div>
            </div>

            {/* Educational Disclaimer */}
            <div className="p-3 bg-gold-500/10 border border-gold-500/30 rounded-lg">
              <p className="text-center text-sm text-terminal-muted">
                <span className="text-gold-500 font-medium">⚠️ Educational tool only.</span>{' '}
                Not financial advice. Trading involves risk.
              </p>
            </div>

            {/* ══ ADMIN PANEL (solo visible para admins) ══ */}
            {isAdmin && (
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #c9a22730' }}>

                {/* Header */}
                <div
                  className="flex items-center justify-between px-5 py-3"
                  style={{ backgroundColor: '#0f0d08', borderBottom: '1px solid #c9a22720' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">📊</span>
                    <span className="text-sm font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Panel Admin
                    </span>
                    {pending.length > 0 && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full animate-pulse"
                        style={{ backgroundColor: '#FF475720', color: '#FF4757', border: '1px solid #FF475740' }}
                      >
                        {pending.length} pendiente{pending.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {failedWebhooks > 0 && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: '#fbbf2420', color: '#fbbf24', border: '1px solid #fbbf2440' }}
                      >
                        {failedWebhooks} webhook fallido{failedWebhooks !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/admin/activate"
                      className="text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 border transition-colors hover:text-white"
                      style={{ borderColor: '#c9a22740', color: '#c9a227', fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Panel completo
                    </Link>
                    <Link
                      href="/admin/licenses"
                      className="text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 border transition-colors hover:text-white"
                      style={{ borderColor: '#333', color: '#555', fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Licencias
                    </Link>
                  </div>
                </div>

                <div className="grid md:grid-cols-2" style={{ backgroundColor: '#0A0A0B' }}>

                  {/* ── Pagos pendientes ── */}
                  <div style={{ borderRight: '1px solid #1a1a1a' }}>
                    <div className="px-5 py-3" style={{ borderBottom: '1px solid #1a1a1a' }}>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-semibold" style={{ color: '#555', fontFamily: "'Space Grotesk', sans-serif" }}>
                        Pagos sin activar
                      </p>
                    </div>

                    {adminLoading ? (
                      <div className="px-5 py-6 text-xs" style={{ color: '#444' }}>Cargando...</div>
                    ) : pending.length === 0 ? (
                      <div className="px-5 py-6 text-xs flex items-center gap-2" style={{ color: '#444' }}>
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="#00D26A" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        Todo al día — sin pendientes
                      </div>
                    ) : (
                      <div className="divide-y divide-[#1a1a1a]">
                        {pending.map((item) => (
                          <div key={item.id} className="px-5 py-3 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                {item.isOld && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase" style={{ backgroundColor: '#FF475715', color: '#FF4757' }}>
                                    +48hs
                                  </span>
                                )}
                                <span className="text-xs font-bold text-white truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                  {PRODUCT_LABEL[item.product] || item.product}
                                </span>
                              </div>
                              <p className="text-xs truncate" style={{ color: '#555' }}>{item.email}</p>
                              <p className="text-[10px]" style={{ color: '#c9a227', fontFamily: "'JetBrains Mono', monospace" }}>
                                Gs. {item.amount.toLocaleString('es-PY')}
                              </p>
                            </div>
                            <div className="shrink-0 flex flex-col items-end gap-1">
                              <button
                                onClick={() => handleAdminActivate(item)}
                                disabled={activatingId === item.id}
                                className="text-[10px] font-bold px-3 py-1.5 uppercase tracking-[0.1em] transition-all disabled:opacity-50"
                                style={{
                                  backgroundColor: activatingId === item.id ? '#141415' : '#00D26A20',
                                  border: '1px solid #00D26A40',
                                  color: '#00D26A',
                                  fontFamily: "'Space Grotesk', sans-serif",
                                }}
                              >
                                {activatingId === item.id ? '...' : 'Activar'}
                              </button>
                              {activateMsg?.id === item.id && (
                                <p className="text-[9px]" style={{ color: activateMsg.ok ? '#00D26A' : '#FF4757' }}>
                                  {activateMsg.msg}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── Activaciones recientes ── */}
                  <div>
                    <div className="px-5 py-3" style={{ borderBottom: '1px solid #1a1a1a' }}>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-semibold" style={{ color: '#555', fontFamily: "'Space Grotesk', sans-serif" }}>
                        Últimas activaciones
                      </p>
                    </div>

                    {adminLoading ? (
                      <div className="px-5 py-6 text-xs" style={{ color: '#444' }}>Cargando...</div>
                    ) : activations.length === 0 ? (
                      <div className="px-5 py-6 text-xs" style={{ color: '#444' }}>Sin activaciones registradas</div>
                    ) : (
                      <div className="divide-y divide-[#1a1a1a]">
                        {activations.map((act) => (
                          <div key={act.id} className="px-5 py-3 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span
                                  className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
                                  style={{
                                    backgroundColor: act.source === 'pagopar' ? '#00D26A15' : '#00E5FF15',
                                    color: act.source === 'pagopar' ? '#00D26A' : '#00E5FF',
                                  }}
                                >
                                  {act.source === 'pagopar' ? 'auto' : 'manual'}
                                </span>
                                <span className="text-xs font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                  {PRODUCT_LABEL[act.product] || act.product}
                                </span>
                              </div>
                              <p className="text-xs truncate" style={{ color: '#555' }}>{act.email}</p>
                            </div>
                            <p
                              className="text-[10px] shrink-0"
                              style={{ color: '#444', fontFamily: "'JetBrains Mono', monospace" }}
                            >
                              {new Date(act.date).toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Footer hint */}
                <div
                  className="px-5 py-2 text-[10px]"
                  style={{ backgroundColor: '#0f0d08', borderTop: '1px solid #c9a22715', color: '#444' }}
                >
                  Los pagos confirmados por PagoPar se activan automáticamente. Los pendientes acá requieren activación manual.
                </div>

              </div>
            )}

            {/* ── Cursos ── solo visible si el usuario tiene al menos un curso */}
            {ownedCourses.length > 0 && (
              <div className="p-5 bg-terminal-card border border-[#c9a227]/30 rounded-xl space-y-4">

                {/* Header */}
                <h2 className="text-white font-bold flex items-center gap-2">
                  <span>🎓</span> Mis Cursos
                </h2>

                {/* Cursos adquiridos */}
                <div className="flex flex-wrap gap-3">
                  {ownedCourses.map((course) => (
                    <Link
                      key={course.productId}
                      href={course.url}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-terminal-bg border border-[#c9a227]/20 hover:border-[#c9a227]/60 hover:bg-[#c9a227]/5 transition-all"
                    >
                      <span className="text-2xl">{course.icon}</span>
                      <div>
                        <p className="text-white font-semibold text-sm">{course.title}</p>
                        <p className="text-[#c9a227] text-xs">▶ Ver curso</p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Cursos disponibles para adquirir */}
                {availableCourses.length > 0 && (
                  <>
                    <div className="border-t border-[#1e1e1e]" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#444]">
                      Disponibles para adquirir
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {availableCourses.map((course) => (
                        <Link
                          key={course.productId}
                          href="/billing"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-terminal-bg border border-[#1e1e1e] hover:border-[#c9a227]/40 hover:bg-[#c9a227]/5 transition-all group"
                        >
                          <span className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity">{course.icon}</span>
                          <div>
                            <p className="text-[#888] group-hover:text-white font-semibold text-sm transition-colors">{course.title}</p>
                            <p className="text-[#444] group-hover:text-[#c9a227] text-xs transition-colors">
                              Gs. {course.pricePYG.toLocaleString('es-PY')} · Adquirir →
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                )}

              </div>
            )}

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-purple-950/50 to-[#0d1421] border border-purple-500/30 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">⚡</span>
                <h2 className="text-white font-bold text-lg tracking-wide">NIVELES ALGORÍTMICOS</h2>
                <div className="h-px flex-1 bg-purple-500/20" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Link
                  href="/quantum"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-purple-900/30 border border-purple-500/20 rounded-xl hover:bg-purple-900/50 hover:border-purple-500/50 transition-all group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">🔬</span>
                  <span className="text-white text-xs font-semibold text-center">Calculator</span>
                  <span className="text-purple-400 text-[10px] text-center">Niveles algorítmicos</span>
                </Link>
                <Link
                  href="/hub"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-[#c9a227]/10 border border-[#c9a227]/20 rounded-xl hover:bg-[#c9a227]/20 hover:border-[#c9a227]/40 transition-all group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">📡</span>
                  <span className="text-white text-xs font-semibold text-center">Señales</span>
                  <span className="text-[#c9a227] text-[10px] text-center">Live Signals</span>
                </Link>
                <Link
                  href="/hub?filter=ALL"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-xl hover:bg-emerald-900/40 hover:border-emerald-500/40 transition-all group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">🌐</span>
                  <span className="text-white text-xs font-semibold text-center">All Markets</span>
                  <span className="text-emerald-400 text-[10px] text-center">Forex · Crypto · Gold</span>
                </Link>
                <Link
                  href="/hub"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-[#131c2e] border border-[#1e2a3a] rounded-xl hover:border-[#8a9bb3] transition-all group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">🤖</span>
                  <span className="text-white text-xs font-semibold text-center">AI Analysis</span>
                  <span className="text-[#8a9bb3] text-[10px] text-center">Análisis IA</span>
                </Link>
                <Link
                  href="/account"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-[#131c2e] border border-[#1e2a3a] rounded-xl hover:border-[#8a9bb3] transition-all group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">👤</span>
                  <span className="text-white text-xs font-semibold text-center">My Account</span>
                  <span className="text-[#8a9bb3] text-[10px] text-center">Settings</span>
                </Link>
              </div>
            </div>

            {/* Whale Features Promo */}
            {tier === 'pro' && (
              <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">
                      🐋 Unlock WHALE features: advanced level tools, Hexagon, Wheel of 24, and more!
                    </p>
                    <p className="text-terminal-muted text-sm mt-1">
                      Get access to every advanced level tool and priority support.
                    </p>
                  </div>
                  <Link href="/billing" className="btn-gold whitespace-nowrap ml-4">
                    Upgrade
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Calculator guide modal */}
      <CalcGuide
        isOpen={clasicaGuideOpen}
        onClose={() => setClasicaGuideOpen(false)}
        title="Guía · Calculadora algorítmica"
        content={GUIDE_CLASICA}
      />

      <Footer />
    </main>
  )
}
