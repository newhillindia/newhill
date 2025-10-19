'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useTranslation } from 'react-i18next';

interface DashboardMetrics {
  totalSales: number;
  revenue: number;
  profitMargin: number;
  lowStockCount: number;
  pendingPayments: number;
  totalOrders: number;
  totalCustomers: number;
  pendingB2BApprovals: number;
}

interface SalesTrend {
  date: string;
  sales: number;
  orders: number;
}

interface TopSKU {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  growth: number;
}

interface ChannelBreakdown {
  channel: string;
  orders: number;
  revenue: number;
  percentage: number;
}

interface RecentActivity {
  id: string;
  type: 'order' | 'low_stock' | 'b2b_approval' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [salesTrend, setSalesTrend] = useState<SalesTrend[]>([]);
  const [topSKUs, setTopSKUs] = useState<TopSKU[]>([]);
  const [channelBreakdown, setChannelBreakdown] = useState<ChannelBreakdown[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveFeedEnabled, setLiveFeedEnabled] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time updates if live feed is enabled
    let interval: NodeJS.Timeout;
    if (liveFeedEnabled) {
      interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [liveFeedEnabled]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
        setSalesTrend(data.salesTrend);
        setTopSKUs(data.topSKUs);
        setChannelBreakdown(data.channelBreakdown);
        setRecentActivity(data.recentActivity);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-heading">
                Dashboard Overview
              </h1>
              <p className="mt-2 text-gray-600">
                Real-time insights into your spice business performance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setLiveFeedEnabled(!liveFeedEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    liveFeedEnabled ? 'bg-emerald-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      liveFeedEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-600">
                  {liveFeedEnabled ? 'Live Feed ON' : 'Live Feed OFF'}
                </span>
              </div>
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics ? formatCurrency(metrics.revenue) : '₹0'}
                </p>
                <p className="text-sm text-emerald-600">+12.5% from last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics ? formatNumber(metrics.totalOrders) : '0'}
                </p>
                <p className="text-sm text-blue-600">+8.2% from last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics ? `${metrics.profitMargin}%` : '0%'}
                </p>
                <p className="text-sm text-yellow-600">+2.1% from last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics ? metrics.lowStockCount : '0'}
                </p>
                <p className="text-sm text-red-600">Needs attention</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Trend Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend (Last 30 Days)</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {salesTrend.map((day, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-emerald-500 rounded-t w-full transition-all duration-300 hover:bg-emerald-600"
                    style={{ height: `${(day.sales / Math.max(...salesTrend.map(d => d.sales))) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top SKUs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing SKUs</h3>
            <div className="space-y-4">
              {topSKUs.map((sku, index) => (
                <div key={sku.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-emerald-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{sku.name}</p>
                      <p className="text-sm text-gray-500">{formatNumber(sku.sales)} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(sku.revenue)}</p>
                    <p className={`text-sm ${sku.growth > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {sku.growth > 0 ? '+' : ''}{sku.growth}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Channel Breakdown and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Channel Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Channel Breakdown</h3>
            <div className="space-y-4">
              {channelBreakdown.map((channel, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-3" style={{
                      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'][index % 4]
                    }}></div>
                    <span className="text-sm font-medium text-gray-900">{channel.channel}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{channel.percentage}%</p>
                    <p className="text-xs text-gray-500">{formatNumber(channel.orders)} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <span className="text-sm text-gray-500">
                {liveFeedEnabled ? 'Live updates' : 'Manual refresh'}
              </span>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.priority === 'high' ? 'bg-red-500' :
                    activity.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-2xl mb-2">➕</div>
              <div className="text-sm font-medium text-gray-900">Add Product</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-2xl mb-2">🎫</div>
              <div className="text-sm font-medium text-gray-900">Create Coupon</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium text-gray-900">Import CSV</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-2xl mb-2">📈</div>
              <div className="text-sm font-medium text-gray-900">View Reports</div>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}


