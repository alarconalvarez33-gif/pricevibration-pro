'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function PromoPopup() {
  const { data: session, status } = useSession()
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (status === 'loading') return

    if ((session?.user as any)?.role === 'admin') return
    if (sessionStorage.getItem('promo_shown_v3')) return

    const t = setTimeout(() => {
      setVisible(true)
      sessionStorage.setItem('promo_shown_v3', '1')
    }, 6000)

    return () => clearTimeout(t)
  }, [status, session])

  if (!mounted || !visible) return null

  return (
    <div
      onClick={() => setVisible(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        backgroundColor: 'rgba(0,0,0,0.80)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popIn  { from { opacity: 0; transform: scale(0.94) } to { opacity: 1; transform: scale(1) } }
      `}</style>

      <div
        style={{ position: 'relative', width: '100%', maxWidth: 440 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setVisible(false)}
          aria-label="Cerrar"
          style={{
            position: 'absolute', top: -14, right: -14, zIndex: 3,
            width: 34, height: 34, borderRadius: '50%',
            background: '#222', border: '1px solid #444',
            color: '#fff', fontSize: 20, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.6)',
          }}
        >
          ×
        </button>

        {/* Clickable image */}
        <Link href="/metalevels" onClick={() => setVisible(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/metalevels2.png"
            alt="MetaLevels"
            style={{
              width: '100%',
              display: 'block',
              borderRadius: 16,
              cursor: 'pointer',
              animation: 'popIn 0.3s ease',
              boxShadow: '0 0 60px rgba(0,229,255,0.12)',
            }}
          />
        </Link>
      </div>
    </div>
  )
}
