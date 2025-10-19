'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  Truck, 
  Lock, 
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  Building,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone?: string;
  isDefault?: boolean;
}

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

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimatedDays: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  name: string;
  icon: string;
  isPopular?: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { currency, formatPrice } = useCurrency();
  
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Address states
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);
  const [billingAddress, setBillingAddress] = useState<Address | null>(null);
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  // Shipping states
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>('');
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  
  // Payment states
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [paymentMethods] = useState<PaymentMethod[]>([
    { id: 'razorpay-card', type: 'card', name: 'Credit/Debit Card', icon: '💳', isPopular: true },
    { id: 'razorpay-upi', type: 'upi', name: 'UPI', icon: '📱' },
    { id: 'razorpay-netbanking', type: 'netbanking', name: 'Net Banking', icon: '🏦' },
    { id: 'razorpay-wallet', type: 'wallet', name: 'Wallet', icon: '👛' },
  ]);
  
  // Form states
  const [formData, setFormData] = useState<Address>({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    country: 'IN',
    postalCode: '',
    phone: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/checkout');
      return;
    }
    
    if (status === 'authenticated') {
      fetchCart();
      fetchSavedAddresses();
    }
  }, [status, router]);

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
        if (data.data.items.length === 0) {
          router.push('/cart');
          return;
        }
      } else {
        setError(data.error?.message || 'Failed to fetch cart');
      }
    } catch (err) {
      setError('An error occurred while fetching cart');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedAddresses = async () => {
    try {
      const response = await fetch('/api/v1/addresses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setSavedAddresses(data.data);
        const defaultAddress = data.data.find((addr: Address) => addr.isDefault);
        if (defaultAddress) {
          setShippingAddress(defaultAddress);
          setBillingAddress(defaultAddress);
        }
      }
    } catch (error) {
      console.error('Error fetching saved addresses:', error);
    }
  };

  const fetchShippingMethods = async () => {
    if (!shippingAddress) return;

    try {
      const response = await fetch('/api/v1/checkout/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          destination: shippingAddress,
          weight: cart?.items.reduce((sum, item) => 
            sum + (item.variant?.weightInGrams || item.product.weight) * item.quantity, 0
          ) || 0,
          currency,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShippingMethods(data.data);
        if (data.data.length > 0) {
          setSelectedShippingMethod(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
    }
  };

  const handleAddressSelect = (address: Address) => {
    setShippingAddress(address);
    if (useSameAddress) {
      setBillingAddress(address);
    }
    setShowAddressForm(false);
  };

  const handleFormChange = (field: keyof Address, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAddress = async () => {
    try {
      const response = await fetch('/api/v1/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          type: 'shipping',
          isDefault: savedAddresses.length === 0,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const newAddress = data.data;
        setSavedAddresses(prev => [...prev, newAddress]);
        setShippingAddress(newAddress);
        if (useSameAddress) {
          setBillingAddress(newAddress);
        }
        setShowAddressForm(false);
        setFormData({
          firstName: '',
          lastName: '',
          address1: '',
          address2: '',
          city: '',
          state: '',
          country: 'IN',
          postalCode: '',
          phone: '',
        });
      }
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress || !billingAddress || !selectedShippingMethod || !selectedPaymentMethod) {
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/v1/checkout/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          items: cart?.items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingAddress,
          billingAddress,
          paymentMethod: {
            type: selectedPaymentMethod.split('-')[1],
            provider: 'razorpay',
          },
          shippingMethod: selectedShippingMethod,
          notes: '',
          idempotencyKey: `checkout-${Date.now()}`,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Redirect to payment gateway or show payment form
        console.log('Checkout started:', data.data);
        // In a real implementation, you would redirect to the payment gateway
        router.push(`/checkout/success?orderId=${data.data.order.id}`);
      } else {
        setError(data.error?.message || 'Failed to place order');
      }
    } catch (error) {
      setError('An error occurred while placing order');
    } finally {
      setIsProcessing(false);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return shippingAddress && billingAddress;
      case 2:
        return selectedShippingMethod;
      case 3:
        return selectedPaymentMethod;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      fetchShippingMethods();
    }
    if (canProceedToNextStep()) {
      setCurrentStep(prev => Math.min(3, prev + 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error || !cart) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Checkout Error</h1>
          <p className="text-neutral-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary mr-4"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/cart')}
            className="btn-secondary"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container-max py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/cart')}
            className="flex items-center gap-2 text-neutral-600 hover:text-emerald-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </button>
          <h1 className="font-heading text-3xl font-bold text-neutral-900">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-neutral-300 text-neutral-400'
                }`}>
                  {currentStep > step ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="font-medium">{step}</span>
                  )}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step ? 'bg-emerald-600' : 'bg-neutral-300'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <div className="flex gap-16">
              <span className={`text-sm ${currentStep >= 1 ? 'text-emerald-600 font-medium' : 'text-neutral-400'}`}>
                Address
              </span>
              <span className={`text-sm ${currentStep >= 2 ? 'text-emerald-600 font-medium' : 'text-neutral-400'}`}>
                Shipping
              </span>
              <span className={`text-sm ${currentStep >= 3 ? 'text-emerald-600 font-medium' : 'text-neutral-400'}`}>
                Payment
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Address */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg p-6 border border-neutral-200">
                <h2 className="font-heading text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </h2>

                {/* Saved Addresses */}
                {savedAddresses.length > 0 && !showAddressForm && (
                  <div className="space-y-3 mb-6">
                    <h3 className="font-medium text-neutral-900">Saved Addresses</h3>
                    {savedAddresses.map((address) => (
                      <div
                        key={address.id}
                        onClick={() => handleAddressSelect(address)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          shippingAddress?.id === address.id
                            ? 'border-emerald-600 bg-emerald-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-neutral-900">
                              {address.firstName} {address.lastName}
                            </p>
                            <p className="text-sm text-neutral-600 mt-1">
                              {address.address1}, {address.city}, {address.state} {address.postalCode}
                            </p>
                            {address.phone && (
                              <p className="text-sm text-neutral-500 mt-1">{address.phone}</p>
                            )}
                          </div>
                          {address.isDefault && (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="w-full p-4 border-2 border-dashed border-neutral-300 rounded-lg text-neutral-600 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
                    >
                      + Add New Address
                    </button>
                  </div>
                )}

                {/* Address Form */}
                {showAddressForm && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleFormChange('firstName', e.target.value)}
                          className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleFormChange('lastName', e.target.value)}
                          className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        value={formData.address1}
                        onChange={(e) => handleFormChange('address1', e.target.value)}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={formData.address2}
                        onChange={(e) => handleFormChange('address2', e.target.value)}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => handleFormChange('city', e.target.value)}
                          className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => handleFormChange('state', e.target.value)}
                          className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          value={formData.postalCode}
                          onChange={(e) => handleFormChange('postalCode', e.target.value)}
                          className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleFormChange('phone', e.target.value)}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveAddress}
                        className="btn-primary"
                      >
                        Save Address
                      </button>
                      <button
                        onClick={() => setShowAddressForm(false)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Billing Address */}
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="sameAddress"
                      checked={useSameAddress}
                      onChange={(e) => setUseSameAddress(e.target.checked)}
                      className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="sameAddress" className="text-sm text-neutral-700">
                      Use same address for billing
                    </label>
                  </div>

                  {!useSameAddress && (
                    <div className="p-4 bg-neutral-50 rounded-lg">
                      <h3 className="font-medium text-neutral-900 mb-3">Billing Address</h3>
                      <p className="text-sm text-neutral-600">
                        Billing address form would go here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Shipping */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg p-6 border border-neutral-200">
                <h2 className="font-heading text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping Method
                </h2>

                <div className="space-y-3">
                  {shippingMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedShippingMethod(method.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedShippingMethod === method.id
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-neutral-900">{method.name}</h3>
                          <p className="text-sm text-neutral-600">{method.description}</p>
                          <p className="text-sm text-neutral-500">Estimated delivery: {method.estimatedDays}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-neutral-900">
                            {method.cost === 0 ? 'Free' : formatPrice(method.cost, currency)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg p-6 border border-neutral-200">
                <h2 className="font-heading text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </h2>

                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPaymentMethod === method.id
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{method.icon}</span>
                          <div>
                            <h3 className="font-medium text-neutral-900">{method.name}</h3>
                            {method.isPopular && (
                              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                                Popular
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-emerald-600">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Lock className="w-4 h-4" />
                    <span>Your payment information is secure and encrypted</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={currentStep === 3 ? handlePlaceOrder : nextStep}
                disabled={!canProceedToNextStep() || isProcessing}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : currentStep === 3 ? (
                  'Place Order'
                ) : (
                  'Next'
                )}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-neutral-200">
              <h2 className="font-heading text-xl font-bold text-neutral-900 mb-4">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={item.product.images[0] || '/images/placeholder-product.jpg'}
                        alt={item.product.name.en}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-neutral-900 text-sm line-clamp-1">
                        {item.product.name.en}
                      </h4>
                      {item.variant && (
                        <p className="text-xs text-neutral-600">{item.variant.name}</p>
                      )}
                      <p className="text-xs text-neutral-500">
                        Qty: {item.quantity} × {formatPrice(item.price, currency)}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-neutral-900">
                      {formatPrice(item.price * item.quantity, currency)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 border-t border-neutral-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.subtotal, currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (GST)</span>
                  <span>{formatPrice(cart.tax, currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>
                    {shippingMethods.find(m => m.id === selectedShippingMethod)?.cost === 0 ? (
                      <span className="text-emerald-600">Free</span>
                    ) : (
                      formatPrice(cart.shipping, currency)
                    )}
                  </span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount</span>
                    <span>-{formatPrice(cart.discount, currency)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-neutral-200 pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(cart.total, currency)}</span>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-white rounded-lg p-6 border border-neutral-200">
              <div className="text-center">
                <Lock className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h3 className="font-medium text-neutral-900 mb-2">Secure Checkout</h3>
                <p className="text-sm text-neutral-600">
                  Your payment information is protected with 256-bit SSL encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

