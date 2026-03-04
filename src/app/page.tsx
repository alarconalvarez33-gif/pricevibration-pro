'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ParticleBackground from '@/components/ParticleBackground'
import AnimatedCounter from '@/components/AnimatedCounter'
import FAQAccordion from '@/components/FAQAccordion'
import LiveNotification from '@/components/LiveNotification'
import { TickerTape } from '@/components/TradingView'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DailyLevels from '@/components/DailyLevels'
import TradeSignals from '@/components/TradeSignals'
import ShareButtons from '@/components/ShareButtons'

const SCROLLING_NAMES = [
  'Micaela Gómez', 'Pedro Benítez', 'Rodrigo Torres', 'Victoria Pérez',
  'Lucas Cáceres', 'Valentina Rodríguez', 'Matías Giménez', 'Camila Silva',
  'Bruno Fernandes', 'Isabella González',
]

const testimonials = [
  { name: 'Marcus C.', country: '🇸🇬', text: 'Los niveles calculados brindan información matemática valiosa para mi análisis.' },
  { name: 'Elena R.', country: '🇪🇸', text: 'Por fin una herramienta que combina Gann con ciclos planetarios. Un cambio total.' },
  { name: 'James T.', country: '🇬🇧', text: 'Dejé el análisis técnico tradicional. No volvería atrás.' },
  { name: 'Yuki M.', country: '🇯🇵', text: 'La precisión en los giros del oro no tiene comparación.' },
  { name: 'Ahmed K.', country: '🇦🇪', text: 'Vale cada centavo. Los ciclos temporales por sí solos son invaluables.' },
]

const faqItems = [
  {
    question: "¿Qué es la metodología de Gann?",
    answer: "W.D. Gann desarrolló técnicas de trading a principios del siglo XX basadas en la ley natural, la geometría y los ciclos de tiempo. Sus métodos han sido utilizados por traders profesionales durante más de un siglo para identificar niveles clave de precio y puntos de inflexión del mercado."
  },
  {
    question: "¿Qué tan precisos son los niveles calculados?",
    answer: "Nuestros usuarios reportan alta precisión en los grandes giros del mercado. La precisión proviene de principios matemáticos que gobiernan los movimientos naturales del mercado. Sin embargo, ningún sistema es 100% preciso — utilizá siempre una gestión de riesgo adecuada."
  },
  {
    question: "¿Necesito experiencia en trading para usar la plataforma?",
    answer: "Aunque los cálculos son complejos, nuestra interfaz es simple. Ingresá un precio y obtené tus niveles. Sin embargo, entender los conceptos básicos del mercado te ayudará a aplicar los niveles de manera más efectiva."
  },
  {
    question: "¿En qué mercados funciona?",
    answer: "La metodología de Gann funciona en cualquier mercado: Oro (XAU/USD), pares de Forex, criptomonedas, acciones, índices y materias primas. Los principios matemáticos son universales."
  },
  {
    question: "¿Cómo afectan los ciclos planetarios al trading?",
    answer: "Las posiciones planetarias heliocéntricas crean aspectos geométricos que históricamente se correlacionan con los puntos de inflexión del mercado. El propio Gann usaba ciclos astrológicos en su trading. Nuestro módulo Astro-Gann trae esto a los traders modernos."
  },
  {
    question: "¿Qué incluye cada plan?",
    answer: "Gratis: Calculadora básica. Pro: Panel completo, integración con TradingView, módulo Astro-Gann. Whale: Todo en Pro más herramientas avanzadas como Rueda de 24, Cuadrado de 9, ciclos de tiempo y cuadratura precio-tiempo."
  }
]

