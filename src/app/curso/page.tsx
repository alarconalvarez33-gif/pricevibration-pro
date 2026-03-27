'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const BG     = '#0A0A0B'
const CARD   = '#141415'
const BORDER = '#222222'
const CYAN   = '#00E5FF'
const MUTED  = '#555555'
const DARK   = '#0d0d0e'

export default function CursoPage() {
  const { data: session, status } = useSession()
  const [hasAccess, setHasAccess]   = useState<boolean | null>(null)
  const [buying, setBuying]         = useState(false)

  // Verify access directly from DB (avoids stale JWT after payment)
  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') { setHasAccess(false); return }

    fetch('/api/curso/check-access')
      .then((r) => r.json())
      .then((d) => setHasAccess(d.hasAccess === true))
      .catch(() => setHasAccess(false))
  }, [status])

  const handleBuy = async () => {
    if (!session) { window.location.href = '/login?redirect=/curso'; return }
    setBuying(true)
    try {
      const res  = await fetch('/api/pagopar/curso-order', { method: 'POST' })
      const data = await res.json()
      if (data.success && data.paymentUrl) window.location.href = data.paymentUrl
      else alert('Error: ' + (data.error || data.pagoparError || 'No se pudo generar el pago'))
    } catch { alert('Error al procesar el pago') }
    setBuying(false)
  }

  const loading = status === 'loading' || hasAccess === null

  return (
    <main className="min-h-screen" style={{ backgroundColor: BG, fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div className="border-b" style={{ backgroundColor: DARK, borderColor: BORDER }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Curso Exclusivo
            </h1>
            <p className="text-[10px] mt-0.5" style={{ color: CYAN, fontFamily: "'JetBrains Mono', monospace" }}>
              Sacred Levels · Contenido premium
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-xs uppercase tracking-[0.15em] transition-colors hover:text-white"
            style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            ← Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 py-16">

        {/* Title */}
        <div className="text-center mb-10">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-4"
            style={{ color: CYAN, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Curso Exclusivo
          </p>
          <h2
            className="text-4xl font-bold text-white mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Sacred Levels
          </h2>
          <p className="text-sm" style={{ color: MUTED }}>
            Contenido premium para suscriptores
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div
              className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto"
              style={{ borderColor: `${CYAN}40`, borderTopColor: 'transparent' }}
            />
          </div>
        ) : hasAccess ? (
          /* ── Video player ── */
          <div
            className="relative w-full overflow-hidden rounded-xl"
            style={{
              paddingBottom: '56.25%',
              backgroundColor: '#000',
              border: `1px solid ${BORDER}`,
              boxShadow: '0 0 60px rgba(0,229,255,0.04), 0 0 120px rgba(0,229,255,0.02)',
            }}
          >
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-xl"
              src="https://player.vimeo.com/video/1177466951?badge=0&autopause=0&player_id=0&app_id=58479"
              width="100%"
              height="100%"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        ) : (
          /* ── Paywall ── */
          <div
            className="border text-center py-20 px-8"
            style={{ backgroundColor: CARD, borderColor: BORDER }}
          >
            {/* Lock icon */}
            <div
              className="w-16 h-16 border flex items-center justify-center mx-auto mb-6"
              style={{ borderColor: `${CYAN}25`, backgroundColor: `${CYAN}06` }}
            >
              <svg className="w-7 h-7" fill="none" stroke={CYAN} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            <h3
              className="text-2xl font-bold text-white mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Super Estrategia
            </h3>
            <p className="text-sm mb-1" style={{ color: MUTED }}>
              Comprá el curso o suscribite a Quantum Access para desbloquear este contenido.
            </p>
            <p
              className="text-3xl font-bold mb-1 mt-4"
              style={{ color: '#C4A77D', fontFamily: "'JetBrains Mono', monospace" }}
            >
              Gs. 65.000
            </p>
            <p className="text-sm mb-1" style={{ color: MUTED }}>/ $10 USD para internacionales</p>
            <p className="text-xs mb-8" style={{ color: MUTED }}>
              Pago único · Cuotas disponibles con tarjetas Familiar y Ueno
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleBuy}
                disabled={buying}
                className="px-8 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#C4A77D', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {buying ? 'Procesando...' : 'Comprar Curso — Gs. 65.000'}
              </button>
              <Link
                href="/billing"
                className="inline-block border px-8 py-3.5 text-sm font-bold uppercase tracking-[0.1em] transition-colors hover:text-white text-center"
                style={{ borderColor: BORDER, color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Ver plan Quantum Access
              </Link>
              {status === 'unauthenticated' && (
                <Link
                  href="/login?redirect=/curso"
                  className="inline-block border px-8 py-3.5 text-sm font-bold uppercase tracking-[0.1em] transition-colors hover:text-white text-center"
                  style={{ borderColor: BORDER, color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
