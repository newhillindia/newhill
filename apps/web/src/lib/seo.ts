import { Metadata } from 'next';
import { useLocalization } from './localization';

// SEO Configuration
export const SEO_CONFIG = {
  siteName: 'Newhill Spices',
  siteDescription: 'Premium Farm-to-Table Spices Since 1995',
  siteUrl: 'https://newhillspices.com',
  defaultImage: 'https://newhillspices.com/images/og-default.jpg',
  twitterHandle: '@newhillspices',
  facebookAppId: 'your-facebook-app-id',
  googleSiteVerification: 'your-google-verification-code',
  bingSiteVerification: 'your-bing-verification-code',
};

// JSON-LD Structured Data
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Newhill Spices',
    description: 'Premium Farm-to-Table Spices Since 1995',
    url: 'https://newhillspices.com',
    logo: 'https://newhillspices.com/images/logo.png',
    image: 'https://newhillspices.com/images/hero-bg.jpg',
    foundingDate: '1995',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Munnar',
      addressLocality: 'Kerala',
      postalCode: '685612',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-1234567890',
      contactType: 'customer service',
      email: 'info@newhillspices.com',
    },
    sameAs: [
      'https://facebook.com/newhillspices',
      'https://instagram.com/newhillspices',
      'https://twitter.com/newhillspices',
      'https://youtube.com/newhillspices',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Premium Spices',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'Premium Spices Collection',
            description: 'Farm-to-table spices from Munnar, Kerala',
          },
        },
      ],
    },
  };
}

export function generateProductSchema(product: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name.en,
    description: product.description?.en || product.name.en,
    image: product.images?.map((img: string) => `https://newhillspices.com${img}`) || [],
    brand: {
      '@type': 'Brand',
      name: 'Newhill Spices',
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Newhill Spices',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'INR',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Newhill Spices',
      },
      url: `https://newhillspices.com/products/${product.slug}`,
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating.average,
      reviewCount: product.rating.count,
    } : undefined,
    category: product.category,
    sku: product.sku,
    gtin: product.gtin,
  };
}

export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `https://newhillspices.com${crumb.url}`,
    })),
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Open Graph and Twitter Card metadata
export function generateMetadata({
  title,
  description,
  image,
  url,
  type = 'website',
  locale = 'en_US',
}: {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: 'website' | 'article' | 'product';
  locale?: string;
}): Metadata {
  const fullTitle = `${title} | ${SEO_CONFIG.siteName}`;
  const fullImage = image ? `https://newhillspices.com${image}` : SEO_CONFIG.defaultImage;
  const fullUrl = `${SEO_CONFIG.siteUrl}${url}`;

  return {
    title: fullTitle,
    description,
    keywords: [
      'spices',
      'premium spices',
      'organic spices',
      'farm to table',
      'Munnar',
      'Kerala',
      'Newhill Spices',
      'Indian spices',
      'authentic spices',
    ],
    authors: [{ name: 'Newhill Spices' }],
    creator: 'Newhill Spices',
    publisher: 'Newhill Spices',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(SEO_CONFIG.siteUrl),
    alternates: {
      canonical: fullUrl,
      languages: {
        'en': fullUrl,
        'hi': `${fullUrl}?lang=hi`,
        'ar': `${fullUrl}?lang=ar`,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: SEO_CONFIG.siteName,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale,
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImage],
      creator: SEO_CONFIG.twitterHandle,
      site: SEO_CONFIG.twitterHandle,
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
    verification: {
      google: SEO_CONFIG.googleSiteVerification,
      yandex: SEO_CONFIG.bingSiteVerification,
    },
  };
}

// Sitemap generation
export async function generateSitemap(): Promise<string> {
  const baseUrl = SEO_CONFIG.siteUrl;
  const currentDate = new Date().toISOString();

  // Static pages
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/contact', priority: '0.8', changefreq: 'monthly' },
    { url: '/faq', priority: '0.7', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.5', changefreq: 'yearly' },
    { url: '/terms', priority: '0.5', changefreq: 'yearly' },
    { url: '/refunds', priority: '0.5', changefreq: 'yearly' },
    { url: '/gst-faq', priority: '0.5', changefreq: 'yearly' },
    { url: '/products', priority: '0.9', changefreq: 'daily' },
    { url: '/cart', priority: '0.6', changefreq: 'weekly' },
    { url: '/checkout', priority: '0.6', changefreq: 'weekly' },
  ];

  // Dynamic pages (products, categories, etc.)
  // In production, fetch from database
  const dynamicPages = [
    // { url: '/products/cardamom', priority: '0.8', changefreq: 'weekly' },
    // { url: '/products/pepper', priority: '0.8', changefreq: 'weekly' },
    // Add more products as needed
  ];

  const allPages = [...staticPages, ...dynamicPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
}

// Robots.txt generation
export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${SEO_CONFIG.siteUrl}/sitemap.xml

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /auth/

# Allow important pages
Allow: /products/
Allow: /about
Allow: /contact
Allow: /faq

# Crawl delay
Crawl-delay: 1`;
}

// Analytics integration
export function initializeAnalytics() {
  if (typeof window === 'undefined') return;

  // PostHog initialization (already done in PostHogProvider)
  
  // Google Analytics 4
  if (process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });

    (window as any).gtag = gtag;
  }
}

// SEO utility functions
export function generateCanonicalUrl(path: string): string {
  return `${SEO_CONFIG.siteUrl}${path}`;
}

export function generateAlternateUrls(path: string): Array<{ hreflang: string; href: string }> {
  return [
    { hreflang: 'en', href: `${SEO_CONFIG.siteUrl}${path}` },
    { hreflang: 'hi', href: `${SEO_CONFIG.siteUrl}${path}?lang=hi` },
    { hreflang: 'ar', href: `${SEO_CONFIG.siteUrl}${path}?lang=ar` },
    { hreflang: 'x-default', href: `${SEO_CONFIG.siteUrl}${path}` },
  ];
}

export function generateKeywords(baseKeywords: string[]): string[] {
  const additionalKeywords = [
    'spices',
    'premium spices',
    'organic spices',
    'farm to table',
    'Munnar',
    'Kerala',
    'Indian spices',
    'authentic spices',
    'Newhill Spices',
    'spice company',
    'wholesale spices',
    'retail spices',
    'B2B spices',
  ];

  return [...new Set([...baseKeywords, ...additionalKeywords])];
}

// Performance monitoring for SEO
export function trackSEOMetrics() {
  if (typeof window === 'undefined') return;

  // Track Core Web Vitals
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        // Track LCP
        if (process.env.NODE_ENV === 'development') {
          console.log('LCP:', entry.startTime);
        }
      }
      if (entry.entryType === 'first-input') {
        // Track FID
        if (process.env.NODE_ENV === 'development') {
          console.log('FID:', (entry as any).processingStart - entry.startTime);
        }
      }
      if (entry.entryType === 'layout-shift') {
        // Track CLS
        if (process.env.NODE_ENV === 'development') {
          console.log('CLS:', (entry as any).value);
        }
      }
    }
  });

  observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
}

// Initialize analytics on page load
if (typeof window !== 'undefined') {
  initializeAnalytics();
  trackSEOMetrics();
}
