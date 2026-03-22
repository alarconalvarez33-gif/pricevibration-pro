import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Analytics } from '@vercel/analytics/next'
import DomainTitle from '@/components/DomainTitle'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fbbf24',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://sacredlevels.com'),
  title: {
    default: 'Sacred Levels | Calculadora de Niveles Cuánticos para Trading',
    template: '%s | Sacred Levels'
  },
  description: 'Calcula niveles de alta probabilidad de giro usando física cuántica. Herramienta profesional para traders de Forex, Oro y Crypto. Prueba gratis.',
  keywords: [
    'trading',
    'niveles cuánticos',
    'forex',
    'oro',
    'xauusd',
    'fibonacci',
    'soporte resistencia',
    'análisis técnico',
    'física cuántica trading',
    'calculadora trading',
    'niveles de precio',
    'XAU/USD calculator',
    'gold trading',
    'crypto análisis',
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
    title: 'Sacred Levels | Niveles Cuánticos para Trading',
    description: 'Predice zonas de giro con física cuántica. 2 cálculos gratis.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sacred Levels - Calculadora de Niveles Cuánticos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sacred Levels | Calculadora Cuántica',
    description: 'Niveles de alta probabilidad para traders profesionales',
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
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

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
      <body className="min-h-screen bg-white text-[#111111] antialiased" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <Providers>
          <DomainTitle />
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
