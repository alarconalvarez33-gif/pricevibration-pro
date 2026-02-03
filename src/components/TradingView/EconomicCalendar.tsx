'use client'

import { useEffect, useRef, memo } from 'react'

interface EconomicCalendarProps {
  width?: string | number
  height?: number
  colorTheme?: 'dark' | 'light'
  currencyFilter?: string
  importanceFilter?: '-1,0,1' | '0,1' | '1'
}

function EconomicCalendar({
  width = '100%',
  height = 400,
  colorTheme = 'dark',
  currencyFilter = 'USD,EUR,GBP,JPY,CHF,AUD,CAD,NZD',
  importanceFilter = '-1,0,1'
}: EconomicCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js'
    script.type = 'text/javascript'
    script.async = true

    script.innerHTML = JSON.stringify({
      width,
      height,
      colorTheme,
      isTransparent: true,
      locale: 'en',
      importanceFilter,
      currencyFilter
    })

    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [colorTheme, height, width, currencyFilter, importanceFilter])

  return (
    <div className="tradingview-widget-container rounded-lg overflow-hidden border border-terminal-border">
      <div ref={containerRef} style={{ height, width }} />
    </div>
  )
}

export default memo(EconomicCalendar)
