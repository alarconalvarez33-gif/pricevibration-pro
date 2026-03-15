'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const PLANS = [
  {
    id: 'pro',
    name: 'Plan Pro',
    pricePyg: 320000,
    priceUsd: 49,
    image: '/planpro.png',
    description: 'Para traders serios que buscan dominar el mercado',
    color: 'from-yellow-500 to-amber-600',
    borderColor: 'border-yellow-500',
    glowColor: 'shadow-yellow-500/20',
    badgeColor: 'bg-yellow-500 text-black',
    btnClass: 'bg-yellow-500 hover:bg-yellow-400 text-black',
    popular: true,
    cuotas: [
      { n: 1,  monto: 320000 },
      { n: 3,  monto: 106667 },
      { n: 6,  monto: 53333  },
      { n: 12, monto: 26667  },
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
    borderColor: 'border-purple-500',
    glowColor: 'shadow-purple-500/20',
    badgeColor: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white',
    btnClass: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white',
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
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="pt-20 pb-24 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-14">
            <p className="text-yellow-500 text-sm font-semibold tracking-widest uppercase mb-3">
              Planes de suscripción
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Elegí tu plan y<br />
              <span className="text-yellow-500">dominá el mercado</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Herramientas profesionales de niveles cuánticos para Forex, Oro y Crypto
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl overflow-hidden border ${plan.borderColor} bg-[#111] shadow-2xl ${plan.glowColor}`}
              >
                {plan.popular && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${plan.badgeColor}`}>
                      Más popular
                    </span>
                  </div>
                )}

                {/* Plan image / flyer — completo sin recorte */}
                <div className="w-full bg-zinc-950 flex items-center justify-center overflow-hidden" style={{minHeight: '220px'}}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={plan.image}
                    alt={plan.name}
                    className="w-full h-full object-contain"
                    style={{maxHeight: '320px'}}
                  />
                </div>

                <div className="flex flex-col flex-1 p-7">

                  {/* Plan name + price */}
                  <div className="mb-5">
                    <h2 className="text-2xl font-bold text-white mb-1">{plan.name}</h2>
                    <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

                    {/* Price in Gs */}
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-extrabold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                        {formatGs(plan.pricePyg)}
                      </span>
                      <span className="text-gray-500 text-sm">/mes</span>
                    </div>

                    {/* Price in USD for international users */}
                    <div className="flex items-center gap-2 mt-2 pl-0.5">
                      <span className="text-gray-500 text-xs">🌎 Internacional:</span>
                      <span className="text-gray-300 font-semibold text-sm">${plan.priceUsd} USD</span>
                      <span className="text-gray-600 text-xs">/mes · pago único</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className="text-gray-300 text-sm">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Credit card installments */}
                  <div className="mb-6 rounded-2xl bg-white/5 border border-white/10 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {/* Card icons */}
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
                      <span className="text-gray-300 text-sm font-semibold">Pagá en cuotas</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {plan.cuotas.map((c) => (
                        <div key={c.n} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
                          <span className="text-gray-400 text-xs font-medium">{c.n}x</span>
                          <span className="text-white text-xs font-bold">{formatGs(c.monto)}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-gray-500 text-xs mt-2 text-center">Visa · Mastercard · Bancard</p>
                  </div>

                  {/* Auto-renewal */}
                  <label className="flex items-center gap-3 mb-4 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoRenew[plan.id] ?? true}
                      onChange={(e) => setAutoRenew(prev => ({ ...prev, [plan.id]: e.target.checked }))}
                      className="w-4 h-4 cursor-pointer accent-yellow-500"
                    />
                    <span className="text-gray-400 text-sm">Renovación automática mensual</span>
                  </label>

                  {/* CTA */}
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isLoading === plan.id}
                    className={`w-full py-3.5 px-6 rounded-2xl font-bold text-base transition-all shadow-lg disabled:opacity-50 ${plan.btnClass}`}
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
          <div className="mt-10 text-center">
            <p className="text-gray-400 text-sm">
              Los cursos podes pagar a cuotas con tus tarjetas:
            </p>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  )
}
