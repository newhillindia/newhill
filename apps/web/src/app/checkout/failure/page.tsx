'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft, 
  Mail, 
  Phone, 
  CreditCard,
  ShoppingCart,
  HelpCircle
} from 'lucide-react';

interface FailureReason {
  code: string;
  message: string;
  description: string;
  canRetry: boolean;
  supportRequired: boolean;
}

const failureReasons: Record<string, FailureReason> = {
  'payment_failed': {
    code: 'payment_failed',
    message: 'Payment Failed',
    description: 'Your payment could not be processed. This could be due to insufficient funds, card declined, or network issues.',
    canRetry: true,
    supportRequired: false,
  },
  'payment_verification_failed': {
    code: 'payment_verification_failed',
    message: 'Payment Verification Failed',
    description: 'We were unable to verify your payment. Please try again or contact support if the issue persists.',
    canRetry: true,
    supportRequired: false,
  },
  'insufficient_stock': {
    code: 'insufficient_stock',
    message: 'Insufficient Stock',
    description: 'Some items in your order are no longer available in the requested quantity.',
    canRetry: false,
    supportRequired: true,
  },
  'shipping_unavailable': {
    code: 'shipping_unavailable',
    message: 'Shipping Unavailable',
    description: 'We cannot deliver to the selected address. Please check your shipping address or contact support.',
    canRetry: false,
    supportRequired: true,
  },
  'system_error': {
    code: 'system_error',
    message: 'System Error',
    description: 'An unexpected error occurred while processing your order. Please try again or contact support.',
    canRetry: true,
    supportRequired: true,
  },
  'order_timeout': {
    code: 'order_timeout',
    message: 'Order Timeout',
    description: 'Your order session has expired. Please start the checkout process again.',
    canRetry: true,
    supportRequired: false,
  },
};

