'use client'

import { useEffect, useRef, memo } from 'react'

const DEFAULT_SYMBOLS = [
  { proName: 'OANDA:XAUUSD',    title: 'Gold' },
  { proName: 'OANDA:XAGUSD',    title: 'Silver' },
  { proName: 'FX:EURUSD',       title: 'EUR/USD' },
  { proName: 'FX:GBPUSD',       title: 'GBP/USD' },
  { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' },
  { proName: 'BITSTAMP:ETHUSD', title: 'Ethereum' },
  { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
  { proName: 'FOREXCOM:DJI',    title: 'Dow Jones' },
]

interface TickerTapeProps {
  symbols?: Array<{ proName: string; title: string }>
  colorTheme?: 'dark' | 'light'
}

function TickerTape({ symbols = DEFAULT_SYMBOLS, colorTheme = 'dark' }: TickerTapeProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.innerHTML = ''

    const widget = document.createElement('div')
    widget.className = 'tradingview-widget-container__widget'
    containerRef.current.appendChild(widget)

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbols,
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: 'adaptive',
      colorTheme,
      locale: 'es',
    })
    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [symbols, colorTheme])

  return (
    <div className="w-full bg-[#0a0a0a] border-b border-gray-800/50 overflow-hidden">
      <div className="tradingview-widget-container" ref={containerRef} />
    </div>
  )
}

export default memo(TickerTape)
