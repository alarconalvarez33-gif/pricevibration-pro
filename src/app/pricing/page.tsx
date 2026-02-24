'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const plans = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Basic access to learn about Gann trading',
    features: [
      'Landing page access',
      'Educational content',
      'Community forum access',
      'Email support',
    ],
    notIncluded: [
      'Gann Calculator',
      'Cosmogram Visualization',
      'Save calculations',
      'Priority support',
    ],
    cta: 'Current Plan',
    popular: false,
  },
  {
    name: 'Pro Monthly',
    price: 29,
    period: 'month',
    description: 'Full access to all trading tools',
    features: [
      'Unlimited Gann calculations',
      'Interactive cosmogram',
      'Save & export calculations',
      'Real-time XAU/USD data',
      'Priority email support',
      'Mobile optimized',
    ],
    notIncluded: [],
    cta: 'Start Pro Monthly',
    popular: true,
  },
  {
    name: 'Pro Yearly',
    price: 199,
    period: 'year',
    description: 'Best value - save over 40%',
    features: [
      'Everything in Pro Monthly',
      '2 months free',
      'Early access to new features',
      'Dedicated support channel',
      'Custom alerts (coming soon)',
      'API access (coming soon)',
    ],
    notIncluded: [],
    cta: 'Start Pro Yearly',
    popular: false,
    badge: 'Best Value',
  },
]

export default function PricingPage() {
  const { data: session } = useSession()

  const handleSubscribe = async (planName: string) => {
    if (!session) {
      window.location.href = '/register'
      return
    }
    // In a real app, this would integrate with Stripe or another payment processor
    alert(`Subscription to ${planName} would be processed here. This is a demo.`)
  }

  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="pt-20 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Simple, Transparent </span>
              <span className="text-gold-500">Pricing</span>
            </h1>
            <p className="text-terminal-muted text-lg max-w-2xl mx-auto">
              Choose the plan that fits your trading needs. Upgrade or downgrade anytime.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? 'bg-gradient-to-b from-gold-500/10 to-terminal-card border-2 border-gold-500'
                    : 'bg-terminal-card border border-terminal-border'
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gold-500 text-black text-sm font-bold px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-green-500 text-black text-sm font-bold px-4 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gold-500">${plan.price}</span>
                    <span className="text-terminal-muted">/{plan.period}</span>
                  </div>
                  <p className="text-terminal-muted text-sm mt-2">{plan.description}</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-terminal-text text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature, i) => (
                    <li key={`not-${i}`} className="flex items-start opacity-50">
                      <svg className="w-5 h-5 text-terminal-muted mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-terminal-muted text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {plan.price === 0 ? (
                  session ? (
                    <button disabled className="w-full py-3 px-6 rounded-lg bg-terminal-border text-terminal-muted cursor-not-allowed">
                      {plan.cta}
                    </button>
                  ) : (
                    <Link href="/register" className="block w-full py-3 px-6 rounded-lg bg-terminal-border text-white text-center hover:bg-terminal-border/80 transition-colors">
                      Sign Up Free
                    </Link>
                  )
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.name)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                      plan.popular
                        ? 'btn-gold'
                        : 'btn-outline-gold'
                    }`}
                  >
                    {plan.cta}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-white mb-8">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {[
                {
                  q: 'Can I cancel my subscription anytime?',
                  a: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.',
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept all major credit cards, PayPal, and cryptocurrency payments through Stripe.',
                },
                {
                  q: 'Can I upgrade from monthly to yearly?',
                  a: 'Yes! You can upgrade anytime and we\'ll prorate your remaining monthly balance.',
                },
                {
                  q: 'Is my payment secure?',
                  a: 'Absolutely. All payments are processed securely through Stripe with SSL encryption.',
                },
              ].map((faq, index) => (
                <div key={index} className="card-terminal">
                  <h4 className="text-white font-medium mb-2">{faq.q}</h4>
                  <p className="text-terminal-muted text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Secure Payment Badge */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center px-6 py-3 bg-terminal-card border border-terminal-border rounded-full">
              <svg className="w-5 h-5 text-gann-support mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-terminal-muted font-medium">Secure Checkout Powered by Stripe</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
