'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Header from '@/components/layout/Header'
import Footer from '@/components/Footer'

const CYAN = '#00D4FF'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 'Gratis',
    priceNote: 'Sin tarjeta requerida',
    color: '#64748B',
    glowColor: 'rgba(100,116,139,0.2)',
    borderColor: 'rgba(100,116,139,0.3)',
    popular: false,
    features: [
      { text: '3 preguntas por día', included: true },
      { text: 'Análisis básico de niveles', included: true },
      { text: 'Respuestas en español', included: true },
      { text: 'Análisis de imágenes / gráficos', included: false },
      { text: 'Multi-timeframe H1 + H4 + D1', included: false },
      { text: 'Correlaciones inter-mercado', included: false },
      { text: 'Modelo avanzado (Opus)', included: false },
      { text: 'Historial de conversaciones', included: false },
    ],
    cta: 'Empezar gratis',
    ctaHref: '/login',
    ctaStyle: 'outline',
  },
  {
    id: 'quantum',
    name: 'Quantum Access',
    price: 'USD 19',
    priceNote: 'por mes',
    color: CYAN,
    glowColor: 'rgba(0,212,255,0.15)',
    borderColor: 'rgba(0,212,255,0.4)',
    popular: true,
    features: [
      { text: '10 preguntas por día', included: true },
      { text: 'Análisis completo de niveles', included: true },
      { text: 'Respuestas en español', included: true },
      { text: 'Análisis de imágenes / gráficos', included: true },
      { text: 'Multi-timeframe H1 + H4 + D1', included: false },
      { text: 'Correlaciones inter-mercado', included: false },
      { text: 'Modelo avanzado (Opus)', included: false },
      { text: 'Historial de conversaciones', included: true },
    ],
    cta: 'Activar Quantum',
    ctaHref: '/billing',
    ctaStyle: 'primary',
  },
  {
    id: 'ser_plus',
    name: 'SER+',
    price: 'USD 49',
    priceNote: 'por mes',
    color: '#F59E0B',
    glowColor: 'rgba(245,158,11,0.15)',
    borderColor: 'rgba(245,158,11,0.4)',
    popular: false,
    features: [
      { text: '30 preguntas por día', included: true },
      { text: 'Análisis completo de niveles', included: true },
      { text: 'Respuestas en español', included: true },
      { text: 'Análisis de imágenes / gráficos', included: true },
      { text: 'Multi-timeframe H1 + H4 + D1', included: true },
      { text: 'Correlaciones inter-mercado', included: true },
      { text: 'Modelo avanzado (Opus)', included: true },
      { text: 'Historial de conversaciones', included: true },
    ],
    cta: 'Activar SER+',
    ctaHref: '/billing',
    ctaStyle: 'gold',
  },
]

const PACKS = [
  { name: '10 preguntas extra', price: 'USD 5', desc: 'No expiran · Acumulables' },
  { name: '50 preguntas extra', price: 'USD 19', desc: 'No expiran · Acumulables' },
  { name: '200 preguntas extra', price: 'USD 59', desc: 'No expiran · Acumulables' },
]

