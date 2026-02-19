'use client'

import { useState, useEffect } from 'react'

// Base: 432 usuarios activos al 2026-02-19
// Aumenta 2 cada 2 días
const BASE_COUNT = 432
const BASE_DATE = new Date('2026-02-19T00:00:00Z')

function getCurrentBase() {
  const msPerDay = 1000 * 60 * 60 * 24
  const daysSinceBase = Math.floor((Date.now() - BASE_DATE.getTime()) / msPerDay)
  return BASE_COUNT + Math.floor(daysSinceBase / 2) * 2
}

export default function OnlineCounter() {
  const [count, setCount] = useState(BASE_COUNT)

  useEffect(() => {
    const base = getCurrentBase()
    // Fluctúa ±20 alrededor del base actual
    setCount(Math.floor(Math.random() * 40) + base - 20)

    const interval = setInterval(() => {
      const b = getCurrentBase()
      setCount(prev => {
        const change = Math.floor(Math.random() * 5) + 1
        const direction = Math.random() > 0.5 ? 1 : -1
        const next = prev + change * direction
        return Math.max(b - 20, Math.min(b + 20, next))
      })
    }, Math.random() * 10000 + 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-terminal-card border border-terminal-border rounded-full">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gann-support opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-gann-support"></span>
      </span>
      <span className="text-sm text-terminal-muted">
        <span className="text-white font-semibold font-mono">{count}</span> traders online now
      </span>
    </div>
  )
}
