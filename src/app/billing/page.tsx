'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

const COURSES = [
  {
    id: 'fisica-cuantica',
    name: 'Física Cuántica',
    pricePyg: 650000,
    priceUsd: 100,
    icon: '🔬',
    description: 'Niveles cuánticos aplicados al precio. Acceso de por vida.',
    color: 'border-purple-500/30',
    accent: '#9333ea',
    badgeColor: 'bg-purple-900/30 text-purple-400',
  },
  {
    id: 'canal-paralelo',
    name: 'Canal Paralelo',
    pricePyg: 320000,
    priceUsd: 50,
    icon: '📐',
    description: 'Técnica del canal paralelo para identificar tendencias.',
    color: 'border-blue-500/30',
    accent: '#3b82f6',
    badgeColor: 'bg-blue-900/30 text-blue-400',
  },
  {
    id: 'fibonacci',
    name: 'Fibonacci',
    pricePyg: 320000,
    priceUsd: 50,
    icon: '🌀',
    description: 'Retrocesos y extensiones de Fibonacci aplicados al trading.',
    color: 'border-[#c9a227]/30',
    accent: '#c9a227',
    badgeColor: 'bg-[#c9a227]/10 text-[#c9a227]',
  },
  {
    id: 'expansion-matematica',
    name: 'Expansión Matemática',
    pricePyg: 1500000,
    priceUsd: 220,
    icon: '∑',
    description: 'Herramientas matemáticas avanzadas para análisis de mercados.',
    color: 'border-emerald-500/30',
    accent: '#10b981',
    badgeColor: 'bg-emerald-900/30 text-emerald-400',
  },
]

function formatGs(amount: number) {
  return amount.toLocaleString('es-PY') + ' Gs.'
}

