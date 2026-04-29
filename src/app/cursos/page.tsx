'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Header from '@/components/layout/Header'
import Footer from '@/components/Footer'

const CYAN      = '#00D4FF'
const CYAN_DARK = '#0EA5E9'
const DARK_BG   = '#0F172A'
const LIGHT_BG  = '#F5F7FA'

const COURSES = [
  {
    id:        'super-estrategia',
    productId: 'super-estrategia',
    name:      'Super Estrategia',
    level:     'Básico',
    icon:      '📊',
    flyer:     '/recursos.png',
    priceGs:   150000,
    priceUsd:  23,
    popular:   false,
    action:    'api' as const,
    subtitle:  'El punto de partida definitivo',
    description:
      'La estrategia base que todo trader debe dominar antes de cualquier otro método. Estructura, disciplina y entradas de alta probabilidad en cualquier mercado.',
    features: [
      'Estrategia de entrada de alta probabilidad',
      'Gestión de riesgo y capital profesional',
      'Aplicable en Forex, Oro y Crypto',
      'Disciplina operativa y psicología del trading',
      'Acceso de por vida sin cuotas adicionales',
    ],
  },
  {
    id:        'genesis',
    productId: 'expansion-matematica',
    name:      'Génesis',
    level:     'Intermedio',
    icon:      '⚡',
    flyer:     '/flyer1.jpg',
    priceGs:   500000,
    priceUsd:  78,
    popular:   true,
    action:    'api' as const,
    subtitle:  'Expansión matemática del precio',
    description:
      'El método de raíz cuadrada de W.D. Gann aplicado con precisión quirúrgica. Aprendé a calcular los niveles exactos donde el precio reacciona en cualquier temporalidad.',
    features: [
      'Método de raíz cuadrada de W.D. Gann',
      'Cálculo de niveles exactos de precio',
      'Proyecciones combinadas de precio y tiempo',
      'Técnicas nunca antes vistas públicamente',
      'Acceso de por vida sin cuotas adicionales',
    ],
  },
  {
    id:        'frecuencia',
    productId: 'frecuencia',
    name:      'Frecuencia',
    level:     'Avanzado',
    icon:      '🔮',
    flyer:     '/cuadradex.png',
    priceGs:   200000,
    priceUsd:  31,
    popular:   false,
    action:    'link' as const,
    href:      '/cursos/frecuencia',
    subtitle:  'Decodificá la estructura fractal del mercado',
    description:
      'Herramienta de análisis técnico avanzado que sincroniza tiempo y precio para proyectar zonas geométricas exactas de reversión, aceleración o consolidación.',
    features: [
      'Estructura fractal del mercado en profundidad',
      'Sincronización precisa de tiempo y precio',
      'Zonas geométricas de reversión exactas',
      'Confluencias multi-temporalidad',
      'Acceso de por vida sin cuotas adicionales',
    ],
  },
]

function formatGs(n: number) {
  return 'Gs. ' + new Intl.NumberFormat('es-PY').format(n)
}

