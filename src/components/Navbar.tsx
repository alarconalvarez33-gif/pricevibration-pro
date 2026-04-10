'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const MOBILE_STICKY_HIDDEN_PATHS = ['/quantum']

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const plan = session?.user?.plan || 'free';
  const role = session?.user?.role || 'user';
  const isAdmin = role === 'admin';
  const isQuantum = plan === 'quantum' || isAdmin;
  const isWhale = plan === 'whale' || isAdmin;
  const isPro = plan === 'pro' || isAdmin;

  const subscriptionStatus = (session?.user as any)?.subscriptionStatus as string | undefined;
  const premiumUntil = (session?.user as any)?.premiumUntil
    ? new Date((session?.user as any).premiumUntil as string)
    : null;
  const daysLeft = premiumUntil
    ? Math.ceil((premiumUntil.getTime() - Date.now()) / 86400000)
    : null;

  const showCancelledBanner = subscriptionStatus === 'cancelled' && daysLeft !== null && daysLeft > 0;
  const showExpiringBanner  = subscriptionStatus === 'active' && daysLeft !== null && daysLeft <= 3 && daysLeft > 0;
  const showExpiredBanner   = subscriptionStatus === 'expired';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/hub', label: 'Signal Hub' },
    { href: '/curso', label: 'Curso' },
    ...(isQuantum
      ? [{ href: '/dashboard', label: 'Dashboard' }]
      : [{ href: '/billing', label: 'Precios' }]),
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b ${
          scrolled
            ? 'bg-[#0A0A0B]/98 backdrop-blur-md border-[#222]'
            : 'bg-[#0A0A0B]/95 border-[#1a1a1a]'
        }`}
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          // Safe area for iPhone notch
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        {/* ── Main bar ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
             <Image src="/logosacred.png" alt="Sacred Levels" width={52} height={52} quality={90} className="w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] md:w-[52px] md:h-[52px] flex-shrink-0" />
              <div className="hidden sm:block">
                <span className="text-white font-semibold text-base tracking-tight leading-none block">
                  Sacred Levels
                </span>
                <span className="text-[#444] text-[10px] tracking-[0.25em] uppercase mt-0.5 block">
                  Quantum Trading
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-0">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors duration-200 ${
                    isActive(link.href) ? 'text-[#00E5FF]' : 'text-[#666] hover:text-white'
                  }`}
                >
                  {isActive(link.href) && (
                    <span className="absolute bottom-0 left-4 right-4 h-px bg-[#00E5FF]" />
                  )}
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-3">
              {session ? (
                <>
                  {isQuantum && (
                    <span className="px-2.5 py-1 text-[10px] font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 uppercase tracking-widest">
                      Quantum
                    </span>
                  )}
                  {isWhale && !isQuantum && (
                    <span className="px-2.5 py-1 text-[10px] font-bold bg-white/5 text-[#888] border border-[#333] uppercase tracking-widest">
                      Whale
                    </span>
                  )}
                  {isPro && !isWhale && !isQuantum && (
                    <span className="px-2.5 py-1 text-[10px] font-bold bg-white/5 text-[#888] border border-[#333] uppercase tracking-widest">
                      Pro
                    </span>
                  )}
                  <Link href="/dashboard" className="text-[#555] hover:text-white text-[11px] uppercase tracking-[0.12em] font-semibold px-3 py-2 transition-colors duration-200">
                    Dashboard
                  </Link>
                  <Link href="/account" className="text-[#555] hover:text-white text-[11px] uppercase tracking-[0.12em] font-semibold px-3 py-2 transition-colors duration-200">
                    Cuenta
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-[#444] hover:text-[#ff4757] text-[11px] uppercase tracking-[0.12em] px-3 py-2 transition-colors duration-200"
                  >
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-[#555] hover:text-white text-[11px] uppercase tracking-[0.12em] font-semibold px-3 py-2 transition-colors duration-200">
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-200 hover:opacity-90"
                    style={{ backgroundColor: '#fbbf24', color: '#000' }}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>

            {/* Mobile toggle — 44×44px touch target */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-11 h-11 text-[#555] hover:text-white border border-[#222] hover:border-[#333] transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile menu — max height prevents viewport overflow */}
          <div className={`md:hidden overflow-y-auto transition-all duration-200 ${
            mobileMenuOpen ? 'max-h-[calc(100vh-64px)] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}>
            <div className="py-3 border-t border-[#1a1a1a]">
              <div className="flex flex-col">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-4 text-sm font-semibold uppercase tracking-[0.12em] transition-colors border-l-2 min-h-[52px] flex items-center ${
                      isActive(link.href)
                        ? 'border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/4'
                        : 'border-transparent text-[#666] hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="border-t border-[#1a1a1a] pt-3 mt-2 px-4 pb-4 space-y-2">
                  {session ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center min-h-[52px] text-[#666] hover:text-white text-sm uppercase tracking-[0.12em] font-semibold transition-colors"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => { signOut({ callbackUrl: '/' }); setMobileMenuOpen(false); }}
                        className="flex items-center w-full min-h-[52px] text-[#ff4757] text-sm uppercase tracking-[0.12em] font-semibold"
                      >
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center min-h-[52px] text-[#666] hover:text-white text-sm uppercase tracking-[0.12em] font-semibold transition-colors"
                      >
                        Iniciar Sesión
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center w-full min-h-[52px] px-4 font-bold text-sm uppercase tracking-[0.12em]"
                        style={{ backgroundColor: '#fbbf24', color: '#000' }}
                      >
                        Crear Cuenta Gratis
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription banners */}
        {showCancelledBanner && (
          <div className="border-t border-[#c9a227]/20 bg-[#c9a227]/8 px-4 sm:px-8 py-2 flex items-center justify-between gap-3">
            <p className="text-[#c9a227] text-[10px] font-medium tracking-wide">
              Suscripción cancelada · Acceso hasta{' '}
              <span className="font-bold">{premiumUntil?.toLocaleDateString('es-PY')}</span>
            </p>
            <Link href="/account/subscription" className="text-[10px] font-bold text-[#c9a227] underline shrink-0">
              Reactivar
            </Link>
          </div>
        )}
        {showExpiringBanner && (
          <div className="border-t border-[#ff4757]/20 bg-[#ff4757]/8 px-4 sm:px-8 py-2 flex items-center justify-between gap-3">
            <p className="text-[#ff4757] text-[10px] font-medium">
              Suscripción vence en <span className="font-bold">{daysLeft} día{daysLeft !== 1 ? 's' : ''}</span>
            </p>
            <Link href="/billing" className="text-[10px] font-bold text-[#ff4757] underline shrink-0">Renovar</Link>
          </div>
        )}
        {showExpiredBanner && (
          <div className="border-t border-[#ff4757]/20 bg-[#ff4757]/8 px-4 sm:px-8 py-2 flex items-center justify-between gap-3">
            <p className="text-[#ff4757] text-[10px] font-medium">Suscripción expirada · Plan gratuito activo</p>
            <Link href="/billing" className="text-[10px] font-bold text-[#ff4757] underline shrink-0">Suscribirme</Link>
          </div>
        )}
      </nav>

      {/* Mobile sticky bottom CTA — only for guests, hidden on /quantum */}
      {!session && !MOBILE_STICKY_HIDDEN_PATHS.includes(pathname) && (
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4"
          style={{
            backgroundColor: 'rgba(10,10,11,0.96)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid #222',
            // Safe area for iPhone home indicator
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)',
            paddingTop: '12px',
          }}
        >
          <Link
            href="/quantum"
            className="flex items-center justify-center w-full min-h-[52px] font-bold text-sm uppercase tracking-[0.12em] transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#fbbf24', color: '#000', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Probar Gratis — Sin Registro
          </Link>
        </div>
      )}
    </>
  );
}
