'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import PriceTicker from '@/components/PriceTicker';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const plan = session?.user?.plan || 'free';
  const role = session?.user?.role || 'user';
  const isAdmin = role === 'admin';
  const isWhale = plan === 'whale' || isAdmin;
  const isPro = plan === 'pro' || isAdmin;

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/quantum', label: 'Calculadora' },
    { href: '/billing', label: 'Planes' },
    { href: '/advanced', label: 'Resultados' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logosacred.png"
                alt="Sacred Levels"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-white font-bold text-lg hidden sm:block">Sacred Levels</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'text-[#c9a227]'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-4">
              {session ? (
                <>
                  {isWhale && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      WHALE
                    </span>
                  )}
                  {isPro && !isWhale && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#c9a227]/20 text-[#c9a227]">
                      PRO
                    </span>
                  )}
                  <Link
                    href="/dashboard"
                    className="text-gray-300 hover:text-white text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-300 hover:text-white text-sm font-medium"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/register"
                    className="bg-[#c9a227] hover:bg-[#d4af37] text-black px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white"
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
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-800">
              <div className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      isActive(link.href)
                        ? 'bg-[#c9a227]/20 text-[#c9a227]'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="border-t border-gray-800 pt-3 mt-2">
                  {session ? (
                    <>
                      {(isWhale || isPro) && (
                        <div className="px-4 pb-2">
                          {isWhale && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                              WHALE
                            </span>
                          )}
                          {isPro && !isWhale && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#c9a227]/20 text-[#c9a227]">
                              PRO
                            </span>
                          )}
                        </div>
                      )}
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg text-sm"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg text-sm"
                      >
                        Mi Perfil
                      </Link>
                      <button
                        onClick={() => { signOut({ callbackUrl: '/' }); setMobileMenuOpen(false); }}
                        className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-800 rounded-lg text-sm"
                      >
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg text-sm"
                      >
                        Iniciar Sesión
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block mx-4 mt-2 bg-[#c9a227] hover:bg-[#d4af37] text-black px-4 py-3 rounded-lg text-sm font-bold text-center"
                      >
                        Crear Cuenta Gratis
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      <div className="fixed left-0 right-0 z-40" style={{ top: '64px' }}>
        <PriceTicker />
      </div>
    </>
  );
}