export default function CursosPage() {
  const { data: session } = useSession()
  const [buyingId, setBuyingId] = useState<string | null>(null)

  const handleBuy = async (course: typeof COURSES[0]) => {
    if (course.action === 'link' && 'href' in course && course.href) {
      window.location.href = course.href
      return
    }
    if (!session) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent('/cursos')}`
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
    <main>
      <Header />

      {/* ── Page header ── */}
      <section
        style={{
          background: `linear-gradient(180deg, ${DARK_BG} 0%, #0c1529 100%)`,
          paddingTop: '96px',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
          <p
            className="text-xs font-bold uppercase tracking-[0.35em] mb-4"
            style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Formación Profesional
          </p>
          <h1
            className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight"
            style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-1px' }}
          >
            Cursos de Trading
          </h1>
          <p className="text-base max-w-xl" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
            Comprás una vez, accedés de por vida. Métodos probados en mercados reales.
          </p>
        </div>
      </section>

      {/* ── Course list ── */}
      <section style={{ backgroundColor: LIGHT_BG }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">

          {/* Info banner */}
          <div
            className="flex items-start gap-3 mb-10 px-5 py-4 rounded-xl max-w-2xl"
            style={{ backgroundColor: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)' }}
          >
            <span className="text-lg shrink-0 mt-0.5">ℹ️</span>
            <p className="text-sm" style={{ color: '#0369A1', fontFamily: "'Inter', sans-serif" }}>
              Al comprar cualquier curso accedés al contenido completo desde la sección{' '}
              <strong>CURSOS</strong> en tu dashboard. Acceso de por vida garantizado.
            </p>
          </div>

          <div className="space-y-8">
            {COURSES.map((course) => (
              <div
                key={course.id}
                className="grid md:grid-cols-5 overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:shadow-lg"
                style={{
                  boxShadow: course.popular
                    ? '0 0 0 2px #00D4FF, 0 8px 32px rgba(0,212,255,0.08)'
                    : '0 4px 20px rgba(0,0,0,0.06)',
                }}
              >
                {/* Popular bar */}
                {course.popular && (
                  <div
                    className="md:hidden text-center py-1.5 text-[11px] font-bold uppercase tracking-[0.15em]"
                    style={{ backgroundColor: CYAN, color: '#000', fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    ⭐ MÁS POPULAR
                  </div>
                )}

                {/* Flyer — col 1 of 5 */}
                <div
                  className="md:col-span-2 relative overflow-hidden flex items-stretch"
                  style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1A2845 100%)' }}
                >
                  {course.popular && (
                    <div
                      className="hidden md:block absolute top-0 left-0 right-0 text-center py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] z-10"
                      style={{ backgroundColor: CYAN, color: '#000', fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      ⭐ MÁS POPULAR
                    </div>
                  )}
                  <div
                    className="relative w-full flex items-center justify-center p-4"
                    style={{ aspectRatio: '3/4', minHeight: '280px', maxHeight: '500px' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.flyer}
                      alt={course.name}
                      className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
                      style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.35))' }}
                    />
                  </div>
                  <div
                    className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.1em]"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      color: CYAN,
                      border: '1px solid rgba(0,212,255,0.3)',
                      backdropFilter: 'blur(8px)',
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {course.icon} {course.level}
                  </div>
                </div>

                {/* Content — col 3 of 5 */}
                <div className="md:col-span-3 p-6 md:p-8 flex flex-col">
                  <div className="flex-1">
                    <h2
                      className="text-2xl font-black mb-1 leading-tight"
                      style={{ color: '#0F172A', fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {course.name}
                    </h2>
                    <p
                      className="text-sm italic mb-4"
                      style={{ color: CYAN_DARK, fontFamily: "'Inter', sans-serif" }}
                    >
                      {course.subtitle}
                    </p>

                    <p
                      className="text-sm leading-relaxed mb-5"
                      style={{ color: '#475569', fontFamily: "'Inter', sans-serif" }}
                    >
                      {course.description}
                    </p>

                    <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-2 mb-6">
                      {course.features.map(f => (
                        <li key={f} className="flex items-start gap-2 text-sm" style={{ color: '#475569', fontFamily: "'Inter', sans-serif" }}>
                          <span className="mt-0.5 shrink-0 font-bold" style={{ color: CYAN_DARK }}>✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price + CTA */}
                  <div
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-5"
                    style={{ borderTop: '1px solid #F1F5F9' }}
                  >
                    <div>
                      <p
                        className="text-2xl font-black leading-none"
                        style={{ color: '#0F172A', fontFamily: "'Montserrat', sans-serif" }}
                      >
                        {formatGs(course.priceGs)}
                      </p>
                      <p className="text-sm mt-1" style={{ color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
                        ≈ USD {course.priceUsd} · pago único
                      </p>
                    </div>

                    <button
                      onClick={() => handleBuy(course)}
                      disabled={buyingId === course.id}
                      className="px-8 py-3.5 text-sm font-bold uppercase tracking-[0.1em] rounded-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 whitespace-nowrap"
                      style={{
                        backgroundColor: course.popular ? CYAN : CYAN_DARK,
                        color: '#fff',
                        fontFamily: "'Space Grotesk', sans-serif",
                        boxShadow: course.popular ? '0 4px 16px rgba(0,212,255,0.35)' : '0 4px 12px rgba(14,165,233,0.25)',
                      }}
                    >
                      {buyingId === course.id ? 'Procesando...' : 'COMPRAR CURSO →'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quantum upsell ── */}
      <section
        style={{
          background: `linear-gradient(135deg, ${DARK_BG} 0%, #1A2845 100%)`,
          borderTop: '1px solid #1a1a1a',
        }}
      >
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 text-center">
          <p
            className="text-xs font-bold uppercase tracking-[0.3em] mb-3"
            style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            ¿Querés más?
          </p>
          <h3
            className="text-2xl sm:text-3xl font-black text-white mb-3"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Quantum Access — Todo incluido
          </h3>
          <p className="text-sm mb-6" style={{ color: '#CBD5E1', fontFamily: "'Inter', sans-serif" }}>
            Calculador ilimitado, niveles diarios, alertas en tiempo real y mucho más.{' '}
            <strong style={{ color: CYAN }}>Gs. 180.000/mes</strong>.
          </p>
          <Link
            href="/billing"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.1em] rounded-lg transition-all hover:-translate-y-0.5"
            style={{
              backgroundColor: CYAN,
              color: '#000',
              fontFamily: "'Space Grotesk', sans-serif",
              boxShadow: '0 8px 24px rgba(0,212,255,0.35)',
            }}
          >
            ACTIVAR QUANTUM ACCESS →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
