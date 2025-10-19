'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  CreditCard, 
  Download, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Shield
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface Payment {
  id: string;
  orderId: string;
  orderNumber: string;
  provider: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  last4Digits?: string;
  cardType?: string;
  createdAt: string;
  metadata?: any;
}

interface SavedPayment {
  id: string;
  provider: string;
  last4Digits: string;
  cardType?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function PaymentsPage() {
  const { data: session, status } = useSession();
  const { currency, formatPrice } = useCurrency();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [savedPayments, setSavedPayments] = useState<SavedPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSavedPayments, setShowSavedPayments] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPayments();
      fetchSavedPayments();
    }
  }, [status]);

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/v1/payments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchSavedPayments = async () => {
    try {
      const response = await fetch('/api/v1/payments/saved', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSavedPayments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching saved payments:', error);
    }
  };

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/v1/payments/${paymentId}/receipt`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${paymentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  const handleDeleteSavedPayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this saved payment method?')) return;

    try {
      const response = await fetch(`/api/v1/payments/saved/${paymentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        fetchSavedPayments();
      }
    } catch (error) {
      console.error('Error deleting saved payment:', error);
    }
  };

  const handleSetDefaultPayment = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/v1/payments/saved/${paymentId}/default`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        fetchSavedPayments();
      }
    } catch (error) {
      console.error('Error setting default payment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'text-emerald-600 bg-emerald-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'refunded':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-neutral-600 bg-neutral-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'refunded':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getCardIcon = (cardType?: string) => {
    switch (cardType?.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your payments...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Please Sign In</h1>
          <p className="text-neutral-600 mb-6">You need to be signed in to view your payments.</p>
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
              <h1 className="font-heading text-3xl font-bold text-neutral-900">Payment History</h1>
              <p className="text-neutral-600 mt-2">
                View your payment history and manage saved payment methods
              </p>
            </div>
            <Link href="/account" className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Account
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-neutral-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setShowSavedPayments(false)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  !showSavedPayments
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                Payment History
              </button>
              <button
                onClick={() => setShowSavedPayments(true)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  showSavedPayments
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                Saved Payment Methods
              </button>
            </nav>
          </div>
        </div>

        {/* Payment History */}
        {!showSavedPayments && (
          <div className="space-y-4">
            {payments.length > 0 ? (
              payments.map((payment) => (
                <div key={payment.id} className="bg-white rounded-lg border border-neutral-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-neutral-900">
                          Order #{payment.orderNumber}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          {payment.method} • {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                        {payment.last4Digits && (
                          <p className="text-sm text-neutral-500">
                            **** **** **** {payment.last4Digits}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-neutral-900">
                        {formatPrice(payment.amount, currency)}
                      </p>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadReceipt(payment.id)}
                      className="btn-outline text-sm flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Receipt
                    </button>
                    <Link
                      href={`/account/orders/${payment.orderId}`}
                      className="btn-secondary text-sm flex items-center gap-2"
                    >
                      View Order
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No payments yet</h3>
                <p className="text-neutral-600 mb-6">
                  Your payment history will appear here after you make your first purchase.
                </p>
                <Link href="/products" className="btn-primary">
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Saved Payment Methods */}
        {showSavedPayments && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-xl font-bold text-neutral-900">Saved Payment Methods</h2>
                <p className="text-neutral-600 mt-1">
                  Manage your saved payment methods for faster checkout
                </p>
              </div>
              <button
                onClick={() => setShowAddPayment(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Payment Method
              </button>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">Secure Payment Storage</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Your payment information is encrypted and stored securely. We never store your full card details.
                  </p>
                </div>
              </div>
            </div>

            {savedPayments.length > 0 ? (
              <div className="space-y-4">
                {savedPayments.map((payment) => (
                  <div key={payment.id} className="bg-white rounded-lg border border-neutral-200 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center text-2xl">
                          {getCardIcon(payment.cardType)}
                        </div>
                        <div>
                          <h3 className="font-medium text-neutral-900">
                            {payment.cardType || 'Card'} ending in {payment.last4Digits}
                          </h3>
                          <p className="text-sm text-neutral-600">
                            {payment.provider} • Added {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                          {payment.expiryMonth && payment.expiryYear && (
                            <p className="text-sm text-neutral-500">
                              Expires {payment.expiryMonth.toString().padStart(2, '0')}/{payment.expiryYear}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {payment.isDefault && (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                            Default
                          </span>
                        )}
                        {!payment.isDefault && (
                          <button
                            onClick={() => handleSetDefaultPayment(payment.id)}
                            className="btn-outline text-sm"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => setShowCardDetails(!showCardDetails)}
                          className="btn-secondary text-sm flex items-center gap-1"
                        >
                          {showCardDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          {showCardDetails ? 'Hide' : 'Show'} Details
                        </button>
                        <button
                          onClick={() => handleDeleteSavedPayment(payment.id)}
                          className="btn-outline text-sm text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    {showCardDetails && (
                      <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
                        <h4 className="font-medium text-neutral-900 mb-2">Payment Details</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-neutral-600">Card Number:</span>
                            <p className="font-mono">**** **** **** {payment.last4Digits}</p>
                          </div>
                          <div>
                            <span className="text-neutral-600">Card Type:</span>
                            <p>{payment.cardType || 'Unknown'}</p>
                          </div>
                          <div>
                            <span className="text-neutral-600">Provider:</span>
                            <p>{payment.provider}</p>
                          </div>
                          <div>
                            <span className="text-neutral-600">Status:</span>
                            <p className={payment.isActive ? 'text-emerald-600' : 'text-red-600'}>
                              {payment.isActive ? 'Active' : 'Inactive'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No saved payment methods</h3>
                <p className="text-neutral-600 mb-6">
                  Save your payment methods for faster checkout on future orders.
                </p>
                <button
                  onClick={() => setShowAddPayment(true)}
                  className="btn-primary"
                >
                  Add Payment Method
                </button>
              </div>
            )}

            {/* Add Payment Method Modal */}
            {showAddPayment && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-md w-full">
                  <div className="p-6 border-b border-neutral-200">
                    <div className="flex items-center justify-between">
                      <h2 className="font-heading text-xl font-bold text-neutral-900">
                        Add Payment Method
                      </h2>
                      <button
                        onClick={() => setShowAddPayment(false)}
                        className="text-neutral-400 hover:text-neutral-600"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-center py-8">
                      <CreditCard className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-neutral-900 mb-2">Demo Mode</h3>
                      <p className="text-neutral-600 mb-6">
                        This is a demo implementation. In a real application, this would integrate with a payment provider like Razorpay or Stripe.
                      </p>
                      <div className="space-y-3">
                        <button className="btn-primary w-full">
                          Add Razorpay Card
                        </button>
                        <button className="btn-outline w-full">
                          Add Stripe Card
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
