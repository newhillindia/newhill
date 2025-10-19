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
  title: 'Newhill Spices - Premium Farm-to-Table Spices Since 1995',
  description: 'Discover the finest spices directly from our farms in Munnar, Kerala. Premium quality, organic, and authentic flavors that transform every meal.',
  keywords: 'spices, premium spices, organic spices, farm to table, Munnar, Kerala, Newhill Spices',
  authors: [{ name: 'Newhill Spices' }],
  openGraph: {
    title: 'Newhill Spices - Premium Farm-to-Table Spices',
    description: 'Discover the finest spices directly from our farms in Munnar, Kerala.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Newhill Spices - Premium Farm-to-Table Spices',
    description: 'Discover the finest spices directly from our farms in Munnar, Kerala.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-body antialiased">
        <PostHogProvider>
          <div className="min-h-screen bg-white">
            <Header />
            <main id="main-content">
              {children}
            </main>
            <Footer />
            <FloatingCartButton />
          </div>
        </PostHogProvider>
      </body>
    </html>
  )
}
