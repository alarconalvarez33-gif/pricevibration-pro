'use client'

import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ExnessBanner from '@/components/ExnessBanner'
import { useAstrology, ZODIAC_SIGNS, ASPECT_CONFIG } from '@/hooks/useAstrology'

export default function AstrologyPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { planets, aspects, majorAspects, times } = useAstrology()
  const [hoveredPlanet, setHoveredPlanet] = useState<typeof planets[0] | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [showOrbits, setShowOrbits] = useState(true)
  const [showAspects, setShowAspects] = useState(true)
  const [viewMode, setViewMode] = useState<'helio' | 'zodiac'>('helio')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || planets.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = canvas.width
    const center = size / 2
    const maxRadius = center - 40

    // Clear canvas
    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, size, size)

    // Draw zodiac ring
    const zodiacOuterR = maxRadius
    const zodiacInnerR = maxRadius - 30

    // Draw zodiac background segments
    ZODIAC_SIGNS.forEach((sign, i) => {
      const startAngle = (sign.start - 90) * Math.PI / 180
      const endAngle = (sign.start + 30 - 90) * Math.PI / 180

      ctx.beginPath()
      ctx.arc(center, center, zodiacOuterR, startAngle, endAngle)
      ctx.arc(center, center, zodiacInnerR, endAngle, startAngle, true)
      ctx.closePath()
      ctx.fillStyle = i % 2 === 0 ? 'rgba(240, 185, 11, 0.05)' : 'rgba(240, 185, 11, 0.02)'
      ctx.fill()

      // Sign symbol
      const midAngle = (sign.start + 15 - 90) * Math.PI / 180
      const symbolR = (zodiacOuterR + zodiacInnerR) / 2
      const sx = center + Math.cos(midAngle) * symbolR
      const sy = center + Math.sin(midAngle) * symbolR

      ctx.font = '14px serif'
      ctx.fillStyle = '#f0b90b'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(sign.symbol, sx, sy)
    })

    // Draw zodiac ring border
    ctx.beginPath()
    ctx.arc(center, center, zodiacOuterR, 0, Math.PI * 2)
    ctx.strokeStyle = '#f0b90b'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(center, center, zodiacInnerR, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(240, 185, 11, 0.5)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw sign divisions
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * Math.PI / 180
      ctx.beginPath()
      ctx.moveTo(center + Math.cos(angle) * zodiacInnerR, center + Math.sin(angle) * zodiacInnerR)
      ctx.lineTo(center + Math.cos(angle) * zodiacOuterR, center + Math.sin(angle) * zodiacOuterR)
      ctx.strokeStyle = 'rgba(240, 185, 11, 0.3)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    if (viewMode === 'helio') {
      // Heliocentric view - draw orbits
      if (showOrbits) {
        const maxAU = 40 // Pluto's approximate distance
        planets.forEach((planet) => {
          const orbitR = (planet.distanceAU / maxAU) * (zodiacInnerR - 20)
          ctx.beginPath()
          ctx.arc(center, center, orbitR, 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(240, 185, 11, 0.1)'
          ctx.lineWidth = 1
          ctx.stroke()
        })
      }

      // Draw Sun at center
      ctx.beginPath()
      ctx.arc(center, center, 12, 0, Math.PI * 2)
      const sunGradient = ctx.createRadialGradient(center, center, 0, center, center, 12)
      sunGradient.addColorStop(0, '#fff7b0')
      sunGradient.addColorStop(0.5, '#f0b90b')
      sunGradient.addColorStop(1, '#b88a00')
      ctx.fillStyle = sunGradient
      ctx.fill()

      // Draw aspects between planets
      if (showAspects) {
        majorAspects.forEach((aspect) => {
          const p1 = planets.find((p) => p.name === aspect.planet1)
          const p2 = planets.find((p) => p.name === aspect.planet2)
          if (!p1 || !p2) return

          const maxAU = 40
          const r1 = (p1.distanceAU / maxAU) * (zodiacInnerR - 20)
          const r2 = (p2.distanceAU / maxAU) * (zodiacInnerR - 20)
          const angle1 = (p1.degree - 90) * Math.PI / 180
          const angle2 = (p2.degree - 90) * Math.PI / 180

          const x1 = center + Math.cos(angle1) * r1
          const y1 = center + Math.sin(angle1) * r1
          const x2 = center + Math.cos(angle2) * r2
          const y2 = center + Math.sin(angle2) * r2

          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.strokeStyle = aspect.type === 'conjunction' ? '#00ff88' :
            aspect.type === 'opposition' ? '#ff3e3e' :
            aspect.type === 'trine' ? '#4169E1' :
            aspect.type === 'square' ? '#FFA500' : '#888'
          ctx.lineWidth = aspect.isExact ? 2 : 1
          ctx.globalAlpha = 0.5
          ctx.stroke()
          ctx.globalAlpha = 1
        })
      }

      // Draw planets at their orbital positions
      const maxAU = 40
      planets.forEach((planet) => {
        const orbitR = (planet.distanceAU / maxAU) * (zodiacInnerR - 20)
        const angle = (planet.degree - 90) * Math.PI / 180
        const x = center + Math.cos(angle) * orbitR
        const y = center + Math.sin(angle) * orbitR

        // Planet circle
        ctx.beginPath()
        ctx.arc(x, y, 10, 0, Math.PI * 2)
        ctx.fillStyle = planet.color
        ctx.fill()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1
        ctx.stroke()

        // Planet symbol
        ctx.font = 'bold 10px serif'
        ctx.fillStyle = '#000'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(planet.symbol, x, y)
      })
    } else {
      // Zodiac view - all planets on same radius
      const planetR = zodiacInnerR - 50

      // Draw aspects
      if (showAspects) {
        majorAspects.forEach((aspect) => {
          const p1 = planets.find((p) => p.name === aspect.planet1)
          const p2 = planets.find((p) => p.name === aspect.planet2)
          if (!p1 || !p2) return

          const angle1 = (p1.degree - 90) * Math.PI / 180
          const angle2 = (p2.degree - 90) * Math.PI / 180

          const x1 = center + Math.cos(angle1) * planetR
          const y1 = center + Math.sin(angle1) * planetR
          const x2 = center + Math.cos(angle2) * planetR
          const y2 = center + Math.sin(angle2) * planetR

          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.strokeStyle = aspect.type === 'conjunction' ? '#00ff88' :
            aspect.type === 'opposition' ? '#ff3e3e' :
            aspect.type === 'trine' ? '#4169E1' :
            aspect.type === 'square' ? '#FFA500' : '#888'
          ctx.lineWidth = aspect.isExact ? 2 : 1
          ctx.globalAlpha = 0.4
          ctx.stroke()
          ctx.globalAlpha = 1
        })
      }

      // Draw planets
      planets.forEach((planet) => {
        const angle = (planet.degree - 90) * Math.PI / 180
        const x = center + Math.cos(angle) * planetR
        const y = center + Math.sin(angle) * planetR

        // Line to zodiac
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(
          center + Math.cos(angle) * zodiacInnerR,
          center + Math.sin(angle) * zodiacInnerR
        )
        ctx.strokeStyle = planet.color + '40'
        ctx.lineWidth = 1
        ctx.stroke()

        // Planet circle
        ctx.beginPath()
        ctx.arc(x, y, 12, 0, Math.PI * 2)
        ctx.fillStyle = planet.color
        ctx.fill()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1
        ctx.stroke()

        // Symbol
        ctx.font = 'bold 11px serif'
        ctx.fillStyle = '#000'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(planet.symbol, x, y)
      })
    }

  }, [planets, showOrbits, showAspects, viewMode, majorAspects])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY
    setMousePos({ x: e.clientX, y: e.clientY })

    const center = canvas.width / 2
    const maxAU = 40
    const zodiacInnerR = center - 40 - 30

    let found: typeof planets[0] | null = null
    for (const planet of planets) {
      let px: number, py: number

      if (viewMode === 'helio') {
        const orbitR = (planet.distanceAU / maxAU) * (zodiacInnerR - 20)
        const angle = (planet.degree - 90) * Math.PI / 180
        px = center + Math.cos(angle) * orbitR
        py = center + Math.sin(angle) * orbitR
      } else {
        const planetR = zodiacInnerR - 50
        const angle = (planet.degree - 90) * Math.PI / 180
        px = center + Math.cos(angle) * planetR
        py = center + Math.sin(angle) * planetR
      }

      const dist = Math.sqrt(Math.pow(x - px, 2) + Math.pow(y - py, 2))
      if (dist < 15) {
        found = planet
        break
      }
    }
    setHoveredPlanet(found)
  }

  return (
    <main className="min-h-screen bg-terminal-bg">
      <Navbar />

      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Exness Partner Banner */}
          <div className="mb-6">
            <ExnessBanner />
          </div>

          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                <span className="text-gold-500">Heliocentric</span> Planetary Chart
              </h1>
              <p className="text-terminal-muted">
                Real-time heliocentric planetary positions - View from the Sun
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-terminal-muted text-sm">UTC Time</div>
                <div className="text-gold-500 font-mono text-lg">{times.utc}</div>
              </div>
              <div className="text-right">
                <div className="text-terminal-muted text-sm">Local ({times.timezone})</div>
                <div className="text-white font-mono text-lg">{times.local}</div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chart Column */}
            <div className="lg:col-span-2">
              <div className="card-terminal">
                {/* Controls */}
                <div className="flex flex-wrap gap-4 mb-4 items-center justify-between">
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOrbits}
                        onChange={(e) => setShowOrbits(e.target.checked)}
                        className="w-4 h-4 accent-gold-500"
                      />
                      <span className="text-sm text-terminal-muted">Show Orbits</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showAspects}
                        onChange={(e) => setShowAspects(e.target.checked)}
                        className="w-4 h-4 accent-gold-500"
                      />
                      <span className="text-sm text-terminal-muted">Show Aspects</span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('helio')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        viewMode === 'helio'
                          ? 'bg-gold-500 text-black'
                          : 'bg-terminal-bg text-terminal-muted hover:text-white'
                      }`}
                    >
                      Heliocentric
                    </button>
                    <button
                      onClick={() => setViewMode('zodiac')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        viewMode === 'zodiac'
                          ? 'bg-gold-500 text-black'
                          : 'bg-terminal-bg text-terminal-muted hover:text-white'
                      }`}
                    >
                      Zodiac Wheel
                    </button>
                  </div>
                </div>

                {/* Canvas */}
                <div className="flex justify-center relative">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={500}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoveredPlanet(null)}
                    className="max-w-full cursor-crosshair"
                  />

                  {/* Tooltip */}
                  {hoveredPlanet && (
                    <div
                      className="fixed z-50 bg-terminal-card border border-gold-500 rounded-lg px-4 py-3 pointer-events-none shadow-lg"
                      style={{ left: mousePos.x + 15, top: mousePos.y + 15 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span style={{ color: hoveredPlanet.color }} className="text-2xl">
                          {hoveredPlanet.symbol}
                        </span>
                        <span className="font-semibold text-white text-lg">{hoveredPlanet.name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <div className="text-terminal-muted">Longitude:</div>
                        <div className="text-gold-500 font-mono">{hoveredPlanet.degree.toFixed(2)}°</div>
                        <div className="text-terminal-muted">Sign:</div>
                        <div className="text-white">{hoveredPlanet.signSymbol} {hoveredPlanet.sign}</div>
                        <div className="text-terminal-muted">In Sign:</div>
                        <div className="text-white">{hoveredPlanet.degreeInSign.toFixed(2)}°</div>
                        <div className="text-terminal-muted">Distance:</div>
                        <div className="text-white">{hoveredPlanet.distanceAU.toFixed(2)} AU</div>
                        <div className="text-terminal-muted">Orbit:</div>
                        <div className="text-white">{hoveredPlanet.orbitDays.toFixed(0)} days</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-0.5 bg-[#00ff88]"></div>
                    <span className="text-terminal-muted">Conjunction</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-0.5 bg-[#ff3e3e]"></div>
                    <span className="text-terminal-muted">Opposition</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-0.5 bg-[#4169E1]"></div>
                    <span className="text-terminal-muted">Trine</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-0.5 bg-[#FFA500]"></div>
                    <span className="text-terminal-muted">Square</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Planet Positions */}
              <div className="card-terminal">
                <h3 className="text-gold-500 font-semibold mb-4">Planetary Positions</h3>
                <div className="space-y-2">
                  {planets.map(planet => (
                    <div
                      key={planet.name}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-terminal-bg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span style={{ color: planet.color }} className="text-xl">{planet.symbol}</span>
                        <span className="text-white text-sm">{planet.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-gold-500 font-mono text-sm">{planet.degree.toFixed(2)}°</div>
                        <div className="text-terminal-muted text-xs">{planet.signSymbol} {planet.degreeInSign.toFixed(1)}°</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
 {/* Major Aspects */}
              <div className="card-terminal">
                <h3 className="text-gold-500 font-semibold mb-4">Current Aspects</h3>
                {majorAspects.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {majorAspects.slice(0, 10).map((aspect, i) => {
                      const config = ASPECT_CONFIG[aspect.type]
                      return (
                        <div
                          key={i}
                          className={`p-2 rounded-lg border ${
                            aspect.isExact ? 'border-gold-500 bg-gold-500/10' : 'border-terminal-border'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white text-sm">
                              {aspect.planet1} {config.symbol} {aspect.planet2}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              aspect.isExact ? 'bg-gold-500 text-black' : 'bg-terminal-border text-terminal-muted'
                            }`}>
                              {aspect.orb.toFixed(1)}°
                            </span>
                          </div>
                          <div className="text-terminal-muted text-xs mt-1 capitalize">
                            {aspect.type} ({aspect.angle.toFixed(1)}°)
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-terminal-muted text-sm">No major aspects within orb</p>
                )}
              </div>

              {/* Exness Partner Banner */}
              <ExnessBanner />
            </div>
          </div>

          {/* Bottom Exness Banner */}
          <div className="mt-8">
            <ExnessBanner />
          </div>
        </div>
      </div>
             

      <Footer />
    </main>
  )
}
