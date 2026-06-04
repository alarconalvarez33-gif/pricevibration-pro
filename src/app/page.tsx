'use client'
import ContactSection from '@/components/home/ContactSection'
import { WhatsAppFloat } from '@/components/ui/WhatsAppFloat'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Header from '@/components/layout/Header'
import Footer from '@/components/Footer'

// ── Design tokens ──────────────────────────────
const CYAN      = '#00D4FF'
const CYAN_DARK = '#0EA5E9'
const DARK_BG   = '#0F172A'
const DARK_BG2  = '#1A2845'
const LIGHT_BG  = '#F5F7FA'
const GOLD      = '#FFD700'

// ── Course data ─────────────────────────────────
const COURSES = [
  {
    id:        'super-estrategia',
    name:      'Super Estrategia',
    level:     'Básico',
    icon:      '📊',
    flyer:     '/recursos.png',
    priceGs:   150000,
    priceUsd:  23,
    popular:   false,
    features:  [
      'Estrategia de entrada de alta probabilidad',
      'Gestión de riesgo profesional',
      'Aplicable en cualquier mercado',
      'Acceso de por vida sin cuotas',
    ],
    action: 'api' as const,
    productId: 'super-estrategia',
  },
  {
    id:        'genesis',
    name:      'Génesis',
    level:     'Intermedio',
    icon:      '⚡',
    flyer:     '/flyer1.jpg',
    priceGs:   500000,
    priceUsd:  78,
    popular:   true,
    features:  [
      'Método de raíz cuadrada de W.D. Gann',
      'Cálculo de niveles exactos de precio',
      'Proyecciones de precio y tiempo',
      'Acceso de por vida sin cuotas',
    ],
    action: 'api' as const,
    productId: 'expansion-matematica',
  },
  {
    id:        'frecuencia',
    name:      'Frecuencia',
    level:     'Avanzado',
    icon:      '🔮',
    flyer:     '/cuadradex.png',
    priceGs:   200000,
    priceUsd:  31,
    popular:   false,
    features:  [
      'Estructura fractal del mercado',
      'Sincronización de tiempo y precio',
      'Zonas geométricas de reversión',
      'Acceso de por vida sin cuotas',
    ],
    action: 'link' as const,
    href:      '/cursos/frecuencia',
  },
]

function formatGs(n: number) {
  return 'Gs. ' + new Intl.NumberFormat('es-PY').format(n)
}

