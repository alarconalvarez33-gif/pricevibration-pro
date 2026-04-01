'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import LegalDisclaimer from '@/components/LegalDisclaimer'

const COURSES = [
  {
    id: 'canal-paralelo',
    name: 'Canal Paralelo',
    pricePyg: 320000,
    priceUsd: 50,
    flyer: '/canal1.png',
    description: 'Técnica del canal paralelo para identificar tendencias y puntos de entrada precisos.',
  },
  {
    id: 'fibonacci',
    name: 'Fibonacci Avanzado',
    pricePyg: 320000,
    priceUsd: 50,
    flyer: '/desbloquea el poder de forex.png',
    description: 'Retrocesos y extensiones de Fibonacci aplicados al trading profesional.',
  },
  {
    id: 'expansion-matematica',
    name: 'Genesis',
    pricePyg: 500000,
    priceUsd: 77,
    flyer: '/flyer1.jpg',
    description: 'Técnicas de trading avanzadas nunca antes vistas, sumamente eficientes y demostrables.',
  },
]

const BG      = '#0A0A0B'
const CARD    = '#141415'
const BORDER  = '#222222'
const CYAN    = '#00E5FF'
const MUTED   = '#555555'
const DARK_BG = '#0d0d0e'

function Gs(n: number) {
  return 'Gs. ' + n.toLocaleString('es-PY')
}

