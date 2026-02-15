'use client'

import Link from 'next/link'
import Logo from './Logo'
import ExnessBanner from './ExnessBanner'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="bg-terminal-card border-t border-terminal-border relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Logo size="sm" showText={true} className="mb-4" />
            <p className="text-terminal-muted text-sm max-w-md mb-4">
              Professional trading tools combining W.D. Gann&apos;s Law of Vibration with
              heliocentric planetary cycles. Calculate precise support and resistance levels
              for XAU/USD, Forex, and Crypto markets.
            </p>
            <div className="flex gap-4">
              {/* Twitter/X */}
              <a href="#" className="text-terminal-muted hover:text-gold-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* Telegram */}
              <a href="#" className="text-terminal-muted hover:text-gold-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
              {/* Discord */}
              <a href="#" className="text-terminal-muted hover:text-gold-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gold-500 font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-terminal-muted hover:text-gold-500 transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/billing" className="text-terminal-muted hover:text-gold-500 transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-terminal-muted hover:text-gold-500 transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/astrology" className="text-terminal-muted hover:text-gold-500 transition-colors text-sm">
                  Astrology
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-gold-500 font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-terminal-muted hover:text-gold-500 transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-terminal-muted hover:text-gold-500 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-terminal-muted hover:text-gold-500 transition-colors text-sm">
                  Risk Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-terminal-muted hover:text-gold-500 transition-colors text-sm">
                  {t('nav.contact') || 'Contact'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Exness Banner */}
        <div className="mt-8">
          <ExnessBanner />
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-8 pt-8 border-t border-terminal-border">
          <div className="bg-terminal-bg border border-gold-500/20 rounded-xl p-6">
            <h3 className="text-gold-500 font-semibold text-sm mb-3 uppercase tracking-wide">
              {t('footer.legal')}
            </h3>
            <p className="text-terminal-muted/80 text-xs leading-relaxed">
              {t('footer.disclaimer')}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-terminal-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-terminal-muted text-sm">
              © 2025 The Mentor Trading. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {/* Stripe Badge */}
              <div className="flex items-center gap-2 text-terminal-muted/60 text-xs">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                </svg>
                <span>Secure payments powered by Stripe</span>
              </div>
            </div>
          </div>
          <p className="text-terminal-muted/50 text-xs text-center mt-4">
            Trading involves substantial risk. Past performance is not indicative of future results. This is not financial advice.
          </p>
          <p className="text-terminal-muted/50 text-xs text-center mt-2">
            Service not available for residents of United States, North Korea, Iran, Syria, Cuba, and other sanctioned countries.
            By using this service, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-gold-500 transition-colors">
              Terms & Conditions
            </Link>
            {' '}and{' '}
            <Link href="/disclaimer" className="underline hover:text-gold-500 transition-colors">
              Disclaimer
            </Link>.
          </p>
        </div>
      </div>
    </footer>
  )
}