// ── Course card ──────────────────────────────────
function CourseCard({
  course,
  onBuy,
  loading,
}: {
  course: typeof COURSES[0]
  onBuy: (c: typeof COURSES[0]) => void
  loading: boolean
}) {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1"
      style={{
        boxShadow: course.popular
          ? '0 0 0 2px #00D4FF, 0 20px 40px rgba(0,212,255,0.12)'
          : '0 4px 20px rgba(0,0,0,0.08)',
      }}
    >
      {/* Popular badge */}
      {course.popular && (
        <div
          className="text-center py-1.5 text-[11px] font-bold uppercase tracking-[0.15em]"
          style={{ backgroundColor: CYAN, color: '#000', fontFamily: "'Space Grotesk', sans-serif" }}
        >
          ⭐ MÁS POPULAR
        </div>
      )}

      {/* Flyer */}
      <div
        className="relative overflow-hidden flex items-center justify-center p-4"
        style={{ aspectRatio: '3/4', background: 'linear-gradient(135deg, #0F172A 0%, #1A2845 100%)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.flyer}
          alt={course.name}
          className="w-full h-full object-contain"
          style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.35))' }}
        />
        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.1em]"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: CYAN_DARK, border: '1px solid rgba(0,212,255,0.3)', backdropFilter: 'blur(8px)' }}
        >
          {course.icon} {course.level}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        <h3
          className="text-xl font-bold mb-3 leading-tight"
          style={{ color: '#0F172A', fontFamily: "'Montserrat', sans-serif" }}
        >
          {course.name}
        </h3>

        <ul className="space-y-2 mb-5 flex-1">
          {course.features.map(f => (
            <li key={f} className="flex items-start gap-2 text-sm" style={{ color: '#475569', fontFamily: "'Inter', sans-serif" }}>
              <span className="mt-0.5 shrink-0" style={{ color: CYAN_DARK }}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        {/* Price */}
        <div className="pt-4 mb-4" style={{ borderTop: '1px solid #F1F5F9' }}>
          <p
            className="text-2xl font-bold leading-none"
            style={{ color: '#0F172A', fontFamily: "'Montserrat', sans-serif" }}
          >
            {formatGs(course.priceGs)}
          </p>
          <p className="text-sm mt-1" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
            ≈ USD {course.priceUsd}
          </p>
        </div>

        {/* Buy button */}
        <button
          onClick={() => onBuy(course)}
          disabled={loading}
          className="w-full py-3.5 text-sm font-bold uppercase tracking-[0.1em] rounded-lg transition-all duration-200 disabled:opacity-60 hover:-translate-y-0.5"
          style={{
            backgroundColor: course.popular ? CYAN : CYAN_DARK,
            color: '#000',
            fontFamily: "'Space Grotesk', sans-serif",
            boxShadow: course.popular ? `0 4px 16px rgba(0,212,255,0.35)` : 'none',
          }}
        >
          {loading ? 'Procesando...' : 'ACCEDER AL CURSO →'}
        </button>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────
export default function HomePage() {
  const { data: session } = useSession()
  const [buyingId, setBuyingId] = useState<string | null>(null)
  const [chartResults, setChartResults] = useState<{ id: string; description: string; date: string }[]>([])
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)

  useEffect(() => {
    fetch('/api/results')
      .then(r => r.json())
      .then(d => { if (d.results) setChartResults(d.results) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  const handleBuy = async (course: typeof COURSES[0]) => {
    if (course.action === 'link' && course.href) {
      window.location.href = course.href
      return
    }
    if (!session) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent('/')}`
      return
    }
    setBuyingId(course.id)
    try {
      const res = await fetch('/api/pagopar/create-product-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: course.productId }),
      })
      const data = await res.json()
      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        alert('Error: ' + (data.error || 'No se pudo generar el pago'))
      }
    } catch {
      alert('Error al procesar el pago.')
    }
    setBuyingId(null)
  }

  return (
    <main style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <WhatsAppFloat />

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section
        style={{
          background: `linear-gradient(135deg, ${DARK_BG} 0%, ${DARK_BG2} 60%, ${DARK_BG} 100%)`,
          paddingTop: '96px',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="max-w-2xl">

            {/* Left — copy */}
            <div>
              <p
                className="text-xs font-bold uppercase tracking-[0.35em] mb-5"
                style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Educación · Trading · Tecnología
              </p>

              <h1
                className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-6"
                style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-1px', color: '#FFFFFF' }}
              >
                Otros traders ya están viendo{' '}
                <span style={{ color: CYAN }}>niveles</span>
                {' '}que vos no.
              </h1>

              <p
                className="text-lg mb-10 leading-relaxed"
                style={{ color: '#CBD5E1', fontFamily: "'Inter', sans-serif" }}
              >
                Calculá niveles exactos de soporte y resistencia con el método de W.D. Gann. Cursos, herramientas profesionales y señales verificadas para Oro, Forex y Crypto.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/hub"
                  className="px-8 py-4 text-sm font-bold uppercase tracking-[0.08em] rounded-lg text-center transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: '#F59E0B',
                    color: '#000',
                    boxShadow: '0 8px 24px rgba(245,158,11,0.35)',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  VER SIGNAL HUB →
                </Link>
                <Link
                  href="/cursos"
                  className="px-8 py-4 text-sm font-bold uppercase tracking-[0.08em] rounded-lg text-center transition-all duration-300 hover:border-white hover:text-white"
                  style={{
                    border: '2px solid rgba(255,255,255,0.2)',
                    color: '#CBD5E1',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  VER CURSOS
                </Link>
              </div>

              {/* ── Banner Quantum Access Master ── */}
              <div
                className="mt-6 rounded-2xl overflow-hidden"
                style={{
                  border: '1px solid rgba(0,212,255,0.25)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a2e 100%)',
                }}
              >
                {/* Imagen flyer — completa al ~60% del tamaño original */}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 16px 0' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/master.png"
                    alt="Quantum Access"
                    style={{ width: '60%', height: 'auto', display: 'block' }}
                  />
                </div>

                {/* Contenido */}
                <div className="px-5 py-4">
                  {/* Badge + precio */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(0,212,255,0.12)', color: CYAN, border: '1px solid rgba(0,212,255,0.25)' }}
                    >
                      ⚡ Quantum Access
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-black text-white leading-none" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        Gs. 149.000
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#475569' }}>≈ USD 22 / mes</p>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-1.5 mb-4">
                    {[
                      'Calculador ilimitado sin restricciones',
                      'Niveles diarios actualizados automáticamente',
                      'Confluencias cuánticas en tiempo real',
                      'Alertas de niveles clave configurables',
                    ].map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs" style={{ color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>
                        <span style={{ color: CYAN, fontSize: 10 }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href="/billing"
                    className="flex items-center justify-center w-full py-2.5 text-xs font-bold uppercase tracking-[0.12em] rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      backgroundColor: CYAN,
                      color: '#000',
                      fontFamily: "'Space Grotesk', sans-serif",
                      boxShadow: '0 4px 16px rgba(0,212,255,0.35)',
                    }}
                  >
                    Activar Quantum Access →
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SIGNAL HUB — PREVIEW HOMEPAGE
      ════════════════════════════════════════ */}
      <section
        id="signal-hub"
        className="relative py-20 px-4 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #0a0f1e 0%, #080E1A 50%, #0a0f1e 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(245,158,11,0.04) 0%, transparent 70%)' }} />

        <div className="max-w-6xl mx-auto relative">

          {/* Header */}
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold tracking-wider uppercase mb-6"
              style={{ backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.2)', color: '#F59E0B', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#F59E0B' }} />
              Signal Hub · En vivo
            </div>

            <h2
              className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight"
              style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-0.5px' }}
            >
              Señales de trading verificadas.{' '}
              <span style={{ color: '#F59E0B' }}>En tiempo real.</span>
            </h2>

            <p className="max-w-xl mx-auto text-base leading-relaxed" style={{ color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>
              Confluencia de niveles Gann, estructura de mercado y momentum —
              todo filtrado en un solo panel. Probalo gratis, 3 veces.
            </p>
          </div>

          {/* Card */}
          <div className="max-w-4xl mx-auto">
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.5)' }}
            >
              {/* Terminal top bar */}
              <div
                className="flex items-center justify-between px-5 py-3 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgba(239,68,68,0.7)' }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgba(234,179,8,0.7)' }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.7)' }} />
                  </div>
                  <span className="text-xs" style={{ color: '#475569', fontFamily: "'JetBrains Mono', monospace" }}>Signal Hub · Sacred Levels</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#00D26A' }} />
                  <span className="text-xs font-bold" style={{ color: '#00D26A', fontFamily: "'JetBrains Mono', monospace" }}>LIVE</span>
                </div>
              </div>

              <div className="p-6 md:p-8">

                {/* Señales preview */}
                <div className="space-y-3 mb-8">

                  {/* Señal 1 — BUY */}
                  <div className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: 'rgba(0,210,106,0.05)', border: '1px solid rgba(0,210,106,0.12)' }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0" style={{ backgroundColor: 'rgba(0,210,106,0.15)', color: '#00D26A', fontFamily: "'Space Grotesk', sans-serif" }}>
                      BUY
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-sm text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>XAUUSD</span>
                        <span className="text-xs" style={{ color: '#475569' }}>H4 · Confluencia Gann</span>
                      </div>
                      <div className="text-xs" style={{ color: '#64748B' }}>Nivel √ 2,683 — Soporte armónico + estructura alcista</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-sm" style={{ color: '#00D26A', fontFamily: "'JetBrains Mono', monospace" }}>⬆ 2,683</div>
                      <div className="text-xs mt-0.5" style={{ color: '#475569' }}>TP: 2,712</div>
                    </div>
                  </div>

                  {/* Señal 2 — SELL */}
                  <div className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,71,87,0.05)', border: '1px solid rgba(255,71,87,0.1)' }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0" style={{ backgroundColor: 'rgba(255,71,87,0.15)', color: '#FF4757', fontFamily: "'Space Grotesk', sans-serif" }}>
                      SELL
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-sm text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>EURUSD</span>
                        <span className="text-xs" style={{ color: '#475569' }}>H1 · Ruptura de nivel</span>
                      </div>
                      <div className="text-xs" style={{ color: '#64748B' }}>Rechazo en 1.0845 — Resistencia Gann + divergencia</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-sm" style={{ color: '#FF4757', fontFamily: "'JetBrains Mono', monospace" }}>⬇ 1.0845</div>
                      <div className="text-xs mt-0.5" style={{ color: '#475569' }}>TP: 1.0790</div>
                    </div>
                  </div>

                  {/* Señal 3 — Bloqueada */}
                  <div className="relative">
                    <div
                      className="flex items-center gap-4 p-4 rounded-xl select-none"
                      style={{ filter: 'blur(5px)', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0" style={{ backgroundColor: 'rgba(0,212,255,0.15)', color: CYAN }}>BUY</div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-white">BTCUSD · D1</div>
                        <div className="text-xs" style={{ color: '#64748B' }}>Nivel cuántico de acumulación...</div>
                      </div>
                      <div className="font-bold text-sm" style={{ color: CYAN, fontFamily: "'JetBrains Mono', monospace" }}>⬆ 68,450</div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.85)', border: '1px solid rgba(245,158,11,0.3)' }}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: '#F59E0B' }}>
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                        <span className="text-xs font-semibold" style={{ color: '#F59E0B', fontFamily: "'Space Grotesk', sans-serif" }}>Quantum Access</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  {session ? (
                    <Link
                      href="/hub"
                      className="flex-1 w-full sm:w-auto text-center px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5"
                      style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#000', boxShadow: '0 8px 24px rgba(245,158,11,0.25)', fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Ir al Signal Hub →
                    </Link>
                  ) : (
                    <Link
                      href="/register"
                      className="flex-1 w-full sm:w-auto text-center px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5"
                      style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#000', boxShadow: '0 8px 24px rgba(245,158,11,0.25)', fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Crear cuenta gratis · 3 señales de prueba →
                    </Link>
                  )}
                  <Link
                    href="/billing"
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:bg-amber-500/10"
                    style={{ border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B', fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    ⚡ Quantum Access · Señales ilimitadas
                  </Link>
                </div>

                {/* Trust indicators */}
                <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-xs" style={{ color: '#475569' }}>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: '#00D26A' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Señales verificadas
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: '#F59E0B' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Actualizadas en tiempo real
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: CYAN }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Método W.D. Gann
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          STATS BAR
      ════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#000', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: '700+',  label: 'Traders registrados' },
              { value: '15+',    label: 'Años de experiencia' },
              { value: '3',     label: 'Niveles de formación' },
              { value: '24/7',  label: 'Acceso al contenido' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p
                  className="text-3xl font-black mb-1"
                  style={{ color: CYAN, fontFamily: "'Montserrat', sans-serif" }}
                >
                  {stat.value}
                </p>
                <p className="text-sm" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          EXNESS BANNER 1
      ════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#080F1A', borderTop: '1px solid #111', borderBottom: '1px solid #111' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <a
            href="https://one.exnessonelink.com/intl/es/a/xwx0gc598n"
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://d3dpet1g0ty5ed.cloudfront.net/ES_Take_control_728x90.png"
              width={728}
              height={90}
              alt="Exness - Take Control"
              style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
            />
          </a>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CURSOS
      ════════════════════════════════════════ */}
      <section style={{ backgroundColor: LIGHT_BG }} id="cursos">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">

          {/* Header */}
          <div className="text-center mb-12">
            <p
              className="text-xs font-bold uppercase tracking-[0.35em] mb-4"
              style={{ color: CYAN_DARK, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Formación
            </p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight"
              style={{ color: '#0F172A', fontFamily: "'Montserrat', sans-serif", letterSpacing: '-1px' }}
            >
              Sepa como ganarle al mercado con estas metodologías de Trading
            </h2>
            <p
              className="text-base max-w-xl mx-auto"
              style={{ color: '#475569', fontFamily: "'Inter', sans-serif" }}
            >
              Comprás una vez, accedés de por vida. Sin suscripción requerida.
            </p>
          </div>

          {/* Course grid */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {COURSES.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onBuy={handleBuy}
                loading={buyingId === course.id}
              />
            ))}
          </div>

          {/* Notice */}
          <div
            className="mt-10 flex items-start gap-3 px-5 py-4 rounded-xl max-w-2xl mx-auto"
            style={{ backgroundColor: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)' }}
          >
            <span className="text-lg shrink-0">ℹ️</span>
            <p className="text-sm" style={{ color: '#0369A1', fontFamily: "'Inter', sans-serif" }}>
              Al comprar cualquier curso, accedés al contenido completo desde la sección{' '}
              <strong>CURSOS</strong> en tu cuenta. Acceso de por vida garantizado.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          QUANTUM ACCESS
      ════════════════════════════════════════ */}
      <section style={{ background: `linear-gradient(180deg, ${DARK_BG} 0%, ${DARK_BG2} 100%)` }} id="quantum">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left — features */}
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.15em] mb-6"
                style={{ backgroundColor: 'rgba(0,212,255,0.1)', color: CYAN, border: '1px solid rgba(0,212,255,0.2)' }}
              >
                ⚡ ACCESO PREMIUM
              </div>

              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight"
                style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-1px' }}
              >
                Quantum Access
              </h2>

              <p
                className="text-base mb-8 leading-relaxed"
                style={{ color: '#CBD5E1', fontFamily: "'Inter', sans-serif" }}
              >
                La herramienta más poderosa para traders profesionales.
                Acceso ilimitado a todo el ecosistema Sacred Levels.
              </p>

              <ul className="space-y-4">
                {[
                  'Calculador ilimitado sin restricciones',
                  'Niveles diarios actualizados automáticamente',
                  'Confluencias cuánticas en tiempo real',
                  'Alertas de niveles clave configurables',
                  'Acceso a comunidad privada de traders',
                ].map(f => (
                  <li key={f} className="flex items-center gap-3">
                    <span
                      className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0"
                      style={{ backgroundColor: 'rgba(0,212,255,0.15)', color: CYAN }}
                    >
                      ⚡
                    </span>
                    <span className="text-sm" style={{ color: '#CBD5E1', fontFamily: "'Inter', sans-serif" }}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — price card */}
            <div className="flex justify-center lg:justify-end">
              <div
                className="w-full rounded-2xl p-8"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(0,212,255,0.2)',
                  maxWidth: '380px',
                  boxShadow: '0 0 60px rgba(0,212,255,0.08)',
                }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-center"
                  style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Suscripción Mensual
                </p>

                <div className="text-center mb-2">
                  <p
                    className="text-4xl font-black text-white leading-none"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Gs. 149.000
                  </p>
                  <p className="text-sm mt-2" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
                    ≈ USD 22 · por mes
                  </p>
                </div>

                <p
                  className="text-center text-xs mb-8"
                  style={{ color: '#475569', fontFamily: "'Inter', sans-serif" }}
                >
                  Cancelable cuando quieras
                </p>

                <div
                  className="h-px mb-8"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                />

                <ul className="space-y-3 mb-8">
                  {[
                    'Todo incluido sin límites',
                    'Sin permanencia mínima',
                    'Renovación automática opcional',
                    'Soporte prioritario',
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>
                      <span style={{ color: '#00D26A' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/billing"
                  className="flex items-center justify-center w-full py-4 text-sm font-bold uppercase tracking-[0.1em] rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: CYAN,
                    color: '#000',
                    fontFamily: "'Space Grotesk', sans-serif",
                    boxShadow: '0 8px 24px rgba(0,212,255,0.4)',
                  }}
                >
                  ACTIVAR MI VENTAJA ✦
                </Link>

                <p
                  className="text-center text-xs mt-4"
                  style={{ color: '#374151', fontFamily: "'Inter', sans-serif" }}
                >
                  Sin permanencia · Renovación automática opcional
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          RESULTADOS / GRÁFICOS DE ESTRATEGIAS
      ════════════════════════════════════════ */}
      <section style={{ background: `linear-gradient(180deg, ${DARK_BG} 0%, #111827 100%)` }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">

          <div className="text-center mb-14">
            <p
              className="text-xs font-bold uppercase tracking-[0.35em] mb-4"
              style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Operaciones Reales
            </p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4"
              style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-1px' }}
            >
              Estrategias en el{' '}
              <span style={{ color: CYAN }}>gráfico real</span>
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
              Resultados verificables aplicando la metodología Sacred Levels en mercados reales.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[0, 1, 2].map(i => {
              const result = chartResults[i]
              return (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: result ? '1px solid rgba(0,212,255,0.2)' : '1px solid #1E293B',
                    boxShadow: result ? '0 0 40px rgba(0,212,255,0.05)' : 'none',
                  }}
                >
                  {/* Chart image */}
                  <div
                    className="relative overflow-hidden"
                    style={{ aspectRatio: '16/9', backgroundColor: '#0A0F1C' }}
                  >
                    {result ? (
                      <button
                        className="w-full h-full block group relative cursor-zoom-in"
                        onClick={() => setLightbox({ src: `/api/results/image/${result.id}`, alt: result.description })}
                        aria-label="Ver imagen completa"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/api/results/image/${result.id}`}
                          alt={result.description}
                          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
                          <span className="text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: 'rgba(0,212,255,0.2)', border: '1px solid rgba(0,212,255,0.4)', fontFamily: "'Space Grotesk', sans-serif" }}>
                            🔍 Ampliar
                          </span>
                        </div>
                      </button>
                    ) : (
                      <div
                        className="w-full h-full flex flex-col items-center justify-center"
                        style={{ border: '2px dashed #1E293B' }}
                      >
                        <svg className="w-10 h-10 mb-3 opacity-20" fill="none" stroke="#00D4FF" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                        <p className="text-xs uppercase tracking-[0.2em]" style={{ color: '#1E293B', fontFamily: "'Space Grotesk', sans-serif" }}>
                          Próximamente
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Info bar */}
                  <div className="px-4 py-3.5">
                    {result ? (
                      <>
                        <p
                          className="text-sm font-semibold text-white leading-snug"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {result.description}
                        </p>
                        {result.date && (
                          <p
                            className="text-xs mt-1"
                            style={{ color: '#475569', fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {new Date(result.date).toLocaleDateString('es-PY', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs" style={{ color: '#1E293B', fontFamily: "'Space Grotesk', sans-serif" }}>
                        — Resultado {i + 1}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-10 text-center">
            <p className="text-xs" style={{ color: '#374151', fontFamily: "'Inter', sans-serif" }}>
              Los gráficos son capturas reales de operaciones cerradas. Los resultados pasados no garantizan rendimientos futuros.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          EXNESS BANNER 2
      ════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#080F1A', borderTop: '1px solid #111', borderBottom: '1px solid #111' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <a
            href="https://one.exnessonelink.com/intl/es/a/xwx0gc598n"
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://d3dpet1g0ty5ed.cloudfront.net/ES_Take_control_728x90.png"
              width={728}
              height={90}
              alt="Exness - Take Control"
              style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
            />
          </a>
        </div>
      </section>

      {/* ════════════════════════════════════════
          MENTOR / METALEVELS
      ════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#FFFFFF' }} id="mentor">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-3 gap-12 items-start">

            {/* Left 1/3 — photo */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative" style={{ maxWidth: '320px', width: '100%' }}>
                <div
                  className="overflow-hidden rounded-2xl"
                  style={{
                    border: '3px solid rgba(14,165,233,0.2)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/raultrader2.jpg"
                    alt="Raúl Alarcón"
                    className="w-full object-cover"
                  />
                </div>
                {/* MetaLevels badge */}
                <div
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.15em] whitespace-nowrap"
                  style={{
                    backgroundColor: '#0F172A',
                    color: CYAN_DARK,
                    border: '1px solid rgba(14,165,233,0.3)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  MetaLevels ✦
                </div>
              </div>
            </div>

            {/* Right 2/3 — bio */}
            <div className="lg:col-span-2 pt-8 lg:pt-0">
              <p
                className="text-xs font-bold uppercase tracking-[0.35em] mb-3"
                style={{ color: CYAN_DARK, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                FUNDADOR & MENTOR
              </p>

              <h2
                className="text-3xl sm:text-4xl font-black mb-5 leading-tight"
                style={{ color: '#0F172A', fontFamily: "'Montserrat', sans-serif", letterSpacing: '-0.5px' }}
              >
                Raúl Alarcón
              </h2>

              <p
                className="text-base leading-relaxed mb-6"
                style={{ color: '#475569', fontFamily: "'Inter', sans-serif" }}
              >
                Analista técnico y educador de trading con más de 14 años de experiencia
                en mercados financieros internacionales. Especialista en el método de W.D. Gann
                y en el desarrollo de herramientas de análisis cuantitativo para traders.
              </p>
              <p
                className="text-base leading-relaxed mb-8"
                style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}
              >
                Fundador de Sacred Levels y Trading.com.py, plataformas líderes de educación
                en trading en Paraguay y América Latina. Su metodología combina análisis técnico
                clásico con tecnología moderna para maximizar la precisión operativa.
              </p>

              {/* Credentials grid */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: '📈', text: 'Más de 300 traders formados en América Latina' },
                  { icon: '🎓', text: 'Especialista en método W.D. Gann y análisis técnico' },
                  { icon: '⚡', text: 'Creador de la tecnología Quantum de Sacred Levels' },
                  { icon: '🌎', text: 'Referente de trading en Paraguay desde 2019' },
                ].map(cred => (
                  <div
                    key={cred.text}
                    className="flex items-start gap-3 px-4 py-3 rounded-lg"
                    style={{ borderLeft: `3px solid ${CYAN_DARK}`, backgroundColor: '#F8FAFC' }}
                  >
                    <span className="text-lg shrink-0">{cred.icon}</span>
                    <p className="text-sm leading-snug" style={{ color: '#475569', fontFamily: "'Inter', sans-serif" }}>
                      {cred.text}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                href="/metalevels"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] rounded-lg transition-all hover:-translate-y-0.5"
                style={{
                  backgroundColor: CYAN_DARK,
                  color: '#fff',
                  fontFamily: "'Space Grotesk', sans-serif",
                  boxShadow: '0 4px 16px rgba(14,165,233,0.3)',
                }}
              >
                Ver perfil completo →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA FINAL
      ════════════════════════════════════════ */}
      <section style={{ background: `linear-gradient(135deg, ${DARK_BG} 0%, ${DARK_BG2} 100%)` }}>
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 text-center">
          <h2
            className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight"
            style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-0.5px' }}
          >
            Cada minuto sin niveles es{' '}
            <span style={{ color: CYAN }}>dinero que perdés</span>
          </h2>
          <p
            className="text-base mb-8"
            style={{ color: '#CBD5E1', fontFamily: "'Inter', sans-serif" }}
          >
            700+ traders registrados calculan niveles antes que el mercado se mueva.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/billing"
              className="px-8 py-4 text-sm font-bold uppercase tracking-[0.08em] rounded-lg transition-all duration-300 hover:-translate-y-0.5"
              style={{
                backgroundColor: CYAN,
                color: '#000',
                boxShadow: '0 8px 24px rgba(0,212,255,0.4)',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              EMPEZAR AHORA →
            </Link>
            <Link
              href="/cursos"
              className="px-8 py-4 text-sm font-bold uppercase tracking-[0.08em] rounded-lg transition-all duration-300 hover:border-white hover:text-white"
              style={{
                border: '2px solid rgba(255,255,255,0.2)',
                color: '#CBD5E1',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              VER CURSOS
            </Link>
          </div>
        </div>
      </section>
<ContactSection />
      <Footer />

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease]"
          style={{ backgroundColor: 'rgba(0,0,0,0.93)', backdropFilter: 'blur(6px)' }}
          onClick={() => setLightbox(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/10 z-10"
            style={{ color: '#fff', fontSize: '18px', border: '1px solid rgba(255,255,255,0.15)' }}
            aria-label="Cerrar"
          >
            ✕
          </button>

          {/* Image — stop propagation so clicking it doesn't close */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            onClick={e => e.stopPropagation()}
            className="rounded-xl select-none"
            style={{
              maxWidth: '92vw',
              maxHeight: '86vh',
              objectFit: 'contain',
              boxShadow: '0 0 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(0,212,255,0.15)',
            }}
          />

          {/* Caption */}
          {lightbox.alt && (
            <p
              className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center text-xs px-4 py-2 rounded-lg pointer-events-none"
              style={{
                color: '#94A3B8',
                backgroundColor: 'rgba(0,0,0,0.6)',
                fontFamily: "'Inter', sans-serif",
                maxWidth: '80vw',
                backdropFilter: 'blur(4px)',
              }}
            >
              {lightbox.alt} · <span style={{ color: '#475569' }}>ESC o clic fuera para cerrar</span>
            </p>
          )}
        </div>
      )}
    </main>
  )
}
