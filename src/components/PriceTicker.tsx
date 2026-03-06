'use client'

import { useEffect, useState, useRef } from 'react'

const ITEMS = [
  { symbol: 'BTC/USD',  binance: 'BTCUSDT',  flag: '₿',  color: '#f7931a' },
  { symbol: 'ETH/USD',  binance: 'ETHUSDT',  flag: 'Ξ',  color: '#627eea' },
  { symbol: 'EUR/USD',  binance: null,        flag: '🇪🇺', color: '#4a90e2' },
  { symbol: 'GBP/USD',  binance: null,        flag: '🇬🇧', color: '#cf142b' },
  { symbol: 'USD/JPY',  binance: null,        flag: '🇯🇵', color: '#bc002d' },
  { symbol: 'XAU/USD',  binance: null,        flag: '🥇', color: '#c9a227' },
  { symbol: 'XAG/USD',  binance: null,        flag: '🥈', color: '#aaaaaa' },
  { symbol: 'S&P 500',  binance: null,        flag: '📊', color: '#26a69a' },
  { symbol: 'NASDAQ',   binance: null,        flag: '🖥️', color: '#7e57c2' },
  { symbol: 'SOL/USD',  binance: 'SOLUSDT',  flag: '◎',  color: '#9945ff' },
]

type PriceMap = Record<string, { price: string; change: number }>

export default function PriceTicker() {
  const [prices, setPrices] = useState<PriceMap>({})
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function fetchPrices() {
      try {
        const binanceSymbols = ITEMS.filter(i => i.binance).map(i => i.binance as string)
        const qs = encodeURIComponent(JSON.stringify(binanceSymbols))
        const res = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbols=${qs}`,
          { cache: 'no-store' }
        )
        if (!res.ok) return
        const data: { symbol: string; lastPrice: string; priceChangePercent: string }[] = await res.json()
        const map: PriceMap = {}
        for (const d of data) {
          const item = ITEMS.find(i => i.binance === d.symbol)
          if (!item) continue
          const price = parseFloat(d.lastPrice)
          const formatted = price > 1000
            ? price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : price.toFixed(4)
          map[item.symbol] = {
            price: formatted,
            change: parseFloat(d.priceChangePercent),
          }
        }
        setPrices(prev => ({ ...prev, ...map }))
      } catch {}
    }

    fetchPrices()
    intervalRef.current = setInterval(fetchPrices, 15000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const items = ITEMS.map(item => ({
    ...item,
    priceStr: prices[item.symbol]?.price ?? '···',
    change:   prices[item.symbol]?.change ?? null,
  }))

  // Duplicate for seamless loop
  const row = [...items, ...items]

  return (
    <div
      className="w-full overflow-hidden border-b border-gray-800/60"
      style={{ backgroundColor: '#080808', height: '44px' }}
    >
      <div className="flex items-center h-full" style={{ position: 'relative' }}>
        {/* Fade edges */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-full w-16 z-10"
          style={{ background: 'linear-gradient(to right, #080808, transparent)' }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-16 z-10"
          style={{ background: 'linear-gradient(to left, #080808, transparent)' }}
        />

        {/* Scrolling track */}
        <div className="flex animate-ticker whitespace-nowrap">
          {row.map((item, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1.5 px-5 shrink-0"
              style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-base leading-none">{item.flag}</span>
              <span className="text-gray-400 text-xs font-medium tracking-wide">{item.symbol}</span>
              <span
                className="text-xs font-mono font-semibold"
                style={{ color: item.color }}
              >
                {item.priceStr}
              </span>
              {item.change !== null && (
                <span
                  className="text-xs font-medium"
                  style={{ color: item.change >= 0 ? '#26a69a' : '#ef5350' }}
                >
                  {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
