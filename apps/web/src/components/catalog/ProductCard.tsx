'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Star, Eye, Clock, Award } from 'lucide-react';
import { Product } from '@newhill/shared';
import { trackProductView, trackAddToCart } from '@/lib/posthog';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string, variantId?: string) => void;
  onAddToWishlist?: (productId: string) => void;
  onQuickView?: (product: Product) => void;
  showQuickView?: boolean;
  showWishlist?: boolean;
  viewMode?: 'grid' | 'list';
  className?: string;
}

export default function ProductCard({
  product,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  showQuickView = true,
  showWishlist = true,
  viewMode = 'grid',
  className = ''
}: ProductCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  const handleAddToCart = async () => {
    if (!onAddToCart) return;
    
    setIsAddingToCart(true);
    try {
      await onAddToCart(product.id, product.variants[0]?.id);
      
      // Track add to cart event
      trackAddToCart(
        product.id,
        product.name.en,
        product.price,
        1,
        product.currency
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!onAddToWishlist) return;
    
    setIsAddingToWishlist(true);
    try {
      await onAddToWishlist(product.id);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleQuickView = () => {
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const formatPrice = (price: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getStockStatus = () => {
    if (!product.inStock) return { text: 'Out of Stock', color: 'text-red-600' };
    if (product.stockQuantity <= 10) return { text: 'Low Stock', color: 'text-orange-600' };
    return { text: 'In Stock', color: 'text-emerald-600' };
  };

  const stockStatus = getStockStatus();

  if (viewMode === 'list') {
    return (
      <div className={`product-card card-hover group relative flex gap-4 p-4 ${className}`}>
        {/* Image Container */}
        <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
          <Link href={`/products/${product.slug}`}>
            <Image
              src={product.images[0] || '/images/placeholder-product.jpg'}
              alt={product.name.en || 'Product image'}
              fill
              className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                isImageLoading ? 'blur-sm' : 'blur-0'
              }`}
              onLoad={() => setIsImageLoading(false)}
              sizes="128px"
            />
          </Link>

          {/* Stock Badge */}
          <div className="absolute top-1 left-1">
            <span className={`px-1 py-0.5 rounded text-xs font-medium bg-white/90 ${stockStatus.color}`}>
              {stockStatus.text}
            </span>
          </div>

          {/* Certifications */}
          {product.certifications.length > 0 && (
            <div className="absolute top-1 right-1">
              <span className="p-1 bg-emerald-600 text-white rounded-full">
                <Award className="w-2 h-2" />
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              {/* Category */}
              <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                {product.category}
              </div>

              {/* Product Name */}
              <Link href={`/products/${product.slug}`}>
                <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2 line-clamp-1 hover:text-emerald-600 transition-colors duration-200">
                  {product.name.en || 'Product Name'}
                </h3>
              </Link>

              {/* Short Description */}
              <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
                {product.shortDescription.en || product.description.en}
              </p>

              {/* Weight & Unit */}
              <div className="text-sm text-neutral-500 mb-2">
                {product.weight} {product.unit}
              </div>
            </div>

            {/* Price & Rating */}
            <div className="text-right ml-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl font-bold text-emerald-600">
                  {formatPrice(product.price, product.currency)}
                </span>
                {product.variants.some(v => v.price < product.price) && (
                  <span className="text-sm text-neutral-500 line-through">
                    {formatPrice(product.variants[0]?.price || product.price, product.currency)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-end space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-neutral-600">4.8</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleQuickView}
                className="p-2 text-neutral-600 hover:text-emerald-600 transition-colors duration-200"
                aria-label="Quick view"
              >
                <Eye className="w-4 h-4" />
              </button>
              {showWishlist && (
                <button
                  onClick={handleAddToWishlist}
                  disabled={isAddingToWishlist}
                  className="p-2 text-neutral-600 hover:text-emerald-600 transition-colors duration-200 disabled:opacity-50"
                  aria-label="Add to wishlist"
                >
                  <Heart className={`w-4 h-4 ${isAddingToWishlist ? 'animate-pulse' : ''}`} />
                </button>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || isAddingToCart}
              className="btn-primary text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingToCart ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Adding...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </div>
              )}
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-3 pt-3 border-t border-neutral-200">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Fast delivery</span>
              </div>
              <div className="flex items-center space-x-1">
                <Award className="w-3 h-3" />
                <span>Premium quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className={`product-card card-hover group relative ${className}`} aria-label={product.name.en}>
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-neutral-100 ring-1 ring-neutral-200 group-hover:ring-emerald-300 transition-all duration-300">
        <Link href={`/products/${product.slug}`} aria-label={`View ${product.name.en}`}>
          <Image
            src={product.images[0] || '/images/placeholder-product.jpg'}
            alt={product.name.en || 'Product image'}
            fill
            className={`object-cover transition-all duration-500 ease-out group-hover:scale-110 ${
              isImageLoading ? 'blur-sm opacity-0' : 'blur-0 opacity-100'
            }`}
            onLoad={() => setIsImageLoading(false)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={85}
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
          />
        </Link>

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            {showQuickView && (
              <button
                onClick={handleQuickView}
                className="p-2 bg-white/90 hover:bg-white text-neutral-700 rounded-full transition-colors duration-200"
                aria-label="Quick view"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            {showWishlist && (
              <button
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist}
                className="p-2 bg-white/90 hover:bg-white text-neutral-700 rounded-full transition-colors duration-200 disabled:opacity-50"
                aria-label="Add to wishlist"
              >
                <Heart className={`w-4 h-4 ${isAddingToWishlist ? 'animate-pulse' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Stock Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white/90 ${stockStatus.color}`}>
            {stockStatus.text}
          </span>
        </div>

        {/* Certifications */}
        {product.certifications.length > 0 && (
          <div className="absolute top-2 right-2">
            <div className="flex space-x-1">
              {product.certifications.slice(0, 2).map((cert, index) => (
                <span
                  key={index}
                  className="p-1 bg-emerald-600 text-white rounded-full"
                  title={cert}
                >
                  <Award className="w-3 h-3" />
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sale Badge */}
        {product.variants.some(v => v.price < product.price) && (
          <div className="absolute top-2 right-2 bg-gold text-white px-2 py-1 rounded-full text-xs font-medium">
            Sale
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
          {product.category}
        </div>

        {/* Product Name */}
        <Link href={`/products/${product.slug}`} className="group/title">
          <h3 className="font-heading text-lg font-semibold text-neutral-900 mb-2 line-clamp-2 group-hover/title:text-emerald-600 transition-colors duration-200">
            {product.name.en || 'Product Name'}
          </h3>
        </Link>

        {/* Short Description */}
        <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
          {product.shortDescription.en || product.description.en}
        </p>

        {/* Weight & Unit */}
        <div className="text-sm text-neutral-500 mb-3">
          {product.weight} {product.unit}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-emerald-600">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.variants.some(v => v.price < product.price) && (
              <span className="text-sm text-neutral-500 line-through">
                {formatPrice(product.variants[0]?.price || product.price, product.currency)}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-neutral-600">4.8</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || isAddingToCart}
            className="flex-1 btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingToCart ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Adding...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </div>
            )}
          </button>
          
          {showWishlist && (
            <button
              onClick={handleAddToWishlist}
              disabled={isAddingToWishlist}
              className="p-2 border border-neutral-300 hover:border-emerald-600 hover:text-emerald-600 rounded-lg transition-colors duration-200 disabled:opacity-50"
              aria-label="Add to wishlist"
            >
              <Heart className={`w-4 h-4 ${isAddingToWishlist ? 'animate-pulse' : ''}`} />
            </button>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="mt-3 pt-3 border-t border-neutral-200">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Fast delivery</span>
            </div>
            <div className="flex items-center space-x-1">
              <Award className="w-3 h-3" />
              <span>Premium quality</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
