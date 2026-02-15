'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import GannCalculator from '@/components/GannCalculator'
import GannCosmogram from '@/components/GannCosmogram'
import AstroGann from '@/components/AstroGann'
import { TickerTape, AdvancedChart, MiniChart, EconomicCalendar } from '@/components/TradingView'
import { GannLevels } from '@/lib/gann'
import Link from 'next/link'
import PersonalizedGreeting from '@/components/PersonalizedGreeting'

type ModuleType = 'calculator' | 'astro' | 'chart' | 'calendar'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [levels, setLevels] = useState<GannLevels | null>(null)
  const [activeModule, setActiveModule] = useState<ModuleType>('calculator')
  const [symbol, setSymbol] = useState('OANDA:XAUUSD')
  const [showMiniCharts, setShowMiniCharts] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-terminal-bg">
        <Navbar />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-gold-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-terminal-muted">Loading TMT Dashboard...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!session) {
    return null
  }

  const isPremium = session.user.isPremium
  const email = session.user.email || ''
  const plan = session.user.plan || 'free'
  const role = session.user.role || 'user'
  const isAdmin = role === 'admin'
  const isWhale = plan === 'whale' || isAdmin
  const isPro = plan === 'pro' || isAdmin
  const tier = isWhale ? 'whale' : isPro ? 'pro' : 'free'
  const trialUses = session.user.trialUses || 0
  const trialExpired = session.user.trialExpired || false

  // Trial system for non-premium users
  if (!isPremium) {
    // If trial is expired, show upgrade prompt
    if (trialExpired || trialUses >= 2) {
      return (
        <main className="min-h-screen bg-terminal-bg">
          <Navbar />
          <div className="pt-32 pb-20 px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="card-terminal">
                <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-4">Free Trial Ended</h1>
                <p className="text-terminal-muted mb-2">
                  You&apos;ve used all {trialUses} of your free trial calculations.
                </p>
                <p className="text-terminal-muted mb-8">
                  Subscribe to continue using the Gann Calculator and unlock premium features.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/billing" className="btn-gold">View Plans & Subscribe</Link>
                  <Link href="/" className="btn-outline-gold">Back to Home</Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      )
    }
    // If trial is still active, allow access with counter
  }

  const modules = [
    { id: 'calculator' as ModuleType, label: 'Gann Calculator', icon: '📊' },
    { id: 'astro' as ModuleType, label: 'Astro-Gann', icon: '☿' },
    { id: 'chart' as ModuleType, label: 'Live Chart', icon: '📈' },
    { id: 'calendar' as ModuleType, label: 'Calendar', icon: '📅' },
  ]

  return (
    <main className="min-h-screen bg-terminal-bg">
      <Navbar />

      {/* Ticker Tape */}
      <div className="pt-16">
        <TickerTape colorTheme="dark" />
      </div>

      <div className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">TMT Dashboard</h1>
                <p className="mt-1">
                  <PersonalizedGreeting userName={session.user.name || session.user.email?.split('@')[0]} />
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* User Guide Button - Only for Pro and Whale */}
                {(tier === 'pro' || tier === 'whale') && (
                  <Link
                    href="/guide"
                    className="px-4 py-2 rounded-lg bg-terminal-card border border-gold-500/30 hover:border-gold-500 text-gold-500 hover:bg-gold-500/10 transition-all flex items-center gap-2 text-sm font-medium"
                  >
                    <span>📖</span>
                    <span className="hidden sm:inline">User Guide</span>
                    <span className="sm:hidden">Guide</span>
                  </Link>
                )}

                {tier === 'whale' ? (
                  <span className="px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center gap-2">
                    <span>🐋</span> WHALE ACCESS
                  </span>
                ) : (
                  <span className="status-premium">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    PRO Member
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Educational Disclaimer Banner */}
          <div className="mb-6 p-3 bg-gold-500/10 border border-gold-500/30 rounded-lg">
            <p className="text-center text-sm text-terminal-muted">
              <span className="text-gold-500 font-medium">⚠️ Educational tool only.</span>{' '}
              Not financial advice. Trading involves risk.
            </p>
          </div>

          {/* Mini Charts Row */}
          {showMiniCharts && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <MiniChart symbol="OANDA:XAUUSD" height={180} />
              <MiniChart symbol="OANDA:XAGUSD" height={180} />
              <MiniChart symbol="BITSTAMP:BTCUSD" height={180} />
              <MiniChart symbol="FX:EURUSD" height={180} />
            </div>
          )}

          {/* Toggle Mini Charts */}
          <button
            onClick={() => setShowMiniCharts(!showMiniCharts)}
            className="mb-4 text-sm text-terminal-muted hover:text-gold-500 transition-colors"
          >
            {showMiniCharts ? '▲ Hide Mini Charts' : '▼ Show Mini Charts'}
          </button>

          {/* Module Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {modules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
                  activeModule === mod.id
                    ? 'bg-gold-500 text-black'
                    : 'bg-terminal-card border border-terminal-border text-terminal-muted hover:border-gold-500'
                }`}
              >
                <span className="mr-2">{mod.icon}</span>
                <span className="hidden sm:inline">{mod.label}</span>
              </button>
            ))}
          </div>

          {/* Symbol Selector for Chart */}
          {activeModule === 'chart' && (
            <div className="mb-4">
              <label className="block text-terminal-muted text-sm mb-2">Select Symbol</label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="bg-terminal-card border border-terminal-border rounded-lg px-4 py-2 text-white focus:border-gold-500 focus:outline-none"
              >
                <option value="OANDA:XAUUSD">XAU/USD (Gold)</option>
                <option value="OANDA:XAGUSD">XAG/USD (Silver)</option>
                <option value="FX:EURUSD">EUR/USD</option>
                <option value="FX:GBPUSD">GBP/USD</option>
                <option value="BITSTAMP:BTCUSD">BTC/USD</option>
                <option value="BITSTAMP:ETHUSD">ETH/USD</option>
                <option value="FOREXCOM:SPXUSD">S&P 500</option>
                <option value="TVC:DXY">US Dollar Index</option>
              </select>
            </div>
          )}

          {/* Calculator Module */}
          {activeModule === 'calculator' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <GannCalculator
                  onCalculate={setLevels}
                  isPremium={isPro || isWhale}
                  userEmail={email}
                  trialUses={trialUses}
                  trialExpired={trialExpired}
                />
              </div>
              <div>
                <GannCosmogram levels={levels} />
              </div>
            </div>
          )}

          {/* Astro-Gann Module */}
          {activeModule === 'astro' && (
            <AstroGann gannLevels={levels} />
          )}
