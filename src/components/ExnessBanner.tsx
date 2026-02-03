'use client'

interface ExnessBannerProps {
  variant?: 'full' | 'compact' | 'sidebar'
  className?: string
}

export default function ExnessBanner({ variant = 'full', className = '' }: ExnessBannerProps) {
  const affiliateUrl = 'https://www.exnesspromo.com/en/trade-gold/?partner_id=xwx0gc598n'

  // Simple link wrapper - uses the official Exness promo page
  // The banner is just a styled link that opens the Exness promotion

  if (variant === 'sidebar') {
    return (
      <div className={`bg-terminal-card border border-terminal-border rounded-xl p-4 text-center ${className}`}>
        <a
          href={affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:opacity-90 transition-opacity"
        >
          <p className="text-terminal-muted text-xs mb-2">Official Partner</p>
          <p className="text-white font-semibold mb-1">Trade Gold with Exness</p>
          <p className="text-gold-500 text-sm">0% Commission →</p>
        </a>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`block bg-terminal-card border border-terminal-border rounded-xl p-4 hover:border-gold-500/30 transition-all ${className}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-terminal-muted text-xs">Official Partner</p>
            <p className="text-white font-semibold">Trade Gold with Exness - 0% Commission</p>
          </div>
          <span className="text-gold-500 font-semibold whitespace-nowrap">Open Account →</span>
        </div>
      </a>
    )
  }

  // Full variant - simple promotional link
  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`block bg-terminal-card border border-gold-500/20 rounded-2xl p-8 hover:border-gold-500/40 transition-all group ${className}`}
    >
      <div className="text-center">
        <p className="text-gold-500 text-sm font-medium mb-2">Official Partner</p>
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Trade Gold with Exness
        </h3>
        <p className="text-terminal-muted text-lg mb-6">
          0% Commission on XAU/USD Trading
        </p>
        <span className="inline-flex items-center gap-2 bg-gold-500 text-black font-bold py-3 px-8 rounded-xl group-hover:bg-gold-400 transition-colors">
          Open Free Account
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
      </div>
    </a>
  )
}
