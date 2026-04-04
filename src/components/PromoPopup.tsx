'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const PREFIXES = ['+595', '+54', '+52', '+56', '+57', '+51', '+58', '+1', '+55', '+34']

export default function PromoPopup() {
  const { data: session, status } = useSession()
  const [visible, setVisible]   = useState(false)
  const [mounted, setMounted]   = useState(false)
  const [email, setEmail]       = useState('')
  const [wPrefix, setWPrefix]   = useState('+595')
  const [wNumber, setWNumber]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    setMounted(true)
    if (status === 'loading') return

    const plan = (session?.user as any)?.plan
    if (plan === 'quantum' || (session?.user as any)?.role === 'admin') return

    if (sessionStorage.getItem('promo_shown_v2')) return

    const t = setTimeout(() => {
      setVisible(true)
      sessionStorage.setItem('promo_shown_v2', '1')
    }, 8000)

    return () => clearTimeout(t)
  }, [status, session])

  const close = () => setVisible(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, whatsapp: wNumber ? wPrefix + wNumber : '' }),
      })
      if (res.ok) {
        setDone(true)
        setTimeout(() => setVisible(false), 2000)
      } else {
        const d = await res.json()
        setError(d.error || 'Error al guardar. Intentá de nuevo.')
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    }
    setLoading(false)
  }

  if (!mounted || !visible) return null

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        backgroundColor: 'rgba(0,0,0,0.75)',
        overflowY: 'auto',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popIn  { from { opacity: 0; transform: scale(0.95) } to { opacity: 1; transform: scale(1) } }
      `}</style>

      {/* Centering wrapper — allows scroll on small screens */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100%', padding: '24px 16px',
      }}>
        {/* Outer wrapper: positions the close button outside overflow:hidden card */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 450 }} onClick={e => e.stopPropagation()}>

          {/* Close button — outside card so overflow:hidden doesn't clip it */}
          <button
            onClick={close}
            aria-label="Cerrar"
            style={{
              position: 'absolute', top: -16, right: -16, zIndex: 3,
              width: 36, height: 36, borderRadius: '50%',
              background: '#222', border: '1px solid #555',
              color: '#fff', fontSize: 22, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1, boxShadow: '0 2px 10px rgba(0,0,0,0.6)',
            }}
          >
            ×
          </button>

          {/* Card */}
          <div style={{
            backgroundColor: '#0e1014',
            border: '1px solid rgba(0,229,255,0.25)',
            borderRadius: 20,
            overflow: 'hidden',
            animation: 'popIn 0.3s ease',
            boxShadow: '0 0 60px rgba(0,229,255,0.08)',
          }}>
            {/* Flyer image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/popup-flyer.jpg"
              alt="Nuevo Curso"
              style={{ width: '100%', display: 'block', objectFit: 'cover' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />

            {/* Content */}
            <div style={{ padding: '20px 24px 24px' }}>
              {done ? (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <p style={{ fontSize: 28, marginBottom: 8 }}>✅</p>
                  <p style={{ color: '#00E5FF', fontWeight: 700, fontSize: 15, fontFamily: "'Space Grotesk', sans-serif" }}>
                    ¡Listo! Te avisaremos cuando esté disponible.
                  </p>
                </div>
              ) : (
                <>
                  <p style={{ color: '#00E5FF', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: 6, fontFamily: "'Space Grotesk', sans-serif" }}>
                    Nuevo Curso Disponible
                  </p>
                  <p style={{ color: '#fff', fontSize: 26, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", marginBottom: 2 }}>
                    Gs. 99.000
                  </p>
                  <p style={{ color: '#555', fontSize: 12, marginBottom: 10 }}>/ $15 USD</p>
                  <p style={{ color: '#888', fontSize: 13, marginBottom: 18, lineHeight: 1.5 }}>
                    Reservá tu lugar y sé el primero en acceder al contenido exclusivo.
                  </p>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Tu email"
                      required
                      style={{
                        width: '100%', padding: '11px 14px', borderRadius: 8,
                        background: '#141415', border: '1px solid #222', color: '#fff',
                        fontSize: 13, outline: 'none', boxSizing: 'border-box',
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    />

                    <div style={{ display: 'flex', gap: 8 }}>
                      <select
                        value={wPrefix}
                        onChange={e => setWPrefix(e.target.value)}
                        style={{
                          padding: '11px 8px', borderRadius: 8, flexShrink: 0,
                          background: '#141415', border: '1px solid #222', color: '#fff',
                          fontSize: 13, outline: 'none', cursor: 'pointer',
                        }}
                      >
                        {PREFIXES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <input
                        type="tel"
                        value={wNumber}
                        onChange={e => setWNumber(e.target.value)}
                        placeholder="WhatsApp (opcional)"
                        style={{
                          flex: 1, padding: '11px 14px', borderRadius: 8,
                          background: '#141415', border: '1px solid #222', color: '#fff',
                          fontSize: 13, outline: 'none', boxSizing: 'border-box',
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      />
                    </div>

                    {error && <p style={{ color: '#ff4466', fontSize: 12 }}>{error}</p>}

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%', padding: '13px', borderRadius: 8,
                        background: loading ? '#0a9db5' : '#00E5FF',
                        border: 'none', color: '#000',
                        fontSize: 12, fontWeight: 800,
                        textTransform: 'uppercase', letterSpacing: '0.15em',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontFamily: "'Space Grotesk', sans-serif",
                        marginTop: 2,
                      }}
                    >
                      {loading ? 'Guardando...' : 'Reservar Mi Lugar'}
                    </button>
                  </form>

                  <p style={{ color: '#333', fontSize: 10, textAlign: 'center', marginTop: 12, fontFamily: "'Space Grotesk', sans-serif" }}>
                    No spam. Solo te avisaremos cuando esté disponible.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
