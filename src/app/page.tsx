'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import ParticleBackground from '@/components/ParticleBackground'
import AnimatedCounter from '@/components/AnimatedCounter'
import FAQAccordion from '@/components/FAQAccordion'
import LiveNotification from '@/components/LiveNotification'
import OnlineCounter from '@/components/OnlineCounter'
import { TickerTape } from '@/components/TradingView'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DailyLevels from '@/components/DailyLevels'
import TradeSignals from '@/components/TradeSignals'

const testimonials = [
  { name: 'Marcus C.', country: '🇸🇬', text: 'The calculated levels provide valuable mathematical insights for my analysis.' },
  { name: 'Elena R.', country: '🇪🇸', text: 'Finally a tool that combines Gann with planetary cycles. Game changer.' },
  { name: 'James T.', country: '🇬🇧', text: 'Switched from traditional TA. Never looking back.' },
  { name: 'Yuki M.', country: '🇯🇵', text: 'The precision on gold reversals is unmatched.' },
  { name: 'Ahmed K.', country: '🇦🇪', text: 'Worth every dollar. The time cycles alone are invaluable.' },
]

const faqItems = [
  {
    question: "What is the Gann methodology?",
    answer: "W.D. Gann developed trading techniques in the early 1900s based on natural law, geometry, and time cycles. His methods have been used by professional traders for over a century to identify key price levels and market turning points."
  },
  {
    question: "How accurate are the calculated levels?",
    answer: "Our users report high accuracy on major reversals. The precision comes from mathematical principles that govern natural market movements. However, no system is 100% accurate - always use proper risk management."
  },
  {
    question: "Do I need trading experience to use PriceVibration Pro?",
    answer: "While the calculations are complex, our interface is simple. Enter a price, get your levels. However, understanding market basics will help you apply the levels more effectively."
  },
  {
    question: "What markets does this work for?",
    answer: "The Gann methodology works on any traded market: Gold (XAU/USD), Forex pairs, cryptocurrencies, stocks, indices, and commodities. The mathematical principles are universal."
  },
  {
    question: "How do planetary cycles affect trading?",
    answer: "Heliocentric planetary positions create geometric aspects that historically correlate with market turning points. Gann himself used astrological cycles in his trading. Our Astro-Gann module brings this to modern traders."
  },
  {
    question: "What's included in each plan?",
    answer: "Free: Basic calculator. Pro: Full dashboard, TradingView integration, Astro-Gann module. Whale: Everything in Pro plus advanced tools like Wheel of 24, Square of 9, time cycles, and price-time squaring."
  }
]

