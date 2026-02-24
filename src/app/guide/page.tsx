'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function GuidePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [language, setLanguage] = useState<'en' | 'es'>('en')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-terminal-bg">
        <Navbar />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-gold-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-terminal-muted">Loading User Guide...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!session) {
    return null
  }

  const plan = session.user.plan || 'free'
  const role = session.user.role || 'user'
  const isAdmin = role === 'admin'
  const isWhale = plan === 'whale' || isAdmin
  const isPro = plan === 'pro' || isAdmin
  const hasAccess = isPro || isWhale

  if (!hasAccess) {
    return (
      <main className="min-h-screen bg-terminal-bg">
        <Navbar />
        <div className="pt-20 pb-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card-terminal">
              <div className="w-20 h-20 bg-gradient-to-r from-gold-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📚</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Pro Access Required</h1>
              <p className="text-terminal-muted mb-8">
                The User Guide is available exclusively for Pro and Whale members.
                Upgrade your plan to access comprehensive educational content and trading methodologies.
              </p>
              <Link href="/billing" className="btn-gold">
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-terminal-bg">
      <Navbar />

      <div className="pt-20 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header with Language Toggle */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              {language === 'en' ? 'User Guide' : 'Guía de Usuario'}
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  language === 'en'
                    ? 'bg-gold-500 text-black font-medium'
                    : 'bg-terminal-card border border-terminal-border text-terminal-muted hover:border-gold-500'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  language === 'es'
                    ? 'bg-gold-500 text-black font-medium'
                    : 'bg-terminal-card border border-terminal-border text-terminal-muted hover:border-gold-500'
                }`}
              >
                Español
              </button>
            </div>
          </div>

          {/* Content */}
          {language === 'en' ? <EnglishContent /> : <SpanishContent />}
        </div>
      </div>

      <Footer />
    </main>
  )
}

function EnglishContent() {
  return (
    <div className="space-y-8">
      {/* Risk Disclaimer */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <h2 className="text-red-500 font-bold text-xl mb-3 flex items-center gap-2">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Important Risk Disclaimer
        </h2>
        <p className="text-terminal-muted leading-relaxed">
          This tool is for <strong className="text-white">educational and analytical purposes only</strong>.
          Sacred Levels does not provide financial advice, trading signals, or investment recommendations.
          Trading financial instruments involves <strong className="text-white">substantial risk of loss</strong>.
          Past performance does not guarantee future results. You are solely responsible for your trading decisions.
        </p>
      </div>

      {/* Calculator Setup */}
      <section className="card-terminal">
        <h2 className="text-2xl font-bold text-gold-500 mb-4">📊 Calculator Setup</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Center Price</h3>
            <p className="text-terminal-muted">
              This is the reference point from which all support and resistance levels are calculated.
              Use a significant price level such as:
            </p>
            <ul className="list-disc list-inside text-terminal-muted mt-2 space-y-1 ml-4">
              <li>Recent swing high or swing low</li>
              <li>Previous day&apos;s close</li>
              <li>A major round number (e.g., $2,600 for Gold)</li>
              <li>A key psychological level</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Increment Level</h3>
            <p className="text-terminal-muted">
              Controls the spacing between calculated levels. Common values:
            </p>
            <ul className="list-disc list-inside text-terminal-muted mt-2 space-y-1 ml-4">
              <li><strong className="text-gold-500">Gold (XAU/USD)</strong>: 1 to 5</li>
              <li><strong className="text-gold-500">Forex Major Pairs</strong>: 0.0001 to 0.0010</li>
              <li><strong className="text-gold-500">Bitcoin</strong>: 50 to 500</li>
              <li><strong className="text-gold-500">Stocks</strong>: 0.25 to 2</li>
            </ul>
            <p className="text-terminal-muted mt-2">
              <strong className="text-gold-500">Tip:</strong> Start with a smaller increment for intraday trading,
              larger for swing trading.
            </p>
          </div>
        </div>
      </section>

      {/* Methodology: Reversal */}
      <section className="card-terminal">
        <h2 className="text-2xl font-bold text-gold-500 mb-4">🔄 Methodology: Reversal</h2>
        <p className="text-terminal-muted mb-4">
          Use this mode when you expect price to <strong className="text-white">reverse at key levels</strong>.
          Ideal for range-bound markets or when price approaches strong support/resistance.
        </p>

        <div className="bg-terminal-bg rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Strategy:</h3>
          <ol className="list-decimal list-inside text-terminal-muted space-y-2 ml-2">
            <li>Wait for price to approach a calculated support or resistance level</li>
            <li>Look for reversal confirmation (candlestick patterns, divergence, volume)</li>
            <li>Enter in the direction of the reversal</li>
            <li>Set stop loss beyond the next level</li>
            <li>Take profit at the opposing level</li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-gold-500/10 border border-gold-500/30 rounded-lg">
          <p className="text-sm text-terminal-muted">
            <strong className="text-gold-500">Best for:</strong> Range traders, scalpers in consolidation zones
          </p>
        </div>
      </section>

      {/* Methodology: Continuation */}
      <section className="card-terminal">
        <h2 className="text-2xl font-bold text-gold-500 mb-4">📈 Methodology: Continuation</h2>
        <p className="text-terminal-muted mb-4">
          Use this mode when you expect price to <strong className="text-white">break through levels and continue trending</strong>.
          Ideal for strong trending markets with momentum.
        </p>

        <div className="bg-terminal-bg rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Strategy:</h3>
          <ol className="list-decimal list-inside text-terminal-muted space-y-2 ml-2">
            <li>Identify the prevailing trend direction</li>
            <li>Wait for a pullback to a calculated level</li>
            <li>Enter when price shows signs of continuation (bullish/bearish candles, volume increase)</li>
            <li>Set stop loss at the previous level</li>
            <li>Trail stop as price moves through subsequent levels</li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-gold-500/10 border border-gold-500/30 rounded-lg">
          <p className="text-sm text-terminal-muted">
            <strong className="text-gold-500">Best for:</strong> Trend followers, momentum traders
          </p>
        </div>
      </section>

      {/* Methodology: Scalping */}
      <section className="card-terminal">
        <h2 className="text-2xl font-bold text-gold-500 mb-4">⚡ Methodology: Scalping</h2>
        <p className="text-terminal-muted mb-4">
          Use this mode for <strong className="text-white">short-term trades with tight targets</strong>.
          Focuses on small price movements between levels.
        </p>

        <div className="bg-terminal-bg rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Strategy:</h3>
          <ol className="list-decimal list-inside text-terminal-muted space-y-2 ml-2">
            <li>Use lower timeframes (1m, 5m, 15m)</li>
            <li>Enter near calculated levels with quick confirmation</li>
            <li>Target the next immediate level (small profit targets)</li>
            <li>Use very tight stop losses</li>
            <li>Execute multiple trades per session</li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-terminal-muted">
            <strong className="text-red-500">Warning:</strong> Scalping requires excellent execution,
            low spreads, and strong discipline. Not recommended for beginners.
          </p>
        </div>
      </section>

      {/* Trader Profiles */}
      <section className="card-terminal">
        <h2 className="text-2xl font-bold text-gold-500 mb-4">👤 Trader Profiles</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-terminal-bg rounded-lg p-4 border border-terminal-border">
            <h3 className="text-lg font-semibold text-white mb-3">🔥 Aggressive Trader</h3>
            <ul className="space-y-2 text-terminal-muted text-sm">
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>Enters at the level without waiting for confirmation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>Uses tighter stop losses</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>Takes partial profits quickly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>Higher risk, higher potential reward</span>
              </li>
            </ul>
          </div>

          <div className="bg-terminal-bg rounded-lg p-4 border border-terminal-border">
            <h3 className="text-lg font-semibold text-white mb-3">🛡️ Conservative Trader</h3>
            <ul className="space-y-2 text-terminal-muted text-sm">
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>Waits for clear confirmation before entry</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>Uses wider stop losses (beyond next level)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>Holds for larger targets</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>Lower risk, more consistent results</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="card-terminal">
        <h2 className="text-2xl font-bold text-gold-500 mb-4">✅ Best Practices</h2>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="text-2xl">1️⃣</div>
            <div>
              <h3 className="text-white font-semibold">Always Use Risk Management</h3>
              <p className="text-terminal-muted text-sm">Never risk more than 1-2% of your account per trade</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-2xl">2️⃣</div>
            <div>
              <h3 className="text-white font-semibold">Combine with Other Analysis</h3>
              <p className="text-terminal-muted text-sm">Use calculated levels alongside trend analysis, volume, and fundamentals</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-2xl">3️⃣</div>
            <div>
              <h3 className="text-white font-semibold">Test Your Strategy</h3>
              <p className="text-terminal-muted text-sm">Practice with a demo account before trading real money</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-2xl">4️⃣</div>
            <div>
              <h3 className="text-white font-semibold">Keep a Trading Journal</h3>
              <p className="text-terminal-muted text-sm">Document your trades to identify patterns and improve</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-2xl">5️⃣</div>
            <div>
              <h3 className="text-white font-semibold">Stay Disciplined</h3>
              <p className="text-terminal-muted text-sm">Follow your strategy consistently - don&apos;t chase trades or overtrade</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <div className="text-center p-6 bg-terminal-card rounded-lg border border-terminal-border">
        <p className="text-terminal-muted text-sm">
          Need help? Visit our <Link href="/terms" className="text-gold-500 hover:underline">Terms</Link> or{' '}
          <Link href="/disclaimer" className="text-gold-500 hover:underline">Disclaimer</Link> pages for more information.
        </p>
      </div>
    </div>
  )
}

function SpanishContent() {
  return (
    <div className="space-y-8">
      {/* Risk Disclaimer */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <h2 className="text-red-500 font-bold text-xl mb-3 flex items-center gap-2">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Advertencia Importante de Riesgo
        </h2>
        <p className="text-terminal-muted leading-relaxed">
          Esta herramienta es únicamente con <strong className="text-white">fines educativos y analíticos</strong>.
          Sacred Levels no proporciona asesoramiento financiero, señales de trading ni recomendaciones de inversión.
          Operar instrumentos financieros implica un <strong className="text-white">riesgo sustancial de pérdida</strong>.
          El rendimiento pasado no garantiza resultados futuros. Usted es el único responsable de sus decisiones de trading.
        </p>
      </div>

      {/* Calculator Setup */}
      <section className="card-terminal">
        <h2 className="text-2xl font-bold text-gold-500 mb-4">📊 Configuración de la Calculadora</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Precio Central</h3>
            <p className="text-terminal-muted">
              Este es el punto de referencia desde el cual se calculan todos los niveles de soporte y resistencia.
              Utiliza un nivel de precio significativo como:
            </p>
            <ul className="list-disc list-inside text-terminal-muted mt-2 space-y-1 ml-4">
              <li>Máximo o mínimo reciente</li>
              <li>Cierre del día anterior</li>
              <li>Un número redondo importante (ej., $2,600 para el Oro)</li>
              <li>Un nivel psicológico clave</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Nivel de Incremento</h3>
            <p className="text-terminal-muted">
              Controla el espaciado entre los niveles calculados. Valores comunes:
            </p>
            <ul className="list-disc list-inside text-terminal-muted mt-2 space-y-1 ml-4">
              <li><strong className="text-gold-500">Oro (XAU/USD)</strong>: 1 a 5</li>
              <li><strong className="text-gold-500">Pares Forex Principales</strong>: 0.0001 a 0.0010</li>
              <li><strong className="text-gold-500">Bitcoin</strong>: 50 a 500</li>
              <li><strong className="text-gold-500">Acciones</strong>: 0.25 a 2</li>
            </ul>
            <p className="text-terminal-muted mt-2">
              <strong className="text-gold-500">Consejo:</strong> Comienza con un incremento más pequeño para trading intradía,
              más grande para swing trading.
            </p>
          </div>
        </div>
      </section>

      {/* Methodology: Reversal */}
      <section className="card-terminal">
        <h2 className="text-2xl font-bold text-gold-500 mb-4">🔄 Metodología: Reversión</h2>
        <p className="text-terminal-muted mb-4">
          Usa este modo cuando esperas que el precio <strong className="text-white">se revierta en niveles clave</strong>.
          Ideal para mercados en rango o cuando el precio se acerca a un soporte/resistencia fuerte.
        </p>

        <div className="bg-terminal-bg rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Estrategia:</h3>
          <ol className="list-decimal list-inside text-terminal-muted space-y-2 ml-2">
            <li>Espera a que el precio se acerque a un nivel de soporte o resistencia calculado</li>
            <li>Busca confirmación de reversión (patrones de velas, divergencia, volumen)</li>
            <li>Entra en la dirección de la reversión</li>
            <li>Coloca stop loss más allá del siguiente nivel</li>
            <li>Toma ganancias en el nivel opuesto</li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-gold-500/10 border border-gold-500/30 rounded-lg">
          <p className="text-sm text-terminal-muted">
            <strong className="text-gold-500">Mejor para:</strong> Traders de rango, scalpers en zonas de consolidación
          </p>
        </div>
      </section>

      {/* Methodology: Continuation */}
      <section className="card-terminal">
        <h2 className="text-2xl font-bold text-gold-500 mb-4">📈 Metodología: Continuación</h2>
        <p className="text-terminal-muted mb-4">
          Usa este modo cuando esperas que el precio <strong className="text-white">rompa niveles y continúe la tendencia</strong>.
          Ideal para mercados con fuerte tendencia y momentum.
        </p>

        <div className="bg-terminal-bg rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Estrategia:</h3>
          <ol className="list-decimal list-inside text-terminal-muted space-y-2 ml-2">
            <li>Identifica la dirección de la tendencia predominante</li>
            <li>Espera un retroceso a un nivel calculado</li>
            <li>Entra cuando el precio muestre señales de continuación (velas alcistas/bajistas, aumento de volumen)</li>
            <li>Coloca stop loss en el nivel anterior</li>
            <li>Mueve el stop loss mientras el precio atraviesa niveles subsiguientes</li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-gold-500/10 border border-gold-500/30 rounded-lg">
          <p className="text-sm text-terminal-muted">
            <strong className="text-gold-500">Mejor para:</strong> Seguidores de tendencia, traders de momentum
          </p>
        </div>
      </section>

      {/* Methodology: Scalping */}
      <section className="card-terminal">
        <h2 className="text-2xl font-bold text-gold-500 mb-4">⚡ Metodología: Scalping</h2>
        <p className="text-terminal-muted mb-4">
          Usa este modo para <strong className="text-white">operaciones de corto plazo con objetivos ajustados</strong>.
          Se enfoca en pequeños movimientos de precio entre niveles.
        </p>

        <div className="bg-terminal-bg rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Estrategia:</h3>
          <ol className="list-decimal list-inside text-terminal-muted space-y-2 ml-2">
            <li>Usa marcos de tiempo bajos (1m, 5m, 15m)</li>
            <li>Entra cerca de niveles calculados con confirmación rápida</li>
            <li>Apunta al siguiente nivel inmediato (objetivos de ganancia pequeños)</li>
            <li>Usa stop losses muy ajustados</li>
            <li>Ejecuta múltiples operaciones por sesión</li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-terminal-muted">
            <strong className="text-red-500">Advertencia:</strong> El scalping requiere excelente ejecución,
            spreads bajos y fuerte disciplina. No recomendado para principiantes.
          </p>
        </div>
      </section>

      {/* Trader Profiles */}
      <section className="card-terminal">
        <h2 className="text-2xl font-bold text-gold-500 mb-4">👤 Perfiles de Trader</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-terminal-bg rounded-lg p-4 border border-terminal-border">
            <h3 className="text-lg font-semibold text-white mb-3">🔥 Trader Agresivo</h3>
            <ul className="space-y-2 text-terminal-muted text-sm">
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>Entra en el nivel sin esperar confirmación</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>Usa stop losses más ajustados</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>Toma ganancias parciales rápidamente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>Mayor riesgo, mayor recompensa potencial</span>
              </li>
            </ul>
          </div>

          <div className="bg-terminal-bg rounded-lg p-4 border border-terminal-border">
            <h3 className="text-lg font-semibold text-white mb-3">🛡️ Trader Conservador</h3>
            <ul className="space-y-2 text-terminal-muted text-sm">
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>Espera confirmación clara antes de entrar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>Usa stop losses más amplios (más allá del siguiente nivel)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>Mantiene para objetivos más grandes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-500 mt-1">•</span>
                <span>Menor riesgo, resultados más consistentes</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="card-terminal">
        <h2 className="text-2xl font-bold text-gold-500 mb-4">✅ Mejores Prácticas</h2>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="text-2xl">1️⃣</div>
            <div>
              <h3 className="text-white font-semibold">Siempre Usa Gestión de Riesgo</h3>
              <p className="text-terminal-muted text-sm">Nunca arriesgues más del 1-2% de tu cuenta por operación</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-2xl">2️⃣</div>
            <div>
              <h3 className="text-white font-semibold">Combina con Otros Análisis</h3>
              <p className="text-terminal-muted text-sm">Usa los niveles calculados junto con análisis de tendencia, volumen y fundamentales</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-2xl">3️⃣</div>
            <div>
              <h3 className="text-white font-semibold">Prueba Tu Estrategia</h3>
              <p className="text-terminal-muted text-sm">Practica con una cuenta demo antes de operar con dinero real</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-2xl">4️⃣</div>
            <div>
              <h3 className="text-white font-semibold">Mantén un Diario de Trading</h3>
              <p className="text-terminal-muted text-sm">Documenta tus operaciones para identificar patrones y mejorar</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-2xl">5️⃣</div>
            <div>
              <h3 className="text-white font-semibold">Mantén la Disciplina</h3>
              <p className="text-terminal-muted text-sm">Sigue tu estrategia consistentemente - no persigas operaciones ni sobreperes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <div className="text-center p-6 bg-terminal-card rounded-lg border border-terminal-border">
        <p className="text-terminal-muted text-sm">
          ¿Necesitas ayuda? Visita nuestras páginas de <Link href="/terms" className="text-gold-500 hover:underline">Términos</Link> o{' '}
          <Link href="/disclaimer" className="text-gold-500 hover:underline">Descargo de Responsabilidad</Link> para más información.
        </p>
      </div>
    </div>
  )
}