export default function Home() {
  const { t } = useLanguage()
  const router = useRouter()
  const { data: session } = useSession()
  const [buyingProduct, setBuyingProduct] = useState<string | null>(null)
  const [siteName, setSiteName] = useState('Sacred Levels')
  const [nameIdx, setNameIdx] = useState(0)
  const [quantumAutoRenew, setQuantumAutoRenew] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const isTrading = hostname.includes('trading.com.py')
      setSiteName(isTrading ? 'Trading.com.py' : 'Sacred Levels')
      document.title = isTrading
        ? 'Trading.com.py | La Evolución Matemática del Trading'
        : 'Sacred Levels | La Evolución Matemática del Trading'
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setNameIdx((i) => (i + 1) % SCROLLING_NAMES.length)
    }, 1800)
    return () => clearInterval(timer)
  }, [])

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
    <main className="min-h-screen bg-[#0a0a0a]">
      <style>{`
        @keyframes scrollNameIn {
          from { transform: translateY(60%); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
      `}</style>
      <ParticleBackground particleCount={40} />
      <Navbar />

      {/* Market Ticker Tape */}
      <div className="pt-20">
        <TickerTape colorTheme="dark" />
      </div>

      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Fondo degradado azul oscuro → negro */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0d1f3c] to-[#0a0a0a]" />
        {/* Glow central */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[120px] pointer-events-none" style={{background: 'rgba(201,162,39,0.07)'}} />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20 pb-16">
          {/* Eyebrow */}
          <p className="text-[#c9a227] text-sm font-semibold tracking-widest uppercase mb-6 opacity-90">
            {siteName}
          </p>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="text-white">La Evolución Matemática</span>
            <br />
            <span className="text-[#c9a227]">del Trading</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            De la geometría de Gann a la probabilidad cuántica.
            <br className="hidden md:block" />
            Herramientas avanzadas de análisis de ciclos para el trader profesional.
          </p>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-6 mb-10 text-gray-400 text-sm">
            <span className="flex items-center gap-2">
              <span className="text-green-500 text-base">✓</span> Pagos Seguros
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-500 text-base">✓</span> Plataforma Educativa
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-500 text-base">✓</span> 8+ Países
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-14">
            <Link
              href={session ? '/dashboard' : '/register'}
              className="bg-[#c9a227] hover:bg-[#d4af37] text-black font-bold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg shadow-[#c9a227]/20"
            >
              {session ? 'Ir al Dashboard' : 'Comenzar Ahora →'}
            </Link>
            <Link
              href="#planes"
              className="border border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227]/10 font-bold px-8 py-4 rounded-lg text-lg transition-colors"
            >
              Ver Planes
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#c9a227]">
                <AnimatedCounter end={89.7} suffix="%" decimals={1} />
              </div>
              <div className="text-gray-500 text-sm mt-1">{t('stats.accuracy')}</div>
            </div>
            <div className="text-center">
              <div className="h-10 flex items-center justify-center overflow-hidden">
                <span
                  key={nameIdx}
                  className="text-lg md:text-xl font-bold text-[#c9a227] whitespace-nowrap"
                  style={{ animation: 'scrollNameIn 0.5s ease' }}
                >
                  {SCROLLING_NAMES[nameIdx]}
                </span>
              </div>
              <div className="text-gray-500 text-sm mt-1">{t('stats.users')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#c9a227]">
                <AnimatedCounter end={8} suffix="+" />
              </div>
              <div className="text-gray-500 text-sm mt-1">{t('stats.countries')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          PLANES SECTION
          ============================================ */}
      <section id="planes" className="py-20 px-4 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Elegí Tu <span className="text-[#c9a227]">Plan</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Accedé a herramientas de análisis profesional basadas en principios matemáticos probados.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

            {/* Plan PRO */}
            <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-[#c9a227] rounded-2xl p-8 shadow-lg shadow-[#c9a227]/20">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-[#c9a227] text-black text-sm font-bold px-4 py-1 rounded-full">
                  MÁS POPULAR
                </span>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <div className="text-4xl font-bold text-[#c9a227]">
                  320.000 <span className="text-lg text-gray-400">Gs/mes</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">$49 USD para usuarios internacionales</div>
              </div>
              <ul className="space-y-3 mb-8">
                {['Calculadora Gann Avanzada', 'Cálculos ilimitados', 'Análisis Histórico', 'Exportar a Excel/CSV', 'Datos planetarios en tiempo real'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-gray-300">
                    <span className="text-[#c9a227] font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/billing" className="block w-full bg-[#c9a227] hover:bg-[#d4af37] text-black font-bold py-3 rounded-lg text-center transition-colors">
                Suscribirse Ahora
              </Link>
            </div>

            {/* Plan WHALE */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border border-gray-700 rounded-2xl p-8 hover:border-purple-500/50 transition-colors">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Whale 🐋</h3>
                <div className="text-4xl font-bold text-[#c9a227]">
                  660.000 <span className="text-lg text-gray-400">Gs/mes</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">$100 USD para usuarios internacionales</div>
              </div>
              <ul className="space-y-3 mb-8">
                {['Todo lo del Plan Pro', 'Módulo Astro-Gann Completo', 'Cuadrado de 9 Completo', 'Hexágono de Gann', 'Análisis de Ciclos Temporales', 'Soporte prioritario'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-gray-300">
                    <span className="text-[#c9a227] font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/billing" className="block w-full border border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227]/10 font-bold py-3 rounded-lg text-center transition-colors">
                Suscribirse Ahora
              </Link>
            </div>

          </div>

          {/* Cuotas bancos */}
          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-6">💳 Pagá en 12 cuotas sin interés</p>
            <div className="flex justify-center items-center gap-8">
              <div className="flex flex-col items-center">
                <img src="/familiar.png" alt="Banco Familiar" className="h-12 object-contain mb-2" />
                <span className="text-[#c9a227] text-xs font-bold tracking-widest">12 CUOTAS</span>
              </div>
              <div className="flex flex-col items-center">
                <img src="/ueno.jpeg" alt="Banco Ueno" className="h-12 object-contain mb-2" />
                <span className="text-[#c9a227] text-xs font-bold tracking-widest">12 CUOTAS</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================
          FÍSICA CUÁNTICA SECTION
          ============================================ */}
      <section id="fisica-cuantica" className="py-20 px-4" style={{background: 'linear-gradient(180deg, #0a0a0a 0%, #0d0a1a 50%, #0a0a0a 100%)'}}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-center">

            {/* Flyer */}
            <div className="w-full lg:w-1/2">
              <img
                src="/cuantico.png"
                alt="Física Cuántica - Niveles de Probabilidad"
                className="w-full rounded-2xl shadow-2xl"
                style={{boxShadow: '0 0 60px rgba(147,51,234,0.25)'}}
              />
            </div>

            {/* Content */}
            <div className="w-full lg:w-1/2">
              <p className="text-purple-400 text-sm font-semibold tracking-widest uppercase mb-3">
                Herramienta Avanzada
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Física Cuántica<br />
                <span className="text-purple-400">Niveles de Probabilidad</span>
              </h2>

              {/* Quote */}
              <blockquote className="border-l-4 border-purple-500 pl-4 mb-6">
                <p className="text-gray-300 italic text-base leading-relaxed">
                  &ldquo;Si la inversión en educación te parece cara,<br className="hidden sm:block" />
                  imagina el precio de la ignorancia&rdquo;
                </p>
              </blockquote>

              <ul className="space-y-3 mb-6">
                {[
                  'Niveles de probabilidad cuántica de alta precisión',
                  '2 usos gratuitos para usuarios registrados',
                  'Algoritmos multi-dimensional de precios',
                  'Acceso de por vida tras la compra',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-gray-300 text-sm">
                    <span className="text-purple-400 font-bold flex-shrink-0">✓</span> {f}
                  </li>
                ))}
              </ul>

              {/* Price */}
              <div className="mb-5">
                <div className="text-4xl font-bold text-purple-400">
                  650.000 <span className="text-lg text-gray-400">GS</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">🌎 Internacional: $100 USD · acceso de por vida</div>
                <div className="text-xs text-purple-400/70 mt-1">🎁 2 usos gratuitos para usuarios registrados</div>
              </div>

              {/* Auto-renewal */}
              <label className="flex items-center gap-3 mb-5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={quantumAutoRenew}
                  onChange={(e) => setQuantumAutoRenew(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                  style={{accentColor: '#9333ea'}}
                />
                <span className="text-gray-400 text-sm">Renovación automática anual</span>
              </label>

              <button
                onClick={() => handleBuyProduct('fisica-cuantica')}
                disabled={buyingProduct === 'fisica-cuantica'}
                className="w-full font-bold text-lg py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 text-white"
                style={{background: 'linear-gradient(135deg, #7e22ce, #9333ea)', boxShadow: '0 8px 32px rgba(147,51,234,0.35)'}}
              >
                {buyingProduct === 'fisica-cuantica' ? '⏳ Procesando...' : '🔬 Adquirir Niveles Cuánticos'}
              </button>

              <ShareButtons url="/#fisica-cuantica" title="Niveles Cuánticos de Probabilidad — Herramienta avanzada de trading 🔬 sacredlevels.com" />
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
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-[#c9a227] text-3xl font-bold">320.000</span>
                  <span className="text-gray-500 text-sm">GS</span>
                </div>
                <p className="text-gray-400 text-sm mb-5">🌎 $48 USD · lifetime access</p>
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

                <ShareButtons url="/courses/canal-paralelo" title="Canal Paralelo — Estrategias de The Mentor 🎓" />
              </div>
            </div>

            {/* Card 2 — Expansión Matemática (PREMIUM) */}
            <div className="relative bg-gradient-to-br from-[#1a1a2e] via-[#1a1020] to-[#0d0d0d] rounded-2xl overflow-hidden flex flex-col"
              style={{ border: '2px solid transparent', backgroundClip: 'padding-box' }}>
              {/* Gradient border effect */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ background: 'linear-gradient(135deg, #c9a227, #9b59b6, #c9a227)', opacity: 0.5, zIndex: 0, margin: '-2px', borderRadius: 'inherit' }} />
              <div className="relative z-10 flex flex-col flex-1 bg-gradient-to-br from-[#1a1a2e] via-[#1a1020] to-[#0d0d0d] rounded-2xl overflow-hidden">
                {/* Premium badge */}
                <div className="bg-gradient-to-r from-[#c9a227] via-[#e8c84a] to-[#9b59b6] text-black text-xs font-black px-4 py-1.5 text-center tracking-widest uppercase">
                  ⭐ CURSO PREMIUM — DISPONIBLE AHORA
                </div>
                <div className="relative bg-black overflow-hidden">
                  <img
                    src="/expa.png"
                    alt="Expansión Matemática"
                    className="w-full h-auto block"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d]/40 to-transparent pointer-events-none" />
                  {/* Premium crown overlay */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-bold text-[#c9a227] border border-[#c9a227]/40">
                    👑 PREMIUM
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-gray-200 text-sm italic mb-4 leading-relaxed">
                    &ldquo;Técnicas nunca antes vistas, sumamente eficientes y demostrables&rdquo;
                  </p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-[#c9a227] text-3xl font-bold">1.500.000</span>
                    <span className="text-gray-400 text-sm">GS</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">🌎 $240 USD · lifetime access</p>
                  <div className="flex items-center gap-2 mb-5">
                    <svg className="w-4 h-4 text-[#c9a227] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[#c9a227] text-sm font-semibold">Acceso de por vida</span>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#c9a227] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Técnicas exclusivas y demostrables
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#c9a227] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Contenido 100% inédito
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#c9a227] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Curso Premium certificado
                    </li>
                  </ul>
                  <button
                    onClick={() => handleBuyProduct('expansion-matematica')}
                    disabled={buyingProduct === 'expansion-matematica'}
                    className="mt-auto w-full bg-gradient-to-r from-[#c9a227] to-[#9b59b6] hover:from-[#b8911f] hover:to-[#8e44ad] disabled:opacity-70 disabled:cursor-wait text-black font-bold text-base py-3 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
                  >
                    {buyingProduct === 'expansion-matematica' ? '⏳ Procesando...' : '👑 Comprar Ahora'}
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

                  <ShareButtons url="/courses/expansion-matematica" title="Expansión Matemática — Técnicas nunca antes vistas 👑 sacredlevels.com" />
                </div>
              </div>
            </div>

            {/* Card 3 — Curso Básico (GRATUITO para registrados) */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border-2 border-green-700/50 rounded-2xl overflow-hidden flex flex-col hover:border-green-600/70 transition-all">
              <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white text-xs font-black px-4 py-1.5 text-center tracking-widest uppercase">
                🎁 GRATUITO — PRÓXIMAMENTE
              </div>
              <div className="relative bg-black overflow-hidden">
                <img
                  src="/cursobasico.png"
                  alt="Curso Básico"
                  className="w-full h-auto block opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d]/50 to-transparent pointer-events-none" />
                <div className="absolute top-3 right-3 bg-green-600/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-bold text-white">
                  🆓 FREE
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-gray-200 text-sm mb-4 leading-relaxed">
                  Sepa como gestionar sus emociones, evite vende humos y preserve su capital.
                </p>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-green-400 text-3xl font-bold">GRATIS</span>
                </div>
                <div className="flex items-center gap-2 mb-5">
                  <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-400 text-sm font-semibold">Para usuarios registrados</span>
                </div>
                <ul className="space-y-2 mb-6 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Gestión emocional en el trading
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Cómo identificar y evitar vende humos
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Preservá tu capital desde el inicio
                  </li>
                </ul>
                <button
                  disabled
                  className="mt-auto w-full bg-green-900/30 text-green-400 font-bold text-base py-3 px-6 rounded-xl cursor-not-allowed border border-green-700/40"
                >
                  🔒 Disponible Muy Pronto
                </button>
                <ShareButtons url="/#mentors-vault" title="¡Curso GRATUITO! Trading Sicológico — Gestión emocional para traders 🎁 sacredlevels.com" />
              </div>
            </div>

            {/* Card 4 — Desbloquea el Poder de Forex */}
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
                <ShareButtons url="/#mentors-vault" title="Desbloquea el Poder de Forex — Próximamente en sacredlevels.com 🔥" />
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
                  <span className="text-gray-400 text-2xl font-bold">—</span>
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
                <ShareButtons url="/#mentors-vault" title="Nuevo curso próximamente en sacredlevels.com 🔥" />
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
                <ShareButtons url="/#mentors-vault" title="El tiempo es más importante que el precio — Próximamente en sacredlevels.com 🔥" />
              </div>
            </div>

            {/* Card 5 — Trading Sicológico */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0d] border-2 border-gray-700/50 rounded-2xl overflow-hidden flex flex-col">
              <div className="bg-gray-700 text-gray-300 text-xs font-bold px-4 py-1.5 text-center tracking-widest uppercase">
                PRÓXIMAMENTE
              </div>
              <div className="relative bg-black overflow-hidden">
                <img
                  src="/TRADING.png"
                  alt="Trading"
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
                <ShareButtons url="/#mentors-vault" title="Trading Sicológico — Próximamente en sacredlevels.com 🔥" />
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
          METHODOLOGY SECTION
          ============================================ */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-white">Análisis Matemático Avanzado de </span>
            <span className="text-gradient-gold-static">Precios</span>
          </h2>
          <p className="text-terminal-muted text-lg mb-12 max-w-2xl mx-auto">
            Cálculos de nivel institucional para identificar soportes y resistencias clave
            usando <span className="text-gold-500">la metodología probada de W.D. Gann</span>.
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
                    <div className="text-gann-resistance text-xs">Resistencias</div>
                    <div className="text-white font-mono text-sm">$X,XXX.XX</div>
                  </div>
                  <div>
                    <div className="text-gold-500 text-xs">Centro</div>
                    <div className="text-white font-mono text-sm">$X,XXX.XX</div>
                  </div>
                  <div>
                    <div className="text-gann-support text-xs">Soportes</div>
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
                <p className="text-white font-semibold text-lg">Suscribite para Desbloquear</p>
                <p className="text-terminal-muted text-sm mt-1">Ver los niveles exactos</p>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto text-center">
            <p className="text-terminal-muted leading-relaxed">
              Principios matemáticos ancestrales. Alineaciones planetarias. Una fórmula oculta por más de 100 años.
              <br />
              <span className="text-white font-medium">W.D. Gann desarrolló estas técnicas basadas en la ley natural y la geometría.</span>
              <br />
              <span className="text-gold-500">Explorá ahora estos métodos probados a lo largo del tiempo.</span>
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
              <span className="text-white">Demostraciones de </span>
              <span className="text-gradient-gold-static">Análisis</span>
            </h2>
            <p className="text-terminal-muted max-w-2xl mx-auto">
              Ejemplos históricos de análisis de mercado usando la metodología Gann. Solo con fines educativos.
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
              <h4 className="text-white font-semibold mb-2">Reversión XAU/USD</h4>
              <p className="text-terminal-muted text-sm mb-2">
                Nivel de resistencia predicho con <span className="text-gold-500">0.15% de precisión</span>
              </p>
              <p className="text-gann-support text-sm font-medium">
                Los suscriptores recibieron la alerta 48 horas antes
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
              <h4 className="text-white font-semibold mb-2">Rebote de Soporte BTC</h4>
              <p className="text-terminal-muted text-sm mb-2">
                Zona de soporte identificada <span className="text-gold-500">3 días antes</span> del rebote
              </p>
              <p className="text-gann-support text-sm font-medium">
                Los miembros se posicionaron anticipadamente con los niveles calculados
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
              <h4 className="text-white font-semibold mb-2">Alineación Planetaria</h4>
              <p className="text-terminal-muted text-sm mb-2">
                Convergencia de ciclos temporales señaló un <span className="text-gold-500">punto de inflexión mayor</span>
              </p>
              <p className="text-terminal-muted text-sm font-medium">
                ¿El método? <span className="text-gold-500">Los miembros Pro tienen acceso.</span>
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-terminal-muted mb-6">¿Querés ver cómo calculamos estos niveles?</p>
            <Link href={session ? '/dashboard' : '/register'} className="btn-gold-large btn-pulse">
              🔓 {session ? 'Ver mis herramientas' : 'Desbloquear la Fórmula'}
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
              <span className="text-white">Cómo </span>
              <span className="text-gradient-gold-static">Funciona</span>
            </h2>
            <p className="text-terminal-muted">
              Tres pasos hacia el trading de precisión
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center group">
              <div className="w-16 h-16 bg-terminal-card border border-terminal-border rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:border-gold-500/50 transition-colors">
                <span className="text-3xl">📍</span>
              </div>
              <div className="text-gold-500 text-sm font-semibold mb-2">Paso 1</div>
              <h3 className="text-white font-semibold mb-2">Ingresá un Precio Significativo</h3>
              <p className="text-terminal-muted text-sm">Ingresá un nivel de precio clave para el mercado que elijas</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-terminal-card border border-terminal-border rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:border-gold-500/50 transition-colors">
                <span className="text-3xl">🔮</span>
              </div>
              <div className="text-gold-500 text-sm font-semibold mb-2">Paso 2</div>
              <h3 className="text-white font-semibold mb-2">Nuestro Algoritmo Revela Zonas Ocultas</h3>
              <p className="text-terminal-muted text-sm">Los cálculos matemáticos identifican los niveles clave</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-terminal-card border border-terminal-border rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:border-gold-500/50 transition-colors">
                <span className="text-3xl">🎯</span>
              </div>
              <div className="text-gold-500 text-sm font-semibold mb-2">Paso 3</div>
              <h3 className="text-white font-semibold mb-2">Ejecutá con Precisión</h3>
              <p className="text-terminal-muted text-sm">Operá con confianza en los niveles calculados</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-terminal-muted italic">
              La metodología completa se revela adentro.
            </p>
            <Link href="/billing" className="text-gold-500 hover:text-gold-400 font-semibold inline-flex items-center gap-1 mt-2">
              Ver Planes
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
          <span className="text-white">La Leyenda Detrás del </span>
          <span className="text-gradient-gold-static">Método</span>
        </h2>
        <p className="text-terminal-muted leading-relaxed mb-6">
          <span className="text-white font-semibold">William Delbert Gann (1878-1955)</span> fue un legendario trader que
          logró resultados extraordinarios mediante la aplicación disciplinada de principios matemáticos.
        </p>
        <p className="text-terminal-muted leading-relaxed mb-6">
          Sus métodos, basados en la ley natural, la geometría y los ciclos planetarios, siguen siendo algunas de las
          técnicas más estudiadas en la historia del trading. Explorá sus métodos analíticos centenarios
          aplicados al mercado actual con fines educativos.
        </p>
        <Link href={session ? '/dashboard' : '/register'} className="btn-gold inline-flex items-center gap-2">
          {session ? 'Ir al Dashboard' : 'Descubrí Sus Secretos'}
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
          <p className="text-terminal-muted text-sm italic">&ldquo;El tiempo es el factor más importante&rdquo;</p>
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
              <span className="text-white">Preguntas </span>
              <span className="text-gradient-gold-static">Frecuentes</span>
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
              <span className="text-white">Comenzá Tu </span>
              <span className="text-gradient-gold-static">Prueba Gratuita Hoy</span>
            </h2>
            <p className="text-terminal-muted mb-8 max-w-2xl mx-auto">
              Accedé a herramientas de análisis de mercado de nivel profesional basadas en principios matemáticos probados.
              No se requiere tarjeta de crédito para el plan gratuito.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link href={session ? '/dashboard' : '/register'} className="btn-gold-large">
                {session ? 'Ir al Dashboard' : 'Crear Cuenta Gratuita'}
              </Link>
              <Link href="/billing" className="btn-outline-gold text-lg px-8 py-4">
                Comparar Planes
              </Link>
            </div>
            <p className="text-terminal-muted/60 text-sm mt-6">
              Únite a traders de más de 8 países
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
