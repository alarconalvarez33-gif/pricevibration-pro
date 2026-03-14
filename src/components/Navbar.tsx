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
  const isWhale = plan === 'whale' || isAdmin;
  const isPro = plan === 'pro' || isAdmin;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/quantum', label: 'Calculadora' },
    { href: '/courses', label: 'Cursos' },
    { href: '/billing', label: 'Planes' },
    { href: '/advanced', label: 'Resultados' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0a0a0a]/98 backdrop-blur-md shadow-lg' : 'bg-[#0a0a0a]/95 backdrop-blur-sm'
      } border-b border-gray-800/50`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logosacred.png" alt="Sacred Levels" width={42} height={42} className="rounded-xl" />
              <span className="text-white font-bold text-lg hidden sm:block">Sacred Levels</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.href)
                      ? 'text-[#c9a227] bg-[#c9a227]/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
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
                  {isWhale && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white">WHALE</span>
                  )}
                  {isPro && !isWhale && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#c9a227]/20 text-[#c9a227]">PRO</span>
                  )}
                  <Link href="/dashboard" className="text-gray-300 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/5 transition-all">
                    Dashboard
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="text-gray-400 hover:text-white text-sm px-3 py-2">
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-300 hover:text-white text-sm font-medium px-4 py-2">
                    Iniciar Sesión
                  </Link>
                  <Link href="/register" className="bg-[#c9a227] hover:bg-[#d4af37] text-black px-5 py-2.5 rounded-xl text-sm font-bold transition-all">
                    Registrarse
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileMenuOpen ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="py-4 border-t border-gray-800/50">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive(link.href)
                        ? 'bg-[#c9a227]/20 text-[#c9a227] border-l-4 border-[#c9a227]'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="border-t border-gray-800/50 pt-4 mt-3 space-y-2">
                  {session ? (
                    <>
                      {(isWhale || isPro) && (
                        <div className="px-4 pb-2">
                          {isWhale && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white">WHALE</span>}
                          {isPro && !isWhale && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#c9a227]/20 text-[#c9a227]">PRO</span>}
                        </div>
                      )}
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl text-sm">
                        Dashboard
                      </Link>
                      <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl text-sm">
                        Mi Perfil
                      </Link>
                      <button
                        onClick={() => { signOut({ callbackUrl: '/' }); setMobileMenuOpen(false); }}
                        className="flex items-center gap-3 w-full text-left px-4 py-3 text-red-400 hover:bg-white/5 rounded-xl text-sm"
                      >
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl text-sm">
                        Iniciar Sesión
                      </Link>
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block mx-4 mt-2 bg-[#c9a227] hover:bg-[#d4af37] text-black px-4 py-3.5 rounded-xl text-sm font-bold text-center">
                        Crear Cuenta Gratis
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div className="fixed left-0 right-0 z-40" style={{ top: '64px' }}>
        <PriceTicker />
      </div>
    </>
  );
}
