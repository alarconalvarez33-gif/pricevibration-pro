'use client'

import { useEffect, useRef, useState } from 'react'
import { Planet, ZODIAC_SIGNS } from '@/lib/astro'

interface ZodiacWheelProps {
  planets: Planet[]
  size?: number
}

export default function ZodiacWheel({ planets, size = 400 }: ZodiacWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredPlanet, setHoveredPlanet] = useState<Planet | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = size / 2
    const centerY = size / 2
    const outerRadius = size / 2 - 20
    const innerRadius = outerRadius * 0.7
    const planetRadius = outerRadius * 0.55

    // Clear canvas
    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, size, size)

    // Draw outer ring (zodiac signs)
    ctx.beginPath()
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2)
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw inner ring
    ctx.beginPath()
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw zodiac sign divisions
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * Math.PI / 180
      const x1 = centerX + Math.cos(angle) * innerRadius
      const y1 = centerY + Math.sin(angle) * innerRadius
      const x2 = centerX + Math.cos(angle) * outerRadius
      const y2 = centerY + Math.sin(angle) * outerRadius

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Draw zodiac symbols
      const symbolAngle = ((i * 30) + 15 - 90) * Math.PI / 180
      const symbolRadius = (innerRadius + outerRadius) / 2
      const symbolX = centerX + Math.cos(symbolAngle) * symbolRadius
      const symbolY = centerY + Math.sin(symbolAngle) * symbolRadius

      ctx.font = '16px serif'
      ctx.fillStyle = getElementColor(ZODIAC_SIGNS[i].element)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(ZODIAC_SIGNS[i].symbol, symbolX, symbolY)
    }

    // Draw aspect lines between planets
    ctx.globalAlpha = 0.3
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const p1 = planets[i]
        const p2 = planets[j]

        let diff = Math.abs(p1.longitude - p2.longitude)
        if (diff > 180) diff = 360 - diff

        // Check for major aspects
        const aspects = [
          { angle: 0, color: '#fbbf24', orb: 8 },    // conjunction
          { angle: 60, color: '#22c55e', orb: 6 },   // sextile
          { angle: 90, color: '#ef4444', orb: 8 },   // square
          { angle: 120, color: '#22c55e', orb: 8 },  // trine
          { angle: 180, color: '#ef4444', orb: 8 },  // opposition
        ]

        for (const aspect of aspects) {
          if (Math.abs(diff - aspect.angle) <= aspect.orb) {
            const angle1 = (p1.longitude - 90) * Math.PI / 180
            const angle2 = (p2.longitude - 90) * Math.PI / 180
            const x1 = centerX + Math.cos(angle1) * planetRadius
            const y1 = centerY + Math.sin(angle1) * planetRadius
            const x2 = centerX + Math.cos(angle2) * planetRadius
            const y2 = centerY + Math.sin(angle2) * planetRadius

            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.strokeStyle = aspect.color
            ctx.lineWidth = 1
            ctx.stroke()
            break
          }
        }
      }
    }
    ctx.globalAlpha = 1

    // Draw planets
    planets.forEach(planet => {
      const angle = (planet.longitude - 90) * Math.PI / 180
      const x = centerX + Math.cos(angle) * planetRadius
      const y = centerY + Math.sin(angle) * planetRadius

      // Planet circle
      ctx.beginPath()
      ctx.arc(x, y, 12, 0, Math.PI * 2)
      ctx.fillStyle = planet.color
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1
      ctx.stroke()

      // Planet symbol
      ctx.font = 'bold 14px serif'
      ctx.fillStyle = planet.name === 'Sun' ? '#000' : '#fff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(planet.symbol, x, y)
    })

    // Draw center point
    ctx.beginPath()
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#fbbf24'
    ctx.fill()

  }, [planets, size])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMousePos({ x: e.clientX, y: e.clientY })

    const centerX = size / 2
    const centerY = size / 2
    const planetRadius = (size / 2 - 20) * 0.55

    // Check if hovering over a planet
    let found: Planet | null = null
    for (const planet of planets) {
      const angle = (planet.longitude - 90) * Math.PI / 180
      const px = centerX + Math.cos(angle) * planetRadius
      const py = centerY + Math.sin(angle) * planetRadius

      const dist = Math.sqrt(Math.pow(x - px, 2) + Math.pow(y - py, 2))
      if (dist < 15) {
        found = planet
        break
      }
    }
    setHoveredPlanet(found)
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredPlanet(null)}
        className="cursor-crosshair"
      />

      {hoveredPlanet && (
        <div
          className="fixed z-50 bg-terminal-card border border-gold-500 rounded-lg px-3 py-2 pointer-events-none"
          style={{ left: mousePos.x + 15, top: mousePos.y + 15 }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: hoveredPlanet.color }} className="text-lg">
              {hoveredPlanet.symbol}
            </span>
            <span className="font-semibold text-white">{hoveredPlanet.name}</span>
          </div>
          <div className="text-sm text-terminal-muted">
            {hoveredPlanet.degree.toFixed(1)}° {hoveredPlanet.sign}
          </div>
          <div className="text-xs text-gold-500">
            {hoveredPlanet.longitude.toFixed(2)}° longitude
          </div>
        </div>
      )}
    </div>
  )
}

function getElementColor(element: string): string {
  switch (element) {
    case 'fire': return '#ef4444'
    case 'earth': return '#22c55e'
    case 'air': return '#fbbf24'
    case 'water': return '#3b82f6'
    default: return '#ffffff'
  }
}
