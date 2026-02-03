'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import Logo from './Logo'

export default function Navbar() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Determine user tier
  const getUserTier = () => {
    if (!session?.user) return null
    const email = session.user.email || ''
    if (email.includes('whale')) return 'whale'
    if (session.user.isPremium) return 'pro'
    return 'free'
  }

  const tier = getUserTier()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-terminal-bg/95 backdrop-blur-md border-b border-terminal-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo size="sm" showText={true} />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-terminal-muted hover:text-gold-500 transition-colors">
              Home
            </Link>
            <Link href="/astrology" className="text-terminal-muted hover:text-gold-500 transition-colors">
              Astrology
            </Link>
            {session && tier !== 'free' && (
              <Link href="/advanced" className="text-terminal-muted hover:text-gold-500 transition-colors">
                Advanced
              </Link>
            )}
            <Link href="/billing" className="text-terminal-muted hover:text-gold-500 transition-colors">
              Pricing
            </Link>
            {session ? (
              <>
                <Link href="/dashboard" className="text-terminal-muted hover:text-gold-500 transition-colors">
                  Dashboard
                </Link>
                <Link href="/settings" className="text-terminal-muted hover:text-gold-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
                <div className="flex items-center space-x-4">
                  {tier === 'whale' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      🐋 WHALE
                    </span>
                  )}
                  {tier === 'pro' && (
                    <span className="status-premium">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      PRO
                    </span>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-terminal-muted hover:text-red-500 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-terminal-muted hover:text-gold-500 transition-colors">
                  Login
                </Link>
                <Link href="/register" className="btn-gold text-sm py-2 px-4">
                  Get Started
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
          <div className="md:hidden py-4 border-t border-terminal-border">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-terminal-muted hover:text-gold-500 transition-colors" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link href="/astrology" className="text-terminal-muted hover:text-gold-500 transition-colors" onClick={() => setIsMenuOpen(false)}>
                Astrology
              </Link>
              {session && tier !== 'free' && (
                <Link href="/advanced" className="text-terminal-muted hover:text-gold-500 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Advanced
                </Link>
              )}
              <Link href="/billing" className="text-terminal-muted hover:text-gold-500 transition-colors" onClick={() => setIsMenuOpen(false)}>
                Pricing
              </Link>
              {session ? (
                <>
                  <Link href="/dashboard" className="text-terminal-muted hover:text-gold-500 transition-colors" onClick={() => setIsMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Link href="/settings" className="text-terminal-muted hover:text-gold-500 transition-colors" onClick={() => setIsMenuOpen(false)}>
                    Settings
                  </Link>
                  <div className="pt-2 border-t border-terminal-border">
                    {tier === 'whale' && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-2">
                        🐋 WHALE
                      </span>
                    )}
                    {tier === 'pro' && (
                      <span className="inline-block status-premium mb-2">
                        PRO Member
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => { signOut({ callbackUrl: '/' }); setIsMenuOpen(false) }}
                    className="text-left text-terminal-muted hover:text-red-500 transition-colors"
                  >
                    Logout
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
