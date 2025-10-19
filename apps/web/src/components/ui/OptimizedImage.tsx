'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useLocalization } from '@/lib/localization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  // SEO and accessibility props
  title?: string;
  caption?: string;
  role?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 85,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  placeholder = 'blur',
  blurDataURL,
  loading = 'lazy',
  onLoad,
  onError,
  fallbackSrc = '/images/placeholder.jpg',
  title,
  caption,
  role = 'img',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { region } = useLocalization();

  // Generate responsive image URLs based on region/CDN
  const getOptimizedSrc = (originalSrc: string, width?: number) => {
    if (!originalSrc) return fallbackSrc;
    
    // If it's already a Cloudinary URL, return as is
    if (originalSrc.includes('cloudinary.com')) {
      return originalSrc;
    }
    
    // For local images, use Next.js optimization
    return originalSrc;
  };

  // Generate blur data URL for placeholder
  const generateBlurDataURL = (w: number, h: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, w, h);
    }
    return canvas.toDataURL();
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
    onError?.();
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsLoading(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, loading]);

  const optimizedSrc = getOptimizedSrc(imageSrc, width);
  const defaultBlurDataURL = blurDataURL || generateBlurDataURL(width || 400, height || 300);

  return (
    <div className={`relative ${className}`}>
      <Image
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        sizes={sizes}
        priority={priority}
        loading={loading}
        placeholder={placeholder}
        blurDataURL={placeholder === 'blur' ? defaultBlurDataURL : undefined}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${hasError ? 'opacity-50' : ''}`}
        title={title}
        role={role}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        // Additional accessibility attributes
        tabIndex={-1}
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
      
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">Image unavailable</p>
          </div>
        </div>
      )}
      
      {/* Caption */}
      {caption && (
        <figcaption className="mt-2 text-sm text-gray-600 text-center">
          {caption}
        </figcaption>
      )}
    </div>
  );
}

// Product image component with specific optimizations
export function ProductImage({
  product,
  variant = 'default',
  className = '',
  ...props
}: {
  product: {
    id: string;
    name: { en: string; ar?: string; hi?: string };
    images: string[];
  };
  variant?: 'thumbnail' | 'card' | 'detail' | 'hero';
  className?: string;
} & Omit<OptimizedImageProps, 'src' | 'alt'>) {
  const { language } = useLocalization();
  
  const getImageSrc = () => {
    if (!product.images || product.images.length === 0) {
      return '/images/product-placeholder.jpg';
    }
    return product.images[0];
  };

  const getAltText = () => {
    const productName = product.name[language] || product.name.en;
    return `${productName} - Premium spice from Newhill Spices`;
  };

  const getDimensions = () => {
    switch (variant) {
      case 'thumbnail':
        return { width: 150, height: 150 };
      case 'card':
        return { width: 300, height: 300 };
      case 'detail':
        return { width: 600, height: 600 };
      case 'hero':
        return { width: 800, height: 400 };
      default:
        return { width: 400, height: 400 };
    }
  };

  const getSizes = () => {
    switch (variant) {
      case 'thumbnail':
        return '150px';
      case 'card':
        return '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw';
      case 'detail':
        return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw';
      case 'hero':
        return '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw';
      default:
        return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
    }
  };

  const dimensions = getDimensions();

  return (
    <OptimizedImage
      src={getImageSrc()}
      alt={getAltText()}
      width={dimensions.width}
      height={dimensions.height}
      sizes={getSizes()}
      className={`${className} ${variant === 'hero' ? 'rounded-lg' : 'rounded-md'}`}
      priority={variant === 'hero'}
      quality={variant === 'hero' ? 90 : 85}
      {...props}
    />
  );
}

// Hero image component with advanced optimizations
export function HeroImage({
  src,
  alt,
  className = '',
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
} & Omit<OptimizedImageProps, 'src' | 'alt' | 'priority'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={1200}
      height={600}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
      priority={true}
      quality={90}
      className={`w-full h-full object-cover ${className}`}
      {...props}
    />
  );
}

// Gallery image component for product galleries
export function GalleryImage({
  src,
  alt,
  index,
  isActive,
  onClick,
  className = '',
  ...props
}: {
  src: string;
  alt: string;
  index: number;
  isActive: boolean;
  onClick: () => void;
  className?: string;
} & Omit<OptimizedImageProps, 'src' | 'alt' | 'onClick'>) {
  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden rounded-md transition-all duration-200 ${
        isActive ? 'ring-2 ring-emerald-500' : 'hover:ring-1 hover:ring-gray-300'
      } ${className}`}
      aria-label={`View image ${index + 1}: ${alt}`}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        width={100}
        height={100}
        sizes="100px"
        className="w-full h-full object-cover"
        {...props}
      />
    </button>
  );
}