function SpinIcon() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export default function BillingPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setIsLocked(params.get('locked') === 'true')
  }, [])

  const handleSubscribe = async () => {
    if (!session) { window.location.href = '/login?redirect=/billing'; return }
    setLoading('quantum')
    try {
      const res = await fetch('/api/pagopar/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: 'quantum', billingPeriod: 'monthly' }),
      })
      const data = await res.json()
      if (data.success && data.paymentUrl) window.location.href = data.paymentUrl
      else alert('Error: ' + (data.error || data.pagoparError || 'No se pudo generar el pago'))
    } catch { alert('Error al procesar el pago') }
    finally { setLoading(null) }
  }

  const handleBuyCourse = async (courseId: string) => {
    if (!session) { window.location.href = '/login?redirect=/billing'; return }
    setLoading(courseId)
    try {
      const res = await fetch('/api/pagopar/create-product-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: courseId }),
      })
      const data = await res.json()
      if (data.success && data.paymentUrl) window.location.href = data.paymentUrl
      else alert('Error: ' + (data.error || data.pagoparError || 'No se pudo generar el pago'))
    } catch { alert('Error al procesar el pago') }
    finally { setLoading(null) }
  }

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: BG, fontFamily: "'Inter', sans-serif" }}
    >
      <Navbar />

      {isLocked && (
        <div
          className="w-full px-6 py-4 text-center text-sm font-semibold"
          style={{
            backgroundColor: '#1a0a00',
            borderBottom: '1px solid #ff4500',
            color: '#ff6b35',
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: '0.02em',
          }}
        >
          Tu acceso ha sido suspendido. Activa Quantum Access para continuar.
        </div>
      )}

      <div className="pt-36 pb-24 px-6">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-16">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-5"
              style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Acceso Total
            </p>
            <h1
              className="text-5xl font-bold text-white mb-4 leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Un plan.
              <br />Todo incluido.
            </h1>
            <p className="text-[#444] text-base max-w-xl">
              Herramientas cuánticas profesionales para Forex, Oro, Crypto e Índices.
            </p>
          </div>

          {/* ── Quantum Access Card ── */}
          <div
            className="border mb-3"
            style={{ backgroundColor: CARD, borderColor: BORDER }}
          >
            {/* Top accent */}
            <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)` }} />

            {/* Header strip */}
            <div
              className="flex items-center justify-between px-8 py-4 border-b"
              style={{ borderColor: BORDER, backgroundColor: DARK_BG }}
            >
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#333]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Plan único
              </span>
              <div
                className="flex items-center gap-2 border px-3 py-1"
                style={{ borderColor: `${CYAN}30`, backgroundColor: `${CYAN}08` }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: CYAN }} />
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.25em]"
                  style={{ color: CYAN }}
                >
                  Quantum Access
                </span>
              </div>
            </div>

            {/* Flyer — siempre completo */}
            <div
              className="w-full border-b"
              style={{ minHeight: '280px', backgroundColor: '#111', borderColor: BORDER }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/signal.png"
                alt="Quantum Access"
                className="w-full block"
                style={{ objectFit: 'contain', maxHeight: '380px' }}
              />
            </div>

            <div className="p-8 md:p-10">

              {/* Price block */}
              <div className="mb-8 pb-8 border-b" style={{ borderColor: BORDER }}>
                <h2
                  className="text-2xl font-bold text-white mb-2"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Quantum Access
                </h2>
                <p className="text-[#444] text-sm mb-5">Acceso completo a todas las herramientas cuánticas</p>
                <div className="flex items-baseline gap-3 mb-1">
                  <span
                    className="text-4xl font-bold text-white"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {Gs(350000)}
                  </span>
                  <span className="text-[#444] text-sm">/ $50 USD</span>
                  <span className="text-[#444] text-sm">/mes</span>
                </div>
              </div>

              {/* Features */}
              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {[
                  'Calculadora Cuadrática (ilimitada)',
                  'Signal Hub (todas las señales)',
                  'DXY Dollar Index en vivo',
                  'Forex, Crypto, Oro e Índices',
                  'Análisis IA en tiempo real',
                  'Dashboard Quantum Levels',
                  'Acceso 24/7',
                  'Niveles cuánticos automáticos',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-1 h-1 shrink-0" style={{ backgroundColor: CYAN }} />
                    <span className="text-[#555] text-sm">{f}</span>
                  </div>
                ))}
              </div>

              {/* Courses note */}
              <div
                className="mb-6 p-4 border text-xs text-[#444]"
                style={{ borderColor: BORDER, backgroundColor: DARK_BG }}
              >
                Los cursos no están incluidos — se compran por separado
              </div>

              {/* Free trial */}
              <div
                className="mb-8 p-4 border text-center text-xs font-medium"
                style={{ borderColor: `${CYAN}20`, backgroundColor: `${CYAN}06`, color: CYAN }}
              >
                7 días de prueba gratuita disponibles
              </div>

              {/* Payment badges — diseño intencional */}
              <div
                className="mb-8 border p-5"
                style={{ borderColor: BORDER, backgroundColor: DARK_BG }}
              >
                <p
                  className="text-[9px] uppercase tracking-[0.3em] mb-4"
                  style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Pagá en cuotas sin interés
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  {[
                    { n: 1, monto: 350000 },
                    { n: 3, monto: 116667 },
                    { n: 6, monto: 58334 },
                    { n: 12, monto: 29167 },
                  ].map((c) => (
                    <div
                      key={c.n}
                      className="border p-3 flex flex-col items-center gap-1 transition-colors duration-200 hover:border-[#333]"
                      style={{ borderColor: BORDER }}
                    >
                      <span
                        className="text-base font-bold"
                        style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {c.n}x
                      </span>
                      <span
                        className="text-[9px] font-bold text-white"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {Gs(c.monto)}
                      </span>
                      <span
                        className="text-[8px] font-bold uppercase tracking-widest"
                        style={{ color: '#00D26A' }}
                      >
                        0% INTERÉS
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[#333] text-[9px] uppercase tracking-[0.2em]">
                  Visa · Mastercard · Bancard
                </p>
              </div>

              {/* CTA */}
              <button
                onClick={handleSubscribe}
                disabled={loading === 'quantum'}
                className="w-full py-4 text-base font-bold uppercase tracking-[0.1em] text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {loading === 'quantum' ? (
                  <span className="flex items-center justify-center gap-2">
                    <SpinIcon /> Procesando...
                  </span>
                ) : 'Suscribirme Ahora'}
              </button>
            </div>
          </div>

          {/* ── Courses ── */}
          <div className="mt-20">
            <div className="mb-10">
              <p
                className="text-[9px] uppercase tracking-[0.3em] mb-3"
                style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Cursos — compra por separado
              </p>
              <h2
                className="text-3xl font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Formación Avanzada
              </h2>
            </div>

            {/* Canal Paralelo + Fibonacci */}
            <div className="grid gap-px sm:grid-cols-1 md:grid-cols-2" style={{ backgroundColor: BORDER }}>
              {COURSES.filter(c => c.id !== 'expansion-matematica').map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col"
                  style={{ backgroundColor: CARD }}
                >
                  <div
                    className="w-full overflow-hidden"
                    style={{ height: '200px', backgroundColor: '#111' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.flyer}
                      alt={course.name}
                      className="w-full h-full block"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3
                      className="text-white font-bold text-sm mb-2"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {course.name}
                    </h3>
                    <p className="text-[#444] text-xs mb-4 leading-relaxed flex-1">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <div
                          className="text-white font-bold text-sm"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {Gs(course.pricePyg)}
                        </div>
                        <div className="text-[#555] text-[10px]">/ ${course.priceUsd} USD · pago único</div>
                      </div>
                      <button
                        onClick={() => handleBuyCourse(course.id)}
                        disabled={loading === course.id}
                        className="border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] transition-all duration-200 hover:border-[#00E5FF]/50 hover:text-[#00E5FF] text-[#555] disabled:opacity-50"
                        style={{ borderColor: BORDER, fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {loading === course.id ? (
                          <span className="flex items-center gap-1"><SpinIcon />...</span>
                        ) : 'No quiero seguir operando a ciegas'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Genesis — featured card ── */}
            <div className="mt-px" style={{ backgroundColor: CARD }}>
              {/* Top accent */}
              <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, #C4A77D, transparent)` }} />

              <div className="flex flex-col md:flex-row">
                {/* Flyer */}
                <div
                  className="w-full md:w-2/5 shrink-0"
                  style={{ backgroundColor: '#111', minHeight: '280px' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/flyer1.jpg"
                    alt="Genesis"
                    className="w-full h-full block"
                    style={{ objectFit: 'contain', maxHeight: '420px' }}
                  />
                </div>

                {/* Content */}
                <div className="p-8 md:p-10 flex flex-col justify-between flex-1">
                  <div>
                    {/* Badge */}
                    <span
                      className="inline-block text-[9px] font-bold uppercase tracking-[0.3em] mb-4 px-2 py-1"
                      style={{ color: '#C4A77D', border: '1px solid #C4A77D30', backgroundColor: '#C4A77D08', fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Curso Exclusivo
                    </span>

                    <h3
                      className="text-2xl font-bold text-white mb-2"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Genesis
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-6">
                      <span
                        className="text-xl font-bold"
                        style={{ color: '#C4A77D', fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {Gs(500000)}
                      </span>
                      <span className="text-[#444] text-xs">/ $77 USD · pago único</span>
                    </div>

                    {/* Description */}
                    <p
                      className="text-sm leading-relaxed mb-8"
                      style={{ color: '#666' }}
                    >
                      ¿Te has preguntado por qué el precio reacciona con precisión quirúrgica en ciertos puntos?
                      La respuesta está en la raíz cuadrada de los niveles armónicos. En esta sección te revelo
                      cómo los ratios de $0.25$, $0.5$ y $0.75$ actúan como imanes magnéticos para las instituciones.
                      Aprende a leer el esqueleto del mercado y deja de operar a ciegas.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <span
                      className="border px-5 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-center"
                      style={{ borderColor: '#C4A77D30', color: '#C4A77D', fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Quiero saber más
                    </span>
                    <button
                      onClick={() => handleBuyCourse('expansion-matematica')}
                      disabled={loading === 'expansion-matematica'}
                      className="px-6 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: '#C4A77D', fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {loading === 'expansion-matematica' ? (
                        <span className="flex items-center justify-center gap-2"><SpinIcon />Procesando...</span>
                      ) : 'Adquirir Genesis'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[#333] text-[9px] text-center mt-4 uppercase tracking-[0.2em]">
              Los cursos se pueden pagar a cuotas con tus tarjetas
            </p>
          </div>

          {session && (
            <div className="text-center mt-10">
              <Link href="/dashboard" className="text-[#333] text-xs hover:text-white transition-colors uppercase tracking-[0.15em]">
                ← Ir al Dashboard
              </Link>
            </div>
          )}

          <div className="mt-16">
            <LegalDisclaimer variant="full" />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
