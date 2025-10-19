'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { Cart, CartItem } from '@newhill/shared';

interface FloatingCartButtonProps {
  cart?: Cart;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onRemoveItem?: (itemId: string) => void;
  onClearCart?: () => void;
  className?: string;
}

export default function FloatingCartButton({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  className = ''
}: FloatingCartButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const itemCount = cart?.items?.length || 0;
  const total = cart?.total || 0;

  // Show/hide floating button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsVisible(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatPrice = (price: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (onUpdateQuantity && newQuantity > 0) {
      onUpdateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    if (onRemoveItem) {
      onRemoveItem(itemId);
    }
  };

  const handleClearCart = () => {
    if (onClearCart) {
      onClearCart();
      setIsOpen(false);
    }
  };

  if (!isVisible && itemCount === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Cart Button */}
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          aria-label="Shopping cart"
        >
          <ShoppingCart className="w-6 h-6" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-gold text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </button>
      </div>

      {/* Cart Sidebar */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Cart Panel */}
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <h3 className="font-heading text-xl font-semibold text-neutral-900">
                  Shopping Cart ({itemCount})
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors duration-200"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {itemCount === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                    <h4 className="font-heading text-lg font-semibold text-neutral-900 mb-2">
                      Your cart is empty
                    </h4>
                    <p className="text-neutral-600 mb-6">
                      Add some delicious spices to get started!
                    </p>
                    <Link
                      href="/products"
                      className="btn-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      Shop Now
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart?.items?.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-lg">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-neutral-200 rounded-lg flex-shrink-0">
                          <img
                            src="/images/placeholder-product.jpg"
                            alt="Product"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-neutral-900 truncate">
                            Product Name
                          </h4>
                          <p className="text-sm text-neutral-600">
                            {formatPrice(item.price, cart?.currency)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-neutral-200 rounded transition-colors duration-200"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-neutral-200 rounded transition-colors duration-200"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors duration-200"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {itemCount > 0 && (
                <div className="border-t border-neutral-200 p-6">
                  {/* Total */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-heading text-lg font-semibold text-neutral-900">
                      Total:
                    </span>
                    <span className="font-heading text-xl font-bold text-emerald-600">
                      {formatPrice(total, cart?.currency)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Link
                      href="/checkout"
                      className="w-full btn-primary text-center block"
                      onClick={() => setIsOpen(false)}
                    >
                      Checkout
                    </Link>
                    <button
                      onClick={handleClearCart}
                      className="w-full btn-secondary"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

