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
  const scriptRef = useRef<HTMLScriptElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Remove previous script if any
    if (scriptRef.current) {
      scriptRef.current.remove()
      scriptRef.current = null
    }

    const container = containerRef.current
    if (!container) return

    const script = document.createElement('script')
    script.type = 'text/javascript'
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

    container.appendChild(script)
    scriptRef.current = script

    return () => {
      script.remove()
      scriptRef.current = null
    }
  }, [colorTheme]) // only re-run if theme changes; symbols are stable

  return (
    <div
      className="w-full overflow-hidden border-b border-gray-800/50"
      style={{ backgroundColor: '#0a0a0a', minHeight: '46px' }}
    >
      <div
        className="tradingview-widget-container"
        ref={containerRef}
        style={{ width: '100%', height: '46px' }}
      >
        <div
          className="tradingview-widget-container__widget"
          style={{ width: '100%', height: '46px' }}
        />
      </div>
    </div>
  )
}

export default memo(TickerTape)
