'use client'

import { useEffect, useRef, memo } from 'react'

interface MiniChartProps {
  symbol?: string
  width?: string | number
  height?: number
  colorTheme?: 'dark' | 'light'
  dateRange?: '1D' | '1M' | '3M' | '12M' | '60M' | 'ALL'
  trendLineColor?: string
  underLineColor?: string
  underLineBottomColor?: string
}

function MiniChart({
  symbol = 'OANDA:XAUUSD',
  width = '100%',
  height = 220,
  colorTheme = 'dark',
  dateRange = '1M',
  trendLineColor = 'rgba(240, 185, 11, 1)',
  underLineColor = 'rgba(240, 185, 11, 0.3)',
  underLineBottomColor = 'rgba(240, 185, 11, 0)'
}: MiniChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js'
    script.type = 'text/javascript'
    script.async = true

    script.innerHTML = JSON.stringify({
      symbol,
      width,
      height,
      locale: 'en',
      dateRange,
      colorTheme,
      trendLineColor,
      underLineColor,
      underLineBottomColor,
      isTransparent: true,
      autosize: false,
      largeChartUrl: ''
    })

    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbol, colorTheme, dateRange, height, width, trendLineColor, underLineColor, underLineBottomColor])

  return (
    <div className="tradingview-widget-container rounded-lg overflow-hidden border border-terminal-border">
      <div ref={containerRef} style={{ height, width }} />
    </div>
  )
}

export default memo(MiniChart)
