'use client'

import { useEffect, useRef, memo } from 'react'

interface TickerTapeProps {
  symbols?: Array<{
    proName: string
    title: string
  }>
  colorTheme?: 'dark' | 'light'
  displayMode?: 'adaptive' | 'regular' | 'compact'
}

function TickerTape({
  symbols = [
    { proName: 'OANDA:XAUUSD', title: 'Gold' },
    { proName: 'OANDA:XAGUSD', title: 'Silver' },
    { proName: 'FX:EURUSD', title: 'EUR/USD' },
    { proName: 'FX:GBPUSD', title: 'GBP/USD' },
    { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' },
    { proName: 'BITSTAMP:ETHUSD', title: 'Ethereum' },
    { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
    { proName: 'FOREXCOM:DJI', title: 'Dow Jones' },
  ],
  colorTheme = 'dark',
  displayMode = 'adaptive'
}: TickerTapeProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
    script.type = 'text/javascript'
    script.async = true

    script.innerHTML = JSON.stringify({
      symbols,
      showSymbolLogo: true,
      colorTheme,
      isTransparent: true,
      displayMode,
      locale: 'en'
    })

    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbols, colorTheme, displayMode])

  return (
    <div className="tradingview-widget-container border-b border-terminal-border bg-terminal-bg/50">
      <div ref={containerRef} />
    </div>
  )
}

export default memo(TickerTape)
