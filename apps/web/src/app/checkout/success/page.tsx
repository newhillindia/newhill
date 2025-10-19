'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CheckCircle, 
  Download, 
  Share2, 
  Truck, 
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Package,
  Clock
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface OrderItem {
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

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  items: OrderItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone?: string;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone?: string;
  };
  payment: {
    id: string;
    method: string;
    status: string;
    amount: number;
  };
  shipment?: {
    id: string;
    trackingNumber: string;
    carrier: string;
    status: string;
    estimatedDelivery: string;
  };
  createdAt: string;
  estimatedDelivery: string;
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currency, formatPrice } = useCurrency();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      setError('No order ID provided');
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setOrder(data.data);
      } else {
        setError(data.error?.message || 'Order not found');
      }
    } catch (err) {
      setError('An error occurred while fetching order details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;

    setIsDownloadingInvoice(true);
    try {
      const response = await fetch(`/api/v1/orders/${order.id}/invoice`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${order.orderNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to download invoice');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  const handleShareOrder = async () => {
    if (!order) return;

    const shareData = {
      title: `Order ${order.orderNumber} - Newhill Spices`,
      text: `I just placed an order for premium spices from Newhill Spices! Order #${order.orderNumber}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareData.url);
      alert('Order link copied to clipboard!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'shipped':
        return 'text-purple-600 bg-purple-100';
      case 'delivered':
        return 'text-emerald-600 bg-emerald-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-neutral-600 bg-neutral-100';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'text-emerald-600 bg-emerald-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-neutral-600 bg-neutral-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Order Not Found</h1>
          <p className="text-neutral-600 mb-6">{error}</p>
          <Link href="/orders" className="btn-primary">
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container-max py-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="font-heading text-4xl font-bold text-neutral-900 mb-4">
            Order Confirmed!
          </h1>
          <p className="text-lg text-neutral-600 mb-6">
            Thank you for your order. We've received your payment and will start processing your order shortly.
          </p>
          <div className="bg-white rounded-lg p-6 border border-neutral-200 max-w-md mx-auto">
            <p className="text-sm text-neutral-600 mb-2">Order Number</p>
            <p className="font-mono text-2xl font-bold text-neutral-900">{order.orderNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-lg p-6 border border-neutral-200">
              <h2 className="font-heading text-xl font-bold text-neutral-900 mb-4">Order Status</h2>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="text-sm text-neutral-600">
                    Order placed on {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-600">Estimated Delivery</p>
                  <p className="font-medium text-neutral-900">{order.estimatedDelivery}</p>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-emerald-600">Order Placed</span>
                </div>
                <div className="flex-1 h-0.5 bg-emerald-600 mx-4"></div>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered'
                      ? 'bg-emerald-600' : 'bg-neutral-200'
                  }`}>
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <span className={`text-sm font-medium ${
                    order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered'
                      ? 'text-emerald-600' : 'text-neutral-400'
                  }`}>Processing</span>
                </div>
                <div className={`flex-1 h-0.5 mx-4 ${
                  order.status === 'shipped' || order.status === 'delivered'
                    ? 'bg-emerald-600' : 'bg-neutral-200'
                }`}></div>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    order.status === 'shipped' || order.status === 'delivered'
                      ? 'bg-emerald-600' : 'bg-neutral-200'
                  }`}>
                    <Truck className="w-4 h-4 text-white" />
                  </div>
                  <span className={`text-sm font-medium ${
                    order.status === 'shipped' || order.status === 'delivered'
                      ? 'text-emerald-600' : 'text-neutral-400'
                  }`}>Shipped</span>
                </div>
                <div className={`flex-1 h-0.5 mx-4 ${
                  order.status === 'delivered'
                    ? 'bg-emerald-600' : 'bg-neutral-200'
                }`}></div>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    order.status === 'delivered'
                      ? 'bg-emerald-600' : 'bg-neutral-200'
                  }`}>
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className={`text-sm font-medium ${
                    order.status === 'delivered'
                      ? 'text-emerald-600' : 'text-neutral-400'
                  }`}>Delivered</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg p-6 border border-neutral-200">
              <h2 className="font-heading text-xl font-bold text-neutral-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={item.product.images[0] || '/images/placeholder-product.jpg'}
                        alt={item.product.name.en}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-neutral-900">{item.product.name.en}</h3>
                      {item.variant && (
                        <p className="text-sm text-neutral-600">{item.variant.name}</p>
                      )}
                      <p className="text-sm text-neutral-500">
                        {item.product.weight} {item.product.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-neutral-900">
                        {formatPrice(item.price * item.quantity, currency)}
                      </p>
                      <p className="text-sm text-neutral-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg p-6 border border-neutral-200">
              <h2 className="font-heading text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </h2>
              <div className="text-neutral-700">
                <p className="font-medium">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.address1}</p>
                {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="mt-2 text-sm text-neutral-600">
                    <Phone className="w-4 h-4 inline mr-1" />
                    {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Tracking Information */}
            {order.shipment && (
              <div className="bg-white rounded-lg p-6 border border-neutral-200">
                <h2 className="font-heading text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Tracking Information
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Tracking Number:</span>
                    <span className="font-mono text-sm font-medium">{order.shipment.trackingNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Carrier:</span>
                    <span className="text-sm font-medium">{order.shipment.carrier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.shipment.status)}`}>
                      {order.shipment.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Estimated Delivery:</span>
                    <span className="text-sm font-medium">{order.shipment.estimatedDelivery}</span>
                  </div>
                </div>
                <button className="mt-4 btn-secondary text-sm">
                  Track Package
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg p-6 border border-neutral-200">
              <h2 className="font-heading text-xl font-bold text-neutral-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.total, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-emerald-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatPrice(order.total * 0.18, currency)}</span>
                </div>
                <div className="border-t border-neutral-200 pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(order.total + (order.total * 0.18), currency)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg p-6 border border-neutral-200">
              <h2 className="font-heading text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Payment Method:</span>
                  <span className="text-sm font-medium">{order.payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(order.payment.status)}`}>
                    {order.payment.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Amount:</span>
                  <span className="text-sm font-medium">{formatPrice(order.payment.amount, currency)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleDownloadInvoice}
                disabled={isDownloadingInvoice}
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isDownloadingInvoice ? 'Downloading...' : 'Download Invoice'}
              </button>
              
              <button
                onClick={handleShareOrder}
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Order
              </button>
              
              <Link
                href="/orders"
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                View All Orders
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Support */}
            <div className="bg-neutral-50 rounded-lg p-6">
              <h3 className="font-medium text-neutral-900 mb-3">Need Help?</h3>
              <div className="space-y-2 text-sm text-neutral-600">
                <p>If you have any questions about your order, please contact us:</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>support@newhillspices.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+91 9876543210</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <h2 className="font-heading text-2xl font-bold text-neutral-900 mb-4">
            Continue Shopping
          </h2>
          <p className="text-neutral-600 mb-6">
            Discover more premium spices and seasonings
          </p>
          <Link href="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
