import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingCartButton from '@/components/ui/FloatingCartButton'
import PostHogProvider from '@/components/providers/PostHogProvider'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-body'
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-heading'
})

export const metadata: Metadata = {
  title: {
    default: 'Newhill Spices - Premium Farm-to-Table Spices Since 1995',
    template: '%s | Newhill Spices'
  },
  description: 'Discover the finest spices directly from our farms in Munnar, Kerala. Premium quality, organic, and authentic flavors that transform every meal. FSSAI certified, 100% natural.',
  keywords: ['spices', 'premium spices', 'organic spices', 'farm to table', 'Munnar spices', 'Kerala spices', 'cardamom', 'black pepper', 'cinnamon', 'FSSAI certified', 'whole spices', 'ground spices', 'spice blends', 'Indian spices'],
  authors: [{ name: 'Newhill Spices', url: 'https://newhillspices.com' }],
  creator: 'Newhill Spices',
  publisher: 'Newhill Spices',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://newhillspices.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Newhill Spices - Premium Farm-to-Table Spices',
    description: 'Discover the finest spices directly from our farms in Munnar, Kerala. FSSAI certified, organic, and authentic.',
    url: 'https://newhillspices.com',
    siteName: 'Newhill Spices',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Newhill Spices - Premium Organic Spices from Munnar',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Newhill Spices - Premium Farm-to-Table Spices',
    description: 'Discover the finest spices directly from our farms in Munnar, Kerala.',
    creator: '@newhillspices',
    images: ['/images/twitter-image.jpg'],
  },
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
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#046E5B' },
    { media: '(prefers-color-scheme: dark)', color: '#035A4A' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        {/* Preconnect to important domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className="font-body antialiased bg-white" suppressHydrationWarning>
        <PostHogProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main id="main-content" className="flex-1" role="main">
              {children}
            </main>
            <Footer />
            <FloatingCartButton />
          </div>
        </PostHogProvider>
        {/* No-script fallback for users with JavaScript disabled */}
        <noscript>
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            padding: '1rem', 
            backgroundColor: '#FEF3C7', 
            color: '#92400E',
            textAlign: 'center',
            zIndex: 9999,
            borderBottom: '2px solid #F59E0B'
          }}>
            For the best experience, please enable JavaScript in your browser.
          </div>
        </noscript>
      </body>
    </html>
  )
}
