'use client'

import { useEffect, useRef, memo } from 'react'

interface AdvancedChartProps {
  symbol?: string
  interval?: string
  theme?: 'dark' | 'light'
  width?: string | number
  height?: number
  onSymbolChange?: (symbol: string) => void
}

function AdvancedChart({
  symbol = 'OANDA:XAUUSD',
  interval = 'D',
  theme = 'dark',
  width = '100%',
  height = 500,
  onSymbolChange
}: AdvancedChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Limpiar contenedor
    containerRef.current.innerHTML = ''

    // Crear script del widget
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true

    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: interval,
      timezone: 'America/Asuncion',
      theme: theme,
      style: '1', // Candlestick
      locale: 'en',
      enable_publishing: false,
      backgroundColor: theme === 'dark' ? '#0a0a0f' : '#ffffff',
      gridColor: theme === 'dark' ? 'rgba(240, 185, 11, 0.06)' : 'rgba(0, 0, 0, 0.06)',
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: true,
      hide_volume: false,
      support_host: 'https://www.tradingview.com',
      container_id: 'tradingview-chart',
      studies: [
        'MASimple@tv-basicstudies', // SMA
      ],
      overrides: {
        'paneProperties.background': theme === 'dark' ? '#0a0a0f' : '#ffffff',
        'paneProperties.backgroundType': 'solid',
        'mainSeriesProperties.candleStyle.upColor': '#00ff88',
        'mainSeriesProperties.candleStyle.downColor': '#ff3e3e',
        'mainSeriesProperties.candleStyle.borderUpColor': '#00ff88',
        'mainSeriesProperties.candleStyle.borderDownColor': '#ff3e3e',
        'mainSeriesProperties.candleStyle.wickUpColor': '#00ff88',
        'mainSeriesProperties.candleStyle.wickDownColor': '#ff3e3e',
      }
    })

    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbol, interval, theme])

  return (
    <div className="tradingview-widget-container rounded-lg overflow-hidden border border-terminal-border">
      <div
        id="tradingview-chart"
        ref={containerRef}
        style={{ height: height, width: width }}
      />
    </div>
  )
}

export default memo(AdvancedChart)
