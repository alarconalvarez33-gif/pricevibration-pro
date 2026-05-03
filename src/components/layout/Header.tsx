'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

const CYAN = '#00D4FF'

export default function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const user = session?.user as any
  const subscriptionStatus = user?.subscriptionStatus
  const premiumUntil = user?.premiumUntil ? new Date(user.premiumUntil) : null
  const daysLeft = premiumUntil
    ? Math.ceil((premiumUntil.getTime() - Date.now()) / 86400000)
    : null

  const showCancelledBanner = subscriptionStatus === 'cancelled' && daysLeft !== null && daysLeft > 0
  const showExpiringBanner = subscriptionStatus === 'active' && daysLeft !== null && daysLeft <= 3 && daysLeft > 0
  const showExpiredBanner = subscriptionStatus === 'expired'

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')

  const navLinks = [
    { href: '/', label: 'INICIO' },
    { href: '/cursos', label: 'CURSOS' },
    { href: '/la-mente-del-trader', label: 'LA MENTE', badge: 'NUEVO' },
    { href: '/metalevels', label: 'METALEVELS' },
    ...(session ? [{ href: '/dashboard', label: 'DASHBOARD' }] : []),
  ]

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ backgroundColor: '#000000', fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* ── TopBar / Disclaimer ── */}
      <div style={{ backgroundColor: '#080808', borderBottom: '1px solid #111' }}>
        <p
          className="text-center px-4 py-1.5"
          style={{ color: '#555', fontSize: '10px', fontFamily: "'Inter', sans-serif", letterSpacing: '0.02em' }}
        >
          ⚠️{' '}
          <strong style={{ color: '#666' }}>Advertencia de Riesgo:</strong>
          {' '}El trading de instrumentos financieros conlleva un alto nivel de riesgo. Los resultados pasados no garantizan resultados futuros.
        </p>
      </div>

      {/* ── Main nav bar ── */}
      <div
        className="transition-all duration-200"
        style={{
          borderBottom: '1px solid #1a1a1a',
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.6)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between" style={{ minHeight: '68px' }}>

            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logonuevos.png"
                alt="Sacred Levels"
                style={{ height: '52px', width: 'auto', display: 'block' }}
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold tracking-[0.12em] transition-colors hover:text-white"
                  style={{ color: isActive(link.href) ? CYAN : '#CBD5E1' }}
                >
                  {isActive(link.href) && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-px"
                      style={{ backgroundColor: CYAN }}
                    />
                  )}
                  {link.label}
                  {link.badge && (
                    <span
                      className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: '#FFD70018', color: '#FFD700', border: '1px solid #FFD70030' }}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-3">
              {session ? (
                <>
                  <Link
                    href="/account"
                    className="text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors hover:text-white"
                    style={{ color: '#CBD5E1' }}
                  >
                    CUENTA
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors hover:text-red-400"
                    style={{ color: '#555' }}
                  >
                    SALIR
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors hover:text-white"
                    style={{ color: '#CBD5E1' }}
                  >
                    INICIAR SESIÓN
                  </Link>
                  <Link
                    href="/billing"
                    className="px-5 py-2 text-[11px] font-bold uppercase tracking-[0.1em] rounded transition-all hover:bg-[#00D4FF] hover:text-black"
                    style={{ border: `1px solid ${CYAN}`, color: CYAN }}
                  >
                    QUANTUM
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 border transition-colors hover:border-[#444]"
              style={{ borderColor: '#222', color: '#888' }}
              aria-label="Menú"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-200 ${mobileOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}
          style={{ borderTop: mobileOpen ? '1px solid #1a1a1a' : 'none', backgroundColor: '#000' }}
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-3.5 text-sm font-semibold uppercase tracking-[0.1em] border-l-2 transition-colors"
                style={{
                  borderColor: isActive(link.href) ? CYAN : 'transparent',
                  color: isActive(link.href) ? CYAN : '#CBD5E1',
                }}
              >
                {link.label}
                {link.badge && (
                  <span
                    className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: '#FFD70018', color: '#FFD700', border: '1px solid #FFD70030' }}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}

            <div className="mt-2 pt-3 flex flex-col gap-2" style={{ borderTop: '1px solid #1a1a1a' }}>
              {session ? (
                <>
                  <Link href="/account" onClick={() => setMobileOpen(false)}
                    className="px-3 py-3.5 text-sm font-semibold uppercase tracking-[0.1em]"
                    style={{ color: '#CBD5E1' }}
                  >
                    MI CUENTA
                  </Link>
                  <button
                    onClick={() => { signOut({ callbackUrl: '/' }); setMobileOpen(false) }}
                    className="px-3 py-3.5 text-sm font-bold uppercase text-left"
                    style={{ color: '#ff4757' }}
                  >
                    CERRAR SESIÓN
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}
                    className="px-3 py-3.5 text-sm font-semibold uppercase tracking-[0.1em] min-h-[52px] flex items-center"
                    style={{ color: '#CBD5E1' }}
                  >
                    INICIAR SESIÓN
                  </Link>
                  <Link href="/billing" onClick={() => setMobileOpen(false)}
                    className="px-3 py-3.5 text-sm font-bold uppercase text-center min-h-[52px] flex items-center justify-center rounded"
                    style={{ border: `1px solid ${CYAN}`, color: CYAN }}
                  >
                    QUANTUM ACCESS
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Subscription banners ── */}
      {showCancelledBanner && (
        <div className="px-4 py-2 flex items-center justify-between gap-3"
          style={{ backgroundColor: '#c9a22710', borderBottom: '1px solid #c9a22718' }}
        >
          <p className="text-[10px]" style={{ color: '#c9a227' }}>
            Suscripción cancelada · Acceso hasta{' '}
            <strong>{premiumUntil?.toLocaleDateString('es-PY')}</strong>
          </p>
          <Link href="/account/subscription" className="text-[10px] font-bold underline shrink-0" style={{ color: '#c9a227' }}>
            Reactivar
          </Link>
        </div>
      )}
      {showExpiringBanner && (
        <div className="px-4 py-2 flex items-center justify-between gap-3"
          style={{ backgroundColor: '#ff475710', borderBottom: '1px solid #ff475718' }}
        >
          <p className="text-[10px]" style={{ color: '#ff4757' }}>
            Suscripción vence en <strong>{daysLeft} día{daysLeft !== 1 ? 's' : ''}</strong>
          </p>
          <Link href="/billing" className="text-[10px] font-bold underline shrink-0" style={{ color: '#ff4757' }}>Renovar</Link>
        </div>
      )}
      {showExpiredBanner && (
        <div className="px-4 py-2 flex items-center justify-between gap-3"
          style={{ backgroundColor: '#ff475710', borderBottom: '1px solid #ff475718' }}
        >
          <p className="text-[10px]" style={{ color: '#ff4757' }}>Suscripción expirada · Plan gratuito activo</p>
          <Link href="/billing" className="text-[10px] font-bold underline shrink-0" style={{ color: '#ff4757' }}>Suscribirme</Link>
        </div>
      )}
    </header>
  )
}
