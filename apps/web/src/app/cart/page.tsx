'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  CheckCircle,
  AlertCircle,
  Truck,
  Lock
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: { en: string };
    images: string[];
    slug: string;
    weight: number;
    unit: string;
  };
  variant?: {
    id: string;
    name: string;
    weightInGrams: number;
  };
}

interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
}

interface PromoCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
}

export default function CartPage() {
  const router = useRouter();
  const { currency, formatPrice } = useCurrency();
  
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/cart', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setCart(data.data);
      } else {
        setError(data.error?.message || 'Failed to fetch cart');
      }
    } catch (err) {
      setError('An error occurred while fetching cart');
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      const response = await fetch('/api/v1/cart', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          items: cart?.items.map(item => 
            item.id === itemId 
              ? { ...item, quantity: newQuantity }
              : item
          ),
        }),
      });

      if (response.ok) {
        await fetchCart(); // Refresh cart data
      } else {
        console.error('Failed to update item quantity');
      }
    } catch (error) {
      console.error('Error updating item quantity:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/v1/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        await fetchCart(); // Refresh cart data
      } else {
        console.error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;

    setPromoLoading(true);
    setPromoError(null);

    try {
      const response = await fetch('/api/v1/discounts/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          code: promoCode,
          orderAmount: cart?.subtotal || 0,
          type: 'discount',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAppliedPromo({
          code: promoCode,
          type: data.data.type,
          value: data.data.value,
          description: data.data.description,
        });
        setPromoCode('');
        await fetchCart(); // Refresh cart with discount applied
      } else {
        setPromoError(data.error?.message || 'Invalid promo code');
      }
    } catch (error) {
      setPromoError('An error occurred while applying promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromoCode = async () => {
    setAppliedPromo(null);
    await fetchCart(); // Refresh cart without discount
  };

  const getShippingEstimate = () => {
    if (!cart) return null;
    
    const subtotal = cart.subtotal;
    if (subtotal >= 500) {
      return { cost: 0, message: 'Free shipping!' };
    } else {
      const remaining = 500 - subtotal;
      return { 
        cost: 50, 
        message: `Add ₹${remaining} more for free shipping` 
      };
    }
  };

  const shippingEstimate = getShippingEstimate();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="container-max py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-6">
                  <div className="flex gap-4">
                    <div className="skeleton w-20 h-20 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-6" />
                      <div className="skeleton h-4" />
                      <div className="skeleton h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="skeleton h-64 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !cart) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Cart Error</h1>
          <p className="text-neutral-600 mb-6">{error}</p>
          <button
            onClick={fetchCart}
            className="btn-primary mr-4"
          >
            Try Again
          </button>
          <Link href="/products" className="btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Your cart is empty</h1>
          <p className="text-neutral-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Link href="/products" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container-max py-8">
        <h1 className="font-heading text-3xl font-bold text-neutral-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-6 border border-neutral-200">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={item.product.images[0] || '/images/placeholder-product.jpg'}
                      alt={item.product.name.en}
                      fill
                      className="object-cover rounded"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/products/${item.product.slug}`}
                      className="font-medium text-neutral-900 hover:text-emerald-600 transition-colors"
                    >
                      {item.product.name.en}
                    </Link>
                    {item.variant && (
                      <p className="text-sm text-neutral-600 mt-1">
                        {item.variant.name} ({item.variant.weightInGrams}g)
                      </p>
                    )}
                    <p className="text-sm text-neutral-500 mt-1">
                      {item.product.weight} {item.product.unit}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                      disabled={updatingItems.has(item.id) || item.quantity <= 1}
                      className="p-1 hover:bg-neutral-100 rounded disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">
                      {updatingItems.has(item.id) ? '...' : item.quantity}
                    </span>
                    <button
                      onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                      disabled={updatingItems.has(item.id)}
                      className="p-1 hover:bg-neutral-100 rounded disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="font-medium text-neutral-900">
                      {formatPrice(item.price * item.quantity, currency)}
                    </div>
                    <div className="text-sm text-neutral-500">
                      {formatPrice(item.price, currency)} each
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <div className="flex justify-between items-center pt-4">
              <Link 
                href="/products" 
                className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Continue Shopping
              </Link>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear your cart?')) {
                    // Clear cart logic
                  }
                }}
                className="text-red-600 hover:text-red-700"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-neutral-200">
              <h2 className="font-heading text-xl font-bold text-neutral-900 mb-4">Order Summary</h2>

              {/* Promo Code */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Promo Code
                </label>
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-800">
                        {appliedPromo.code}
                      </span>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-emerald-600 hover:text-emerald-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter promo code"
                      className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                      onClick={applyPromoCode}
                      disabled={promoLoading || !promoCode.trim()}
                      className="btn-secondary text-sm px-4 py-2 disabled:opacity-50"
                    >
                      {promoLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {promoError}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.subtotal, currency)}</span>
                </div>
                
                {appliedPromo && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount ({appliedPromo.code})</span>
                    <span>-{formatPrice(cart.discount, currency)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span>Tax (GST)</span>
                  <span>{formatPrice(cart.tax, currency)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>
                    {shippingEstimate?.cost === 0 ? (
                      <span className="text-emerald-600">Free</span>
                    ) : (
                      formatPrice(cart.shipping, currency)
                    )}
                  </span>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(cart.total, currency)}</span>
                </div>
              </div>

              {/* Shipping Message */}
              {shippingEstimate && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${
                  shippingEstimate.cost === 0 
                    ? 'bg-emerald-50 text-emerald-800' 
                    : 'bg-orange-50 text-orange-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <span>{shippingEstimate.message}</span>
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={() => router.push('/checkout')}
                className="w-full btn-primary mt-6 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Proceed to Checkout
              </button>

              {/* Security Badge */}
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
                  <Lock className="w-3 h-3" />
                  <span>Secure checkout with SSL encryption</span>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="bg-white rounded-lg p-6 border border-neutral-200">
              <h3 className="font-medium text-neutral-900 mb-4">Why Shop with Us?</h3>
              <div className="space-y-3 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Premium quality spices</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Direct from farm</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Fast & secure delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>30-day return policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

