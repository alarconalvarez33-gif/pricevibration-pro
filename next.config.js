/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@anthropic-ai/sdk'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    domains: ['localhost', 'sacredlevels.com', 'trading.com.py'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/ser',
        destination: '/dashboard',
        permanent: false,
      },
      {
        source: '/ser/planes',
        destination: '/billing',
        permanent: false,
      },
      // Quantum se unificó con SER — la calculadora vive en el dashboard.
      {
        source: '/quantum',
        destination: '/dashboard',
        permanent: false,
      },
      // QTrader fue eliminado por completo.
      {
        source: '/qtrader',
        destination: '/',
        permanent: false,
      },
      {
        source: '/qtrader/:path*',
        destination: '/',
        permanent: false,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://s3.tradingview.com https://s.tradingview.com https://www.googletagmanager.com https://www.google-analytics.com https://player.vimeo.com https://f.vimeocdn.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://f.vimeocdn.com",
              "font-src 'self' https://fonts.gstatic.com https://f.vimeocdn.com",
              "img-src 'self' data: blob: https: https://*.cloudfront.net",
              "frame-src 'self' https://s.tradingview.com https://www.tradingview.com https://player.vimeo.com https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com",
              "connect-src 'self' https://s3.tradingview.com https://s.tradingview.com https://api.binance.com https://www.google-analytics.com https://player.vimeo.com https://vimeo.com https://fresnel.vimeocdn.com https://skyfire.vimeo.com",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
