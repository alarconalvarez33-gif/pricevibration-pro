import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Radar de Señales en Vivo — 12 Mercados | Sacred Levels',
  description:
    'Señales de trading en tiempo real para Oro, Forex, Crypto e Índices. Detección automática de zonas de compra y venta sobre 12 mercados. Probá gratis 2 activos.',
  keywords: [
    'señales trading en vivo',
    'señales forex',
    'señales oro XAUUSD',
    'señales crypto BTCUSD ETHUSD',
    'radar de mercados',
    'señales índices US30 NAS100',
    'compra venta trading',
    'niveles de soporte y resistencia',
    'análisis algorítmico mercados',
    'trading Paraguay',
    'señales en tiempo real',
  ],
  alternates: { canonical: 'https://sacredlevels.com/hub' },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://sacredlevels.com/hub',
    siteName: 'Sacred Levels',
    title: 'Radar de Señales en Vivo — 12 Mercados',
    description:
      'Señales de trading en tiempo real para Oro, Forex, Crypto e Índices. Detección automática de zonas de compra y venta.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Radar de Señales — Sacred Levels' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Radar de Señales en Vivo — 12 Mercados',
    description: 'Señales de trading en tiempo real para Oro, Forex, Crypto e Índices.',
    images: ['/og-image.png'],
  },
};

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Radar de Señales Sacred Levels',
            url: 'https://sacredlevels.com/hub',
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'Web',
            description:
              'Radar de señales de trading sobre 12 mercados (Oro, Forex, Crypto, Índices) con detección automática de zonas de compra y venta en tiempo real.',
            offers: [
              { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: '2 activos gratuitos sin registro' },
              { '@type': 'Offer', price: '30', priceCurrency: 'USD', description: 'Acceso completo — 12 activos del radar' },
            ],
            featureList: [
              'Señales de compra y venta en tiempo real',
              '12 mercados monitoreados simultáneamente',
              'Niveles de soporte y resistencia calculados por algoritmo',
              'Confianza estadística por activo',
              'Actualización cada 15 segundos',
            ],
            provider: { '@type': 'Organization', name: 'Sacred Levels', url: 'https://sacredlevels.com' },
          }),
        }}
      />
      {children}
    </>
  );
}