export default function SerPlanesPage() {
  const { data: session } = useSession()

  return (
    <main style={{ backgroundColor: '#000', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <Header />

      <div style={{ paddingTop: '80px' }}>

        {/* Hero */}
        <section
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 60%), linear-gradient(180deg, #000 0%, #0F172A 100%)',
            padding: '80px 16px 60px',
            textAlign: 'center',
          }}
        >
          <div className="max-w-2xl mx-auto">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] mb-6"
              style={{ backgroundColor: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: CYAN }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              INTELIGENCIA FINANCIERA · ONLINE 24/7
            </div>

            <h1
              className="text-4xl sm:text-5xl font-black mb-4 leading-tight"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                background: `linear-gradient(135deg, #fff 0%, ${CYAN} 60%, #0EA5E9 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-2px',
              }}
            >
              Elegí tu plan SER
            </h1>
            <p className="text-base" style={{ color: '#94A3B8' }}>
              Acceso a la inteligencia financiera Sacred Levels. Cancelá cuando quieras.
            </p>
          </div>
        </section>

        {/* Plans grid */}
        <section style={{ padding: '0 16px 80px' }}>
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
            {PLANS.map(plan => (
              <div
                key={plan.id}
                className="relative rounded-2xl flex flex-col overflow-hidden"
                style={{
                  backgroundColor: 'rgba(15,23,42,0.8)',
                  border: `1px solid ${plan.borderColor}`,
                  boxShadow: plan.popular ? `0 0 60px ${plan.glowColor}, 0 30px 60px rgba(0,0,0,0.4)` : '0 4px 24px rgba(0,0,0,0.3)',
                }}
              >
                {plan.popular && (
                  <div
                    className="text-center py-2 text-[11px] font-black uppercase tracking-[0.15em]"
                    style={{ backgroundColor: plan.color, color: '#000' }}
                  >
                    ⭐ MÁS POPULAR
                  </div>
                )}

                <div className="p-7 flex flex-col flex-1">
                  {/* Plan name */}
                  <div className="mb-6">
                    <h2
                      className="text-xl font-black mb-1"
                      style={{ color: plan.color, fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {plan.name}
                    </h2>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        {plan.price}
                      </span>
                      <span className="text-sm" style={{ color: '#64748B' }}>{plan.priceNote}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 flex-1 mb-8">
                    {plan.features.map(f => (
                      <li key={f.text} className="flex items-center gap-2.5 text-sm">
                        <span style={{ color: f.included ? plan.color : '#334155', fontSize: '13px' }}>
                          {f.included ? '✓' : '✕'}
                        </span>
                        <span style={{ color: f.included ? '#CBD5E1' : '#334155' }}>{f.text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href={session ? plan.ctaHref : `/login?callbackUrl=${encodeURIComponent(plan.ctaHref)}`}
                    className="block text-center py-3.5 rounded-xl font-bold text-sm uppercase tracking-[0.1em] transition-all hover:-translate-y-0.5"
                    style={
                      plan.ctaStyle === 'primary'
                        ? { backgroundColor: plan.color, color: '#000', boxShadow: `0 8px 24px ${plan.glowColor}` }
                        : plan.ctaStyle === 'gold'
                        ? { backgroundColor: plan.color, color: '#000', boxShadow: `0 8px 24px ${plan.glowColor}` }
                        : { border: `1px solid ${plan.borderColor}`, color: plan.color }
                    }
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Question packs */}
        <section style={{ padding: '0 16px 80px' }}>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2
                className="text-2xl font-black mb-2"
                style={{ color: '#fff', fontFamily: "'Montserrat', sans-serif" }}
              >
                Packs de preguntas extra
              </h2>
              <p className="text-sm" style={{ color: '#64748B' }}>
                No expiran y se acumulan a tu cuota diaria. Disponibles para Quantum y SER+.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {PACKS.map(pack => (
                <div
                  key={pack.name}
                  className="rounded-xl p-5 flex flex-col gap-2"
                  style={{
                    backgroundColor: 'rgba(15,23,42,0.6)',
                    border: '1px solid rgba(0,212,255,0.1)',
                  }}
                >
                  <p className="font-bold text-white text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {pack.name}
                  </p>
                  <p className="text-lg font-black" style={{ color: CYAN, fontFamily: "'Montserrat', sans-serif" }}>
                    {pack.price}
                  </p>
                  <p className="text-[11px]" style={{ color: '#64748B' }}>{pack.desc}</p>
                  <Link
                    href="/billing"
                    className="mt-2 text-center text-xs py-2 rounded-lg font-bold uppercase tracking-[0.08em] transition-all hover:opacity-80"
                    style={{ border: '1px solid rgba(0,212,255,0.25)', color: CYAN }}
                  >
                    Comprar
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '0 16px 80px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="max-w-2xl mx-auto pt-16">
            <h2
              className="text-2xl font-black text-center mb-8"
              style={{ color: '#fff', fontFamily: "'Montserrat', sans-serif" }}
            >
              Preguntas frecuentes
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: '¿Qué es una "pregunta"?',
                  a: 'Cada mensaje que enviás a SER cuenta como una pregunta. Las respuestas de SER no cuentan.',
                },
                {
                  q: '¿Qué pasa si se me acaban las preguntas diarias?',
                  a: 'Podés comprar un pack de preguntas extra que no expiran, o esperar al día siguiente para que se renueve tu cuota.',
                },
                {
                  q: '¿Puedo cancelar en cualquier momento?',
                  a: 'Sí. Podés cancelar desde tu panel de usuario. El acceso se mantiene hasta el fin del período facturado.',
                },
                {
                  q: '¿Qué modelo de IA usa SER?',
                  a: 'Quantum Access usa Claude Sonnet para respuestas rápidas y efectivas. SER+ usa Claude Opus para análisis profundo multi-timeframe.',
                },
                {
                  q: '¿SER constituye asesoría financiera?',
                  a: 'No. SER es una herramienta educativa basada en la metodología Sacred Levels. No es asesoría financiera ni recomendación de inversión. El trading conlleva alto riesgo de capital.',
                },
              ].map(item => (
                <div
                  key={item.q}
                  className="rounded-xl p-5"
                  style={{ backgroundColor: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p className="font-bold text-white text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {item.q}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section
          className="text-center"
          style={{ padding: '60px 16px 80px', background: 'radial-gradient(ellipse at 50% 100%, rgba(0,212,255,0.06) 0%, transparent 60%)' }}
        >
          <h2
            className="text-2xl font-black mb-3"
            style={{ color: '#fff', fontFamily: "'Montserrat', sans-serif" }}
          >
            "La técnica se transforma en abundancia"
          </h2>
          <p className="text-sm mb-6" style={{ color: '#64748B' }}>
            Creado por Raúl Alarcón · Sacred Levels · Paraguay
          </p>
          <Link
            href="/ser"
            className="inline-block px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-[0.1em] transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: CYAN, color: '#000', boxShadow: '0 8px 24px rgba(0,212,255,0.35)' }}
          >
            Probar SER gratis
          </Link>
        </section>

      </div>

      <Footer />
    </main>
  )
}
