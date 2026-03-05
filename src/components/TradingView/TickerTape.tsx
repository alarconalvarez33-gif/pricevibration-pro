'use client'

import { useEffect, useRef, memo } from 'react'

interface TickerTapeProps {
  symbols?: Array<{ proName: string; title: string }>
  colorTheme?: 'dark' | 'light'
}

const DEFAULT_SYMBOLS = [
  { proName: 'OANDA:XAUUSD',   title: 'Gold' },
  { proName: 'OANDA:XAGUSD',   title: 'Silver' },
  { proName: 'FX:EURUSD',      title: 'EUR/USD' },
  { proName: 'FX:GBPUSD',      title: 'GBP/USD' },
  { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' },
  { proName: 'BITSTAMP:ETHUSD', title: 'Ethereum' },
  { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
  { proName: 'FOREXCOM:DJI',   title: 'Dow Jones' },
]

function TickerTape({
  symbols = DEFAULT_SYMBOLS,
  colorTheme = 'dark',
}: TickerTapeProps) {
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = widgetRef.current
    if (!container) return

    container.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbols,
      showSymbolLogo: false,
      isTransparent: true,
      displayMode: 'compact',
      colorTheme,
      locale: 'en',
    })

    container.appendChild(script)

    return () => {
      if (container) container.innerHTML = ''
    }
  }, [symbols, colorTheme])

  return (
    <div className="w-full bg-[#080c14] border-b border-white/5 overflow-hidden">
      <div className="tradingview-widget-container" style={{ height: '46px' }}>
        <div
          ref={widgetRef}
          className="tradingview-widget-container__widget"
          style={{ height: '46px' }}
        />
      </div>
    </div>
  )
}

export default memo(TickerTape)
