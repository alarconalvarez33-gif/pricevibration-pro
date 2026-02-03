'use client'

import { useEffect, useRef, memo } from 'react'

interface SymbolInfoProps {
  symbol?: string
  width?: string | number
  colorTheme?: 'dark' | 'light'
}

function SymbolInfo({
  symbol = 'OANDA:XAUUSD',
  width = '100%',
  colorTheme = 'dark'
}: SymbolInfoProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js'
    script.type = 'text/javascript'
    script.async = true

    script.innerHTML = JSON.stringify({
      symbol,
      width,
      locale: 'en',
      colorTheme,
      isTransparent: true
    })

    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbol, colorTheme, width])

  return (
    <div className="tradingview-widget-container">
      <div ref={containerRef} />
    </div>
  )
}

export default memo(SymbolInfo)
