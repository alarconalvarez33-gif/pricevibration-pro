'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

const BG     = '#0A0A0B'
const CARD   = '#141415'
const BORDER = '#222222'
const CYAN   = '#00E5FF'
const MUTED  = '#555555'
const DARK   = '#0d0d0e'

export default function CursoPage() {
  const { data: session, status } = useSession()
  const [hasAccess, setHasAccess]     = useState<boolean | null>(null)
  const [buying, setBuying]           = useState(false)
  const [verifying, setVerifying]     = useState(false)
  const [verifyMsg, setVerifyMsg]     = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const checkAccess = () =>
    fetch('/api/curso/check-access')
      .then((r) => r.json())
      .then((d) => {
        if (d.hasAccess === true) {
          setHasAccess(true)
          if (pollRef.current) clearInterval(pollRef.current)
        }
        return d.hasAccess === true
      })
      .catch(() => false)

  // Verify access directly from DB (avoids stale JWT after payment)
  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') { setHasAccess(false); return }
    checkAccess()
  }, [status])

  // Cleanup poll on unmount
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  const handleBuy = async () => {
    if (!session) { window.location.href = '/login?redirect=/curso'; return }
    setBuying(true)
    try {
      const res  = await fetch('/api/pagopar/curso-order', { method: 'POST' })
      const data = await res.json()
      if (data.success && data.paymentUrl) {
        // Start polling while user is on Pagopar — when they return access is instant
        pollRef.current = setInterval(checkAccess, 5000)
        window.location.href = data.paymentUrl
      } else {
        alert('Error: ' + (data.error || data.pagoparError || 'No se pudo generar el pago'))
      }
    } catch { alert('Error al procesar el pago') }
    setBuying(false)
  }

  const handleVerify = async () => {
    if (!session) { window.location.href = '/login?redirect=/curso'; return }
    setVerifying(true)
    setVerifyMsg('')
    try {
      const res  = await fetch('/api/pagopar/verify-curso', { method: 'POST' })
      const data = await res.json()
      if (data.hasAccess) {
        setVerifyMsg('✓ Pago confirmado — desbloqueando...')
        setTimeout(() => setHasAccess(true), 800)
      } else {
        setVerifyMsg(data.message || 'Pago aún no confirmado. Si ya pagaste, esperá unos minutos.')
      }
    } catch { setVerifyMsg('Error al verificar. Intentá de nuevo.') }
    setVerifying(false)
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
              Contenido premium exclusivo
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
            Super Estrategia
          </h2>
          <p className="text-sm" style={{ color: MUTED }}>
            Curso exclusivo de trading avanzado
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
            className="w-full rounded-xl overflow-hidden"
            style={{
              position: 'relative',
              aspectRatio: '16/9',
              backgroundColor: '#000',
              border: `1px solid ${BORDER}`,
              boxShadow: '0 0 60px rgba(0,229,255,0.04)',
            }}
          >
            <iframe
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              src="https://player.vimeo.com/video/1177466951?badge=0&autopause=0&player_id=0&app_id=58479"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
              allowFullScreen
              title="Super Estrategia"
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
            <div className="flex items-baseline gap-3 mt-4 mb-1 justify-center">
              <p className="text-3xl font-bold" style={{ color: '#C4A77D', fontFamily: "'JetBrains Mono', monospace" }}>
                Gs. 65.000
              </p>
              <p className="text-sm" style={{ color: MUTED }}>/ $10 USD</p>
            </div>
            <p className="text-xs mb-8" style={{ color: MUTED }}>
              Pago único · Cuotas disponibles con tarjetas Familiar y Ueno
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button
                onClick={handleBuy}
                disabled={buying}
                className="px-8 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#C4A77D', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {buying ? 'Procesando...' : 'No quiero seguir operando a ciegas'}
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

            {/* ── Ya pagué — verificar ── */}
            {status === 'authenticated' && (
              <div className="border-t pt-6" style={{ borderColor: BORDER }}>
                <button
                  onClick={handleVerify}
                  disabled={verifying}
                  className="text-xs uppercase tracking-[0.15em] transition-colors hover:text-white disabled:opacity-50"
                  style={{ color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {verifying ? 'Verificando...' : '¿Ya pagaste? — Verificar acceso'}
                </button>
                {verifyMsg && (
                  <p
                    className="text-xs mt-3"
                    style={{ color: verifyMsg.startsWith('✓') ? CYAN : MUTED }}
                  >
                    {verifyMsg}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
