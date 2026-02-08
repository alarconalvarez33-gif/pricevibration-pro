'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ExnessBanner from '@/components/ExnessBanner'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    yearlyPrice: 0,
    period: 'forever',
    description: 'Perfect for learning Gann basics',
    icon: '🌱',
    color: 'from-gray-500 to-gray-600',
    borderColor: 'border-gray-500',
    features: [
      { text: 'Basic Gann Calculator', included: true },
      { text: '3 calculations per day', included: true },
      { text: 'Educational content', included: true },
      { text: 'Community forum access', included: true },
      { text: 'Astro-Gann Module', included: false },
      { text: 'Real-time planetary data', included: false },
      { text: 'Export calculations', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Started',
  },
  {
    id: 'pro',
    name: 'Pro',
    priceUsd: 49,
    yearlyPriceUsd: 470,
    pricePyg: 340000,
    yearlyPricePyg: 3145000,
    period: 'month',
    description: 'For serious traders',
    icon: '🚀',
    color: 'from-gold-500 to-gold-600',
    borderColor: 'border-gold-500',
    popular: true,
    features: [
      { text: 'Advanced Gann Calculator', included: true },
      { text: 'Unlimited calculations', included: true },
      { text: 'Full Astro-Gann Module', included: true },
      { text: 'Real-time planetary data', included: true },
      { text: 'Export to CSV/PDF', included: true },
      { text: 'Price alerts', included: true },
      { text: 'API access (100 req/day)', included: false },
    ],
    cta: 'Start Pro',
    payable: true,
  },
  {
    id: 'whale',
    name: 'Whale',
    priceUsd: 100,
    yearlyPriceUsd: 960,
    pricePyg: 693900,
    yearlyPricePyg: 6660000,
    period: 'month',
    description: 'For professional traders',
    icon: '🐋',
    color: 'from-blue-500 to-purple-600',
    borderColor: 'border-purple-500',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Wheel of 24 Calculator', included: true },
      { text: 'Square of 9 Complete', included: true },
      { text: 'Gann Hexagon Tool', included: true },
      { text: '144 Series & Master Time', included: true },
      { text: 'Time Cycles Analysis', included: true },
      { text: 'Price-Time Squaring', included: true },
      { text: 'Priority Support', included: true },
    ],
    cta: 'Become a Whale',
    payable: true,
  },
]

export default function BillingPage() {
  const { data: session } = useSession()
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      window.location.href = '/register'
      return
    }

    if (!session) {
      window.location.href = '/login?redirect=/billing'
      return
    }

    setIsLoading(planId)

    try {
      const response = await fetch('/api/pagopar/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: planId,
          billingPeriod: billingPeriod,
        }),
      })

      const data = await response.json()

      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        alert('Error: ' + (data.error || data.pagoparError || 'No se pudo generar la sesión de pago'))
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Error al procesar el pago')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Choose Your </span>
              <span className="text-yellow-500">Trading Edge</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Unlock the power of Gann&apos;s Law of Vibration combined with planetary cycles
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-zinc-900 p-1 rounded-xl inline-flex border border-zinc-800">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-yellow-500 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  billingPeriod === 'yearly'
                    ? 'bg-yellow-500 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="bg-[#00ff88] text-black text-xs px-2 py-0.5 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {PLANS.map((plan) => {
              const displayPriceUsd = billingPeriod === 'yearly' ? (plan.yearlyPriceUsd || 0) : (plan.priceUsd || 0)
              const savingsText = billingPeriod === 'yearly' && plan.priceUsd ? ' (Save 20%)' : ''

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-8 bg-zinc-900 border-2 ${
                    plan.popular ? 'border-yellow-500' : 'border-zinc-800'
                  } ${plan.popular ? 'scale-105 shadow-2xl' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className={`bg-gradient-to-r ${plan.color} text-black text-sm font-bold px-4 py-1 rounded-full`}>
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className="text-4xl mb-2">{plan.icon}</div>
                    <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-gray-400 text-sm">{plan.description}</p>
                  </div>

                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-white">${displayPriceUsd}</span>
                      <span className="text-gray-400">/{billingPeriod === 'yearly' ? 'year' : 'month'}</span>
                    </div>
                    {savingsText && (
                      <p className="text-green-400 text-sm mt-1">{savingsText}</p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <svg className="w-5 h-5 text-[#00ff88] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span className={feature.included ? 'text-white' : 'text-gray-500'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isLoading === plan.id}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                      plan.popular
                        ? `bg-yellow-500 text-black hover:bg-yellow-400`
                        : 'border-2 border-zinc-700 text-white hover:border-yellow-500'
                    } disabled:opacity-50`}
                  >
                    {isLoading === plan.id ? 'Processing...' : plan.cta}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="mt-12">
            <ExnessBanner />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
