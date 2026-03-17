'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const PLANS = [
  {
    id: 'signal_hub',
    name: 'Signal Hub Pro',
    pricePyg: 750000,
    priceUsd: 120,
    image: null,
    description: 'Dashboard de señales cuánticas en tiempo real con análisis IA',
    color: 'from-emerald-400 to-cyan-500',
    borderColor: 'border-[#1e2a3a]',
    accentColor: '#00d26a',
    badgeText: 'Signal Hub',
    popular: false,
    cuotas: [
      { n: 1,  monto: 750000 },
      { n: 3,  monto: 250000 },
      { n: 6,  monto: 125000 },
      { n: 12, monto: 62500  },
    ],
    features: [
      'Señales ilimitadas en todos los mercados',
      'Análisis IA completo en tiempo real',
      'Forex, Oro, Crypto e Índices',
      'Niveles cuánticos automáticos',
    ],
    cta: 'Acceder al Signal Hub',
  },
  {
    id: 'pro',
    name: 'Plan Pro',
    pricePyg: 550000,
    priceUsd: 84,
    image: '/planpro.png',
    description: 'Para traders serios que buscan dominar el mercado',
    color: 'from-yellow-500 to-amber-600',
    borderColor: 'border-[#c9a227]',
    accentColor: '#c9a227',
    badgeText: 'Más popular',
    popular: true,
    cuotas: [
      { n: 1,  monto: 550000 },
      { n: 3,  monto: 183334 },
      { n: 6,  monto: 91667  },
      { n: 12, monto: 45834  },
    ],
    features: [
      'Cálculos ilimitados',
      'Subarmónicos incluidos',
      'Zonas Entelechy',
      'Soporte prioritario',
    ],
    cta: 'Suscribirme al Pro',
  },
  {
    id: 'whale',
    name: 'Plan Whale',
    pricePyg: 660000,
    priceUsd: 100,
    image: '/whale.png',
    description: 'Para traders profesionales que operan en serio',
    color: 'from-blue-500 to-purple-600',
    borderColor: 'border-[#1e2a3a]',
    accentColor: '#4a9eff',
    badgeText: 'Whale',
    popular: false,
    cuotas: [
      { n: 1,  monto: 660000 },
      { n: 3,  monto: 220000 },
      { n: 6,  monto: 110000 },
      { n: 12, monto: 55000  },
    ],
    features: [
      'Todo de Pro incluido',
      'Curso Canal Paralelo',
      'Curso Fibonacci',
      'Comunidad VIP',
    ],
    cta: 'Convertirme en Whale',
  },
]

function formatGs(amount: number) {
  return amount.toLocaleString('es-PY') + ' Gs.'
}

