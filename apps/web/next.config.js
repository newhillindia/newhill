/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,  images: {
    domains: [
      process.env.CLOUDFRONT_DOMAIN || 'localhost',
      process.env.S3_BUCKET_DOMAIN || 'localhost',
      'res.cloudinary.com', // Cloudinary domain
      'i.ibb.co', // Image hosting for logo
    ],
    unoptimized: process.env.NODE_ENV === 'production' && process.env.USE_CLOUDFRONT === 'true'
  },= 'true'
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://us.i.posthog.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.newhillspices.com https://us.i.posthog.com https://uyezqzxriwextrcklslr.supabase.co; frame-src 'none'; object-src 'none'; base-uri 'self';",
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  // Security
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
}

module.exports = nextConfig
