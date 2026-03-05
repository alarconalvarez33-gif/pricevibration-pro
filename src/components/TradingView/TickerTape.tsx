'use client'

import { memo } from 'react'

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
  // Build the TradingView embed URL with symbols
  const symbolsParam = encodeURIComponent(
    symbols.map(s => `${s.proName}|${s.title}`).join(',')
  )

  const src =
    `https://s.tradingview.com/embed-widget/ticker-tape/?locale=en` +
    `#%7B%22symbols%22%3A%5B` +
    symbols
      .map(s => `%7B%22proName%22%3A%22${encodeURIComponent(s.proName)}%22%2C%22title%22%3A%22${encodeURIComponent(s.title)}%22%7D`)
      .join('%2C') +
    `%5D%2C%22showSymbolLogo%22%3Atrue%2C%22isTransparent%22%3Atrue%2C%22displayMode%22%3A%22compact%22%2C%22colorTheme%22%3A%22${colorTheme}%22%2C%22locale%22%3A%22en%22%7D`

  return (
    <div className="w-full bg-[#0a0a0a] border-b border-gray-800/60 overflow-hidden">
      <iframe
        src={src}
        style={{ width: '100%', height: '46px', border: 'none', display: 'block' }}
        scrolling="no"
        allowTransparency={true}
        title="TradingView Ticker Tape"
      />
    </div>
  )
}

export default memo(TickerTape)
