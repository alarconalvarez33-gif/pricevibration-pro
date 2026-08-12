import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Analytics } from '@vercel/analytics/next'
import DomainTitle from '@/components/DomainTitle'
import ExnessBanner from '@/components/ExnessBanner'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fbbf24',
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://sacredlevels.com'),
  title: {
    default: 'Sacred Levels | Calculadora de Niveles Gann para Trading — Oro, Forex, Crypto',
    template: '%s | Sacred Levels'
  },
  description: 'Calculá niveles de soporte y resistencia de alta probabilidad con el método de raíz cuadrada de W.D. Gann. Herramienta profesional para XAUUSD, Forex y Crypto. 3 usos gratis.',
  keywords: [
    'trading',
    'niveles Gann',
    'calculadora Gann',
    'forex',
    'oro',
    'xauusd',
    'soporte resistencia',
    'análisis técnico',
    'W.D. Gann trading',
    'calculadora trading',
    'niveles de precio',
    'XAU/USD calculator',
    'gold trading',
    'crypto análisis',
    'raíz cuadrada precio',
  ],
  authors: [{ name: 'Sacred Levels' }],
  creator: 'Sacred Levels',
  publisher: 'Sacred Levels',
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
    locale: 'es_ES',
    url: 'https://sacredlevels.com',
    siteName: 'Sacred Levels',
    title: 'Sacred Levels | Calculadora de Niveles Gann para Trading',
    description: 'Calculá niveles de soporte y resistencia de alta probabilidad con el método de W.D. Gann. 3 usos gratis, sin registro.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sacred Levels - Calculadora de Niveles Gann para Trading',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sacred Levels | Calculadora de Niveles Gann',
    description: 'Calculá niveles de alta probabilidad para XAUUSD, Forex y Crypto con el método de W.D. Gann. 3 usos gratis.',
    images: ['/og-image.png'],
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
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;1,400;1,600&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&display=swap" rel="stylesheet" />

        {/* Structured Data — SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Sacred Levels — Calculadora de Niveles Gann",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Web",
              "url": "https://sacredlevels.com/quantum",
              "description": "Calculadora de niveles de soporte y resistencia basada en el método de raíz cuadrada de W.D. Gann. Para Oro (XAUUSD), Forex y Crypto.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "description": "3 cálculos gratuitos sin registro"
              },
              "author": {
                "@type": "Organization",
                "name": "Sacred Levels",
                "url": "https://sacredlevels.com"
              }
            })
          }}
        />

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
      <body className="min-h-screen bg-[#0A0A0B] text-white antialiased" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <Providers>
          {/* Promo Exness — arriba de todo, visible en todas las páginas */}
          <ExnessBanner />
          <DomainTitle />
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
