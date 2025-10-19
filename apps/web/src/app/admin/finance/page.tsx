'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface FinanceMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  profitMargin: number;
  refunds: number;
  taxes: number;
  netRevenue: number;
  currency: string;
}

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  refunds: number;
}

interface PaymentProviderBreakdown {
  provider: string;
  orders: number;
  revenue: number;
  percentage: number;
  fees: number;
}

interface RefundData {
  id: string;
  orderNumber: string;
  amount: number;
  reason: string;
  status: string;
  createdAt: string;
}

export default function FinancePage() {
  const [metrics, setMetrics] = useState<FinanceMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentProviderBreakdown[]>([]);
  const [refunds, setRefunds] = useState<RefundData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchFinanceData();
  }, [dateRange]);

  const fetchFinanceData = async () => {
    try {
      const response = await fetch(`/api/admin/finance?period=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
        setRevenueData(data.revenueData);
        setPaymentBreakdown(data.paymentBreakdown);
        setRefunds(data.refunds);
      }
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'csv' | 'xlsx') => {
    try {
      const response = await fetch(`/api/admin/finance/export?format=${format}&period=${dateRange}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance-report-${dateRange}days.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
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
                Finance & Reporting
              </h1>
              <p className="mt-2 text-gray-600">
                Revenue insights, financial reports, and payment analytics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              <button
                onClick={() => exportReport('csv')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Export CSV
              </button>
              <button
                onClick={() => exportReport('xlsx')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${
                activeTab === 'overview'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`${
                activeTab === 'revenue'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
            >
              Revenue Analysis
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`${
                activeTab === 'payments'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
            >
              Payment Providers
            </button>
            <button
              onClick={() => setActiveTab('refunds')}
              className={`${
                activeTab === 'refunds'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
            >
              Refunds
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && metrics && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                      {formatCurrency(metrics.totalRevenue, metrics.currency)}
                    </p>
                    <p className="text-sm text-emerald-600">+12.5% from last period</p>
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
                      {formatNumber(metrics.totalOrders)}
                    </p>
                    <p className="text-sm text-blue-600">+8.2% from last period</p>
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
                    <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(metrics.averageOrderValue, metrics.currency)}
                    </p>
                    <p className="text-sm text-yellow-600">+5.1% from last period</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📈</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.profitMargin}%
                    </p>
                    <p className="text-sm text-purple-600">+2.1% from last period</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Gross Revenue</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(metrics.totalRevenue, metrics.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Refunds</span>
                    <span className="text-sm font-medium text-red-600">
                      -{formatCurrency(metrics.refunds, metrics.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Taxes (GST)</span>
                    <span className="text-sm font-medium text-gray-600">
                      {formatCurrency(metrics.taxes, metrics.currency)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-gray-900">Net Revenue</span>
                      <span className="text-sm font-semibold text-emerald-600">
                        {formatCurrency(metrics.netRevenue, metrics.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Orders per Day</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round(metrics.totalOrders / parseInt(dateRange))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Revenue per Day</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(metrics.totalRevenue / parseInt(dateRange), metrics.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Refund Rate</span>
                    <span className="text-sm font-medium text-gray-900">
                      {((metrics.refunds / metrics.totalRevenue) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tax Rate</span>
                    <span className="text-sm font-medium text-gray-900">
                      {((metrics.taxes / metrics.totalRevenue) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Analysis Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
              <div className="h-64 flex items-end justify-between space-x-2">
                {revenueData.map((day, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="bg-emerald-500 rounded-t w-full transition-all duration-300 hover:bg-emerald-600"
                      style={{ height: `${(day.revenue / Math.max(...revenueData.map(d => d.revenue))) * 200}px` }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue</h3>
                <div className="space-y-3">
                  {revenueData.slice(-7).map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(day.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">{day.orders} orders</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(day.revenue, metrics?.currency || 'INR')}
                        </div>
                        {day.refunds > 0 && (
                          <div className="text-xs text-red-600">
                            -{formatCurrency(day.refunds, metrics?.currency || 'INR')} refunds
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">B2C Revenue</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(metrics ? metrics.totalRevenue * 0.7 : 0, metrics?.currency || 'INR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">B2B Revenue</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(metrics ? metrics.totalRevenue * 0.3 : 0, metrics?.currency || 'INR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Direct Sales</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(metrics ? metrics.totalRevenue * 0.8 : 0, metrics?.currency || 'INR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Online Sales</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(metrics ? metrics.totalRevenue * 0.2 : 0, metrics?.currency || 'INR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Providers Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Provider Breakdown</h3>
              <div className="space-y-4">
                {paymentBreakdown.map((provider, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-3" style={{
                        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'][index % 4]
                      }}></div>
                      <div>
                        <div className="font-medium text-gray-900">{provider.provider}</div>
                        <div className="text-sm text-gray-500">{provider.orders} orders</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(provider.revenue, metrics?.currency || 'INR')}
                      </div>
                      <div className="text-sm text-gray-500">{provider.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Fees</h3>
                <div className="space-y-3">
                  {paymentBreakdown.map((provider, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{provider.provider}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(provider.fees, metrics?.currency || 'INR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Success Rates</h3>
                <div className="space-y-3">
                  {paymentBreakdown.map((provider, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{provider.provider}</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full" 
                            style={{ width: `${85 + Math.random() * 10}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {(85 + Math.random() * 10).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refunds Tab */}
        {activeTab === 'refunds' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Refunds</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {refunds.map((refund) => (
                      <tr key={refund.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          #{refund.orderNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatCurrency(refund.amount, metrics?.currency || 'INR')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {refund.reason}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            refund.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            refund.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {refund.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(refund.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}