export default function BillingPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSubscribe = async () => {
    if (!session) {
      window.location.href = '/login?redirect=/billing'
      return
    }
    setIsLoading('quantum')
    try {
      const response = await fetch('/api/pagopar/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: 'quantum', billingPeriod: 'monthly' }),
      })
      const data = await response.json()
      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        alert('Error: ' + (data.error || data.pagoparError || 'No se pudo generar el pago'))
      }
    } catch {
      alert('Error al procesar el pago')
    } finally {
      setIsLoading(null)
    }
  }

  const handleBuyCourse = async (courseId: string) => {
    if (!session) {
      window.location.href = '/login?redirect=/billing'
      return
    }
    setIsLoading(courseId)
    try {
      const response = await fetch('/api/pagopar/create-product-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: courseId }),
      })
      const data = await response.json()
      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        alert('Error: ' + (data.error || data.pagoparError || 'No se pudo generar el pago'))
      }
    } catch {
      alert('Error al procesar el pago')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#0d1421]">
      <Navbar />

      <div className="pt-20 pb-24 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-purple-400 text-[10px] font-semibold tracking-widest uppercase mb-3">
              Acceso Total
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Un solo plan.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">Todo incluido.</span>
            </h1>
            <p className="text-[#8a9bb3] text-base max-w-xl mx-auto">
              Herramientas cuánticas profesionales para Forex, Oro, Crypto e Índices
            </p>
          </div>

          {/* Quantum Access Card */}
          <div className="relative rounded-xl overflow-hidden border border-purple-500/40 bg-[#131c2e] mb-6">

            {/* Popular badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest bg-purple-600 text-white">
                Plan único
              </span>
            </div>

            {/* Flyer image */}
            <div className="w-full bg-[#0d1421] overflow-hidden border-b border-purple-500/20" style={{ minHeight: '280px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/signal.png"
                alt="Quantum Access"
                className="w-full object-contain"
                style={{ maxHeight: '380px' }}
              />
            </div>

            <div className="p-6 md:p-8">

              {/* Plan name + price */}
              <div className="mb-6 pb-6 border-b border-[#1e2a3a]">
                <h2 className="text-2xl font-bold text-white mb-1">QUANTUM ACCESS</h2>
                <p className="text-[#8a9bb3] text-sm mb-5">
                  Acceso completo a todas las herramientas cuánticas
                </p>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-mono font-extrabold text-purple-400">
                    {formatGs(350000)}
                  </span>
                  <span className="text-[#8a9bb3] text-sm">/mes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#8a9bb3] text-xs uppercase tracking-widest">Internacional:</span>
                  <span className="text-white font-mono">$50 USD</span>
                  <span className="text-[#8a9bb3] text-xs">/mes</span>
                </div>
              </div>

              {/* Features */}
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {[
                  { icon: '🔬', text: 'Calculadora Cuántica (ilimitada)' },
                  { icon: '📡', text: 'Signal Hub (todas las señales)' },
                  { icon: '💵', text: 'DXY Dollar Index' },
                  { icon: '🌐', text: 'Forex, Crypto, Oro e Índices' },
                  { icon: '🤖', text: 'Análisis IA en tiempo real' },
                  { icon: '⚡', text: 'Sección Quantum Levels en dashboard' },
                  { icon: '🕐', text: 'Acceso 24/7' },
                  { icon: '📊', text: 'Niveles cuánticos automáticos' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-[#8a9bb3] text-sm">
                      <span className="mr-1">{f.icon}</span>{f.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Not included */}
              <div className="mb-6 p-3 rounded-lg bg-[#0d1421] border border-[#1e2a3a]">
                <p className="text-[#8a9bb3] text-xs flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-[#ff4757] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Los cursos no están incluidos — se compran por separado
                </p>
              </div>

              {/* Free trial note */}
              <div className="mb-6 p-3 rounded-lg bg-purple-900/20 border border-purple-500/20">
                <p className="text-purple-300 text-xs text-center font-medium">
                  ✨ 3 usos gratuitos disponibles sin registrarse
                </p>
              </div>

              {/* Payment methods */}
              <div className="mb-6 rounded-lg bg-[#0d1421] border border-[#1e2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-8 h-5 text-blue-400" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="38" height="24" rx="4" fill="#1A1F71"/>
                    <path d="M15.2 16.5H12.8L14.3 7.5H16.7L15.2 16.5Z" fill="white"/>
                    <path d="M22.6 7.7C22.1 7.5 21.3 7.3 20.4 7.3C18 7.3 16.3 8.5 16.3 10.2C16.3 11.5 17.5 12.2 18.4 12.6C19.3 13 19.6 13.3 19.6 13.7C19.6 14.3 18.9 14.6 18.2 14.6C17.2 14.6 16.7 14.4 15.9 14.1L15.6 14L15.3 16C15.9 16.3 17 16.5 18.1 16.5C20.7 16.5 22.3 15.3 22.3 13.5C22.3 12.5 21.7 11.7 20.3 11.1C19.5 10.7 19 10.4 19 10C19 9.6 19.5 9.2 20.5 9.2C21.3 9.2 21.9 9.4 22.4 9.6L22.6 9.7L22.9 7.8L22.6 7.7Z" fill="white"/>
                    <path d="M26 13.2L26.9 10.8C26.9 10.8 27.1 10.2 27.3 9.8L27.5 10.7L28.1 13.2H26ZM29.1 7.5H27.2C26.6 7.5 26.2 7.7 25.9 8.3L22.3 16.5H24.9L25.4 15H28.6L28.9 16.5H31.2L29.1 7.5Z" fill="white"/>
                    <path d="M13.1 7.5L10.7 13.4L10.5 12.3C10 10.8 8.7 9.2 7.2 8.3L9.4 16.5H12L16.3 7.5H13.1Z" fill="white"/>
                    <path d="M8.5 7.5H4.5L4.4 7.7C7.5 8.5 9.6 10.3 10.5 12.3L9.5 8.4C9.3 7.7 9 7.5 8.5 7.5Z" fill="#F9A51A"/>
                  </svg>
                  <svg className="w-8 h-5" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="38" height="24" rx="4" fill="#252525"/>
                    <circle cx="15" cy="12" r="6" fill="#EB001B"/>
                    <circle cx="23" cy="12" r="6" fill="#F79E1B"/>
                    <path d="M19 7.3C20.5 8.3 21.5 9.9 21.5 12C21.5 14.1 20.5 15.7 19 16.7C17.5 15.7 16.5 14.1 16.5 12C16.5 9.9 17.5 8.3 19 7.3Z" fill="#FF5F00"/>
                  </svg>
                  <span className="text-[#8a9bb3] text-xs uppercase tracking-widest">Pagá en cuotas</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { n: 1, monto: 350000 },
                    { n: 3, monto: 116667 },
                    { n: 6, monto: 58334 },
                    { n: 12, monto: 29167 },
                  ].map((c) => (
                    <div key={c.n} className="flex items-center justify-between bg-[#131c2e] border border-[#1e2a3a] rounded px-2 py-2">
                      <span className="text-[#8a9bb3] text-[10px] font-medium">{c.n}x</span>
                      <span className="text-white text-[10px] font-mono font-bold">{formatGs(c.monto)}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[#8a9bb3] text-[10px] mt-2 text-center uppercase tracking-widest">Visa · Mastercard · Bancard</p>
              </div>

              {/* CTA */}
              <button
                onClick={handleSubscribe}
                disabled={isLoading === 'quantum'}
                className="w-full py-4 px-6 rounded-xl font-bold text-base transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-white"
                style={{ background: 'linear-gradient(135deg, #7e22ce, #9333ea)' }}
              >
                {isLoading === 'quantum' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Procesando...
                  </span>
                ) : '⚡ Subscribe Now'}
              </button>

            </div>
          </div>

          {/* Courses Section */}
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-[#1e2a3a]" />
              <p className="text-[#8a9bb3] text-xs uppercase tracking-widest font-semibold px-2">
                Courses (separate purchase)
              </p>
              <div className="h-px flex-1 bg-[#1e2a3a]" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {COURSES.map((course) => (
                <div
                  key={course.id}
                  className={`flex flex-col rounded-xl border ${course.color} bg-[#131c2e] p-4`}
                >
                  <div className="text-2xl mb-2">{course.icon}</div>
                  <h3 className="text-white font-bold text-sm mb-1">{course.name}</h3>
                  <p className="text-[#8a9bb3] text-xs mb-3 flex-1">{course.description}</p>
                  <div className="mb-3">
                    <div className="text-white font-mono font-bold text-sm">{formatGs(course.pricePyg)}</div>
                    <div className="text-[#8a9bb3] text-xs">${course.priceUsd} USD · único</div>
                  </div>
                  <button
                    onClick={() => handleBuyCourse(course.id)}
                    disabled={isLoading === course.id}
                    className="w-full py-2 px-3 rounded-lg font-bold text-xs transition-all hover:opacity-80 disabled:opacity-50 text-white"
                    style={{ backgroundColor: course.accent }}
                  >
                    {isLoading === course.id ? (
                      <span className="flex items-center justify-center gap-1">
                        <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        ...
                      </span>
                    ) : 'Comprar'}
                  </button>
                </div>
              ))}
            </div>

            <p className="text-[#8a9bb3] text-xs text-center mt-4 uppercase tracking-widest">
              Los cursos podés pagar a cuotas con tus tarjetas
            </p>
          </div>

          {/* Already subscribed? */}
          {session && (
            <div className="text-center mt-8">
              <Link href="/dashboard" className="text-[#8a9bb3] text-xs hover:text-white transition-colors">
                ← Ir al Dashboard
              </Link>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </main>
  )
}
