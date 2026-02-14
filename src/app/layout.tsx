import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Analytics } from '@vercel/analytics/next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fbbf24',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://pricevibration.com'),
  title: {
    default: 'PriceVibration Pro | Professional Trading Tools by TheMentorTrading',
    template: '%s | PriceVibration Pro'
  },
  description: 'Master the markets with W.D. Gann\'s Law of Vibration and heliocentric planetary cycles. Professional trading tools for XAU/USD, Forex, and Crypto. Calculate precise support and resistance levels instantly.',
  keywords: [
    'Gann trading',
    'Square of 9',
    'XAU/USD calculator',
    'gold trading',
    'support resistance levels',
    'Gann wheel',
    'planetary trading',
    'heliocentric astrology',
    'trading tools',
    'forex calculator',
    'crypto analysis',
    'technical analysis',
    'W.D. Gann',
    'Law of Vibration',
    'PriceVibration'
  ],
  authors: [{ name: 'TheMentorTrading' }],
  creator: 'TheMentorTrading',
  publisher: 'PriceVibration Pro',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pricevibration.com',
    siteName: 'PriceVibration Pro',
    title: 'PriceVibration Pro | Professional Gann Trading Tools',
    description: 'Master the markets with W.D. Gann\'s Law of Vibration and heliocentric planetary cycles. Professional trading tools for XAU/USD, Forex, and Crypto.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PriceVibration Pro - Professional Trading Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PriceVibration Pro | Professional Gann Trading Tools',
    description: 'Master the markets with W.D. Gann\'s Law of Vibration and heliocentric planetary cycles.',
    images: ['/og-image.png'],
    creator: '@pricevibration',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
  category: 'finance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17947767962"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-17947767962');
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-terminal-bg text-white antialiased">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