export default function BillingPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [autoRenew, setAutoRenew] = useState<Record<string, boolean>>({ pro: true, whale: true })

  const handleSubscribe = async (planId: string) => {
    if (!session) {
      window.location.href = '/login?redirect=/billing'
      return
    }
    setIsLoading(planId)
    try {
      const response = await fetch('/api/pagopar/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: planId, billingPeriod: 'monthly' }),
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
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-14">
            <p className="text-[#c9a227] text-[10px] font-semibold tracking-widest uppercase mb-3">
              Planes de Suscripción
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Elegí tu plan y<br />
              <span className="text-[#c9a227]">dominá el mercado</span>
            </h1>
            <p className="text-[#8a9bb3] text-base max-w-xl mx-auto">
              Herramientas profesionales de niveles cuánticos para Forex, Oro y Crypto
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-lg overflow-hidden border ${plan.borderColor} bg-[#131c2e]`}
              >
                {plan.popular && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest bg-[#c9a227] text-black">
                      {plan.badgeText}
                    </span>
                  </div>
                )}

                {/* Plan image / placeholder */}
                {plan.image ? (
                  <div className="w-full bg-[#0d1421] flex items-center justify-center overflow-hidden border-b border-[#1e2a3a]" style={{minHeight: '220px'}}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={plan.image}
                      alt={plan.name}
                      className="w-full h-full object-contain"
                      style={{maxHeight: '320px'}}
                    />
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-center overflow-hidden bg-[#0d1421] border-b border-[#1e2a3a]" style={{minHeight: '220px'}}>
                    <div className="text-center py-10">
                      <div className="w-14 h-14 border border-[#00d26a]/40 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-[#00d26a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <p className="text-[#00d26a] font-bold text-sm uppercase tracking-widest">Quantum Signal Hub</p>
                      <p className="text-[#8a9bb3] text-xs mt-1">Real-time AI Trading Signals</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col flex-1 p-6">

                  {/* Plan name + price */}
                  <div className="mb-5 pb-5 border-b border-[#1e2a3a]">
                    <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
                    <p className="text-[#8a9bb3] text-xs mb-4">{plan.description}</p>

                    {/* Price in Gs */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-mono font-extrabold" style={{ color: plan.accentColor }}>
                        {formatGs(plan.pricePyg)}
                      </span>
                      <span className="text-[#8a9bb3] text-xs">/mes</span>
                    </div>

                    {/* Price in USD */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[#8a9bb3] text-[10px] uppercase tracking-widest">Internacional:</span>
                      <span className="text-white font-mono text-sm">${plan.priceUsd} USD</span>
                      <span className="text-[#8a9bb3] text-[10px]">/mes</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-5 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-[#00d26a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className="text-[#8a9bb3] text-sm">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Credit card installments */}
                  <div className="mb-5 rounded-lg bg-[#0d1421] border border-[#1e2a3a] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {/* Visa icon */}
                      <svg className="w-8 h-5 text-blue-400" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="38" height="24" rx="4" fill="#1A1F71"/>
                        <path d="M15.2 16.5H12.8L14.3 7.5H16.7L15.2 16.5Z" fill="white"/>
                        <path d="M22.6 7.7C22.1 7.5 21.3 7.3 20.4 7.3C18 7.3 16.3 8.5 16.3 10.2C16.3 11.5 17.5 12.2 18.4 12.6C19.3 13 19.6 13.3 19.6 13.7C19.6 14.3 18.9 14.6 18.2 14.6C17.2 14.6 16.7 14.4 15.9 14.1L15.6 14L15.3 16C15.9 16.3 17 16.5 18.1 16.5C20.7 16.5 22.3 15.3 22.3 13.5C22.3 12.5 21.7 11.7 20.3 11.1C19.5 10.7 19 10.4 19 10C19 9.6 19.5 9.2 20.5 9.2C21.3 9.2 21.9 9.4 22.4 9.6L22.6 9.7L22.9 7.8L22.6 7.7Z" fill="white"/>
                        <path d="M26 13.2L26.9 10.8C26.9 10.8 27.1 10.2 27.3 9.8L27.5 10.7L28.1 13.2H26ZM29.1 7.5H27.2C26.6 7.5 26.2 7.7 25.9 8.3L22.3 16.5H24.9L25.4 15H28.6L28.9 16.5H31.2L29.1 7.5Z" fill="white"/>
                        <path d="M13.1 7.5L10.7 13.4L10.5 12.3C10 10.8 8.7 9.2 7.2 8.3L9.4 16.5H12L16.3 7.5H13.1Z" fill="white"/>
                        <path d="M8.5 7.5H4.5L4.4 7.7C7.5 8.5 9.6 10.3 10.5 12.3L9.5 8.4C9.3 7.7 9 7.5 8.5 7.5Z" fill="#F9A51A"/>
                      </svg>
                      {/* Mastercard icon */}
                      <svg className="w-8 h-5" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="38" height="24" rx="4" fill="#252525"/>
                        <circle cx="15" cy="12" r="6" fill="#EB001B"/>
                        <circle cx="23" cy="12" r="6" fill="#F79E1B"/>
                        <path d="M19 7.3C20.5 8.3 21.5 9.9 21.5 12C21.5 14.1 20.5 15.7 19 16.7C17.5 15.7 16.5 14.1 16.5 12C16.5 9.9 17.5 8.3 19 7.3Z" fill="#FF5F00"/>
                      </svg>
                      <span className="text-[#8a9bb3] text-xs uppercase tracking-widest">Pagá en cuotas</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {plan.cuotas.map((c) => (
                        <div key={c.n} className="flex items-center justify-between bg-[#131c2e] border border-[#1e2a3a] rounded px-3 py-2">
                          <span className="text-[#8a9bb3] text-[10px] font-medium uppercase tracking-widest">{c.n}x</span>
                          <span className="text-white text-[10px] font-mono font-bold">{formatGs(c.monto)}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[#8a9bb3] text-[10px] mt-2 text-center uppercase tracking-widest">Visa · Mastercard · Bancard</p>
                  </div>

                  {/* Auto-renewal */}
                  <label className="flex items-center gap-3 mb-4 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoRenew[plan.id] ?? true}
                      onChange={(e) => setAutoRenew(prev => ({ ...prev, [plan.id]: e.target.checked }))}
                      className="w-4 h-4 cursor-pointer accent-[#c9a227]"
                    />
                    <span className="text-[#8a9bb3] text-xs">Renovación automática mensual</span>
                  </label>

                  {/* CTA */}
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isLoading === plan.id}
                    className="w-full py-3 px-6 rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: plan.accentColor,
                      color: plan.accentColor === '#c9a227' ? '#000' : plan.accentColor === '#00d26a' ? '#000' : '#fff',
                    }}
                  >
                    {isLoading === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Procesando...
                      </span>
                    ) : plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Payment methods footer note */}
          <div className="mt-8 text-center">
            <p className="text-[#8a9bb3] text-xs uppercase tracking-widest">
              Los cursos podés pagar a cuotas con tus tarjetas
            </p>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  )
}
