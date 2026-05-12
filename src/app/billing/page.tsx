'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import LegalDisclaimer from '@/components/LegalDisclaimer'

type CourseAction = { action: 'api'; id: string } | { action: 'link'; href: string }

const COURSES: Array<{
  id: string; name: string; level: string; icon: string; flyer: string;
  pricePyg: number; priceUsd: number; popular: boolean;
  features: string[];
} & CourseAction> = [
  {
    id: 'super-estrategia', action: 'api',
    name: 'Super Estrategia', level: 'Básico', icon: '📊', flyer: '/recursos.png',
    pricePyg: 150000, priceUsd: 23, popular: false,
    features: [
      'Estrategia de entrada de alta probabilidad',
      'Gestión de riesgo profesional',
      'Aplicable en cualquier mercado',
      'Acceso de por vida sin cuotas',
    ],
  },
  {
    id: 'expansion-matematica', action: 'api',
    name: 'Génesis', level: 'Intermedio', icon: '⚡', flyer: '/flyer1.jpg',
    pricePyg: 500000, priceUsd: 78, popular: true,
    features: [
      'Método de raíz cuadrada de W.D. Gann',
      'Cálculo de niveles exactos de precio',
      'Proyecciones de precio y tiempo',
      'Acceso de por vida sin cuotas',
    ],
  },
  {
    id: 'frecuencia', action: 'link', href: '/cursos/frecuencia',
    name: 'Frecuencia', level: 'Avanzado', icon: '🔮', flyer: '/cuadradex.png',
    pricePyg: 200000, priceUsd: 31, popular: false,
    features: [
      'Estructura fractal del mercado',
      'Sincronización de tiempo y precio',
      'Zonas geométricas de reversión',
      'Acceso de por vida sin cuotas',
    ],
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

  const handleSubscribeSer = async (planType: 'ser' | 'ser-plus') => {
    if (!session) { window.location.href = '/login?redirect=/billing'; return }
    setLoading(planType)
    try {
      const res = await fetch('/api/pagopar/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, billingPeriod: 'monthly' }),
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
      className="min-h-screen pb-20 md:pb-0"
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

      <div className="pt-24 sm:pt-36 pb-24 px-4 sm:px-6 pb-28 md:pb-24">
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
              className="text-3xl sm:text-5xl font-bold text-white mb-4 leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Un plan.
              <br />Todo incluido.
            </h1>
            <p className="text-[#444] text-base max-w-xl">
              Herramientas cuánticas profesionales para Forex, Oro, Crypto e Índices.
            </p>
          </div>

          {/* ── Planes SER IA ── */}
          <div className="mb-20">
            <div className="mb-8">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-3"
                style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Inteligencia Artificial
              </p>
              <h2
                className="text-2xl sm:text-3xl font-bold text-white mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Planes SER IA
              </h2>
              <p className="text-sm" style={{ color: '#444' }}>
                Acceso a la IA de trading más avanzada, creada en los laboratorios de THE MENTOR.
              </p>
            </div>

            {/* Flyer */}
            <div
              className="w-full border mb-6"
              style={{ backgroundColor: '#0d0d0e', borderColor: BORDER, maxHeight: 340, overflow: 'hidden' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/presenta.png"
                alt="SER Inteligencia Artificial"
                className="w-full block"
                style={{ objectFit: 'contain', maxHeight: 340 }}
              />
            </div>

            {/* Two plan cards */}
            <div className="grid sm:grid-cols-2 gap-px" style={{ backgroundColor: BORDER }}>

              {/* Plan SER */}
              <div style={{ backgroundColor: CARD }}>
                <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)` }} />
                <div
                  className="flex items-center justify-between px-5 py-3 border-b"
                  style={{ borderColor: BORDER, backgroundColor: DARK_BG }}
                >
                  <span className="text-[9px] font-bold uppercase tracking-[0.25em]" style={{ color: '#444', fontFamily: "'Space Grotesk', sans-serif" }}>
                    Plan mensual
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}>
                    SER
                  </span>
                </div>
                <div className="p-5 sm:p-6">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {Gs(89000)}
                    </span>
                  </div>
                  <p className="text-[#444] text-xs mb-5">/ $13 USD · por mes</p>
                  <ul className="space-y-2.5 mb-6">
                    {[
                      '10 preguntas por día',
                      'Análisis de gráficos',
                      'Niveles cuánticos',
                      'Modelo avanzado',
                      'En español 24/7',
                    ].map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-xs" style={{ color: '#555' }}>
                        <span style={{ color: CYAN, fontSize: 10 }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSubscribeSer('ser')}
                    disabled={loading === 'ser'}
                    className="w-full py-3 text-sm font-bold uppercase tracking-[0.1em] border transition-all hover:border-[#00E5FF]/60 hover:text-[#00E5FF] disabled:opacity-50"
                    style={{ borderColor: BORDER, color: '#555', backgroundColor: DARK_BG, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {loading === 'ser' ? (
                      <span className="flex items-center justify-center gap-2"><SpinIcon /> Procesando...</span>
                    ) : 'Suscribirme a SER'}
                  </button>
                </div>
              </div>

              {/* Plan SER+ */}
              <div style={{ backgroundColor: CARD }}>
                <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)` }} />
                <div
                  className="flex items-center justify-between px-5 py-3 border-b"
                  style={{ borderColor: BORDER, backgroundColor: DARK_BG }}
                >
                  <span className="text-[9px] font-bold uppercase tracking-[0.25em]" style={{ color: '#444', fontFamily: "'Space Grotesk', sans-serif" }}>
                    Plan mensual
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: CYAN }} />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}>
                      SER+
                    </span>
                  </div>
                </div>
                <div className="p-5 sm:p-6">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {Gs(249000)}
                    </span>
                  </div>
                  <p className="text-[#444] text-xs mb-5">/ $38 USD · por mes</p>
                  <ul className="space-y-2.5 mb-6">
                    {[
                      '20 preguntas por día',
                      'Análisis multi-timeframe',
                      '5 escenarios por análisis',
                      'Mentor · razonamiento profundo',
                      'En español 24/7',
                    ].map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-xs" style={{ color: '#94A3B8' }}>
                        <span style={{ color: CYAN, fontSize: 10 }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSubscribeSer('ser-plus')}
                    disabled={loading === 'ser-plus'}
                    className="w-full py-3 text-sm font-bold uppercase tracking-[0.1em] text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {loading === 'ser-plus' ? (
                      <span className="flex items-center justify-center gap-2"><SpinIcon /> Procesando...</span>
                    ) : 'Suscribirme a SER+'}
                  </button>
                </div>
              </div>

            </div>
            <p className="text-center text-[10px] mt-3 uppercase tracking-[0.15em]" style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}>
              Cancelá cuando quieras · Pago seguro con Visa/Mastercard
            </p>

            {/* Seguridad global */}
            <div className="mt-8 text-center">
              <p
                className="text-lg sm:text-2xl font-black uppercase tracking-[0.08em] leading-tight"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  background: 'linear-gradient(90deg, #ffffff 0%, #00E5FF 60%, #ffffff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Se puede pagar de cualquier parte del mundo con total seguridad
              </p>
              <div className="flex items-center justify-center gap-3 mt-3">
                <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#444' }}>Visa</span>
                <span style={{ color: '#222' }}>·</span>
                <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#444' }}>Mastercard</span>
                <span style={{ color: '#222' }}>·</span>
                <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#444' }}>Bancard</span>
                <span style={{ color: '#222' }}>·</span>
                <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#444' }}>Transferencia</span>
              </div>
            </div>
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
              className="flex items-center justify-between px-4 sm:px-8 py-4 border-b"
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

            <div className="p-5 sm:p-8 md:p-10">

              {/* Price block */}
              <div className="mb-8 pb-8 border-b" style={{ borderColor: BORDER }}>
                <h2
                  className="text-xl sm:text-2xl font-bold text-white mb-2"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Quantum Access
                </h2>
                <p className="text-[#444] text-sm mb-5">Todo lo que necesitás para operar con precisión matemática</p>
                <div className="flex items-baseline gap-3 mb-1">
                  <span
                    className="text-3xl sm:text-4xl font-bold text-white"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {Gs(149000)}
                  </span>
                  <span className="text-[#444] text-sm">/ $22 USD</span>
                  <span className="text-[#444] text-sm">/mes</span>
                </div>
              </div>

              {/* Features */}
              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {[
                  'Calculadora Cuadrática (ilimitada)',
                  'Signal Hub (todas las señales)',
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


              {/* Payment method note */}
              <div className="mb-8 p-4 border text-xs text-[#444]" style={{ borderColor: BORDER, backgroundColor: DARK_BG }}>
                Pago mensual · Visa · Mastercard · Bancard
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
                ) : 'Comenzar Ahora'}
              </button>
              <p className="text-center text-[10px] mt-3 uppercase tracking-[0.15em]" style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}>
                Cancelá cuando quieras · Pago seguro con Visa/Mastercard
              </p>
            </div>
          </div>

          {/* ── Courses ── */}
          <div className="mt-20">
            <div className="mb-8">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-3"
                style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Formación
              </p>
              <h2
                className="text-2xl sm:text-3xl font-bold text-white mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Cursos Independientes
              </h2>
              <p className="text-sm" style={{ color: MUTED }}>
                Comprás una vez, accedés para siempre. Sin suscripción requerida.
              </p>
            </div>

            {/* Course access notice */}
            <div
              className="flex items-start gap-3 mb-8 px-4 py-3 rounded-xl"
              style={{ background: `${CYAN}08`, border: `1px solid ${CYAN}20` }}
            >
              <span className="text-base shrink-0 mt-0.5">ℹ️</span>
              <p className="text-xs" style={{ color: '#64748B' }}>
                Al comprar, accedés al contenido completo desde la sección <strong style={{ color: CYAN }}>CURSOS</strong> en tu cuenta. Acceso de por vida garantizado.
              </p>
            </div>

            {/* 3-column grid — same card design as home */}
            <div className="grid sm:grid-cols-3 gap-6">
              {COURSES.map(course => (
                <div
                  key={course.id}
                  className="flex flex-col overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1"
                  style={{
                    boxShadow: course.popular
                      ? `0 0 0 2px ${CYAN}, 0 20px 40px rgba(0,229,255,0.12)`
                      : '0 4px 20px rgba(0,0,0,0.18)',
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
                      style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: CYAN, border: `1px solid ${CYAN}50`, backdropFilter: 'blur(8px)' }}
                    >
                      {course.icon} {course.level}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-5">
                    <h3
                      className="text-lg font-bold mb-3 leading-tight"
                      style={{ color: '#0F172A', fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {course.name}
                    </h3>
                    <ul className="space-y-1.5 mb-4 flex-1">
                      {course.features.map(f => (
                        <li key={f} className="flex items-start gap-2 text-xs" style={{ color: '#475569' }}>
                          <span className="mt-0.5 shrink-0" style={{ color: '#0EA5E9' }}>✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* Price */}
                    <div className="pt-3 mb-4" style={{ borderTop: '1px solid #F1F5F9' }}>
                      <p className="text-xl font-bold leading-none" style={{ color: '#0F172A', fontFamily: "'Montserrat', sans-serif" }}>
                        {Gs(course.pricePyg)}
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#64748B' }}>≈ USD {course.priceUsd} · pago único</p>
                    </div>

                    {/* CTA */}
                    {course.action === 'api' ? (
                      <button
                        onClick={() => handleBuyCourse(course.id)}
                        disabled={loading === course.id}
                        className="w-full py-3 text-sm font-bold uppercase tracking-[0.1em] rounded-lg transition-all duration-200 disabled:opacity-60 hover:-translate-y-0.5"
                        style={{
                          backgroundColor: course.popular ? CYAN : '#0EA5E9',
                          color: '#000',
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        {loading === course.id ? (
                          <span className="flex items-center justify-center gap-2"><SpinIcon /> Procesando...</span>
                        ) : 'Comprar ahora'}
                      </button>
                    ) : (
                      <Link
                        href={course.href}
                        className="w-full py-3 text-sm font-bold uppercase tracking-[0.1em] rounded-lg text-center transition-all duration-200 hover:-translate-y-0.5 block"
                        style={{ backgroundColor: '#0EA5E9', color: '#000', fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        Ver curso
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[#333] text-[9px] text-center mt-5 uppercase tracking-[0.2em]">
              Pago único · Sin suscripción · Acceso de por vida
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
