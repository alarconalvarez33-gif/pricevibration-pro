/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd3dpet1g0ty5ed.cloudfront.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
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
              "img-src 'self' data: blob: https:",
              "frame-src 'self' https://s.tradingview.com https://www.tradingview.com https://player.vimeo.com",
              "connect-src 'self' https://s3.tradingview.com https://s.tradingview.com https://api.binance.com https://www.google-analytics.com https://player.vimeo.com https://vimeo.com https://fresnel.vimeocdn.com https://skyfire.vimeo.com",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
