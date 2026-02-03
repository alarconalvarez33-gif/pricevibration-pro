'use client'

import { useState, useEffect } from 'react'

export default function OnlineCounter() {
  const [count, setCount] = useState(89)

  useEffect(() => {
    // Initial random count between 47-156
    setCount(Math.floor(Math.random() * (156 - 47 + 1)) + 47)

    // Update every 5-15 seconds
    const interval = setInterval(() => {
      setCount(prev => {
        // Randomly increase or decrease by 1-5
        const change = Math.floor(Math.random() * 5) + 1
        const direction = Math.random() > 0.5 ? 1 : -1
        const newCount = prev + (change * direction)
        // Keep within bounds
        return Math.max(47, Math.min(156, newCount))
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
