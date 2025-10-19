'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Truck, 
  Award, 
  Leaf, 
  Clock, 
  MapPin,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Share2,
  Minus,
  Plus,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Product } from '@newhill/shared';
import { useCurrency } from '@/hooks/useCurrency';

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const router = useRouter();
  const { currency, formatPrice } = useCurrency();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [shippingPincode, setShippingPincode] = useState('');
  const [shippingEstimate, setShippingEstimate] = useState<any>(null);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [params.slug, currency]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/products/${params.slug}?currency=${currency}`, {
        headers: {
          'Accept-Language': 'en',
          'X-Currency': currency,
        },
      });
      const data = await response.json();

      if (data.success) {
        setProduct(data.data);
        if (data.data.variants && data.data.variants.length > 0) {
          setSelectedVariant(data.data.variants[0]);
        }
      } else {
        setError(data.error?.message || 'Product not found');
      }
    } catch (err) {
      setError('An error occurred while fetching product details');
    } finally {
      setLoading(false);
    }
  };

  const handleVariantChange = (variant: any) => {
    setSelectedVariant(variant);
    setQuantity(1); // Reset quantity when variant changes
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (selectedVariant?.stockQty || 10)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) return;

    setIsAddingToCart(true);
    try {
      const response = await fetch('/api/v1/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariant.id,
          quantity,
        }),
      });

      if (response.ok) {
        // Show success message or update cart UI
        console.log('Added to cart successfully');
      } else {
        console.error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!product) return;

    setIsAddingToWishlist(true);
    try {
      const response = await fetch('/api/v1/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ productId: product.id }),
      });

      if (response.ok) {
        console.log('Added to wishlist successfully');
      } else {
        console.error('Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleShippingEstimate = async () => {
    if (!shippingPincode || !product) return;

    try {
      const response = await fetch('/api/v1/checkout/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          destination: {
            postalCode: shippingPincode,
            country: 'IN',
          },
          weight: selectedVariant?.weightInGrams || product.weight,
          currency,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShippingEstimate(data.data[0]); // Get first shipping option
      }
    } catch (error) {
      console.error('Error getting shipping estimate:', error);
    }
  };

  const getStockStatus = () => {
    if (!selectedVariant) return { text: 'Select a variant', color: 'text-neutral-500' };
    if (selectedVariant.stockQty === 0) return { text: 'Out of Stock', color: 'text-red-600' };
    if (selectedVariant.stockQty <= 10) return { text: 'Low Stock', color: 'text-orange-600' };
    return { text: 'In Stock', color: 'text-emerald-600' };
  };

  const stockStatus = getStockStatus();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="container-max py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="skeleton h-96 rounded-lg" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="skeleton h-20 rounded" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="skeleton h-8" />
              <div className="skeleton h-4" />
              <div className="skeleton h-6" />
              <div className="skeleton h-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Product Not Found</h1>
          <p className="text-neutral-600 mb-6">{error}</p>
          <Link href="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container-max py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-neutral-600">
            <li><Link href="/" className="hover:text-emerald-600">Home</Link></li>
            <li><ChevronLeft className="w-4 h-4 rotate-180" /></li>
            <li><Link href="/products" className="hover:text-emerald-600">Products</Link></li>
            <li><ChevronLeft className="w-4 h-4 rotate-180" /></li>
            <li><Link href={`/products?category=${product.category}`} className="hover:text-emerald-600">{product.category}</Link></li>
            <li><ChevronLeft className="w-4 h-4 rotate-180" /></li>
            <li className="text-neutral-900">{product.name.en}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-white border border-neutral-200">
              <Image
                src={product.images[selectedImageIndex] || '/images/placeholder-product.jpg'}
                alt={product.name.en || 'Product image'}
                fill
                className="object-cover cursor-pointer"
                onClick={() => setIsImageModalOpen(true)}
              />
              <button
                onClick={() => setIsImageModalOpen(true)}
                className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square overflow-hidden rounded border-2 ${
                      selectedImageIndex === index ? 'border-emerald-600' : 'border-neutral-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name.en} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Product Name & Badges */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.certifications.map((cert, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full"
                  >
                    {cert}
                  </span>
                ))}
                {product.organicCertified && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                    <Leaf className="w-3 h-3" />
                    Organic
                  </span>
                )}
              </div>
              <h1 className="font-heading text-3xl font-bold text-neutral-900 mb-2">
                {product.name.en}
              </h1>
              <p className="text-lg text-neutral-600">
                {product.shortDescription.en}
              </p>
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
                <span className="ml-2 text-sm text-neutral-600">4.8 (127 reviews)</span>
              </div>
              <button className="text-sm text-emerald-600 hover:text-emerald-700">
                Write a review
              </button>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-emerald-600">
                  {formatPrice(selectedVariant?.price || product.price, currency)}
                </span>
                {selectedVariant?.price < product.price && (
                  <span className="text-lg text-neutral-500 line-through">
                    {formatPrice(product.price, currency)}
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-600">
                Price per {selectedVariant?.weightInGrams || product.weight}g
              </p>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="font-medium text-neutral-900 mb-3">Size & Weight</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantChange(variant)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        selectedVariant?.id === variant.id
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      <div className="font-medium">{variant.name}</div>
                      <div className="text-sm text-neutral-600">
                        {formatPrice(variant.price, currency)}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {variant.stockQty > 0 ? `${variant.stockQty} in stock` : 'Out of stock'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Quantity</label>
                  <div className="flex items-center border border-neutral-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-neutral-50 disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 border-x border-neutral-300 min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= (selectedVariant?.stockQty || 10)}
                      className="p-2 hover:bg-neutral-50 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-medium ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                    {selectedVariant?.stockQty && selectedVariant.stockQty <= 10 && selectedVariant.stockQty > 0 && (
                      <span className="text-xs text-orange-600">
                        Only {selectedVariant.stockQty} left!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stockQty === 0 || isAddingToCart}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingToCart ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Adding to Cart...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={handleAddToWishlist}
                  disabled={isAddingToWishlist}
                  className="p-3 border border-neutral-300 hover:border-emerald-600 hover:text-emerald-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Heart className={`w-5 h-5 ${isAddingToWishlist ? 'animate-pulse' : ''}`} />
                </button>

                <button className="p-3 border border-neutral-300 hover:border-emerald-600 hover:text-emerald-600 rounded-lg transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Shipping Estimator */}
            <div className="border border-neutral-200 rounded-lg p-4">
              <h3 className="font-medium text-neutral-900 mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Shipping Estimate
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shippingPincode}
                  onChange={(e) => setShippingPincode(e.target.value)}
                  placeholder="Enter pincode"
                  className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  onClick={handleShippingEstimate}
                  className="btn-secondary text-sm px-4 py-2"
                >
                  Check
                </button>
              </div>
              {shippingEstimate && (
                <div className="mt-3 p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Delivery in {shippingEstimate.estimatedDays} days
                    </span>
                  </div>
                  <div className="text-sm text-emerald-700 mt-1">
                    Shipping: {formatPrice(shippingEstimate.cost, currency)}
                  </div>
                </div>
              )}
            </div>

            {/* Gift Options */}
            <div className="border border-neutral-200 rounded-lg p-4">
              <h3 className="font-medium text-neutral-900 mb-3">Gift Options</h3>
              <button
                onClick={() => setShowGiftModal(true)}
                className="text-sm text-emerald-600 hover:text-emerald-700"
              >
                Add gift message (+₹50)
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-neutral-600">
                <Truck className="w-4 h-4" />
                <span>Free shipping over ₹500</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <Clock className="w-4 h-4" />
                <span>Same day dispatch</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <Award className="w-4 h-4" />
                <span>Premium quality</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <MapPin className="w-4 h-4" />
                <span>From Munnar, Kerala</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description & Details */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-4">Description</h2>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed">
                  {product.description.en}
                </p>
              </div>
            </div>

            {/* Product Details */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-4">Product Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-neutral-600">Category:</span>
                  <span className="ml-2 text-sm text-neutral-900">{product.category}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-neutral-600">Weight:</span>
                  <span className="ml-2 text-sm text-neutral-900">{product.weight} {product.unit}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-neutral-600">Origin:</span>
                  <span className="ml-2 text-sm text-neutral-900">Munnar, Kerala</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-neutral-600">Certifications:</span>
                  <span className="ml-2 text-sm text-neutral-900">{product.certifications.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-4">Customer Reviews</h2>
              <div className="space-y-4">
                {/* Mock reviews */}
                {[1, 2, 3].map((index) => (
                  <div key={index} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-neutral-900">Customer {index}</span>
                      <span className="text-xs text-neutral-500">2 days ago</span>
                    </div>
                    <p className="text-sm text-neutral-700">
                      Excellent quality spices! The aroma is amazing and the taste is authentic. 
                      Will definitely order again.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Products */}
            <div>
              <h3 className="font-medium text-neutral-900 mb-4">You might also like</h3>
              <div className="space-y-3">
                {/* Mock related products */}
                {[1, 2, 3].map((index) => (
                  <div key={index} className="flex gap-3 p-3 border border-neutral-200 rounded-lg hover:border-emerald-300 transition-colors">
                    <div className="w-16 h-16 bg-neutral-100 rounded"></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-neutral-900 line-clamp-1">
                        Related Product {index}
                      </h4>
                      <p className="text-sm text-emerald-600 font-medium">₹299</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <Image
              src={product.images[selectedImageIndex] || '/images/placeholder-product.jpg'}
              alt={product.name.en || 'Product image'}
              width={800}
              height={800}
              className="object-contain max-h-[80vh]"
            />
          </div>
        </div>
      )}

      {/* Gift Modal */}
      {showGiftModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="font-medium text-neutral-900 mb-4">Add Gift Message</h3>
            <textarea
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              placeholder="Enter your gift message..."
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowGiftModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowGiftModal(false);
                  // Handle gift message
                }}
                className="flex-1 btn-primary"
              >
                Add Gift Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

