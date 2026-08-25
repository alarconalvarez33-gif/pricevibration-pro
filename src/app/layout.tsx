import type { Metadata, Viewport } from 'next'
import { Anton, Archivo, Martian_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Analytics } from '@vercel/analytics/next'
import DomainTitle from '@/components/DomainTitle'

const SITE_URL = 'https://trading.com.py'

// Headlines, body and figures. Loaded through next/font so they are
// self-hosted and cannot shift the layout while an external stylesheet loads.
const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-anton',
})

const archivo = Archivo({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo',
})

const martianMono = Martian_Mono({
  weight: ['400', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-martian',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0F7A6B',
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Trading.com.py | Seis niveles por sesión, publicados a las 07:00 de Paraguay',
    template: '%s | Trading.com.py',
  },
  description:
    'Seis niveles algorítmicos de soporte y resistencia por activo, calculados una vez al día a las 07:00 de Paraguay y verificados al cierre. Registro público de 90 días para oro, cripto, forex e índices. Acceso completo gratis con tu cuenta de broker.',
  keywords: [
    'niveles de soporte y resistencia',
    'niveles algorítmicos',
    'trading Paraguay',
    'XAUUSD niveles',
    'oro',
    'forex',
    'cripto',
    'índices',
    'calculadora de riesgo',
    'tamaño de lote',
    'registro verificado',
    'análisis técnico',
    'trading.com.py',
  ],
  alternates: {
    canonical: SITE_URL,
  },
  authors: [{ name: 'The Mentor Trading' }],
  creator: 'The Mentor Trading',
  publisher: 'The Mentor Trading',
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
    locale: 'es_PY',
    url: SITE_URL,
    siteName: 'Trading.com.py',
    title: 'Trading.com.py | Seis niveles por sesión, verificados al cierre',
    description:
      'Los niveles se calculan una vez, a las 07:00 de Paraguay, y quedan escritos. Al cierre marcamos cuáles el precio respetó. Los días malos también quedan.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Trading.com.py — seis niveles por sesión, con registro público verificado',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trading.com.py | Seis niveles por sesión, verificados al cierre',
    description:
      'Seis niveles algorítmicos por activo, publicados a las 07:00 de Paraguay y verificados al cierre. Registro público de 90 días.',
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
    <html
      lang="es"
      className={`scroll-smooth ${anton.variable} ${archivo.variable} ${martianMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;1,400;1,600&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&display=swap" rel="stylesheet" />

        {/* Structured Data — the levels service, not a "Gann calculator" */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Trading.com.py',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web',
              url: SITE_URL,
              inLanguage: 'es-PY',
              description:
                'Seis niveles algorítmicos de soporte y resistencia por activo, publicados a las 07:00 de Paraguay y verificados al cierre de la sesión, con registro público de 90 días.',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                description:
                  'Historial completo y los tres primeros niveles del día, sin registro. Acceso completo gratis con cuenta de broker verificada.',
              },
              author: {
                '@type': 'Organization',
                name: 'The Mentor Trading',
                url: SITE_URL,
              },
            }),
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
          {/* The Exness creatives live inside the page, where the copy earns
              them — never pinned above the masthead. */}
          <DomainTitle />
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
