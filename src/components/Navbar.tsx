'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

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
  const hasBanner = showCancelledBanner || showExpiringBanner || showExpiredBanner;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/hub', label: 'Signal Hub' },
    { href: '/courses', label: 'Cursos' },
    ...(isQuantum
      ? [{ href: '/dashboard', label: 'Dashboard' }]
      : [{ href: '/billing', label: 'Planes' }]),
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
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <div className="flex items-center justify-between h-20">

            {/* Logo — Negative Space tratado como marca de lujo */}
            <Link href="/" className="flex items-center gap-5 shrink-0">
              <div className="relative">
                <Image
                  src="/logosacred.png"
                  alt="Sacred Levels"
                  width={56}
                  height={56}
                  className="rounded-lg"
                  priority
                />
              </div>
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
                    isActive(link.href)
                      ? 'text-[#00E5FF]'
                      : 'text-[#666] hover:text-white'
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
                    className="border border-[#00E5FF]/40 hover:border-[#00E5FF] text-[#00E5FF] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-200 hover:bg-[#00E5FF]/5"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#555] hover:text-white border border-[#222] hover:border-[#333] transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile menu */}
          <div className={`md:hidden overflow-hidden transition-all duration-200 ${
            mobileMenuOpen ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="py-4 border-t border-[#1a1a1a]">
              <div className="flex flex-col gap-0.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors border-l-2 ${
                      isActive(link.href)
                        ? 'border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/4'
                        : 'border-transparent text-[#555] hover:text-white hover:bg-white/3'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-[#1a1a1a] pt-4 mt-3 space-y-1 px-4">
                  {session ? (
                    <>
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-3 text-[#555] hover:text-white text-[11px] uppercase tracking-[0.12em] font-semibold transition-colors">
                        Dashboard
                      </Link>
                      <button
                        onClick={() => { signOut({ callbackUrl: '/' }); setMobileMenuOpen(false); }}
                        className="block w-full text-left py-3 text-[#ff4757] text-[11px] uppercase tracking-[0.12em] font-semibold"
                      >
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block py-3 text-[#555] hover:text-white text-[11px] uppercase tracking-[0.12em] font-semibold transition-colors">
                        Iniciar Sesión
                      </Link>
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block mt-2 border border-[#00E5FF]/40 text-[#00E5FF] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-center">
                        Crear Cuenta
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
          <div className="border-t border-[#c9a227]/20 bg-[#c9a227]/8 px-8 py-2 flex items-center justify-between gap-3">
            <p className="text-[#c9a227] text-[10px] font-medium tracking-wide">
              Suscripción cancelada · Acceso hasta{' '}
              <span className="font-bold">{premiumUntil?.toLocaleDateString('es-PY')}</span>
            </p>
            <Link href="/account/subscription" className="text-[10px] font-bold text-[#c9a227] underline whitespace-nowrap">
              Reactivar
            </Link>
          </div>
        )}
        {showExpiringBanner && (
          <div className="border-t border-[#ff4757]/20 bg-[#ff4757]/8 px-8 py-2 flex items-center justify-between gap-3">
            <p className="text-[#ff4757] text-[10px] font-medium">
              Suscripción vence en <span className="font-bold">{daysLeft} día{daysLeft !== 1 ? 's' : ''}</span>
            </p>
            <Link href="/billing" className="text-[10px] font-bold text-[#ff4757] underline whitespace-nowrap">Renovar</Link>
          </div>
        )}
        {showExpiredBanner && (
          <div className="border-t border-[#ff4757]/20 bg-[#ff4757]/8 px-8 py-2 flex items-center justify-between gap-3">
            <p className="text-[#ff4757] text-[10px] font-medium">Suscripción expirada · Plan gratuito activo</p>
            <Link href="/billing" className="text-[10px] font-bold text-[#ff4757] underline whitespace-nowrap">Suscribirme</Link>
          </div>
        )}
      </nav>

    </>
  );
}
