'use client'

import { useEffect, useRef, useState } from 'react'
import { GannLevels, getAllLevels } from '@/lib/gann'

interface GannCosmogramProps {
  levels: GannLevels | null
}

export default function GannCosmogram({ levels }: GannCosmogramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [hoveredLevel, setHoveredLevel] = useState<{ price: number; type: string; level: number } | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!levels || !canvasRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const container = containerRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const size = Math.min(container.clientWidth, 600)
    canvas.width = size
    canvas.height = size

    const centerX = size / 2
    const centerY = size / 2
    const maxRadius = (size / 2) - 40

    // Clear canvas
    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, size, size)

    // Draw grid pattern
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.05)'
    ctx.lineWidth = 1
    const gridSize = 30 * zoom
    for (let i = 0; i < size; i += gridSize) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, size)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(size, i)
      ctx.stroke()
    }

    // Draw diagonal lines
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.1)'
    ctx.lineWidth = 1

    // Main diagonals
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(size, size)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(size, 0)
    ctx.lineTo(0, size)
    ctx.stroke()

    // Additional diagonals at 45 degrees intervals
    const diagonalAngles = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5]
    diagonalAngles.forEach(angle => {
      const rad = (angle * Math.PI) / 180
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX + Math.cos(rad) * maxRadius * 1.5, centerY + Math.sin(rad) * maxRadius * 1.5)
      ctx.stroke()
    })

    // Draw vertical and horizontal lines through center
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.15)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(centerX, 0)
    ctx.lineTo(centerX, size)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, centerY)
    ctx.lineTo(size, centerY)
    ctx.stroke()

    // Get all levels
    const allLevels = getAllLevels(levels)
    const priceRange = Math.max(...levels.resistances) - Math.min(...levels.supports)

    // Draw concentric circles for each level
    allLevels.forEach((levelData, index) => {
      const normalizedDistance = Math.abs(levelData.price - levels.centerPrice) / (priceRange / 2)
      const radius = normalizedDistance * maxRadius * zoom

      if (radius > 0 && radius < maxRadius * 1.2) {
        // Circle color based on type
        if (levelData.type === 'resistance') {
          ctx.strokeStyle = `rgba(239, 68, 68, ${0.3 + (index * 0.05)})`
        } else if (levelData.type === 'support') {
          ctx.strokeStyle = `rgba(34, 197, 94, ${0.3 + (index * 0.05)})`
        }

        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.stroke()

        // Draw price label
        ctx.fillStyle = levelData.type === 'resistance' ? '#ef4444' : '#22c55e'
        ctx.font = '10px JetBrains Mono'
        ctx.textAlign = 'left'
        ctx.fillText(`$${levelData.price.toFixed(0)}`, centerX + radius + 5, centerY)
      }
    })

    // Draw center point
    ctx.beginPath()
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#fbbf24'
    ctx.fill()
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw center price label
    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 14px JetBrains Mono'
    ctx.textAlign = 'center'
    ctx.fillText(`$${levels.centerPrice.toFixed(2)}`, centerX, centerY + 25)

    // Draw cardinal markers
    const cardinals = ['N', 'E', 'S', 'W']
    const cardinalPositions = [
      { x: centerX, y: 20 },
      { x: size - 20, y: centerY },
      { x: centerX, y: size - 10 },
      { x: 15, y: centerY },
    ]
    ctx.fillStyle = 'rgba(251, 191, 36, 0.5)'
    ctx.font = 'bold 12px JetBrains Mono'
    ctx.textAlign = 'center'
    cardinals.forEach((cardinal, i) => {
      ctx.fillText(cardinal, cardinalPositions[i].x, cardinalPositions[i].y)
    })

  }, [levels, zoom])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!levels || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMousePos({ x: e.clientX, y: e.clientY })

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const maxRadius = (canvas.width / 2) - 40

    // Calculate distance from center
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))

    // Find closest level
    const allLevels = getAllLevels(levels)
    const priceRange = Math.max(...levels.resistances) - Math.min(...levels.supports)

    let closestLevel = null
    let minDiff = Infinity

    allLevels.forEach(levelData => {
      const normalizedDistance = Math.abs(levelData.price - levels.centerPrice) / (priceRange / 2)
      const levelRadius = normalizedDistance * maxRadius * zoom
      const diff = Math.abs(distance - levelRadius)

      if (diff < 15 && diff < minDiff) {
        minDiff = diff
        closestLevel = levelData
      }
    })

    setHoveredLevel(closestLevel)
  }

  if (!levels) {
    return (
      <div className="card-terminal flex items-center justify-center h-96">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-terminal-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-terminal-muted">Calculate levels to view the cosmogram</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-terminal">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gold-500 font-semibold text-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Gann Cosmogram
        </h3>

        {/* Zoom controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
            className="p-2 bg-terminal-bg border border-terminal-border rounded hover:border-gold-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-terminal-muted text-sm w-16 text-center">{(zoom * 100).toFixed(0)}%</span>
          <button
            onClick={() => setZoom(z => Math.min(2, z + 0.1))}
            className="p-2 bg-terminal-bg border border-terminal-border rounded hover:border-gold-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <div ref={containerRef} className="relative flex justify-center">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredLevel(null)}
          className="cursor-crosshair rounded-lg"
        />

        {/* Hover tooltip */}
        {hoveredLevel && (
          <div
            className="fixed z-50 bg-terminal-card border border-gold-500 rounded-lg px-3 py-2 pointer-events-none"
            style={{
              left: mousePos.x + 15,
              top: mousePos.y + 15,
            }}
          >
            <div className={`font-semibold ${hoveredLevel.type === 'resistance' ? 'text-red-400' : hoveredLevel.type === 'support' ? 'text-green-400' : 'text-gold-500'}`}>
              {hoveredLevel.type === 'center' ? 'Center' : hoveredLevel.type === 'resistance' ? `R${hoveredLevel.level}` : `S${Math.abs(hoveredLevel.level)}`}
            </div>
            <div className="text-white font-mono">${hoveredLevel.price.toFixed(2)}</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <span className="text-terminal-muted">Resistance</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-terminal-muted">Support</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-gold-500 mr-2"></div>
          <span className="text-terminal-muted">Center</span>
        </div>
      </div>
    </div>
  )
}
