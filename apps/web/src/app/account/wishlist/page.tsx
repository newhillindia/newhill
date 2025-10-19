'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Heart, 
  ShoppingCart, 
  Share2, 
  Trash2, 
  ArrowLeft,
  Plus,
  Eye,
  EyeOff,
  Settings,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface WishlistItem {
  id: string;
  variantId: string;
  quantity: number;
  notes?: string;
  isPublic: boolean;
  createdAt: string;
  variant: {
    id: string;
    weightInGrams: number;
    basePriceINR: number;
    product: {
      id: string;
      name: string;
      images: string[];
      category: string;
      organicCertified: boolean;
    };
  };
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const { currency, formatPrice } = useCurrency();
  
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPublicToggle, setShowPublicToggle] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchWishlist();
    }
  }, [status]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/wishlist', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (variantId: string, quantity: number = 1) => {
    try {
      const response = await fetch('/api/v1/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ variantId, quantity })
      });

      if (response.ok) {
        // Show success message or redirect to cart
        alert('Item added to cart successfully!');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleRemoveFromWishlist = async (itemId: string) => {
    if (!confirm('Remove this item from your wishlist?')) return;

    try {
      const response = await fetch(`/api/v1/wishlist/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        fetchWishlist();
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleTogglePublic = async (itemId: string, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/v1/wishlist/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isPublic })
      });

      if (response.ok) {
        fetchWishlist();
      }
    } catch (error) {
      console.error('Error updating wishlist item:', error);
    }
  };

  const handleShareWishlist = async () => {
    try {
      const response = await fetch('/api/v1/wishlist/share', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setShareUrl(data.data.shareUrl);
        setShowShareModal(true);
      }
    } catch (error) {
      console.error('Error creating share link:', error);
    }
  };

  const handleCopyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Wishlist - Newhill Spices',
          text: 'Check out my wishlist of premium spices!',
          url: shareUrl
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      handleCopyShareUrl();
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'whole spices':
        return 'bg-emerald-100 text-emerald-700';
      case 'ground spices':
        return 'bg-blue-100 text-blue-700';
      case 'blends':
        return 'bg-purple-100 text-purple-700';
      case 'herbs':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Please Sign In</h1>
          <p className="text-neutral-600 mb-6">You need to be signed in to view your wishlist.</p>
          <Link href="/auth/signin" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container-max py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold text-neutral-900">My Wishlist</h1>
              <p className="text-neutral-600 mt-2">
                Save items you love and share them with others
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleShareWishlist}
                className="btn-secondary flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Wishlist
              </button>
              <Link href="/account" className="btn-outline flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Account
              </Link>
            </div>
          </div>
        </div>

        {/* Wishlist Stats */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                {wishlistItems.length}
              </div>
              <div className="text-sm text-neutral-600">Items in Wishlist</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {wishlistItems.filter(item => item.isPublic).length}
              </div>
              <div className="text-sm text-neutral-600">Public Items</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {formatPrice(
                  wishlistItems.reduce((total, item) => 
                    total + (item.variant.basePriceINR * item.quantity), 0
                  ), 
                  currency
                )}
              </div>
              <div className="text-sm text-neutral-600">Total Value</div>
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                <div className="relative">
                  <Image
                    src={item.variant.product.images[0] || '/images/placeholder-product.jpg'}
                    alt={item.variant.product.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => handleTogglePublic(item.id, !item.isPublic)}
                      className={`p-2 rounded-full ${
                        item.isPublic 
                          ? 'bg-emerald-100 text-emerald-600' 
                          : 'bg-white text-neutral-400'
                      }`}
                      title={item.isPublic ? 'Make private' : 'Make public'}
                    >
                      {item.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {item.isPublic && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                        Public
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-neutral-900 line-clamp-2">
                      {item.variant.product.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(item.variant.product.category)}`}>
                      {item.variant.product.category}
                    </span>
                    {item.variant.product.organicCertified && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Organic
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-neutral-600 mb-3">
                    <p>{item.variant.weightInGrams}g • Qty: {item.quantity}</p>
                  </div>

                  {item.notes && (
                    <div className="mb-3">
                      <p className="text-sm text-neutral-600 italic">"{item.notes}"</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-bold text-neutral-900">
                      {formatPrice(item.variant.basePriceINR * item.quantity, currency)}
                    </div>
                    <div className="text-sm text-neutral-500">
                      {formatPrice(item.variant.basePriceINR, currency)} each
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(item.variantId, item.quantity)}
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <Link
                      href={`/products/${item.variant.product.id}`}
                      className="btn-outline flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Your wishlist is empty</h3>
            <p className="text-neutral-600 mb-6">
              Start adding items you love to your wishlist for easy access later.
            </p>
            <Link href="/products" className="btn-primary">
              Browse Products
            </Link>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-xl font-bold text-neutral-900">
                    Share Your Wishlist
                  </h2>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Share Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                    />
                    <button
                      onClick={handleCopyShareUrl}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleShareNative}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full btn-outline flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Link
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
