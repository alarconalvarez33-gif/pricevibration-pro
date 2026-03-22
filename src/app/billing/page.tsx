'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

const COURSES = [
  {
    id: 'canal-paralelo',
    name: 'Canal Paralelo',
    pricePyg: 320000,
    priceUsd: 50,
    flyer: '/canal1.png',
    description: 'Técnica del canal paralelo para identificar tendencias y puntos de entrada.',
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
    name: 'Expansión Matemática',
    pricePyg: 1500000,
    priceUsd: 220,
    flyer: '/expa.png',
    description: 'Herramientas matemáticas avanzadas para análisis de mercados financieros.',
  },
  {
    id: 'fisica-cuantica',
    name: 'Física Cuántica',
    pricePyg: 650000,
    priceUsd: 100,
    flyer: '/cuantico.png',
    description: 'Niveles cuánticos aplicados al precio. Acceso de por vida.',
  },
]

function formatGs(amount: number) {
  return 'Gs. ' + amount.toLocaleString('es-PY')
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
    <main
      className="min-h-screen bg-white"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <Navbar />

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-[#C4A77D] text-[11px] uppercase tracking-[0.2em] mb-5 font-medium">
              Acceso Total
            </p>
            <h1
              className="text-4xl md:text-5xl text-[#111111] mb-5 leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
            >
              Un solo plan.
              <br />Todo incluido.
            </h1>
            <p className="text-[#666666] text-base max-w-xl mx-auto">
              Herramientas cuánticas profesionales para Forex, Oro, Crypto e Índices.
            </p>
          </div>

          {/* Quantum Access Card */}
          <div className="rounded-lg border border-[#E8E8E8] bg-white overflow-hidden mb-8">

            {/* Badge */}
            <div className="bg-[#F7F8F9] border-b border-[#E8E8E8] px-8 py-3 flex items-center justify-between">
              <p className="text-[#888888] text-xs uppercase tracking-[0.15em]">Plan único</p>
              <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-[#C4A77D]/12 text-[#B8953C] border border-[#C4A77D]/30 uppercase tracking-widest">
                Quantum Access
              </span>
            </div>

            {/* Flyer */}
            <div
              className="w-full overflow-hidden border-b border-[#E8E8E8]"
              style={{ backgroundColor: '#F1F1F1', minHeight: '280px' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/signal.png"
                alt="Quantum Access"
                className="w-full"
                style={{ objectFit: 'contain', maxHeight: '380px', display: 'block' }}
              />
            </div>

            <div className="p-8 md:p-10">

              {/* Plan name + price */}
              <div className="mb-8 pb-8 border-b border-[#E8E8E8]">
                <h2
                  className="text-2xl text-[#111111] mb-2"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
                >
                  Quantum Access
                </h2>
                <p className="text-[#666666] text-sm mb-6">
                  Acceso completo a todas las herramientas cuánticas
                </p>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-mono font-bold text-[#111111]">
                    {formatGs(350000)}
                  </span>
                  <span className="text-[#888888] text-sm">/mes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#888888] text-xs uppercase tracking-widest">Internacional:</span>
                  <span className="text-[#111111] font-mono text-sm font-semibold">$50 USD</span>
                  <span className="text-[#888888] text-xs">/mes</span>
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
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C4A77D] shrink-0" />
                    <span className="text-[#666666] text-sm">{f}</span>
                  </div>
                ))}
              </div>

              {/* Courses note */}
              <div className="mb-6 p-4 rounded-lg bg-[#F7F8F9] border border-[#E8E8E8]">
                <p className="text-[#888888] text-xs">
                  Los cursos no están incluidos — se compran por separado
                </p>
              </div>

              {/* Free trial */}
              <div className="mb-6 p-4 rounded-lg bg-[#C4A77D]/8 border border-[#C4A77D]/20">
                <p className="text-[#B8953C] text-xs text-center font-medium">
                  3 usos gratuitos disponibles sin registrarse
                </p>
              </div>

              {/* Payment methods + cuotas */}
              <div className="mb-8 rounded-lg bg-[#F7F8F9] border border-[#E8E8E8] p-5">
                <p className="text-[#888888] text-[10px] uppercase tracking-[0.15em] mb-4">Pagá en cuotas sin interés</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { n: '1 cuota', monto: 350000 },
                    { n: '3 cuotas', monto: 116667 },
                    { n: '6 cuotas', monto: 58334 },
                    { n: '12 cuotas', monto: 29167 },
                  ].map((c) => (
                    <div key={c.n} className="bg-white border border-[#E8E8E8] rounded-lg p-3 text-center">
                      <p className="text-[#888888] text-[10px] mb-1">{c.n}</p>
                      <p className="text-[#111111] text-xs font-mono font-semibold">{formatGs(c.monto)}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[#888888] text-[10px] text-center uppercase tracking-widest">Visa · Mastercard · Bancard</p>
              </div>

              {/* CTA */}
              <button
                onClick={handleSubscribe}
                disabled={isLoading === 'quantum'}
                className="w-full py-4 px-6 rounded-lg font-semibold text-base transition-all hover:bg-[#333333] active:scale-[0.99] disabled:opacity-50 text-white bg-[#111111]"
              >
                {isLoading === 'quantum' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Procesando...
                  </span>
                ) : 'Suscribirme Ahora'}
              </button>

            </div>
          </div>

          {/* Courses Section */}
          <div className="mt-16">
            <div className="text-center mb-10">
              <p className="text-[#888888] text-[10px] uppercase tracking-[0.2em] mb-3">Cursos (compra por separado)</p>
              <h2
                className="text-3xl text-[#111111]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}
              >
                Formación Avanzada
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {COURSES.map((course) => (
                <div
                  key={course.id}
                  className="bg-white border border-[#E8E8E8] rounded-lg overflow-hidden hover:border-[#C4A77D] transition-colors"
                >
                  <div
                    className="w-full overflow-hidden border-b border-[#E8E8E8]"
                    style={{ backgroundColor: '#F1F1F1', height: '200px' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.flyer}
                      alt={course.name}
                      className="w-full h-full"
                      style={{ objectFit: 'contain', display: 'block' }}
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-[#111111] font-semibold text-sm mb-2">{course.name}</h3>
                    <p className="text-[#666666] text-xs mb-4 leading-relaxed">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[#111111] font-semibold text-sm">{formatGs(course.pricePyg)}</div>
                        <div className="text-[#888888] text-xs">${course.priceUsd} USD · pago único</div>
                      </div>
                      <button
                        onClick={() => handleBuyCourse(course.id)}
                        disabled={isLoading === course.id}
                        className="py-2 px-4 rounded-lg font-semibold text-xs transition-colors hover:opacity-80 disabled:opacity-50 text-white bg-[#111111] hover:bg-[#333333]"
                      >
                        {isLoading === course.id ? (
                          <span className="flex items-center gap-1">
                            <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                            ...
                          </span>
                        ) : 'Comprar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[#888888] text-xs text-center mt-6 uppercase tracking-widest">
              Los cursos se pueden pagar a cuotas con tus tarjetas
            </p>
          </div>

          {/* Dashboard link */}
          {session && (
            <div className="text-center mt-10">
              <Link href="/dashboard" className="text-[#888888] text-sm hover:text-[#111111] transition-colors">
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
