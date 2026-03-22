'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import PriceTicker from '@/components/PriceTicker';

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
    { href: '/quantum', label: 'Calculadora Cuadrática' },
    { href: '/courses', label: 'Cursos' },
    ...(isQuantum
      ? [{ href: '/dashboard', label: 'Dashboard' }]
      : [{ href: '/billing', label: 'Planes' }]),
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
        scrolled ? 'shadow-sm' : ''
      } border-b border-[#E8E8E8]`}>
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-4 shrink-0">
              <Image
                src="/logosacred.png"
                alt="Sacred Levels"
                width={52}
                height={52}
                className="rounded-lg"
                priority
              />
              <span className="text-[#111111] font-semibold text-base hidden sm:block tracking-tight font-['Inter',sans-serif]">
                Sacred Levels
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-xs font-medium tracking-wide transition-colors rounded-lg ${
                    isActive(link.href)
                      ? 'text-[#C4A77D] bg-[#C4A77D]/8'
                      : 'text-[#666666] hover:text-[#111111] hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
              {session ? (
                <>
                  {isQuantum && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#C4A77D]/12 text-[#B8953C] border border-[#C4A77D]/30 uppercase tracking-widest">
                      Quantum
                    </span>
                  )}
                  {isWhale && !isQuantum && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 uppercase tracking-widest">
                      Whale
                    </span>
                  )}
                  {isPro && !isWhale && !isQuantum && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#C4A77D]/12 text-[#B8953C] border border-[#C4A77D]/30 uppercase tracking-widest">
                      Pro
                    </span>
                  )}
                  <Link href="/dashboard" className="text-[#666666] hover:text-[#111111] text-xs font-medium px-3 py-2 transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/account" className="text-[#666666] hover:text-[#111111] text-xs font-medium px-3 py-2 transition-colors">
                    Mi Cuenta
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-[#666666] hover:text-[#111111] text-xs font-medium px-3 py-2 transition-colors"
                  >
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-[#666666] hover:text-[#111111] text-xs font-medium px-3 py-2 transition-colors">
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/register"
                    className="bg-[#111111] hover:bg-[#333333] text-white px-5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-colors"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 text-[#666666] hover:text-[#111111] hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileMenuOpen ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="py-4 border-t border-[#E8E8E8]">
              <div className="flex flex-col gap-0.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 text-sm font-medium transition-colors rounded-lg ${
                      isActive(link.href)
                        ? 'bg-[#C4A77D]/8 text-[#C4A77D] border-l-2 border-[#C4A77D]'
                        : 'text-[#666666] hover:bg-gray-50 hover:text-[#111111] border-l-2 border-transparent'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="border-t border-[#E8E8E8] pt-4 mt-3 space-y-1">
                  {session ? (
                    <>
                      {(isQuantum || isWhale || isPro) && (
                        <div className="px-4 pb-2">
                          {isQuantum && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#C4A77D]/12 text-[#B8953C] border border-[#C4A77D]/30 uppercase tracking-widest">
                              Quantum
                            </span>
                          )}
                        </div>
                      )}
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[#666666] hover:text-[#111111] hover:bg-gray-50 text-sm font-medium transition-colors">
                        Dashboard
                      </Link>
                      <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[#666666] hover:text-[#111111] hover:bg-gray-50 text-sm font-medium transition-colors">
                        Mi Perfil
                      </Link>
                      <button
                        onClick={() => { signOut({ callbackUrl: '/' }); setMobileMenuOpen(false); }}
                        className="flex items-center gap-3 w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 text-sm font-medium transition-colors"
                      >
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[#666666] hover:text-[#111111] hover:bg-gray-50 text-sm font-medium transition-colors">
                        Iniciar Sesión
                      </Link>
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block mx-4 mt-2 bg-[#111111] hover:bg-[#333333] text-white px-4 py-3 rounded-lg text-sm font-semibold text-center transition-colors">
                        Crear Cuenta Gratis
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription status banners */}
        {showCancelledBanner && (
          <div className="border-t border-[#C4A77D]/30 bg-[#C4A77D]/8 px-6 py-2 flex items-center justify-between gap-3">
            <p className="text-[#B8953C] text-xs font-medium">
              Suscripción cancelada · Acceso hasta{' '}
              <span className="font-semibold">{premiumUntil?.toLocaleDateString('es-PY')}</span>
            </p>
            <Link href="/account/subscription" className="text-xs font-semibold text-[#B8953C] underline whitespace-nowrap">
              Reactivar
            </Link>
          </div>
        )}
        {showExpiringBanner && (
          <div className="border-t border-red-200 bg-red-50 px-6 py-2 flex items-center justify-between gap-3">
            <p className="text-red-600 text-xs font-medium">
              Tu suscripción vence en{' '}
              <span className="font-semibold">{daysLeft} día{daysLeft !== 1 ? 's' : ''}</span>
            </p>
            <Link href="/billing" className="text-xs font-semibold text-red-600 underline whitespace-nowrap">
              Renovar
            </Link>
          </div>
        )}
        {showExpiredBanner && (
          <div className="border-t border-red-200 bg-red-50 px-6 py-2 flex items-center justify-between gap-3">
            <p className="text-red-600 text-xs font-medium">
              Tu suscripción expiró · Plan gratuito activo
            </p>
            <Link href="/billing" className="text-xs font-semibold text-red-600 underline whitespace-nowrap">
              Suscribirme
            </Link>
          </div>
        )}
      </nav>
      <div className="fixed left-0 right-0 z-40" style={{ top: hasBanner ? '96px' : '80px' }}>
        <PriceTicker />
      </div>
    </>
  );
}
