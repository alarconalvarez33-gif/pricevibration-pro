'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import LanguageSelector from './LanguageSelector'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Navbar() {
  const { data: session } = useSession()
  const { t } = useLanguage()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const plan = session?.user?.plan || 'free'
  const role = session?.user?.role || 'user'
  const isAdmin = role === 'admin'
  const isWhale = plan === 'whale' || isAdmin
  const isPro = plan === 'pro' || isAdmin

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayName = session?.user?.name?.split(' ')[0] || 'User'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-navy-800 to-terminal-bg backdrop-blur-md border-b border-terminal-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logomentor.png"
              alt="The Mentor Trading"
              width={160}
              height={48}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-terminal-muted hover:text-gold-500 transition-colors">
              {t('nav.home')}
            </Link>
            <Link href="/astrology" className="text-terminal-muted hover:text-gold-500 transition-colors">
              Astrology
            </Link>
            {session && (isPro || isWhale) && (
              <Link href="/advanced" className="text-terminal-muted hover:text-gold-500 transition-colors">
                Advanced
              </Link>
            )}
            <Link href="/billing" className="text-terminal-muted hover:text-gold-500 transition-colors">
              {t('nav.pricing')}
            </Link>
            <Link href="/contact" className="text-terminal-muted hover:text-gold-500 transition-colors">
              {t('nav.contact')}
            </Link>

            {/* Language Selector */}
            <LanguageSelector />

            {session ? (
              <>
                <Link href="/dashboard" className="text-terminal-muted hover:text-gold-500 transition-colors">
                  {t('nav.dashboard')}
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 text-terminal-muted hover:text-white transition-colors"
                  >
                    {/* Plan Badge */}
                    {isWhale && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        WHALE
                      </span>
                    )}
                    {isPro && !isWhale && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gold-500/20 text-gold-400">
                        PRO
                      </span>
                    )}
                    <span className="text-sm font-medium text-white">
                      Hola, {displayName}
                    </span>
                    <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#1a1a2e] border border-gold-500/20 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-fadeIn">
                      <div className="p-3 border-b border-gold-500/10">
                        <p className="text-sm font-medium text-white truncate">{session.user.name || session.user.email}</p>
                        <p className="text-xs text-terminal-muted truncate">{session.user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/settings"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-terminal-muted hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          My Profile
                        </Link>
                        <Link
                          href="/billing"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-terminal-muted hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          My Subscription
                          <span className="ml-auto text-xs text-gold-500 capitalize">{plan}</span>
                        </Link>

                        {/* Cancel Subscription (only for Pro/Whale, not admin) */}
                        {(isPro || isWhale) && !isAdmin && (
                          <Link
                            href="/settings?section=subscription"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-terminal-muted hover:text-red-400 hover:bg-red-500/5 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel Subscription
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-gold-500/10 py-1">
                        <button
                          onClick={() => { signOut({ callbackUrl: '/' }); setIsDropdownOpen(false) }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-terminal-muted hover:text-gold-500 transition-colors">
                  {t('nav.login')}
                </Link>
                <Link href="/register" className="btn-gold text-sm py-2 px-4">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-terminal-muted hover:text-gold-500"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gold-500/10">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-terminal-muted hover:text-gold-500 transition-colors" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link href="/astrology" className="text-terminal-muted hover:text-gold-500 transition-colors" onClick={() => setIsMenuOpen(false)}>
                Astrology
              </Link>
              {session && (isPro || isWhale) && (
                <Link href="/advanced" className="text-terminal-muted hover:text-gold-500 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Advanced
                </Link>
              )}
              <Link href="/billing" className="text-terminal-muted hover:text-gold-500 transition-colors" onClick={() => setIsMenuOpen(false)}>
                Pricing
              </Link>
              <Link href="/contact" className="text-terminal-muted hover:text-gold-500 transition-colors" onClick={() => setIsMenuOpen(false)}>
                {t('nav.contact')}
              </Link>
              {session ? (
                <>
                  <Link href="/dashboard" className="text-terminal-muted hover:text-gold-500 transition-colors" onClick={() => setIsMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <div className="pt-2 border-t border-gold-500/10">
                    <p className="text-white font-medium mb-1">Hola, {displayName}</p>
                    {isWhale && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-2">
                        WHALE
                      </span>
                    )}
                    {isPro && !isWhale && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gold-500/20 text-gold-400 mb-2">
                        PRO
                      </span>
                    )}
                  </div>
                  <Link href="/settings" className="text-terminal-muted hover:text-gold-500 transition-colors" onClick={() => setIsMenuOpen(false)}>
                    My Profile
                  </Link>
                  <button
                    onClick={() => { signOut({ callbackUrl: '/' }); setIsMenuOpen(false) }}
                    className="text-left text-red-400 hover:text-red-300 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-terminal-muted hover:text-gold-500 transition-colors" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                  <Link href="/register" className="btn-gold text-center text-sm py-2 px-4" onClick={() => setIsMenuOpen(false)}>
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
