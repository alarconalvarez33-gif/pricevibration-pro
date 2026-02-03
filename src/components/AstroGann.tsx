'use client'

import { useState, useEffect } from 'react'
import {
  getPlanetaryPositions,
  calculateAspects,
  findUpcomingAspects,
  correlateAspectsWithGann,
  getAspectSignificance,
  Planet,
  Aspect,
  GannAstroCorrelation,
  ASPECT_SYMBOLS,
  ZODIAC_SIGNS
} from '@/lib/astro'
import { GannLevels } from '@/lib/gann'
import ZodiacWheel from './ZodiacWheel'

interface AstroGannProps {
  gannLevels: GannLevels | null
}

export default function AstroGann({ gannLevels }: AstroGannProps) {
  const [planets, setPlanets] = useState<Planet[]>([])
  const [aspects, setAspects] = useState<Aspect[]>([])
  const [upcomingAspects, setUpcomingAspects] = useState<Aspect[]>([])
  const [correlations, setCorrelations] = useState<GannAstroCorrelation[]>([])
  const [alerts, setAlerts] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'wheel' | 'aspects' | 'calendar' | 'alerts'>('wheel')

  useEffect(() => {
    // Calculate current positions
    const currentPlanets = getPlanetaryPositions()
    setPlanets(currentPlanets)

    // Calculate current aspects
    const currentAspects = calculateAspects(currentPlanets)
    setAspects(currentAspects)

    // Find upcoming aspects
    const upcoming = findUpcomingAspects(30)
    setUpcomingAspects(upcoming)

    // Generate alerts for exact aspects
    const newAlerts: string[] = []
    currentAspects.forEach(aspect => {
      if (aspect.exact) {
        newAlerts.push(`⚠️ EXACT: ${aspect.planet1} ${ASPECT_SYMBOLS[aspect.type]} ${aspect.planet2}`)
      }
    })
    setAlerts(newAlerts)
  }, [])

  useEffect(() => {
    if (gannLevels && aspects.length > 0) {
      const newCorrelations = correlateAspectsWithGann(
        aspects,
        gannLevels.centerPrice,
        gannLevels.resistances,
        gannLevels.supports
      )
      setCorrelations(newCorrelations)

      // Add alerts for high confluence
      const highConfluence = newCorrelations.filter(c => c.confluence === 'high')
      if (highConfluence.length > 0) {
        setAlerts(prev => [
          ...prev,
          ...highConfluence.map(c => `🎯 ${c.description}`)
        ])
      }
    }
  }, [gannLevels, aspects])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-terminal">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gold-500 font-semibold text-lg flex items-center">
            <span className="text-2xl mr-2">☿</span>
            Astro-Gann Module
          </h3>
          <div className="text-xs text-terminal-muted">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {[
            { id: 'wheel', label: 'Zodiac Wheel', icon: '☉' },
            { id: 'aspects', label: 'Aspects', icon: '☌' },
            { id: 'calendar', label: 'Calendar', icon: '📅' },
            { id: 'alerts', label: `Alerts (${alerts.length})`, icon: '🔔' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gold-500 text-black'
                  : 'bg-terminal-bg border border-terminal-border text-terminal-muted hover:border-gold-500'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'wheel' && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Zodiac Wheel */}
            <div className="flex justify-center">
              <ZodiacWheel planets={planets} size={350} />
            </div>

            {/* Planet Positions Table */}
            <div className="flex-1">
              <h4 className="text-white font-medium mb-3">Current Planetary Positions</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-terminal-muted border-b border-terminal-border">
                      <th className="text-left py-2">Planet</th>
                      <th className="text-left py-2">Sign</th>
                      <th className="text-left py-2">Degree</th>
                      <th className="text-left py-2">Longitude</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planets.map(planet => (
                      <tr key={planet.name} className="border-b border-terminal-border/50">
                        <td className="py-2">
                          <span style={{ color: planet.color }} className="mr-2">{planet.symbol}</span>
                          {planet.name}
                        </td>
                        <td className="py-2">
                          {ZODIAC_SIGNS.find(s => s.name === planet.sign)?.symbol} {planet.sign}
                        </td>
                        <td className="py-2 font-mono">{planet.degree.toFixed(1)}°</td>
                        <td className="py-2 font-mono text-terminal-muted">{planet.longitude.toFixed(2)}°</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'aspects' && (
          <div className="space-y-4">
            <h4 className="text-white font-medium">Current Planetary Aspects</h4>
            {aspects.length === 0 ? (
              <p className="text-terminal-muted">No significant aspects at this time.</p>
            ) : (
              <div className="grid gap-3">
                {aspects.map((aspect, i) => {
                  const sig = getAspectSignificance(aspect)
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border ${
                        aspect.exact
                          ? 'border-gold-500 bg-gold-500/10'
                          : 'border-terminal-border bg-terminal-bg'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{ASPECT_SYMBOLS[aspect.type]}</span>
                          <span className="font-medium">
                            {aspect.planet1} - {aspect.planet2}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            sig.impact === 'major' ? 'bg-red-500/20 text-red-400' :
                            sig.impact === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {sig.impact}
                          </span>
                        </div>
                        <div className={`text-sm ${
                          sig.direction === 'bullish' ? 'text-green-400' :
                          sig.direction === 'bearish' ? 'text-red-400' :
                          'text-terminal-muted'
                        }`}>
                          {sig.direction === 'bullish' ? '↑' : sig.direction === 'bearish' ? '↓' : '↔'} {sig.direction}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-terminal-muted">
                        {aspect.type.charAt(0).toUpperCase() + aspect.type.slice(1)} ({aspect.angle.toFixed(1)}°)
                        {aspect.exact && <span className="text-gold-500 ml-2">★ EXACT</span>}
                      </div>
                      <div className="mt-1 text-xs text-terminal-muted">{sig.description}</div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Gann Correlations */}
            {gannLevels && correlations.length > 0 && (
              <div className="mt-6">
                <h4 className="text-gold-500 font-medium mb-3">Gann Level Correlations</h4>
                <div className="grid gap-2">
                  {correlations.map((corr, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border ${
                        corr.confluence === 'high'
                          ? 'border-gold-500 bg-gold-500/10'
                          : 'border-terminal-border bg-terminal-bg'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{corr.description}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          corr.confluence === 'high' ? 'bg-gold-500/20 text-gold-400' :
                          corr.confluence === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {corr.confluence} confluence
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <h4 className="text-white font-medium">Upcoming Planetary Aspects (30 days)</h4>
            {upcomingAspects.length === 0 ? (
              <p className="text-terminal-muted">No exact aspects in the next 30 days.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-terminal-muted border-b border-terminal-border">
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Aspect</th>
                      <th className="text-left py-2">Planets</th>
                      <th className="text-left py-2">Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingAspects.slice(0, 15).map((aspect, i) => {
                      const sig = getAspectSignificance(aspect)
                      return (
                        <tr key={i} className="border-b border-terminal-border/50">
                          <td className="py-2">
                            {aspect.date?.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="py-2">
                            <span className="text-lg mr-2">{ASPECT_SYMBOLS[aspect.type]}</span>
                            {aspect.type}
                          </td>
                          <td className="py-2">{aspect.planet1} - {aspect.planet2}</td>
                          <td className="py-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              sig.impact === 'major' ? 'bg-red-500/20 text-red-400' :
                              sig.impact === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {sig.impact}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <h4 className="text-white font-medium">Active Alerts</h4>
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-terminal-muted">
                <span className="text-4xl mb-2 block">✓</span>
                No active alerts. Calculate Gann levels to see correlations.
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((alert, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-gold-500/10 border border-gold-500/30 text-gold-400"
                  >
                    {alert}
                  </div>
                ))}
              </div>
            )}

            {!gannLevels && (
              <div className="mt-4 p-4 bg-terminal-bg border border-terminal-border rounded-lg text-center">
                <p className="text-terminal-muted text-sm">
                  💡 Calculate Gann levels first to see astro-price correlations and confluence alerts.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-terminal text-center">
          <div className="text-2xl mb-1">☉</div>
          <div className="text-terminal-muted text-xs">Sun</div>
          <div className="text-white font-mono">
            {planets.find(p => p.name === 'Sun')?.degree.toFixed(0)}° {planets.find(p => p.name === 'Sun')?.sign.slice(0, 3)}
          </div>
        </div>
        <div className="card-terminal text-center">
          <div className="text-2xl mb-1">☽</div>
          <div className="text-terminal-muted text-xs">Moon</div>
          <div className="text-white font-mono">
            {planets.find(p => p.name === 'Moon')?.degree.toFixed(0)}° {planets.find(p => p.name === 'Moon')?.sign.slice(0, 3)}
          </div>
        </div>
        <div className="card-terminal text-center">
          <div className="text-2xl mb-1">☌</div>
          <div className="text-terminal-muted text-xs">Active Aspects</div>
          <div className="text-white font-mono">{aspects.length}</div>
        </div>
        <div className="card-terminal text-center">
          <div className="text-2xl mb-1">⚠️</div>
          <div className="text-terminal-muted text-xs">Alerts</div>
          <div className="text-gold-500 font-mono">{alerts.length}</div>
        </div>
      </div>
    </div>
  )
}