export default function Home() {
  const { t } = useLanguage()
  const router = useRouter()
  const { data: session } = useSession()
  const [buyingProduct, setBuyingProduct] = useState<string | null>(null)

  const handleBuyProduct = async (productId: string) => {
    if (!session) { router.push('/login'); return }
    setBuyingProduct(productId)
    try {
      const res = await fetch('/api/pagopar/create-product-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      const data = await res.json()
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        const msg = data.pagoparError || data.error || 'Error desconocido'
        const detail = data.fullResponse ? '\n\nDetalle: ' + JSON.stringify(data.fullResponse) : ''
        alert('Error Pagopar: ' + msg + detail)
      }
    } catch (err) {
      alert('Error de conexión. Por favor intentá de nuevo.')
    } finally {
      setBuyingProduct(null)
    }
  }

  return (
    <main className="min-h-screen bg-terminal-bg overflow-hidden">
      <ParticleBackground particleCount={40} />
      <Navbar />

      {/* Market Ticker Tape */}
      <div className="pt-16">
        <TickerTape colorTheme="dark" />
      </div>

      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative pt-16 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[120px]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-white">{t('hero.title1')}</span>
              <br />
              <span className="text-gradient-gold">{t('hero.title2')}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-terminal-muted text-base md:text-lg max-w-3xl mx-auto mb-4 leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-10 text-sm text-terminal-muted">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{t('hero.secure')}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{t('hero.educational')}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>8+ {t('hero.countries')}</span>
              </div>
            </div>

            {/* Online Counter */}
            <div className="flex justify-center mb-6">
              <OnlineCounter />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Link href={session ? '/dashboard' : '/register'} className="btn-gold-large group">
                <span className="flex items-center gap-2">
                  {session ? 'Ir al Dashboard' : t('hero.cta.start')}
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link href="/billing" className="btn-outline-gold text-lg px-8 py-4">
                {t('hero.cta.pricing')}
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-12">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gold-500">
                  <AnimatedCounter end={89.7} suffix="%" decimals={1} />
                </div>
                <div className="text-terminal-muted text-sm mt-1">{t('stats.accuracy')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gold-500">
                  <AnimatedCounter end={12500} suffix="+" />
                </div>
                <div className="text-terminal-muted text-sm mt-1">{t('stats.users')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gold-500">
                  <AnimatedCounter end={8} suffix="+" />
                </div>
                <div className="text-terminal-muted text-sm mt-1">{t('stats.countries')}</div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="border-t border-terminal-border pt-8">
              <p className="text-terminal-muted/60 text-xs mb-4 uppercase tracking-wide">Trusted & Secure</p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
                {/* Stripe */}
                <div className="flex items-center gap-2">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-white">Stripe</div>
                    <div className="text-xs text-terminal-muted">Secure Payments</div>
                  </div>
                </div>

                {/* SSL */}
                <div className="flex items-center gap-2">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-white">SSL Encrypted</div>
                    <div className="text-xs text-terminal-muted">Bank-Level Security</div>
                  </div>
                </div>

                {/* 24/7 */}
                <div className="flex items-center gap-2">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-white">24/7 Access</div>
                    <div className="text-xs text-terminal-muted">Always Available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          MENTOR'S VAULT - PREMIUM COURSES
          ============================================ */}
      <section id="mentors-vault" className="py-20 px-4 relative z-10 bg-gradient-to-b from-terminal-card/20 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-white">🎓 Estrategias de </span>
              <span className="text-gradient-gold-static">&quot;The Mentor&quot;</span>
            </h2>
            <p className="text-terminal-muted text-lg max-w-2xl mx-auto">
              Estrategias exclusivas de más de 15 años de experiencia
            </p>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

            {/* Card 1 — Canal Paralelo */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border-2 border-[#c9a227]/40 rounded-2xl overflow-hidden hover:border-[#c9a227]/70 transition-all hover:scale-[1.02] shadow-2xl shadow-[#c9a227]/10 flex flex-col">
              <div className="bg-[#c9a227] text-black text-xs font-bold px-4 py-1.5 text-center tracking-widest uppercase">
                VIDEO CURSO
              </div>
              <div className="relative bg-black overflow-hidden">
                <img src="/canal1.png" alt="Canal Paralelo" className="w-full h-auto block" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-white text-xl font-bold mb-2">Canal Paralelo</h3>
                <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                  Descubrí las estrategias de trading que usan los profesionales.
                </p>
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-[#c9a227] text-3xl font-bold">$49</span>
                  <span className="text-gray-500 text-sm">USD</span>
                  <span className="text-gray-600 text-sm">/ 343.000 PYG</span>
                </div>
                <ul className="space-y-2 mb-6 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#c9a227] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Estrategias exclusivas
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#c9a227] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    15+ años de experiencia condensados
                  </li>
                </ul>
                <button
                  onClick={() => handleBuyProduct('canal-paralelo')}
                  disabled={buyingProduct === 'canal-paralelo'}
                  className="mt-auto w-full bg-[#c9a227] hover:bg-[#b8911f] disabled:opacity-70 disabled:cursor-wait text-black font-bold text-base py-3 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
                >
                  {buyingProduct === 'canal-paralelo' ? '⏳ Procesando...' : 'Comprar Ahora'}
                </button>

                {/* Bank installments inside card */}
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <p className="text-gray-400 text-xs font-semibold text-center mb-3">💳 Pagá en 12 cuotas sin interés con:</p>
                  <div className="flex justify-center gap-3">
                    <div className="flex-1 bg-[#0d0d0d] border border-[#c9a227]/30 rounded-xl p-3 flex flex-col items-center justify-center gap-1">
                      <img src="/familiar.png" alt="Banco Familiar" className="h-16 object-contain" />
                      <span className="text-[#c9a227] text-[10px] font-bold tracking-wide">12 CUOTAS</span>
                    </div>
                    <div className="flex-1 bg-[#0d0d0d] border border-[#c9a227]/30 rounded-xl p-3 flex flex-col items-center justify-center gap-1">
                      <img src="/ueno.jpeg" alt="Banco Ueno" className="h-16 object-contain" />
                      <span className="text-[#c9a227] text-[10px] font-bold tracking-wide">12 CUOTAS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 — Desbloquea el Poder de Forex */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border-2 border-gray-700/50 rounded-2xl overflow-hidden flex flex-col">
              <div className="bg-gray-700 text-gray-300 text-xs font-bold px-4 py-1.5 text-center tracking-widest uppercase">
                PRÓXIMAMENTE
              </div>
              <div className="relative bg-black overflow-hidden">
                <img
                  src="/desbloquea el poder de forex.png"
                  alt="Desbloquea el Poder de Forex"
                  className="w-full h-auto block opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d]/60 to-transparent pointer-events-none" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-gray-300 text-sm italic mb-4 leading-relaxed">
                  &ldquo;Descubrí el potencial del fibonacci, por décadas oculto al público&rdquo;
                </p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-gray-400 text-2xl font-bold">499.000</span>
                  <span className="text-gray-500 text-sm">GS</span>
                </div>
                <ul className="space-y-2 mb-6 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Estrategias exclusivas
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    15+ años de experiencia condensados
                  </li>
                </ul>
                <button
                  disabled
                  className="mt-auto w-full bg-gray-700 text-gray-500 font-bold text-base py-3 px-6 rounded-xl cursor-not-allowed"
                >
                  🔒 Próximamente
                </button>
              </div>
            </div>

            {/* Card 3 — What */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border-2 border-gray-700/50 rounded-2xl overflow-hidden flex flex-col">
              <div className="bg-gray-700 text-gray-300 text-xs font-bold px-4 py-1.5 text-center tracking-widest uppercase">
                PRÓXIMAMENTE
              </div>
              <div className="relative bg-black overflow-hidden">
                <img
                  src="/what.png"
                  alt="Próximo Curso"
                  className="w-full h-auto block opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d]/60 to-transparent pointer-events-none" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-gray-300 text-sm italic mb-4 leading-relaxed">
                  &ldquo;Contenido exclusivo en preparación. Muy pronto.&rdquo;
                </p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-gray-400 text-2xl font-bold">$49</span>
                  <span className="text-gray-500 text-sm">USD</span>
                </div>
                <ul className="space-y-2 mb-6 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Estrategias exclusivas
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    15+ años de experiencia condensados
                  </li>
                </ul>
                <button
                  disabled
                  className="mt-auto w-full bg-gray-700 text-gray-500 font-bold text-base py-3 px-6 rounded-xl cursor-not-allowed"
                >
                  🔒 Próximamente
                </button>
              </div>
            </div>

            {/* Card 4 — Geo1 */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border-2 border-gray-700/50 rounded-2xl overflow-hidden flex flex-col">
              <div className="bg-gray-700 text-gray-300 text-xs font-bold px-4 py-1.5 text-center tracking-widest uppercase">
                PRÓXIMAMENTE
              </div>
              <div className="relative bg-black overflow-hidden">
                <img
                  src="/geo1.png"
                  alt="Próximo Curso"
                  className="w-full h-auto block opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d]/60 to-transparent pointer-events-none" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-gray-300 text-sm italic mb-4 leading-relaxed">
                  &ldquo;El tiempo es más importante que el precio&rdquo;
                </p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-gray-400 text-2xl font-bold">599.000</span>
                  <span className="text-gray-500 text-sm">GS</span>
                </div>
                <ul className="space-y-2 mb-6 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Estrategias exclusivas
                  </li>
                </ul>
                <button
                  disabled
                  className="mt-auto w-full bg-gray-700 text-gray-500 font-bold text-base py-3 px-6 rounded-xl cursor-not-allowed"
                >
                  🔒 Próximamente
                </button>
              </div>
            </div>

            {/* Card 5 — Trading Sicológico */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border-2 border-gray-700/50 rounded-2xl overflow-hidden flex flex-col">
              <div className="bg-gray-700 text-gray-300 text-xs font-bold px-4 py-1.5 text-center tracking-widest uppercase">
                PRÓXIMAMENTE
              </div>
              <div className="relative bg-black overflow-hidden">
                <img
                  src="/trading sicológico.png"
                  alt="Trading Sicológico"
                  className="w-full h-auto block opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d]/60 to-transparent pointer-events-none" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-gray-300 text-sm italic mb-4 leading-relaxed">
                  &ldquo;Contenido exclusivo en preparación. Muy pronto.&rdquo;
                </p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-gray-400 text-2xl font-bold">—</span>
                </div>
                <ul className="space-y-2 mb-6 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Estrategias exclusivas
                  </li>
                </ul>
                <button
                  disabled
                  className="mt-auto w-full bg-gray-700 text-gray-500 font-bold text-base py-3 px-6 rounded-xl cursor-not-allowed"
                >
                  🔒 Próximamente
                </button>
              </div>
            </div>

          </div>

          {/* Cuotas */}
          <div className="text-center mb-8">
            <p className="text-gray-400 text-base mb-8">💳 Pagá en cuotas sin interés con tu tarjeta de crédito</p>
            <div className="flex flex-col md:flex-row justify-center items-center gap-6">
              <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-[#c9a227]/30 rounded-xl p-5 w-full md:w-56 hover:border-[#c9a227]/50 transition-all hover:scale-105">
                <img src="/familiar.png" alt="Banco Familiar" className="h-14 object-contain mx-auto mb-3" />
                <div className="bg-[#c9a227] text-black text-xs font-bold px-3 py-1 rounded-full inline-block">
                  12 CUOTAS SIN INTERÉS
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-[#c9a227]/30 rounded-xl p-5 w-full md:w-56 hover:border-[#c9a227]/50 transition-all hover:scale-105">
                <img src="/ueno.jpeg" alt="Banco Ueno" className="h-14 object-contain mx-auto mb-3" />
                <div className="bg-[#c9a227] text-black text-xs font-bold px-3 py-1 rounded-full inline-block">
                  12 CUOTAS SIN INTERÉS
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          DAILY LEVELS & TRADE SIGNALS
          ============================================ */}
      <DailyLevels />
      <TradeSignals />

      {/* ============================================
          METHODOLOGY SECTION
          ============================================ */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-white">Advanced Mathematical </span>
            <span className="text-gradient-gold-static">Price Analysis</span>
          </h2>
          <p className="text-terminal-muted text-lg mb-12 max-w-2xl mx-auto">
            Institutional-grade calculations for identifying key support and resistance levels
            using <span className="text-gold-500">W.D. Gann&apos;s proven methodology</span>.
          </p>

          {/* Blurred Trading Chart with Levels */}
          <div className="relative max-w-3xl mx-auto mb-12">
            <div className="card-terminal p-6 select-none overflow-hidden">
              {/* Blurred chart mockup with levels */}
              <svg className="w-full h-64 blur-[4px]" viewBox="0 0 400 200" fill="none" preserveAspectRatio="xMidYMid meet">
                {/* Background grid */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#30363d" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="400" height="200" fill="url(#grid)"/>

                {/* Resistance levels */}
                <line x1="0" y1="30" x2="400" y2="30" stroke="#ef4444" strokeWidth="1" strokeDasharray="8 4"/>
                <text x="360" y="25" fill="#ef4444" fontSize="10">R3</text>
                <line x1="0" y1="50" x2="400" y2="50" stroke="#ef4444" strokeWidth="1" strokeDasharray="8 4"/>
                <text x="360" y="45" fill="#ef4444" fontSize="10">R2</text>
                <line x1="0" y1="70" x2="400" y2="70" stroke="#ef4444" strokeWidth="1" strokeDasharray="8 4"/>
                <text x="360" y="65" fill="#ef4444" fontSize="10">R1</text>

                {/* Support levels */}
                <line x1="0" y1="130" x2="400" y2="130" stroke="#10b981" strokeWidth="1" strokeDasharray="8 4"/>
                <text x="360" y="125" fill="#10b981" fontSize="10">S1</text>
                <line x1="0" y1="150" x2="400" y2="150" stroke="#10b981" strokeWidth="1" strokeDasharray="8 4"/>
                <text x="360" y="145" fill="#10b981" fontSize="10">S2</text>
                <line x1="0" y1="170" x2="400" y2="170" stroke="#10b981" strokeWidth="1" strokeDasharray="8 4"/>
                <text x="360" y="165" fill="#10b981" fontSize="10">S3</text>

                {/* Center price line */}
                <line x1="0" y1="100" x2="400" y2="100" stroke="#c9a227" strokeWidth="2"/>
                <text x="360" y="95" fill="#c9a227" fontSize="10">Center</text>

                {/* Price action candlesticks */}
                <g>
                  <rect x="30" y="85" width="8" height="30" fill="#ef4444"/>
                  <line x1="34" y1="75" x2="34" y2="125" stroke="#ef4444" strokeWidth="2"/>

                  <rect x="50" y="90" width="8" height="25" fill="#10b981"/>
                  <line x1="54" y1="80" x2="54" y2="120" stroke="#10b981" strokeWidth="2"/>

                  <rect x="70" y="75" width="8" height="35" fill="#10b981"/>
                  <line x1="74" y1="65" x2="74" y2="115" stroke="#10b981" strokeWidth="2"/>

                  <rect x="90" y="65" width="8" height="25" fill="#ef4444"/>
                  <line x1="94" y1="55" x2="94" y2="100" stroke="#ef4444" strokeWidth="2"/>

                  <rect x="110" y="70" width="8" height="30" fill="#ef4444"/>

                  <rect x="130" y="80" width="8" height="40" fill="#10b981"/>

                  <rect x="150" y="95" width="8" height="35" fill="#10b981"/>
                  <line x1="154" y1="85" x2="154" y2="140" stroke="#10b981" strokeWidth="2"/>

                  <rect x="170" y="110" width="8" height="30" fill="#ef4444"/>
                  <line x1="174" y1="100" x2="174" y2="150" stroke="#ef4444" strokeWidth="2"/>

                  <rect x="190" y="125" width="8" height="20" fill="#10b981"/>
                  <line x1="194" y1="115" x2="194" y2="155" stroke="#10b981" strokeWidth="2"/>

                  <rect x="210" y="115" width="8" height="25" fill="#10b981"/>

                  <rect x="230" y="100" width="8" height="30" fill="#10b981"/>
                  <line x1="234" y1="90" x2="234" y2="140" stroke="#10b981" strokeWidth="2"/>

                  <rect x="250" y="85" width="8" height="25" fill="#ef4444"/>
                </g>

                {/* Reversal arrow at support */}
                <path d="M194 160 L194 175 L184 165 M194 175 L204 165" stroke="#c9a227" strokeWidth="2" fill="none"/>
              </svg>

              {/* Blurred levels panel */}
              <div className="absolute bottom-4 left-4 right-4 bg-terminal-bg/80 backdrop-blur-sm rounded-lg p-4 blur-[6px]">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-gann-resistance text-xs">Resistances</div>
                    <div className="text-white font-mono text-sm">$X,XXX.XX</div>
                  </div>
                  <div>
                    <div className="text-gold-500 text-xs">Center</div>
                    <div className="text-white font-mono text-sm">$X,XXX.XX</div>
                  </div>
                  <div>
                    <div className="text-gann-support text-xs">Supports</div>
                    <div className="text-white font-mono text-sm">$X,XXX.XX</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lock overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-terminal-bg/90 backdrop-blur-sm rounded-xl px-8 py-6 border border-gold-500/30 shadow-2xl">
                <svg className="w-10 h-10 text-gold-500 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <p className="text-white font-semibold text-lg">Subscribe to Unlock</p>
                <p className="text-terminal-muted text-sm mt-1">See the exact levels</p>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto text-center">
            <p className="text-terminal-muted leading-relaxed">
              Ancient mathematical principles. Planetary alignments. A formula hidden for over 100 years.
              <br />
              <span className="text-white font-medium">W.D. Gann developed these techniques based on natural law and geometry.</span>
              <br />
              <span className="text-gold-500">Now explore these time-tested methods.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ============================================
          ANALYSIS EXAMPLES
          ============================================ */}
      <section className="py-20 px-4 bg-terminal-card/30 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-white">Analysis </span>
              <span className="text-gradient-gold-static">Demonstrations</span>
            </h2>
            <p className="text-terminal-muted max-w-2xl mx-auto">
              Historical market analysis examples using Gann methodology. For educational purposes only.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Example 1 */}
            <div className="card-terminal-hover">
              <div className="aspect-video bg-terminal-bg rounded-lg mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-terminal-card to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Blurred chart mockup */}
                  <svg className="w-full h-full opacity-30" viewBox="0 0 200 100" fill="none">
                    <path d="M10 70 L40 50 L70 60 L100 30 L130 45 L160 25 L190 35" stroke="#c9a227" strokeWidth="2" fill="none" className="blur-[2px]"/>
                    <line x1="10" y1="30" x2="190" y2="30" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" className="blur-[1px]"/>
                    <line x1="10" y1="65" x2="190" y2="65" stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" className="blur-[1px]"/>
                  </svg>
                </div>
                <div className="absolute top-3 right-3">
                  <svg className="w-8 h-8 text-gann-support" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h4 className="text-white font-semibold mb-2">XAU/USD Reversal</h4>
              <p className="text-terminal-muted text-sm mb-2">
                Resistance level predicted with <span className="text-gold-500">0.15% accuracy</span>
              </p>
              <p className="text-gann-support text-sm font-medium">
                Subscribers received the alert 48 hours early
              </p>
            </div>

            {/* Example 2 */}
            <div className="card-terminal-hover">
              <div className="aspect-video bg-terminal-bg rounded-lg mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-terminal-card to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Blurred candlestick mockup */}
                  <svg className="w-full h-full opacity-30 blur-[3px]" viewBox="0 0 200 100" fill="none">
                    <rect x="20" y="30" width="8" height="40" fill="#ef4444"/>
                    <line x1="24" y1="20" x2="24" y2="80" stroke="#ef4444" strokeWidth="2"/>
                    <rect x="40" y="35" width="8" height="30" fill="#10b981"/>
                    <line x1="44" y1="25" x2="44" y2="75" stroke="#10b981" strokeWidth="2"/>
                    <rect x="60" y="25" width="8" height="35" fill="#10b981"/>
                    <rect x="80" y="40" width="8" height="25" fill="#ef4444"/>
                    <rect x="100" y="30" width="8" height="40" fill="#10b981"/>
                  </svg>
                </div>
                <div className="absolute top-3 right-3">
                  <svg className="w-8 h-8 text-gann-support" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h4 className="text-white font-semibold mb-2">BTC Support Bounce</h4>
              <p className="text-terminal-muted text-sm mb-2">
                Key support zone identified <span className="text-gold-500">3 days before</span> the bounce
              </p>
              <p className="text-gann-support text-sm font-medium">
                Members positioned early with calculated levels
              </p>
            </div>

            {/* Example 3 */}
            <div className="card-terminal-hover">
              <div className="aspect-video bg-terminal-bg rounded-lg mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-terminal-card to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Planetary aspect diagram */}
                  <svg className="w-24 h-24 opacity-40 blur-[2px]" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="40" stroke="#c9a227" strokeWidth="1"/>
                    <circle cx="50" cy="50" r="25" stroke="#c9a227" strokeWidth="1" strokeDasharray="3 3"/>
                    <circle cx="50" cy="10" r="5" fill="#c9a227"/>
                    <circle cx="85" cy="50" r="4" fill="#10b981"/>
                    <circle cx="50" cy="90" r="4" fill="#ef4444"/>
                    <line x1="50" y1="10" x2="85" y2="50" stroke="#c9a227" strokeWidth="1" opacity="0.5"/>
                  </svg>
                </div>
                <div className="absolute top-3 right-3">
                  <svg className="w-8 h-8 text-gann-support" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h4 className="text-white font-semibold mb-2">Planetary Alignment</h4>
              <p className="text-terminal-muted text-sm mb-2">
                Time cycle convergence signaled <span className="text-gold-500">major turning point</span>
              </p>
              <p className="text-terminal-muted text-sm font-medium">
                The method? <span className="text-gold-500">Pro members have access.</span>
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-terminal-muted mb-6">Want to see how we calculated these levels?</p>
            <Link href={session ? '/dashboard' : '/register'} className="btn-gold-large btn-pulse">
              🔓 {session ? 'Ver mis herramientas' : 'Unlock the Formula'}
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          EXNESS - SIMULA GRATIS
          ============================================ */}
      <section className="py-16 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            📈 Simulá Gratis Operar en los Mercados Financieros
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Practicá con una cuenta demo sin riesgo — operá en tiempo real con dinero virtual
          </p>
          <div className="flex justify-center">
            <a
              href="https://one.exnessonelink.com/intl/es/a/xwx0gc598n"
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:opacity-90 transition-opacity hover:scale-[1.01] transition-transform rounded-2xl overflow-hidden shadow-2xl shadow-black/50 max-w-sm w-full"
            >
              <img
                src="https://d3dpet1g0ty5ed.cloudfront.net/ES_ES_GOOGLE_C1_PRODUCTSUP_C2_T1_INSTANTW_MONEYWHEN_T2_PERFORMANCE_D-3-13_STATIC_1200x1500.jpg"
                width={1200}
                height={1500}
                alt="Exness - Simulá gratis en los mercados financieros"
                className="w-full h-auto block"
              />
            </a>
          </div>
        </div>
      </section>

      {/* ============================================
          PAYMENT INSTALLMENTS PROMO
          ============================================ */}
      <section className="py-16 px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
            💳 Paga en cuotas sin interés
          </h2>
          <p className="text-gray-400 text-lg md:text-xl mb-12">
            Financiá tu suscripción con tarjetas de crédito
          </p>

          <div className="flex flex-col md:flex-row justify-center items-center gap-10">
            {/* Banco Familiar */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border-2 border-[#c9a227]/30 rounded-2xl p-8 w-full md:w-80 lg:w-96 hover:border-[#c9a227]/50 transition-all hover:scale-105">
              <img src="/familiar.png" alt="Banco Familiar" className="h-20 md:h-24 object-contain mx-auto mb-6" />
              <div className="bg-[#c9a227] text-black text-base md:text-lg font-bold px-4 py-2 rounded-full inline-block">
                12 CUOTAS SIN INTERÉS
              </div>
            </div>

            {/* Banco Ueno */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border-2 border-[#c9a227]/30 rounded-2xl p-8 w-full md:w-80 lg:w-96 hover:border-[#c9a227]/50 transition-all hover:scale-105">
              <img src="/ueno.jpeg" alt="Banco Ueno" className="h-20 md:h-24 object-contain mx-auto mb-6" />
              <div className="bg-[#c9a227] text-black text-base md:text-lg font-bold px-4 py-2 rounded-full inline-block">
                12 CUOTAS SIN INTERÉS
              </div>
            </div>
          </div>

          <p className="text-gray-500 text-base mt-8">
            *Válido para tarjetas de crédito emitidas por estos bancos
          </p>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS
          ============================================ */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-white">How It </span>
              <span className="text-gradient-gold-static">Works</span>
            </h2>
            <p className="text-terminal-muted">
              Three steps to precision trading
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center group">
              <div className="w-16 h-16 bg-terminal-card border border-terminal-border rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:border-gold-500/50 transition-colors">
                <span className="text-3xl">📍</span>
              </div>
              <div className="text-gold-500 text-sm font-semibold mb-2">Step 1</div>
              <h3 className="text-white font-semibold mb-2">Enter a Significant Price</h3>
              <p className="text-terminal-muted text-sm">Input a key price level for your chosen market</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-terminal-card border border-terminal-border rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:border-gold-500/50 transition-colors">
                <span className="text-3xl">🔮</span>
              </div>
              <div className="text-gold-500 text-sm font-semibold mb-2">Step 2</div>
              <h3 className="text-white font-semibold mb-2">Our Algorithm Reveals Hidden Zones</h3>
              <p className="text-terminal-muted text-sm">Mathematical calculations identify key levels</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-terminal-card border border-terminal-border rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:border-gold-500/50 transition-colors">
                <span className="text-3xl">🎯</span>
              </div>
              <div className="text-gold-500 text-sm font-semibold mb-2">Step 3</div>
              <h3 className="text-white font-semibold mb-2">Execute with Precision</h3>
              <p className="text-terminal-muted text-sm">Trade confidently at calculated levels</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-terminal-muted italic">
              The complete methodology is revealed inside.
            </p>
            <Link href="/billing" className="text-gold-500 hover:text-gold-400 font-semibold inline-flex items-center gap-1 mt-2">
              View Plans
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
    GANN LEGEND
    ============================================ */}
<section className="py-20 px-4 bg-terminal-card/30 relative z-10">
  <div className="max-w-5xl mx-auto">
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          <span className="text-white">The Legend Behind </span>
          <span className="text-gradient-gold-static">the Method</span>
        </h2>
        <p className="text-terminal-muted leading-relaxed mb-6">
          <span className="text-white font-semibold">William Delbert Gann (1878-1955)</span> was a legendary trader who
          achieved remarkable results through disciplined application of mathematical principles.
        </p>
        <p className="text-terminal-muted leading-relaxed mb-6">
          His methods, based on natural law, geometry, and planetary cycles, remain some of the
          most studied techniques in trading history. PriceVibration Pro brings his century-old analytical methods
          into the modern era for educational purposes.
        </p>
        <Link href={session ? '/dashboard' : '/register'} className="btn-gold inline-flex items-center gap-2">
          {session ? 'Ir al Dashboard' : 'Discover His Secrets'}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
      <div className="relative">
        <div className="aspect-[4/3] bg-terminal-card rounded-2xl border border-terminal-border overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 to-transparent"></div>
          
          {/* NUEVA IMAGEN MODERNIZADA */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <img 
              src="/gann7.jpg" 
              alt="William D. Gann" 
              className="h-full w-auto object-contain rounded-lg shadow-2xl border border-gold-500/30"
            />
          </div>

          {/* Filtro de textura opcional */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-terminal-card/50 pointer-events-none"></div>
        </div>
        
        {/* Cita debajo de la imagen */}
        <div className="text-center mt-4">
          <p className="text-terminal-muted text-sm italic">&ldquo;Time is the most important factor&rdquo;</p>
          <p className="text-gold-500 font-cursive text-lg mt-1">— W.D. Gann</p>
        </div>
      </div>
    </div>
  </div>
</section>
      {/* ============================================
          FAQ SECTION
          ============================================ */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-white">Frequently Asked </span>
              <span className="text-gradient-gold-static">Questions</span>
            </h2>
          </div>
          <FAQAccordion items={faqItems} />
        </div>
      </section>

      {/* ============================================
          FINAL CTA
          ============================================ */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card-premium p-12 rounded-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-white">Start Your </span>
              <span className="text-gradient-gold-static">Free Trial Today</span>
            </h2>
            <p className="text-terminal-muted mb-8 max-w-2xl mx-auto">
              Access professional-grade market analysis tools based on proven mathematical principles.
              No credit card required for free tier.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link href={session ? '/dashboard' : '/register'} className="btn-gold-large">
                {session ? 'Ir al Dashboard' : 'Create Free Account'}
              </Link>
              <Link href="/billing" className="btn-outline-gold text-lg px-8 py-4">
                Compare Plans
              </Link>
            </div>
            <p className="text-terminal-muted/60 text-sm mt-6">
              Join traders in 8+ countries
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
