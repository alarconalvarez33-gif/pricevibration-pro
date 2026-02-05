'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ExnessBanner from '@/components/ExnessBanner'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    priceUsd: 0,
    yearlyPriceUsd: 0,
    pricePyg: 0,
    yearlyPricePyg: 0,
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
    payable: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    priceUsd: 29,
    yearlyPriceUsd: 278,
    pricePyg: 200000,
    yearlyPricePyg: 1900000,
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
      { text: 'Email support', included: true },
      { text: 'API access (100 req/day)', included: false },
    ],
    cta: 'Start Pro Trial',
    payable: true,
  },
  {
    id: 'whale',
    name: 'Whale',
    priceUsd: 99,
    yearlyPriceUsd: 948,
    pricePyg: 700000,
    yearlyPricePyg: 6500000,
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

function formatPyg(amount: number): string {
  return new Intl.NumberFormat('es-PY').format(amount)
}

function BillingContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'pending' | 'error' | null>(null)

  useEffect(() => {
    // Check for Pagopar redirect parameters
    const payment = searchParams.get('payment')
    const estado = searchParams.get('estado')
    const pagado = searchParams.get('pagado')
    const hash = searchParams.get('hash')

    // Handle different parameter formats from Pagopar
    if (payment === 'success' || estado === 'pagado' || pagado === 'true') {
      setPaymentStatus('success')
    } else if (payment === 'pending' || estado === 'pendiente' || hash) {
      setPaymentStatus('pending')
    } else if (payment === 'error' || estado === 'error' || estado === 'rechazado') {
      setPaymentStatus('error')
    }

    // Clear the URL parameters after showing the message
    if (payment || estado || pagado || hash) {
      setTimeout(() => {
        window.history.replaceState({}, '', '/billing')
      }, 5000)
    }
  }, [searchParams])

  const handleSubscribe = async (planId: string, payable: boolean) => {
    if (!payable) {
      if (planId === 'free') {
        window.location.href = '/register'
      }
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
          billingPeriod,
        }),
      })

      const data = await response.json()

      if (data.hash) {
        window.location.href = `https://www.pagopar.com/pagos/${data.hash}`
      } else if (data.error) {
        alert(data.error)
      } else {
        alert('Error creating payment session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Error processing payment. Please try again.')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <main className="min-h-screen bg-terminal-bg">
      <Navbar />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Payment Status Message */}
          {paymentStatus === 'success' && (
            <div className="mb-8 p-4 bg-green-500/20 border border-green-500 rounded-xl text-center">
              <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-bold text-lg">Payment Successful!</span>
              </div>
              <p className="text-green-300">Your subscription has been activated. Enjoy your premium features!</p>
            </div>
          )}
          {paymentStatus === 'pending' && (
            <div className="mb-8 p-4 bg-yellow-500/20 border border-yellow-500 rounded-xl text-center">
              <div className="flex items-center justify-center gap-2 text-yellow-400 mb-2">
                <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-bold text-lg">Payment Pending</span>
              </div>
              <p className="text-yellow-300">Your payment is being processed. This may take a few minutes.</p>
            </div>
          )}
          {paymentStatus === 'error' && (
            <div className="mb-8 p-4 bg-red-500/20 border border-red-500 rounded-xl text-center">
              <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-bold text-lg">Payment Failed</span>
              </div>
              <p className="text-red-300">There was an issue with your payment. Please try again or contact support.</p>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Choose Your </span>
              <span className="text-gold-500">Trading Edge</span>
            </h1>
            <p className="text-terminal-muted text-lg max-w-2xl mx-auto">
              Unlock the power of Gann&apos;s Law of Vibration combined with planetary cycles
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-terminal-card p-1 rounded-xl inline-flex">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-gold-500 text-black'
                    : 'text-terminal-muted hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  billingPeriod === 'yearly'
                    ? 'bg-gold-500 text-black'
                    : 'text-terminal-muted hover:text-white'
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
              const displayPriceUsd = billingPeriod === 'yearly' && plan.priceUsd > 0
                ? plan.yearlyPriceUsd
                : plan.priceUsd
              const displayPricePyg = billingPeriod === 'yearly' && plan.pricePyg > 0
                ? plan.yearlyPricePyg
                : plan.pricePyg
              const savingsUsd = plan.priceUsd > 0 ? (plan.priceUsd * 12) - plan.yearlyPriceUsd : 0

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-8 bg-terminal-card border-2 ${
                    plan.popular ? plan.borderColor : 'border-terminal-border'
                  } ${plan.popular ? 'scale-105 shadow-2xl' : ''}`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className={`bg-gradient-to-r ${plan.color} text-black text-sm font-bold px-4 py-1 rounded-full`}>
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-2">{plan.icon}</div>
                    <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-terminal-muted text-sm">{plan.description}</p>
                  </div>

                  {/* Price USD */}
                  <div className="text-center mb-2">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-white">${displayPriceUsd}</span>
                      {plan.priceUsd > 0 && (
                        <span className="text-terminal-muted">
                          /{billingPeriod === 'yearly' ? 'year' : plan.period}
                        </span>
                      )}
                    </div>
                    {billingPeriod === 'yearly' && plan.priceUsd > 0 && (
                      <div className="text-gann-support text-sm mt-1">
                        Save ${savingsUsd}/year
                      </div>
                    )}
                    {billingPeriod === 'monthly' && plan.priceUsd > 0 && (
                      <div className="text-terminal-muted text-xs mt-1">
                        or ${plan.yearlyPriceUsd}/year <span className="text-gann-support">(Save 20%)</span>
                      </div>
                    )}
                  </div>

                  {/* Price PYG */}
                  {plan.pricePyg > 0 && (
                    <div className="text-center mb-6">
                      <span className="text-gold-500 text-sm font-medium">
                        Gs. {formatPyg(displayPricePyg)} PYG
                      </span>
                      <span className="text-terminal-muted text-xs">
                        {' '}/ {billingPeriod === 'yearly' ? 'year' : plan.period}
                      </span>
                    </div>
                  )}
                  {plan.pricePyg === 0 && <div className="mb-6" />}

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <svg className="w-5 h-5 text-[#00ff88] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-terminal-muted flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span className={feature.included ? 'text-white' : 'text-terminal-muted'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscribe(plan.id, plan.payable)}
                    disabled={isLoading === plan.id}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                      plan.popular
                        ? `bg-gradient-to-r ${plan.color} text-black hover:opacity-90`
                        : 'border-2 border-terminal-border text-white hover:border-gold-500'
                    } disabled:opacity-50`}
                  >
                    {isLoading === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      plan.cta
                    )}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Trust Badges */}
          <div className="mt-16 text-center">
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <div className="flex items-center gap-2 text-terminal-muted">
                <svg className="w-5 h-5 text-gann-support" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                SSL Secured
              </div>
              <div className="flex items-center gap-2 text-terminal-muted">
                <svg className="w-5 h-5 text-gann-support" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Powered by Pagopar
              </div>
              <div className="flex items-center gap-2 text-terminal-muted">
                <svg className="w-5 h-5 text-gann-support" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure Checkout
              </div>
            </div>

            <p className="text-terminal-muted text-sm">
              Cancel anytime. No questions asked.
            </p>
          </div>

          {/* Exness Partner Banner */}
          <div className="mt-12">
            <ExnessBanner />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-terminal-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </main>
    }>
      <BillingContent />
    </Suspense>
  )
}
