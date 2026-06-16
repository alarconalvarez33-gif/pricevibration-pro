'use client'
import ContactSection from '@/components/home/ContactSection'
import { WhatsAppFloat } from '@/components/ui/WhatsAppFloat'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Header from '@/components/layout/Header'
import Footer from '@/components/Footer'
import ExnessBanner from '@/components/ExnessBanner'
import SignalRadarPreview from '@/components/home/SignalRadarPreview'

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
  const [cryptoCopied, setCryptoCopied] = useState(false)

  const handleCopyAddress = () => {
    navigator.clipboard.writeText('TAh8pftt2kszhrJyUMXZt3vfbctmWPFgaL')
    setCryptoCopied(true)
    setTimeout(() => setCryptoCopied(false), 2500)
  }

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
          EXNESS — BANNER AFILIADO (top of page)
      ════════════════════════════════════════ */}
      <div style={{ paddingTop: '96px' }}>
        <ExnessBanner />
      </div>

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section
        style={{
          background: `linear-gradient(135deg, ${DARK_BG} 0%, ${DARK_BG2} 60%, ${DARK_BG} 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

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
                  VER SEÑALES →
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
            </div>

            {/* Right — Binance USDT Banner */}
            <div>
              <div
                className="mt-8 overflow-hidden"
                style={{ backgroundColor: '#0d0d0d', border: '1px solid #1c1a12', outline: '1px solid #000' }}
              >
                {/* top bar — terminal style */}
                <div
                  className="flex items-center justify-between px-4 py-2"
                  style={{ backgroundColor: '#0a0900', borderBottom: '1px solid #1c1a12' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F3BA2F' }} />
                    <span
                      className="text-[9px] font-bold uppercase tracking-[0.35em]"
                      style={{ color: '#4a3f10', fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      CRYPTO_PAYMENT
                    </span>
                  </div>
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: '#2a2510', fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    USDT · TRC-20
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row">

                  {/* Left — Binance image */}
                  <div
                    className="sm:w-[140px] shrink-0 flex items-center justify-center p-4"
                    style={{ backgroundColor: '#080700', borderRight: '1px solid #1c1a12' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/binance.jpg"
                      alt="Binance"
                      className="w-full object-contain"
                      style={{ maxHeight: '80px', filter: 'brightness(0.9)' }}
                    />
                  </div>

                  {/* Right — info */}
                  <div className="flex-1 p-4 space-y-3">

                    {/* Heading */}
                    <div>
                      <p
                        className="text-base font-black text-white leading-tight"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.3px' }}
                      >
                        Pagá con USDT
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: '#6b5c1a', fontFamily: "'Inter', sans-serif" }}>
                        Binance · Red Tron TRC-20 · $30 USD / Gs. 180.000
                      </p>
                    </div>

                    {/* Address row */}
                    <div className="flex items-center gap-2">
                      <code
                        className="flex-1 text-[10px] px-2.5 py-1.5 select-all truncate"
                        style={{
                          backgroundColor: '#060500',
                          border: '1px solid #1c1a12',
                          color: '#F3BA2F',
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        TAh8pftt2kszhrJyUMXZt3vfbctmWPFgaL
                      </code>
                      <button
                        onClick={handleCopyAddress}
                        className="shrink-0 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-colors"
                        style={{
                          backgroundColor: cryptoCopied ? 'rgba(0,210,106,0.15)' : 'rgba(243,186,47,0.1)',
                          border: `1px solid ${cryptoCopied ? '#00D26A40' : '#F3BA2F30'}`,
                          color: cryptoCopied ? '#00D26A' : '#F3BA2F',
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        {cryptoCopied ? '✓ OK' : 'Copiar'}
                      </button>
                    </div>

                    {/* WhatsApp CTA */}
                    <a
                      href="https://wa.me/595981234128?text=Hola%2C%20realic%C3%A9%20un%20pago%20USDT%20por%20Quantum%20Access%20y%20adjunto%20el%20comprobante"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[11px] font-bold transition-opacity hover:opacity-80"
                      style={{ color: '#25D366', fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.616l4.54-1.472A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.325 0-4.47-.744-6.228-2.01l-.435-.327-2.927.949.974-2.883-.36-.467A9.958 9.958 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
                      </svg>
                      Enviá el comprobante y activamos en menos de 1 hora →
                    </a>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          RADAR EN VIVO — PREVIEW HOMEPAGE
      ════════════════════════════════════════ */}
      <SignalRadarPreview />

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
          SEÑALES
      ════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#0A0A0B', borderTop: '1px solid #1a1a1a' }} id="quantum">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-20 md:py-28">

          {/* Section label */}
          <div className="flex items-center gap-4 mb-16">
            <div className="h-px flex-1" style={{ backgroundColor: '#1a1a1a' }} />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.4em]"
              style={{ color: '#333', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Señales · Suscripción mensual
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: '#1a1a1a' }} />
          </div>

          <div className="grid lg:grid-cols-[1fr_340px] gap-12 lg:gap-20 items-start">

            {/* LEFT — pitch */}
            <div>
              <h2
                className="text-4xl md:text-5xl font-black text-white leading-tight mb-6"
                style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-1.5px' }}
              >
                Todo el ecosistema.<br />
                <span style={{ color: CYAN }}>Un solo precio.</span>
              </h2>

              <p className="text-base mb-10 leading-relaxed" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
                Acceso completo a Sacred Levels — Señales sin restricciones,
                calculadora ilimitada, niveles cuánticos diarios y más.
              </p>

              <ul className="space-y-5">
                {[
                  ['Señales', 'en tiempo real, todos los mercados'],
                  ['Calculadora Cuadrática', 'usos ilimitados, sin restricciones'],
                  ['Niveles Gann diarios', 'actualizados automáticamente cada sesión'],
                  ['Dashboard de confluencias', 'análisis cuántico en tiempo real'],
                  ['Acceso 24/7', 'sin cortes, sin límites de uso'],
                ].map(([title, desc]) => (
                  <li key={title} className="flex items-start gap-4">
                    <span className="mt-1 shrink-0 w-px h-4 block" style={{ backgroundColor: CYAN }} />
                    <div>
                      <span className="text-sm font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {title}
                      </span>
                      <span className="text-sm ml-2" style={{ color: '#475569' }}>— {desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* RIGHT — pricing */}
            <div style={{ borderTop: `2px solid ${CYAN}`, paddingTop: '24px' }}>

              {/* Price block */}
              <div className="mb-8">
                <div className="flex items-end gap-3 mb-1">
                  <span
                    className="text-[80px] font-black text-white leading-none"
                    style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-4px' }}
                  >
                    $30
                  </span>
                  <div className="pb-3">
                    <p className="text-base font-bold text-white leading-tight">USD</p>
                    <p className="text-sm leading-tight" style={{ color: '#444' }}>por mes</p>
                  </div>
                </div>
                <p className="text-sm font-medium" style={{ color: '#555', fontFamily: "'JetBrains Mono', monospace" }}>
                  Gs. 180.000 &nbsp;·&nbsp; equivalente local
                </p>
                <p className="text-xs mt-1" style={{ color: '#2d2d2d' }}>
                  Cancelá cuando quieras · sin permanencia
                </p>
              </div>

              {/* Divider */}
              <div className="h-px mb-6" style={{ backgroundColor: '#1a1a1a' }} />

              {/* Payment methods */}
              <div className="mb-6">
                <p
                  className="text-[9px] font-bold uppercase tracking-[0.35em] mb-3"
                  style={{ color: '#333', fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Métodos de pago
                </p>
                <div className="flex flex-wrap gap-2 mb-2.5">
                  {['Visa', 'Mastercard', 'Bancard', 'Ueno'].map(card => (
                    <span
                      key={card}
                      className="px-2.5 py-1 text-[11px] font-bold border"
                      style={{ borderColor: '#242424', color: '#555', fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {card}
                    </span>
                  ))}
                </div>
                <p className="text-[11px]" style={{ color: '#333', fontFamily: "'Inter', sans-serif" }}>
                  Cuotas sin interés disponibles con Banco Familiar
                </p>
              </div>

              {/* Crypto / USDT */}
              <div
                className="mb-7 px-3 py-3.5"
                style={{ borderLeft: '2px solid #F59E0B', backgroundColor: 'rgba(245,158,11,0.04)' }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#F59E0B' }} />
                  <p
                    className="text-[9px] font-bold uppercase tracking-[0.35em]"
                    style={{ color: '#F59E0B', fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    USDT · Tron TRC-20
                  </p>
                </div>
                <p className="text-[11px] mb-2 leading-relaxed" style={{ color: '#555', fontFamily: "'Inter', sans-serif" }}>
                  Pagá con cripto y mandá el comprobante por WhatsApp — acceso activado en menos de 1 hora.
                </p>
                <code
                  className="text-[10px] block select-all leading-relaxed break-all"
                  style={{ color: '#7a6030', fontFamily: "'JetBrains Mono', monospace" }}
                >
                  TAh8pftt2kszhrJyUMXZt3vfbctmWPFgaL
                </code>
              </div>

              {/* CTA */}
              <Link
                href="/billing"
                className="flex items-center justify-between w-full px-5 py-4 text-sm font-bold uppercase tracking-[0.1em] text-black transition-opacity duration-200 hover:opacity-90"
                style={{ backgroundColor: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <span>Activar Señales</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>→</span>
              </Link>

              <p className="text-[10px] mt-3 text-center" style={{ color: '#2a2a2a', fontFamily: "'Inter', sans-serif" }}>
                Visa · Mastercard · Bancard · USDT
              </p>
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
