'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  Building2, 
  FileText, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  ArrowLeft,
  Plus,
  Eye,
  Download,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  MessageCircle
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface B2BQuote {
  id: string;
  quoteNumber: string;
  status: string;
  totalAmount?: number;
  currency: string;
  validUntil?: string;
  createdAt: string;
  items: B2BQuoteItem[];
}

interface B2BQuoteItem {
  id: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant: {
    product: {
      name: string;
      category: string;
    };
    weightInGrams: number;
  };
}

interface B2BStats {
  totalQuotes: number;
  pendingQuotes: number;
  approvedQuotes: number;
  totalValue: number;
  averageOrderValue: number;
}

export default function B2BDashboard() {
  const { data: session, status } = useSession();
  const { currency, formatPrice } = useCurrency();
  
  const [quotes, setQuotes] = useState<B2BQuote[]>([]);
  const [stats, setStats] = useState<B2BStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<B2BQuote | null>(null);
  const [showQuoteDetail, setShowQuoteDetail] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'B2B') {
      fetchB2BData();
    }
  }, [status, session]);

  const fetchB2BData = async () => {
    setLoading(true);
    try {
      const [quotesRes, statsRes] = await Promise.all([
        fetch('/api/v1/b2b/quotes', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/v1/b2b/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (quotesRes.ok) {
        const quotesData = await quotesRes.json();
        setQuotes(quotesData.data || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Error fetching B2B data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuote = async () => {
    try {
      const response = await fetch('/api/v1/b2b/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items: [], // Will be populated via CSV upload or manual selection
          customerNotes: ''
        })
      });

      if (response.ok) {
        fetchB2BData();
        setShowQuoteForm(false);
      }
    } catch (error) {
      console.error('Error creating quote:', error);
    }
  };

  const handleConvertToOrder = async (quoteId: string) => {
    if (!confirm('Convert this quote to an order?')) return;

    try {
      const response = await fetch(`/api/v1/b2b/quotes/${quoteId}/convert`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        fetchB2BData();
      }
    } catch (error) {
      console.error('Error converting quote:', error);
    }
  };

  const handleDownloadQuote = async (quoteId: string) => {
    try {
      const response = await fetch(`/api/v1/b2b/quotes/${quoteId}/pdf`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quote-${quoteId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading quote:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'text-emerald-600 bg-emerald-100';
      case 'reviewed':
        return 'text-blue-600 bg-blue-100';
      case 'requested':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'expired':
        return 'text-neutral-600 bg-neutral-100';
      case 'converted':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-neutral-600 bg-neutral-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'reviewed':
        return <Eye className="w-4 h-4" />;
      case 'requested':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4" />;
      case 'converted':
        return <ShoppingCart className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your B2B dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Please Sign In</h1>
          <p className="text-neutral-600 mb-6">You need to be signed in to access B2B features.</p>
          <Link href="/auth/signin" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (session?.user?.role !== 'B2B') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">B2B Access Required</h1>
          <p className="text-neutral-600 mb-6">This page is only available for B2B customers.</p>
          <Link href="/account" className="btn-primary">
            Back to Account
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
              <h1 className="font-heading text-3xl font-bold text-neutral-900">B2B Dashboard</h1>
              <p className="text-neutral-600 mt-2">
                Manage bulk orders, quotes, and access wholesale pricing
              </p>
            </div>
            <Link href="/account" className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Account
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Total Quotes</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.totalQuotes}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Pending Quotes</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingQuotes}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Approved Quotes</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.approvedQuotes}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Total Value</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {formatPrice(stats.totalValue, currency)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-8">
          <h2 className="font-heading text-xl font-bold text-neutral-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowQuoteForm(true)}
              className="p-4 border border-neutral-200 rounded-lg hover:border-emerald-300 transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <h3 className="font-medium text-neutral-900">New Quote Request</h3>
              </div>
              <p className="text-sm text-neutral-600">Request a custom quote for bulk orders</p>
            </button>
            <Link
              href="/account/b2b/upload"
              className="p-4 border border-neutral-200 rounded-lg hover:border-emerald-300 transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-neutral-900">Upload CSV</h3>
              </div>
              <p className="text-sm text-neutral-600">Upload a CSV file with your requirements</p>
            </Link>
            <Link
              href="/account/orders"
              className="p-4 border border-neutral-200 rounded-lg hover:border-emerald-300 transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
                <h3 className="font-medium text-neutral-900">Bulk Orders</h3>
              </div>
              <p className="text-sm text-neutral-600">View and manage your bulk orders</p>
            </Link>
          </div>
        </div>

        {/* Sales Rep Contact */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-neutral-900 mb-2">
                Need Help with Your Order?
              </h3>
              <p className="text-neutral-600 mb-4">
                Our dedicated sales team is here to help you with bulk orders, custom pricing, and product recommendations.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="tel:+919876543210"
                  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
                >
                  <Phone className="w-4 h-4" />
                  +91 9876543210
                </a>
                <a
                  href="mailto:b2b@newhillspices.com"
                  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
                >
                  <Mail className="w-4 h-4" />
                  b2b@newhillspices.com
                </a>
                <button className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700">
                  <MessageCircle className="w-4 h-4" />
                  Live Chat
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
                <Users className="w-12 h-12 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Quotes */}
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold text-neutral-900">Recent Quote Requests</h2>
              <Link href="/account/b2b/quotes" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                View All
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {quotes.length > 0 ? (
              <div className="space-y-4">
                {quotes.slice(0, 5).map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <FileText className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-neutral-900">#{quote.quoteNumber}</h3>
                        <p className="text-sm text-neutral-600">
                          {quote.items.length} item{quote.items.length !== 1 ? 's' : ''} • {new Date(quote.createdAt).toLocaleDateString()}
                        </p>
                        {quote.validUntil && (
                          <p className="text-xs text-neutral-500">
                            Valid until: {new Date(quote.validUntil).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {quote.totalAmount && (
                        <div className="text-right">
                          <p className="font-medium text-neutral-900">
                            {formatPrice(quote.totalAmount, currency)}
                          </p>
                        </div>
                      )}
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                        {getStatusIcon(quote.status)}
                        {quote.status}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedQuote(quote);
                            setShowQuoteDetail(true);
                          }}
                          className="btn-secondary text-sm"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadQuote(quote.id)}
                          className="btn-outline text-sm"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {quote.status === 'APPROVED' && (
                          <button
                            onClick={() => handleConvertToOrder(quote.id)}
                            className="btn-primary text-sm"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No quotes yet</h3>
                <p className="text-neutral-600 mb-6">
                  Start by requesting your first bulk quote.
                </p>
                <button
                  onClick={() => setShowQuoteForm(true)}
                  className="btn-primary"
                >
                  Request Quote
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quote Detail Modal */}
        {showQuoteDetail && selectedQuote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-xl font-bold text-neutral-900">
                    Quote #{selectedQuote.quoteNumber}
                  </h2>
                  <button
                    onClick={() => setShowQuoteDetail(false)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {/* Quote Status */}
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-2">Quote Status</h3>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedQuote.status)}`}>
                        {getStatusIcon(selectedQuote.status)}
                        {selectedQuote.status}
                      </span>
                      {selectedQuote.validUntil && (
                        <span className="text-sm text-neutral-600">
                          Valid until: {new Date(selectedQuote.validUntil).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quote Items */}
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-4">Quote Items</h3>
                    <div className="space-y-3">
                      {selectedQuote.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-neutral-900">{item.variant.product.name}</h4>
                            <p className="text-sm text-neutral-600">
                              {item.variant.weightInGrams}g • Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-neutral-900">
                              {formatPrice(item.totalPrice, currency)}
                            </p>
                            <p className="text-sm text-neutral-500">
                              {formatPrice(item.unitPrice, currency)} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quote Total */}
                  {selectedQuote.totalAmount && (
                    <div className="border-t border-neutral-200 pt-4">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{formatPrice(selectedQuote.totalAmount, currency)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quote Form Modal */}
        {showQuoteForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-xl font-bold text-neutral-900">
                    New Quote Request
                  </h2>
                  <button
                    onClick={() => setShowQuoteForm(false)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">Quote Request Options</h3>
                  <p className="text-neutral-600 mb-6">
                    Choose how you'd like to submit your quote request.
                  </p>
                  <div className="space-y-3">
                    <Link
                      href="/account/b2b/quotes/new"
                      className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Manual Entry
                    </Link>
                    <Link
                      href="/account/b2b/upload"
                      className="w-full btn-outline flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload CSV
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
