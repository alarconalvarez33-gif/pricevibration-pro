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
}

module.exports = nextConfig
