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

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [levels, setLevels] = useState<GannLevels | null>(null)
  const [activeModule, setActiveModule] = useState<ModuleType>('quantica')
  const [myCourses, setMyCourses] = useState<{ productId: string; title: string; url: string; icon: string; paidAt: string | null }[]>([])
  const [clasicaGuideOpen, setClasicaGuideOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user/purchases')
        .then((r) => r.json())
        .then((data) => { if (data.courses) setMyCourses(data.courses) })
        .catch(() => {})
    }
  }, [status])

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
  const isQuantum = plan === 'quantum' || isAdmin
  const isWhale = plan === 'whale' || isAdmin
  const isPro = plan === 'pro' || isAdmin
  const tier = isQuantum ? 'quantum' : isWhale ? 'whale' : isPro ? 'pro' : 'free'
  const trialUses = session.user.trialUses || 0
  const trialExpired = session.user.trialExpired || false

  // Trial system for non-premium users
  if (!isPremium) {
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
                  Suscribite a Quantum Access para seguir usando la calculadora sin límites.
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

  const modules: { id: ModuleType; label: string; shortLabel: string; icon: string }[] = [
    { id: 'quantica', label: 'Cuántica',     shortLabel: 'Cuántica', icon: '⚡' },
    { id: 'clasica',  label: 'Gann Clásica', shortLabel: 'Gann',     icon: '📊' },
    { id: 'aurea',    label: 'Áurea',        shortLabel: 'Áurea',    icon: '◈'  },
  ]

  return (
    <main className="min-h-screen bg-terminal-bg">
      <Navbar />

      <div className="pt-[110px] pb-20 px-4">
        <div className="max-w-7xl mx-auto">

          {/* ══ CALCULADORAS — primera sección visible ══ */}

          {/* Module Tabs */}
          <div className="flex flex-wrap gap-2 mb-5">
            {modules.map((mod) => (
              <div key={mod.id} className="flex items-center gap-1">
                <button
                  onClick={() => { setActiveModule(mod.id); setLevels(null) }}
                  className={`px-4 sm:px-6 rounded-full font-semibold transition-all text-sm min-h-[48px] flex items-center gap-2 ${
                    activeModule === mod.id
                      ? 'text-black'
                      : 'bg-[#141415] border border-[#222] text-[#666] hover:border-[#444] hover:text-white'
                  }`}
                  style={activeModule === mod.id ? { backgroundColor: '#fbbf24' } : {}}
                >
                  <span>{mod.icon}</span>
                  <span className="hidden sm:inline">{mod.label}</span>
                  <span className="sm:hidden">{mod.shortLabel}</span>
                </button>
                {/* "?" guide button for Gann Clásica */}
                {mod.id === 'clasica' && activeModule === 'clasica' && (
                  <button
                    onClick={() => setClasicaGuideOpen(true)}
                    className="w-8 h-8 rounded-full border border-[#2a2a2a] flex items-center justify-center text-sm font-bold text-[#555] hover:text-white hover:border-[#444] transition-colors"
                    title="Guía de uso"
                  >
                    ?
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Calculadora Cuántica */}
          {activeModule === 'quantica' && (
            <QuantumCalcDash />
          )}

          {/* Gann Clásica */}
          {activeModule === 'clasica' && (
            <GannCalculator
              onCalculate={setLevels}
              isPremium={isPro || isWhale || isQuantum}
              userEmail={email}
              trialUses={trialUses}
              trialExpired={trialExpired}
            />
          )}

          {/* Calculadora Áurea */}
          {activeModule === 'aurea' && (
            <GannAurea />
          )}

          {/* Quick Stats (Gann Clásica results) */}
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
                    <span>⚡</span> Acceso cuántico
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

            {/* Mis Cursos */}
            {myCourses.length > 0 && (
              <div className="p-4 bg-terminal-card border border-[#c9a227]/30 rounded-xl">
                <h2 className="text-white font-bold mb-3 flex items-center gap-2">
                  <span>🎓</span> Mis Cursos
                </h2>
                <div className="flex flex-wrap gap-3">
                  {myCourses.map((course) => (
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
              </div>
            )}

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-purple-950/50 to-[#0d1421] border border-purple-500/30 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">⚡</span>
                <h2 className="text-white font-bold text-lg tracking-wide">QUANTUM LEVELS</h2>
                <div className="h-px flex-1 bg-purple-500/20" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Link
                  href="/quantum"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-purple-900/30 border border-purple-500/20 rounded-xl hover:bg-purple-900/50 hover:border-purple-500/50 transition-all group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">🔬</span>
                  <span className="text-white text-xs font-semibold text-center">Calculator</span>
                  <span className="text-purple-400 text-[10px] text-center">Quantum Levels</span>
                </Link>
                <Link
                  href="/hub"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-[#c9a227]/10 border border-[#c9a227]/20 rounded-xl hover:bg-[#c9a227]/20 hover:border-[#c9a227]/40 transition-all group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">📡</span>
                  <span className="text-white text-xs font-semibold text-center">Signal Hub</span>
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
                  <span className="text-[#8a9bb3] text-[10px] text-center">Quantum AI</span>
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
                      🐋 Unlock WHALE features: Advanced Gann Tools, Hexagon, Wheel of 24, and more!
                    </p>
                    <p className="text-terminal-muted text-sm mt-1">
                      Get access to all advanced W.D. Gann techniques and priority support.
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

      {/* Gann Clásica guide modal */}
      <CalcGuide
        isOpen={clasicaGuideOpen}
        onClose={() => setClasicaGuideOpen(false)}
        title="Guía · Calculadora Gann Clásica"
        content={GUIDE_CLASICA}
      />

      <Footer />
    </main>
  )
}
