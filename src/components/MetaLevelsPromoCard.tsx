'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const C = {
  bg:     '#0A0A0B',
  card:   '#141415',
  border: '#222222',
  cyan:   '#00E5FF',
  gold:   '#c9a227',
  muted:  '#555555',
} as const

export default function MetaLevelsPromoCard() {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.08 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      className="py-20 md:py-28 px-6"
      style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}
    >
      <div
        className="max-w-3xl mx-auto text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(28px)',
          transition: 'opacity 0.65s ease, transform 0.65s ease',
        }}
      >
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.cyan }} />
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.3em]"
            style={{ color: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            NUEVO · INDICADOR
          </span>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.cyan }} />
        </div>

        {/* Flyer */}
        <div
          className="mx-auto max-w-[500px] rounded-2xl overflow-hidden mb-8"
          style={{
            border: `1px solid ${C.gold}30`,
            boxShadow: `0 0 40px ${C.gold}12, 0 8px 32px rgba(0,0,0,0.5)`,
          }}
        >
          <Image
            src="/metalevels.png"
            alt="MetaLevels — Indicador Pine Script"
            width={500}
            height={500}
            className="w-full h-auto block"
          />
        </div>

        {/* Title */}
        <h2
          className="text-4xl sm:text-5xl font-bold text-white mb-3 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          MetaLevels
        </h2>

        <p
          className="text-base sm:text-lg mb-3"
          style={{ color: C.cyan, fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}
        >
          Geometría Cuántica y Armonía de Precio
        </p>

        <p className="text-sm mb-8 max-w-md mx-auto leading-relaxed" style={{ color: C.muted }}>
          Proyectá zonas futuras de soporte y resistencia con precisión institucional.
          El indicador exclusivo de The Mentor Pro para TradingView.
        </p>

        {/* Price */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span
            className="text-2xl font-bold"
            style={{ color: C.gold, fontFamily: "'JetBrains Mono', monospace" }}
          >
            Gs. 150.000
          </span>
          <span className="text-xs px-2 py-0.5 rounded border font-bold uppercase" style={{ color: C.cyan, borderColor: `${C.cyan}30` }}>
            Pago único
          </span>
        </div>

        {/* CTA */}
        <Link
          href="/metalevels"
          className="inline-flex items-center gap-2 px-10 py-4 font-bold text-sm uppercase tracking-[0.15em] text-black transition-all duration-200 hover:opacity-90 animate-pulse"
          style={{ backgroundColor: C.cyan, fontFamily: "'Space Grotesk', sans-serif", animationDuration: '2.5s' }}
        >
          CLICK AQUÍ PARA VER MÁS
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
