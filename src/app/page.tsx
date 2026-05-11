'use client'
import ContactSection from '@/components/home/ContactSection'
import { SerHeroSection } from '@/components/home/SerHeroSection'
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
          {loading ? 'Procesando...' : 'COMPRAR CURSO →'}
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">

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
                Opera con la{' '}
                <span style={{ color: CYAN }}>precisión</span>
                {' '}que el mercado exige.
              </h1>

              <p
                className="text-lg mb-4 leading-relaxed"
                style={{ color: '#CBD5E1', fontFamily: "'Inter', sans-serif" }}
              >
                Tecnología de precisión al servicio de tu operativa.
              </p>
              <p
                className="text-base mb-10 leading-relaxed"
                style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}
              >
                Accedé a herramientas de análisis técnico avanzado, cursos probados
                y comunidad de traders profesionales.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/billing"
                  className="px-8 py-4 text-sm font-bold uppercase tracking-[0.08em] rounded-lg text-center transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: CYAN,
                    color: '#000',
                    boxShadow: '0 8px 24px rgba(0,212,255,0.4)',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  COMENZAR AHORA
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
                        Gs. 180.000
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#475569' }}>≈ USD 28 / mes</p>
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
                    href="/dashboard"
                    className="flex items-center justify-center w-full py-2.5 text-xs font-bold uppercase tracking-[0.12em] rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      backgroundColor: CYAN,
                      color: '#000',
                      fontFamily: "'Space Grotesk', sans-serif",
                      boxShadow: '0 4px 16px rgba(0,212,255,0.35)',
                    }}
                  >
                    Ir a las Calculadoras →
                  </Link>
                </div>
              </div>

            </div>

            {/* Right — SER flyer */}
            <div className="relative flex justify-center lg:justify-end">
              <div style={{ maxWidth: '400px', width: '100%' }}>

                {/* Flyer frame */}
                <div
                  className="relative overflow-hidden rounded-2xl"
                  style={{
                    border: '1px solid rgba(0,212,255,0.18)',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,212,255,0.06)',
                    background: '#0D1117',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/presenta.png"
                    alt="SER — Sistema de Econofísica Resonante"
                    className="w-full block"
                    style={{ display: 'block' }}
                  />
                  {/* Subtle top bar overlay */}
                  <div
                    className="absolute top-0 inset-x-0 h-12"
                    style={{ background: 'linear-gradient(180deg, rgba(13,17,23,0.4) 0%, transparent 100%)' }}
                  />
                </div>

                {/* Stats below flyer — replacing CEO / 68% win rate */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[
                    { value: 'IA 24/7', label: 'Siempre disponible' },
                    { value: '100%', label: 'En español' },
                    { value: 'Tiempo real', label: 'Datos reales' },
                  ].map(s => (
                    <div
                      key={s.label}
                      className="rounded-xl px-3 py-3 text-center"
                      style={{
                        backgroundColor: 'rgba(0,212,255,0.06)',
                        border: '1px solid rgba(0,212,255,0.2)',
                      }}
                    >
                      <p className="font-black text-sm leading-none mb-1" style={{ color: '#FFFFFF', fontFamily: "'Montserrat', sans-serif" }}>
                        {s.value}
                      </p>
                      <p className="text-[10px] font-medium" style={{ color: '#CBD5E1', fontFamily: "'Inter', sans-serif" }}>
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SER — INTELIGENCIA FINANCIERA
      ════════════════════════════════════════ */}
      <SerHeroSection />

      {/* ════════════════════════════════════════
          PLANES SER IA
      ════════════════════════════════════════ */}
      <section style={{ background: `linear-gradient(180deg, #080E1A 0%, ${DARK_BG} 100%)` }} id="planes-ser">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">

          <div className="text-center mb-12">
            <p
              className="text-xs font-bold uppercase tracking-[0.35em] mb-4"
              style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Inteligencia Artificial
            </p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight"
              style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-1px' }}
            >
              Planes SER IA
            </h2>
            <p
              className="text-base max-w-xl mx-auto"
              style={{ color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}
            >
              Acceso a la primera IA trader, creada en los laboratorios de THE MENTOR.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8 items-start">

            {/* Flyer presenta.png */}
            <div className="lg:col-span-2 flex justify-center">
              <div
                className="w-full max-w-sm rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(0,212,255,0.18)', boxShadow: '0 0 60px rgba(0,212,255,0.08)' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/presenta.png"
                  alt="SER Inteligencia Artificial"
                  className="w-full block"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>

            {/* Plan cards */}
            <div className="lg:col-span-3 grid sm:grid-cols-2 gap-6">

              {/* Plan SER - $20 */}
              <div
                className="rounded-2xl p-6 flex flex-col"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(0,212,255,0.15)',
                }}
              >
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.15em] mb-4 self-start"
                  style={{ backgroundColor: 'rgba(0,212,255,0.1)', color: CYAN, border: '1px solid rgba(0,212,255,0.2)' }}
                >
                  Plan SER
                </div>
                <div className="mb-4">
                  <p
                    className="text-3xl font-black text-white leading-none"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    $20<span className="text-sm font-normal text-slate-400">/mes</span>
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#475569' }}>≈ Gs. 130.000</p>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {['10 preguntas / día', 'Análisis de gráficos', 'Niveles cuánticos', 'Modelo avanzado', 'Acceso a Signal Hub', 'En español 24/7'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>
                      <span style={{ color: CYAN }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/billing#planes-ser"
                  className="block text-center py-3 text-sm font-bold uppercase tracking-[0.1em] border rounded-xl transition-all hover:border-[#00D4FF]/60 hover:text-[#00D4FF]"
                  style={{ borderColor: 'rgba(0,212,255,0.25)', color: '#64748B', fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Ver Plan SER
                </Link>
              </div>

              {/* Plan SER+ - $40 */}
              <div
                className="rounded-2xl p-6 flex flex-col"
                style={{
                  backgroundColor: 'rgba(0,212,255,0.05)',
                  border: '1px solid rgba(0,212,255,0.3)',
                  boxShadow: '0 0 40px rgba(0,212,255,0.06)',
                }}
              >
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.15em] mb-4 self-start"
                  style={{ backgroundColor: 'rgba(0,212,255,0.15)', color: CYAN, border: '1px solid rgba(0,212,255,0.3)' }}
                >
                  ⚡ Plan SER+
                </div>
                <div className="mb-4">
                  <p
                    className="text-3xl font-black text-white leading-none"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    $40<span className="text-sm font-normal text-slate-400">/mes</span>
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#475569' }}>≈ Gs. 260.000</p>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {['20 preguntas / día', 'Análisis multi-timeframe', '5 escenarios por análisis', 'Mentor · razonamiento profundo', 'Acceso a Signal Hub', 'En español 24/7'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: '#CBD5E1', fontFamily: "'Inter', sans-serif" }}>
                      <span style={{ color: CYAN }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/billing#planes-ser"
                  className="block text-center py-3 text-sm font-bold uppercase tracking-[0.1em] rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: CYAN,
                    color: '#000',
                    fontFamily: "'Space Grotesk', sans-serif",
                    boxShadow: '0 8px 24px rgba(0,212,255,0.3)',
                  }}
                >
                  Ver Plan SER+
                </Link>
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
              { value: '200+',  label: 'Traders formados' },
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
                    Gs. 180.000
                  </p>
                  <p className="text-sm mt-2" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
                    ≈ USD 28 · por mes
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
                  ACTIVAR QUANTUM ACCESS
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
          TESTIMONIOS
      ════════════════════════════════════════ */}
      <section style={{ backgroundColor: LIGHT_BG }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">

          <div className="text-center mb-14">
            <p
              className="text-xs font-bold uppercase tracking-[0.35em] mb-4"
              style={{ color: CYAN_DARK, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Historias Reales
            </p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4"
              style={{ color: '#0F172A', fontFamily: "'Montserrat', sans-serif", letterSpacing: '-1px' }}
            >
              Resultados de nuestros{' '}
              <span style={{ color: CYAN_DARK }}>clientes</span>
            </h2>
            <p className="text-base max-w-2xl mx-auto" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
              Personas reales aplicando la metodología Sacred Levels con resultados verificables.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                image: '/esdra.jpg',
                name: 'Esdra',
                profit: '$30–40 USD/día',
                quote: 'Soy de Brasil, empecé hace poco en el mundo del trading, buscando obtener un ingreso extra, y me ha ido bien por el momento. Con mucha humildad voy ganando entre 30-40 USD por día. Claro, hay días que no se gana, pero la consistencia y disciplina es la clave. ',
              },
              {
                image: '/erwin.jpeg',
                name: 'Erwin',
                role: 'Abogado independiente',
                profit: '$400 USD primer retiro',
                quote: 'Soy abogado, ya hice el retiro de aproximadamente 400 USD en una cuenta fondeada.',
              },
              {
                image: '/virgilio.jpg',
                name: 'Virgilio',
                profit: '$380 USD/semana',
                quote: 'Soy independiente y con estas estrategias ya voy alcanzando la suma de 380 USD en una semana.',
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
              >
                {/* Photo */}
                <div
                  className="relative overflow-hidden"
                  style={{ aspectRatio: '4/5', background: 'linear-gradient(135deg, #0F172A, #1A2845)' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{ backgroundColor: CYAN_DARK, color: '#fff', boxShadow: '0 4px 12px rgba(14,165,233,0.4)', fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    💰 {t.profit}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3
                    className="text-xl font-black mb-0.5"
                    style={{ color: '#0F172A', fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {t.name}
                  </h3>
                  {t.role && (
                    <p className="text-xs mb-3" style={{ color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>
                      {t.role}
                    </p>
                  )}

                  <div className="relative mt-3">
                    <span
                      className="absolute -top-3 -left-1 font-black leading-none select-none"
                      style={{ color: `${CYAN_DARK}30`, fontSize: '60px', fontFamily: "'Montserrat', sans-serif" }}
                    >
                      &ldquo;
                    </span>
                    <p className="text-sm leading-relaxed pl-5 italic" style={{ color: '#475569', fontFamily: "'Inter', sans-serif" }}>
                      {t.quote}
                    </p>
                  </div>

                  <div className="flex gap-0.5 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} style={{ color: GOLD, fontSize: '14px' }}>★</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p
            className="text-center text-xs mt-10 max-w-3xl mx-auto"
            style={{ color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}
          >
            * Los resultados mostrados son experiencias individuales. El trading conlleva riesgos y los resultados
            pasados no garantizan resultados futuros. Cada persona puede obtener resultados diferentes.
          </p>
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
            ¿Listo para operar con{' '}
            <span style={{ color: CYAN }}>precisión</span>?
          </h2>
          <p
            className="text-base mb-8"
            style={{ color: '#CBD5E1', fontFamily: "'Inter', sans-serif" }}
          >
            Unite a más de 300 traders que ya usan Sacred Levels para mejorar sus operaciones.
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
              ACTIVAR QUANTUM ACCESS
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
