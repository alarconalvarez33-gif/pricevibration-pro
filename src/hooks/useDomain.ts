'use client'

import { useState, useEffect } from 'react'

export function useDomain() {
  const [isTrading, setIsTrading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTrading(window.location.hostname.includes('trading.com.py'))
    }
  }, [])

  return {
    logoSrc: isTrading ? '/logoreal2.png' : '/logosacred.png',
    siteTitle: isTrading
      ? 'Trading.com.py - Professional Trading Tools'
      : 'Sacred Levels - Gann Calculator',
    isTrading,
  }
}
