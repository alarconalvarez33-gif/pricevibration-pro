'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PriceTicker from '@/components/PriceTicker'
import Link from 'next/link'
import useGannAdvanced from '@/hooks/useGannAdvanced'
import useTimeCycles from '@/hooks/useTimeCycles'

type AdvancedModule = 'wheel24' | 'square9' | 'hexagon' | 'series144' | 'timeCycles' | 'priceTime'

export default function AdvancedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [price, setPrice] = useState<string>('2650')
  const [activeModule, setActiveModule] = useState<AdvancedModule>('wheel24')
  const [swingDate, setSwingDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [swingType, setSwingType] = useState<'high' | 'low'>('low')

  const centerPrice = price ? parseFloat(price) : null
  const gannAdvanced = useGannAdvanced(centerPrice)
  const timeCycles = useTimeCycles()

  // Set swing point when date/price changes
  useEffect(() => {
    if (centerPrice && swingDate) {
      timeCycles.setSwing(new Date(swingDate), centerPrice, swingType)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerPrice, swingDate, swingType])

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
            <p className="text-terminal-muted">Loading Advanced Tools...</p>
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

  if (!isWhale) {
    return (
      <main className="min-h-screen bg-terminal-bg">
        <Navbar />
        <div className="pt-20 pb-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card-terminal">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🐋</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">WHALE Access Required</h1>
              <p className="text-terminal-muted mb-8">
                Advanced Gann Tools including Wheel of 24, Square of 9, Hexagon, 144 Series,
                Time Cycles, and Price-Time Squaring are exclusive to WHALE members.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/billing" className="px-6 py-3 rounded-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 transition-opacity">
                  Upgrade to WHALE
                </Link>
                <Link href="/dashboard" className="btn-outline-gold">Back to Dashboard</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const modules = [
    { id: 'wheel24' as AdvancedModule, label: 'Wheel of 24', icon: '🎡', desc: 'Law of Vibration' },
    { id: 'square9' as AdvancedModule, label: 'Square of 9', icon: '⬜', desc: 'Spiral Calculator' },
    { id: 'hexagon' as AdvancedModule, label: 'Hexagon', icon: '⬡', desc: '6-Axis System' },
    { id: 'series144' as AdvancedModule, label: '144 Series', icon: '🔢', desc: 'Sacred Numbers' },
    { id: 'timeCycles' as AdvancedModule, label: 'Time Cycles', icon: '⏰', desc: 'Gann Cycles' },
    { id: 'priceTime' as AdvancedModule, label: 'Price-Time', icon: '📐', desc: 'Squaring' },
  ]

  return (
    <main className="min-h-screen bg-terminal-bg">
      <Navbar />

      <div className="pt-[110px] pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Advanced Gann Tools</h1>
                <p className="text-terminal-muted mt-1">
                  W.D. Gann&apos;s Complete Trading System
                </p>
              </div>
              <span className="px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center gap-2 w-fit">
                <span>🐋</span> WHALE ACCESS
              </span>
            </div>
          </div>

          {/* Price & Date Input */}
          <div className="card-terminal mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-terminal-muted text-sm mb-2">Center Price</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="Enter price..."
                  className="w-full bg-terminal-bg border border-terminal-border rounded-lg px-4 py-3 text-white text-lg focus:border-gold-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-terminal-muted text-sm mb-2">Swing Date</label>
                <input
                  type="date"
                  value={swingDate}
                  onChange={(e) => setSwingDate(e.target.value)}
                  className="w-full bg-terminal-bg border border-terminal-border rounded-lg px-4 py-3 text-white focus:border-gold-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-terminal-muted text-sm mb-2">Swing Type</label>
                <select
                  value={swingType}
                  onChange={(e) => setSwingType(e.target.value as 'high' | 'low')}
                  className="w-full bg-terminal-bg border border-terminal-border rounded-lg px-4 py-3 text-white focus:border-gold-500 focus:outline-none"
                >
                  <option value="low">Swing Low (Support)</option>
                  <option value="high">Swing High (Resistance)</option>
                </select>
              </div>
              <div className="flex items-end">
                <div className="w-full p-3 bg-gold-500/10 border border-gold-500/30 rounded-lg text-center">
                  <div className="text-terminal-muted text-xs">Square Root</div>
                  <div className="text-gold-500 font-bold text-xl">
                    {centerPrice ? Math.sqrt(centerPrice).toFixed(4) : '--'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Module Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
            {modules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className={`p-3 rounded-lg font-medium transition-all text-left ${
                  activeModule === mod.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-terminal-card border border-terminal-border text-terminal-muted hover:border-gold-500'
                }`}
              >
                <div className="text-xl mb-1">{mod.icon}</div>
                <div className="text-sm font-bold">{mod.label}</div>
                <div className="text-xs opacity-70">{mod.desc}</div>
              </button>
            ))}
          </div>

          {/* Module Content */}
          <div className="card-terminal">
            {/* Wheel of 24 */}
            {activeModule === 'wheel24' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">🎡 Wheel of 24 - Law of Vibration</h2>
                <p className="text-terminal-muted mb-6">
                  The Wheel of 24 divides the circle into 24 segments of 15 degrees each.
                  These levels represent natural vibration points based on the square root of the price.
                </p>
                {centerPrice && (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {gannAdvanced.wheel24.slice(0, 24).map((level, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border ${
                          level.type === 'cardinal'
                            ? 'bg-gold-500/20 border-gold-500'
                            : level.type === 'cross'
                            ? 'bg-blue-500/20 border-blue-500'
                            : level.type === 'resistance'
                            ? 'bg-red-500/10 border-red-500/50'
                            : 'bg-green-500/10 border-green-500/50'
                        }`}
                      >
                        <div className="text-xs text-terminal-muted">{level.angle}°</div>
                        <div className={`font-bold ${
                          level.type === 'resistance' ? 'text-red-400' : 'text-green-400'
                        }`}>
                          ${level.price.toFixed(2)}
                        </div>
                        <div className="text-xs text-terminal-muted capitalize">{level.type}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Square of 9 */}
            {activeModule === 'square9' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">⬜ Square of 9 - Spiral Calculator</h2>
                <p className="text-terminal-muted mb-6">
                  Gann&apos;s most famous tool. The spiral unfolds from the center price,
                  with each ring representing price levels based on the square root increment.
                </p>
                {centerPrice && (
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-green-400 font-bold mb-3">Supports</h3>
                      <div className="space-y-2">
                        {gannAdvanced.square9.supports.map((price, i) => (
                          <div key={i} className="flex justify-between p-2 bg-green-500/10 rounded border border-green-500/30">
                            <span className="text-terminal-muted">S{i + 1}</span>
                            <span className="text-green-400 font-bold">${price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-gold-500 font-bold mb-3">Cardinals (90°)</h3>
                      <div className="space-y-2">
                        {gannAdvanced.square9.cardinals.map((price, i) => (
                          <div key={i} className="flex justify-between p-2 bg-gold-500/10 rounded border border-gold-500/30">
                            <span className="text-terminal-muted">{(i + 1) * 90}°</span>
                            <span className="text-gold-500 font-bold">${price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-red-400 font-bold mb-3">Resistances</h3>
                      <div className="space-y-2">
                        {gannAdvanced.square9.resistances.map((price, i) => (
                          <div key={i} className="flex justify-between p-2 bg-red-500/10 rounded border border-red-500/30">
                            <span className="text-terminal-muted">R{i + 1}</span>
                            <span className="text-red-400 font-bold">${price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Hexagon */}
            {activeModule === 'hexagon' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">⬡ Gann Hexagon - 6-Axis System</h2>
                <p className="text-terminal-muted mb-6">
                  The Hexagon chart uses 6 axes at 60° intervals. Each ring and axis intersection
                  represents a significant price level.
                </p>
                {centerPrice && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-terminal-border">
                          <th className="text-left p-2 text-terminal-muted">Ring</th>
                          <th className="text-center p-2 text-terminal-muted">0°</th>
                          <th className="text-center p-2 text-terminal-muted">60°</th>
                          <th className="text-center p-2 text-terminal-muted">120°</th>
                          <th className="text-center p-2 text-terminal-muted">180°</th>
                          <th className="text-center p-2 text-terminal-muted">240°</th>
                          <th className="text-center p-2 text-terminal-muted">300°</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2, 3, 4, 5, 6].map((ring) => (
                          <tr key={ring} className="border-b border-terminal-border/50">
                            <td className="p-2 text-gold-500 font-bold">Ring {ring}</td>
                            {[0, 1, 2, 3, 4, 5].map((axis) => {
                              const level = gannAdvanced.hexagon.find(
                                (l) => l.ring === ring && l.axis === axis
                              )
                              return (
                                <td key={axis} className="text-center p-2">
                                  <span className="text-white font-mono">
                                    ${level?.price.toFixed(2) || '--'}
                                  </span>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 144 Series */}
            {activeModule === 'series144' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">🔢 144 Series - Sacred Numbers</h2>
                <p className="text-terminal-muted mb-6">
                  Gann considered 144 his most sacred number. This series includes divisions
                  and multiples: 18, 36, 48, 72, 144, 288 - applied both as absolute values and percentages.
                </p>
                {centerPrice && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-red-400 font-bold mb-3">Resistances</h3>
                      <div className="space-y-2">
                        {gannAdvanced.series144
                          .filter((l) => l.type === 'resistance')
                          .map((level, i) => (
                            <div key={i} className="flex justify-between p-2 bg-red-500/10 rounded border border-red-500/30">
                              <span className="text-terminal-muted">{level.source}</span>
                              <span className="text-red-400 font-bold">${level.price.toFixed(2)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-green-400 font-bold mb-3">Supports</h3>
                      <div className="space-y-2">
                        {gannAdvanced.series144
                          .filter((l) => l.type === 'support')
                          .map((level, i) => (
                            <div key={i} className="flex justify-between p-2 bg-green-500/10 rounded border border-green-500/30">
                              <span className="text-terminal-muted">{level.source}</span>
                              <span className="text-green-400 font-bold">${level.price.toFixed(2)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Time Cycles */}
            {activeModule === 'timeCycles' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">⏰ Gann Time Cycles</h2>
                <p className="text-terminal-muted mb-6">
                  Gann&apos;s sacred time cycles based on natural divisions: 7, 14, 21, 28, 30, 45, 49,
                  52, 72, 90, 144, 180, 288, 360 days and more.
                </p>
                {timeCycles.upcomingCycles.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-gold-500 font-bold">Upcoming Cycle Dates</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {timeCycles.upcomingCycles.map((cycle, i) => (
                        <div
                          key={i}
                          className={`p-4 rounded-lg border ${
                            cycle.significance === 'high'
                              ? 'bg-gold-500/10 border-gold-500'
                              : cycle.significance === 'medium'
                              ? 'bg-blue-500/10 border-blue-500/50'
                              : 'bg-terminal-card border-terminal-border'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-white">{cycle.name}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              cycle.significance === 'high'
                                ? 'bg-gold-500 text-black'
                                : 'bg-terminal-border text-terminal-muted'
                            }`}>
                              {cycle.significance}
                            </span>
                          </div>
                          <div className="text-terminal-muted text-sm">
                            {cycle.date.toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-gold-500 font-bold mt-1">
                            {cycle.daysRemaining} days remaining
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Price-Time Squaring */}
            {activeModule === 'priceTime' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">📐 Price-Time Squaring</h2>
                <p className="text-terminal-muted mb-6">
                  When √Price × Factor = Days from swing, price and time are &quot;squared&quot;.
                  These moments often produce significant market reversals.
                </p>
                {timeCycles.nextSquareDates.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-gold-500 font-bold">Next Price-Time Square Dates</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {timeCycles.nextSquareDates.map((sq, i) => (
                        <div key={i} className="p-4 bg-gold-500/10 rounded-lg border border-gold-500/50">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-white">Factor {sq.factor}×</span>
                            <span className="text-gold-500 text-sm">
                              √{centerPrice?.toFixed(0)} × {sq.factor} = {sq.daysFromSwing} days
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-gold-500">
                            {sq.date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-terminal-muted text-sm mt-1">
                            Expected: Strong {swingType === 'low' ? 'Resistance' : 'Support'} / Reversal
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Time Angles */}
                    <h3 className="text-gold-500 font-bold mt-6">Current Time Angles</h3>
                    <div className="grid md:grid-cols-3 gap-3">
                      {timeCycles.getTimeAngles(centerPrice || 0).map((angle, i) => (
                        <div key={i} className="p-3 bg-terminal-card rounded-lg border border-terminal-border">
                          <div className="flex justify-between">
                            <span className="text-white font-bold">{angle.name}</span>
                            <span className="text-terminal-muted">{angle.ratio}</span>
                          </div>
                          <div className="text-gold-500 font-bold text-lg">
                            ${angle.expectedPrice.toFixed(2)}
                          </div>
                          <div className={`text-xs ${
                            angle.currentDeviation < 1 ? 'text-green-400' :
                            angle.currentDeviation < 3 ? 'text-gold-500' : 'text-terminal-muted'
                          }`}>
                            Deviation: {angle.currentDeviation}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!centerPrice && (
              <div className="text-center py-8 text-terminal-muted">
                Enter a price above to see calculations
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