export default function CheckoutFailurePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [cartPreserved, setCartPreserved] = useState(true);

  const errorCode = searchParams.get('error') || 'system_error';
  const orderId = searchParams.get('orderId');
  const failureReason = failureReasons[errorCode] || failureReasons['system_error'];

  useEffect(() => {
    // Track failure event for analytics
    if (typeof window !== 'undefined') {
      // Analytics tracking
      console.log('Checkout failure tracked:', {
        errorCode,
        orderId,
        retryCount,
      });
    }
  }, [errorCode, orderId, retryCount]);

  const handleRetryPayment = async () => {
    if (!orderId) {
      router.push('/checkout');
      return;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      // In a real implementation, this would recreate the order and redirect to payment
      const response = await fetch('/api/v1/checkout/retry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          orderId,
          retryCount,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Redirect to payment gateway
        window.location.href = data.data.paymentUrl;
      } else {
        throw new Error(data.error?.message || 'Retry failed');
      }
    } catch (error) {
      console.error('Retry failed:', error);
      // Show error message to user
      alert('Unable to retry payment. Please try again or contact support.');
    } finally {
      setIsRetrying(false);
    }
  };

  const handleContactSupport = () => {
    const subject = `Checkout Failure - Order ${orderId || 'Unknown'}`;
    const body = `Error Code: ${errorCode}\nOrder ID: ${orderId || 'N/A'}\nRetry Count: ${retryCount}\n\nPlease describe the issue you encountered:`;
    
    const mailtoLink = `mailto:support@newhillspices.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  const handleBackToCart = () => {
    router.push('/cart');
  };

  const handleContinueShopping = () => {
    router.push('/products');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container-max py-8">
        {/* Failure Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="font-heading text-4xl font-bold text-neutral-900 mb-4">
            Order Failed
          </h1>
          <p className="text-lg text-neutral-600 mb-6">
            We're sorry, but we couldn't complete your order. Don't worry, your cart has been saved.
          </p>
          
          {orderId && (
            <div className="bg-white rounded-lg p-6 border border-neutral-200 max-w-md mx-auto">
              <p className="text-sm text-neutral-600 mb-2">Order Reference</p>
              <p className="font-mono text-lg font-bold text-neutral-900">{orderId}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Error Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-neutral-200">
              <h2 className="font-heading text-xl font-bold text-neutral-900 mb-4">
                What Happened?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-1">
                      {failureReason.message}
                    </h3>
                    <p className="text-neutral-600 text-sm">
                      {failureReason.description}
                    </p>
                  </div>
                </div>

                {retryCount > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        Retry Attempt #{retryCount}
                      </span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      This is your {retryCount} attempt. If the issue persists, please contact support.
                    </p>
                  </div>
                )}

                {cartPreserved && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-800">
                        Cart Preserved
                      </span>
                    </div>
                    <p className="text-sm text-emerald-700">
                      Your cart has been saved. You can retry your order or continue shopping.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-lg p-6 border border-neutral-200">
              <h2 className="font-heading text-xl font-bold text-neutral-900 mb-4">
                What Can You Do?
              </h2>
              <div className="space-y-4">
                {failureReason.canRetry && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <RefreshCw className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900 mb-1">
                        Try Again
                      </h3>
                      <p className="text-neutral-600 text-sm mb-3">
                        Most payment issues are temporary. You can retry your order with the same payment method.
                      </p>
                      <button
                        onClick={handleRetryPayment}
                        disabled={isRetrying}
                        className="btn-primary text-sm"
                      >
                        {isRetrying ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Retrying...
                          </div>
                        ) : (
                          'Retry Payment'
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <ShoppingCart className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-1">
                      Review Your Cart
                    </h3>
                    <p className="text-neutral-600 text-sm mb-3">
                      Check your cart and try a different payment method or update your shipping address.
                    </p>
                    <button
                      onClick={handleBackToCart}
                      className="btn-secondary text-sm"
                    >
                      Back to Cart
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <ArrowLeft className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-1">
                      Continue Shopping
                    </h3>
                    <p className="text-neutral-600 text-sm mb-3">
                      Browse our products and add items to your cart for a fresh start.
                    </p>
                    <button
                      onClick={handleContinueShopping}
                      className="btn-secondary text-sm"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support & Help */}
          <div className="space-y-6">
            {/* Support Contact */}
            <div className="bg-white rounded-lg p-6 border border-neutral-200">
              <h2 className="font-heading text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Need Help?
              </h2>
              <div className="space-y-4">
                <p className="text-neutral-600 text-sm">
                  Our support team is here to help you complete your order. Contact us with your order reference.
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={handleContactSupport}
                    className="w-full btn-secondary flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Email Support
                  </button>
                  
                  <a
                    href="tel:+919876543210"
                    className="w-full btn-secondary flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Call Support
                  </a>
                </div>

                <div className="text-center">
                  <p className="text-xs text-neutral-500">
                    Support Hours: Mon-Fri 9AM-6PM IST
                  </p>
                </div>
              </div>
            </div>

            {/* Common Solutions */}
            <div className="bg-white rounded-lg p-6 border border-neutral-200">
              <h3 className="font-medium text-neutral-900 mb-4">Common Solutions</h3>
              <div className="space-y-3 text-sm text-neutral-600">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Check that your payment method has sufficient funds</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Verify your billing address matches your card</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Try a different payment method</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Clear your browser cache and cookies</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Disable any ad blockers or VPN</p>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg p-6 border border-neutral-200">
              <h3 className="font-medium text-neutral-900 mb-4">Accepted Payment Methods</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2 border border-neutral-200 rounded">
                  <CreditCard className="w-4 h-4 text-neutral-600" />
                  <span className="text-sm">Credit/Debit Cards</span>
                </div>
                <div className="flex items-center gap-2 p-2 border border-neutral-200 rounded">
                  <div className="w-4 h-4 bg-blue-600 rounded text-white text-xs flex items-center justify-center">U</div>
                  <span className="text-sm">UPI</span>
                </div>
                <div className="flex items-center gap-2 p-2 border border-neutral-200 rounded">
                  <div className="w-4 h-4 bg-green-600 rounded text-white text-xs flex items-center justify-center">N</div>
                  <span className="text-sm">Net Banking</span>
                </div>
                <div className="flex items-center gap-2 p-2 border border-neutral-200 rounded">
                  <div className="w-4 h-4 bg-orange-600 rounded text-white text-xs flex items-center justify-center">W</div>
                  <span className="text-sm">Wallets</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetryPayment}
              disabled={isRetrying || !failureReason.canRetry}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </button>
            <button
              onClick={handleBackToCart}
              className="btn-secondary"
            >
              Back to Cart
            </button>
            <button
              onClick={handleContinueShopping}
              className="btn-secondary"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
