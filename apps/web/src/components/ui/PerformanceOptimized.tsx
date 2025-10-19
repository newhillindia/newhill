'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Skeleton loader components
export function SkeletonLoader({ 
  className = '', 
  variant = 'default',
  lines = 1,
  width = '100%',
  height = '1rem'
}: {
  className?: string;
  variant?: 'default' | 'card' | 'text' | 'image' | 'button';
  lines?: number;
  width?: string | number;
  height?: string | number;
}) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const variants = {
    default: 'h-4 bg-gray-200 rounded',
    card: 'h-48 bg-gray-200 rounded-lg',
    text: 'h-4 bg-gray-200 rounded',
    image: 'bg-gray-200 rounded-lg',
    button: 'h-10 bg-gray-200 rounded-md',
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${variants[variant]} ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
            style={{ width: i === lines - 1 ? '75%' : width, height }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${variants[variant]} ${className}`}
      style={{ width, height }}
    />
  );
}

// Product card skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <SkeletonLoader variant="image" className="w-full h-48 mb-4" />
      <div className="space-y-2">
        <SkeletonLoader variant="text" lines={2} />
        <SkeletonLoader variant="text" width="60%" />
        <div className="flex justify-between items-center mt-4">
          <SkeletonLoader variant="text" width="40%" />
          <SkeletonLoader variant="button" width="80px" height="32px" />
        </div>
      </div>
    </div>
  );
}

// Product list skeleton
export function ProductListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Page skeleton
export function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header skeleton */}
        <div className="text-center space-y-4">
          <SkeletonLoader variant="text" width="60%" height="2rem" className="mx-auto" />
          <SkeletonLoader variant="text" width="40%" height="1.5rem" className="mx-auto" />
        </div>
        
        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <SkeletonLoader variant="card" height="300px" />
            <div className="space-y-4">
              <SkeletonLoader variant="text" lines={3} />
              <SkeletonLoader variant="text" lines={2} />
            </div>
          </div>
          <div className="space-y-6">
            <SkeletonLoader variant="card" height="200px" />
            <SkeletonLoader variant="card" height="150px" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Data prefetching hook
export function usePrefetch() {
  const router = useRouter();

  const prefetchRoute = (href: string) => {
    router.prefetch(href);
  };

  const prefetchCriticalData = async () => {
    // Prefetch critical API endpoints
    const criticalEndpoints = [
      '/api/v1/products',
      '/api/v1/categories',
      '/api/v1/cart',
    ];

    try {
      await Promise.all(
        criticalEndpoints.map(endpoint => 
          fetch(endpoint, { 
            method: 'HEAD',
            cache: 'force-cache'
          }).catch(() => {})
        )
      );
    } catch (error) {
      console.warn('Failed to prefetch critical data:', error);
    }
  };

  return { prefetchRoute, prefetchCriticalData };
}

// Optimized 3D Hero component
export function OptimizedHero3D() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Intersection Observer for 3D hero
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    const heroElement = document.getElementById('hero-3d');
    if (heroElement) {
      observer.observe(heroElement);
    }

    return () => observer.disconnect();
  }, []);

  // Lazy load 3D assets only when visible
  useEffect(() => {
    if (isVisible && !isLoaded) {
      // Simulate 3D asset loading
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, isLoaded]);

  return (
    <div id="hero-3d" className="relative h-96 bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-lg overflow-hidden">
      {!isLoaded ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <SkeletonLoader variant="card" className="w-full h-full" />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Premium Spices</h1>
            <p className="text-xl mb-8">From Farm to Table</p>
            <button className="bg-gold-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gold-600 transition-colors">
              Shop Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Server-side rendering optimization
export function SSRWrapper({ 
  children, 
  fallback = <PageSkeleton />,
  ssr = true 
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  ssr?: boolean;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!ssr && !isClient) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Critical resource preloader
export function CriticalResourcePreloader() {
  useEffect(() => {
    // Preload critical fonts
    const fontPreloads = [
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap',
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    ];

    fontPreloads.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      document.head.appendChild(link);
    });

    // Preload critical images
    const criticalImages = [
      '/images/hero-bg.jpg',
      '/images/logo.png',
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }, []);

  return null;
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Monitor Core Web Vitals
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (process.env.NODE_ENV === 'development') {
          console.log('LCP:', lastEntry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('FID:', entry.processingStart - entry.startTime);
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        if (process.env.NODE_ENV === 'development') {
          console.log('CLS:', clsValue);
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }, []);
}

// Optimized link component with prefetching
export function OptimizedLink({ 
  href, 
  children, 
  prefetch = true,
  ...props 
}: {
  href: string;
  children: React.ReactNode;
  prefetch?: boolean;
} & React.ComponentProps<typeof Link>) {
  const { prefetchRoute } = usePrefetch();

  const handleMouseEnter = () => {
    if (prefetch) {
      prefetchRoute(href);
    }
  };

  return (
    <Link
      href={href}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </Link>
  );
}

// Virtual scrolling for large lists
export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = '',
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(visibleStart, visibleEnd);

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${visibleStart * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) =>
            renderItem(item, visibleStart + index)
          )}
        </div>
      </div>
    </div>
  );
}
