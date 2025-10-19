'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  User, 
  Package, 
  MapPin, 
  CreditCard, 
  Heart, 
  Settings, 
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Eye,
  EyeOff,
  Download,
  Share2,
  ShoppingCart,
  TrendingUp,
  Users,
  Building2
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  itemCount: number;
  createdAt: string;
  estimatedDelivery: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    preferredLanguage: string;
    defaultCurrency: string;
  };
}

interface QuickStats {
  totalOrders: number;
  totalSpent: number;
  wishlistItems: number;
  addresses: number;
}

export default function AccountDashboard() {
  const { data: session, status } = useSession();
  const { currency, formatPrice } = useCurrency();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImpersonation, setShowImpersonation] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, ordersRes, statsRes] = await Promise.all([
        fetch('/api/v1/users/profile', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/v1/orders?limit=5', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/v1/users/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.data);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setRecentOrders(ordersData.data.items || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setQuickStats(statsData.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-emerald-600 bg-emerald-100';
      case 'shipped':
        return 'text-blue-600 bg-blue-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-neutral-600 bg-neutral-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'shipped':
        return <Package className="w-4 h-4" />;
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Please Sign In</h1>
          <p className="text-neutral-600 mb-6">You need to be signed in to access your account.</p>
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
              <h1 className="font-heading text-3xl font-bold text-neutral-900">
                Welcome back, {profile?.profile?.firstName || profile?.name || 'User'}!
              </h1>
              <p className="text-neutral-600 mt-2">
                Manage your account, orders, and preferences
              </p>
            </div>
            
            {/* Admin Impersonation Toggle */}
            {session?.user?.role === 'ADMIN' && (
              <button
                onClick={() => setShowImpersonation(!showImpersonation)}
                className="btn-secondary flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                {showImpersonation ? 'Hide' : 'Show'} Admin Tools
              </button>
            )}
          </div>
        </div>

        {/* Admin Impersonation Panel */}
        {showImpersonation && session?.user?.role === 'ADMIN' && (
          <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Admin Tools
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-yellow-700 mb-2">
                  Impersonate User (Demo)
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="user@example.com"
                    className="flex-1 px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <button className="btn-secondary text-sm">
                    Impersonate
                  </button>
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                  This is a demo stub for troubleshooting
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-700 mb-2">
                  B2B Approvals
                </label>
                <Link href="/admin/b2b" className="btn-secondary text-sm">
                  Manage B2B Applications
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            {quickStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg border border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600">Total Orders</p>
                      <p className="text-2xl font-bold text-neutral-900">{quickStats.totalOrders}</p>
                    </div>
                    <Package className="w-8 h-8 text-emerald-600" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600">Total Spent</p>
                      <p className="text-2xl font-bold text-neutral-900">
                        {formatPrice(quickStats.totalSpent, currency)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600">Wishlist Items</p>
                      <p className="text-2xl font-bold text-neutral-900">{quickStats.wishlistItems}</p>
                    </div>
                    <Heart className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600">Addresses</p>
                      <p className="text-2xl font-bold text-neutral-900">{quickStats.addresses}</p>
                    </div>
                    <MapPin className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Recent Orders */}
            <div className="bg-white rounded-lg border border-neutral-200">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-xl font-bold text-neutral-900">Recent Orders</h2>
                  <Link href="/account/orders" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900">#{order.orderNumber}</p>
                            <p className="text-sm text-neutral-600">
                              {order.itemCount} item{order.itemCount !== 1 ? 's' : ''} • {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-neutral-900">
                            {formatPrice(order.total, currency)}
                          </p>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-600 mb-4">No orders yet</p>
                    <Link href="/products" className="btn-primary">
                      Start Shopping
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* B2B Dashboard (if B2B user) */}
            {session?.user?.role === 'B2B' && (
              <div className="bg-white rounded-lg border border-neutral-200">
                <div className="p-6 border-b border-neutral-200">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-xl font-bold text-neutral-900 flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      B2B Dashboard
                    </h2>
                    <Link href="/account/b2b" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                      Manage B2B
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/account/b2b/quotes" className="p-4 border border-neutral-200 rounded-lg hover:border-emerald-300 transition-colors">
                      <h3 className="font-medium text-neutral-900 mb-2">Quote Requests</h3>
                      <p className="text-sm text-neutral-600">Manage bulk quote requests and pricing</p>
                    </Link>
                    <Link href="/account/b2b/orders" className="p-4 border border-neutral-200 rounded-lg hover:border-emerald-300 transition-colors">
                      <h3 className="font-medium text-neutral-900 mb-2">Bulk Orders</h3>
                      <p className="text-sm text-neutral-600">Place and track bulk orders</p>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  {profile?.profile?.firstName ? (
                    <span className="text-2xl font-bold text-emerald-600">
                      {profile.profile.firstName[0]}{profile.profile.lastName?.[0] || ''}
                    </span>
                  ) : (
                    <User className="w-8 h-8 text-emerald-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900">
                    {profile?.profile?.firstName && profile?.profile?.lastName
                      ? `${profile.profile.firstName} ${profile.profile.lastName}`
                      : profile?.name || 'User'
                    }
                  </h3>
                  <p className="text-sm text-neutral-600">{profile?.email}</p>
                  <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full mt-1">
                    {profile?.role}
                  </span>
                </div>
              </div>
              <Link href="/account/profile" className="btn-secondary w-full flex items-center justify-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Link>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h3 className="font-medium text-neutral-900 mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link href="/account/orders" className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                  <Package className="w-5 h-5 text-neutral-600" />
                  <span className="text-neutral-700">Orders</span>
                  <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto" />
                </Link>
                <Link href="/account/addresses" className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                  <MapPin className="w-5 h-5 text-neutral-600" />
                  <span className="text-neutral-700">Addresses</span>
                  <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto" />
                </Link>
                <Link href="/account/payments" className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                  <CreditCard className="w-5 h-5 text-neutral-600" />
                  <span className="text-neutral-700">Payment Methods</span>
                  <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto" />
                </Link>
                <Link href="/account/wishlist" className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                  <Heart className="w-5 h-5 text-neutral-600" />
                  <span className="text-neutral-700">Wishlist</span>
                  <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto" />
                </Link>
                <Link href="/account/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                  <Settings className="w-5 h-5 text-neutral-600" />
                  <span className="text-neutral-700">Settings</span>
                  <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto" />
                </Link>
              </div>
            </div>

            {/* Support */}
            <div className="bg-neutral-50 rounded-lg p-6">
              <h3 className="font-medium text-neutral-900 mb-3">Need Help?</h3>
              <p className="text-sm text-neutral-600 mb-4">
                Our support team is here to help with any questions.
              </p>
              <div className="space-y-2">
                <Link href="/contact" className="btn-secondary w-full text-sm">
                  Contact Support
                </Link>
                <Link href="/faq" className="btn-outline w-full text-sm">
                  View FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
