'use client'

import { useEffect, useState } from 'react'

interface AdSlotProps {
  slot: string
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle'
  className?: string
}

// Skeleton loader para evitar CLS (Cumulative Layout Shift)
function AdSkeleton({ format }: { format: string }) {
  const heights: Record<string, string> = {
    horizontal: 'h-24',
    vertical: 'h-64',
    rectangle: 'h-64',
    auto: 'h-24 md:h-32',
  }

  return (
    <div className={`w-full ${heights[format]} bg-terminal-card/50 border border-terminal-border/30 rounded-lg animate-pulse flex items-center justify-center`}>
      <span className="text-terminal-muted text-xs">Ad Space</span>
    </div>
  )
}

export default function AdSlot({ slot, format = 'auto', className = '' }: AdSlotProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Cargar AdSense script si no está cargado
    if (typeof window !== 'undefined' && !window.adsbygoogle) {
      const script = document.createElement('script')
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
      script.async = true
      script.crossOrigin = 'anonymous'
      // Reemplaza con tu ID de cliente AdSense
      script.dataset.adClient = 'ca-pub-XXXXXXXXXXXXXXXX'
      document.head.appendChild(script)
    }

    // Pequeño delay para simular carga del ad
    const timer = setTimeout(() => setIsLoaded(true), 500)
    return () => clearTimeout(timer)
  }, [])

  if (!isClient) {
    return <AdSkeleton format={format} />
  }

  return (
    <div className={`ad-container ${className}`}>
      {!isLoaded && <AdSkeleton format={format} />}

      <div className={`${!isLoaded ? 'hidden' : ''}`}>
        {/*
          Para activar AdSense real:
          1. Reemplaza ca-pub-XXXXXXXXXXXXXXXX con tu ID
          2. Reemplaza data-ad-slot con el slot de tu anuncio
        */}
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />

        {/* Placeholder visual para desarrollo */}
        <div className="w-full bg-gradient-to-r from-terminal-card to-terminal-bg border border-dashed border-terminal-border rounded-lg p-4 text-center">
          <div className="text-terminal-muted text-xs mb-1">ADVERTISEMENT</div>
          <div className="text-gold-500/50 text-sm font-mono">
            AdSlot: {slot}
          </div>
          <div className="text-terminal-muted text-xs mt-1">
            {format === 'horizontal' && '728x90 / Responsive'}
            {format === 'vertical' && '160x600 / Responsive'}
            {format === 'rectangle' && '300x250 / Responsive'}
            {format === 'auto' && 'Auto Size'}
          </div>
        </div>
      </div>
    </div>
  )
}

// Declaración global para TypeScript
declare global {
  interface Window {
    adsbygoogle: any[]
  }
}