<Link href="/analysis">
  <button className="gold-button">
    📊 Historical Analysis (Pro/Whale)
  </button>
</Link>
          {/* Live Chart Module */}
          {activeModule === 'chart' && (
            <div className="space-y-4">
              <AdvancedChart symbol={symbol} height={600} />
            </div>
          )}

          {/* Economic Calendar Module */}
          {activeModule === 'calendar' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <EconomicCalendar height={500} />
              <div className="card-terminal">
                <h3 className="text-lg font-bold text-white mb-4">Trading Notes</h3>
                <textarea
                  placeholder="Write your trading notes here..."
                  className="w-full h-96 bg-terminal-bg border border-terminal-border rounded-lg p-4 text-white placeholder-terminal-muted focus:border-gold-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* Quick Stats (when calculator has results) */}
          {levels && activeModule === 'calculator' && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card-terminal text-center">
                <div className="text-terminal-muted text-sm mb-1">Nearest Resistance</div>
                <div className="text-red-400 font-bold text-xl">${levels.resistances[0].toFixed(2)}</div>
              </div>
              <div className="card-terminal text-center">
                <div className="text-terminal-muted text-sm mb-1">Nearest Support</div>
                <div className="text-green-400 font-bold text-xl">${levels.supports[0].toFixed(2)}</div>
              </div>
              <div className="card-terminal text-center">
                <div className="text-terminal-muted text-sm mb-1">Range High (R8)</div>
                <div className="text-white font-bold text-xl">${levels.resistances[7].toFixed(2)}</div>
              </div>
              <div className="card-terminal text-center">
                <div className="text-terminal-muted text-sm mb-1">Range Low (S8)</div>
                <div className="text-white font-bold text-xl">${levels.supports[7].toFixed(2)}</div>
              </div>
            </div>
          )}

          {/* Whale Features Promo */}
          {tier === 'pro' && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">
                    🐋 Unlock WHALE features: Advanced Gann Tools, Hexagon, Wheel of 24, and more!
                  </p>
                  <p className="text-terminal-muted text-sm mt-1">
                    Get access to all advanced W.D. Gann techniques and priority support.
                  </p>
                </div>
                <Link href="/billing" className="btn-gold whitespace-nowrap ml-4">
                  Upgrade
                </Link>
              </div>
            </div>
          )}

          {/* Tip */}
          {!levels && activeModule === 'calculator' && (
            <div className="mt-6 p-4 bg-gold-500/5 border border-gold-500/20 rounded-lg">
              <p className="text-gold-500 text-sm">
                <strong>Tip:</strong> Enter a XAU/USD price in the calculator to see Gann levels and enable Astro-Gann correlations.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
