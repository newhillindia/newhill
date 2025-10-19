'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface B2BApplication {
  id: string;
  businessName: string;
  businessType: string;
  gstVatNumber: string;
  contactPerson: string;
  contactPhone: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  expectedMonthlyVolume: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface B2BQuote {
  id: string;
  quoteNumber: string;
  status: 'REQUESTED' | 'REVIEWED' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED';
  totalAmount: number;
  currency: string;
  validUntil: string;
  customerNotes: string;
  adminNotes: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  items: B2BQuoteItem[];
}

interface B2BQuoteItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant: {
    product: {
      name: string;
    };
    weightInGrams: number;
  };
}

export default function B2BPage() {
  const [applications, setApplications] = useState<B2BApplication[]>([]);
  const [quotes, setQuotes] = useState<B2BQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applications');
  const [selectedApplication, setSelectedApplication] = useState<B2BApplication | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<B2BQuote | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchB2BData();
  }, []);

  const fetchB2BData = async () => {
    try {
      const [applicationsRes, quotesRes] = await Promise.all([
        fetch('/api/admin/b2b/applications'),
        fetch('/api/admin/b2b/quotes')
      ]);

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json();
        setApplications(applicationsData.applications);
      }

      if (quotesRes.ok) {
        const quotesData = await quotesRes.json();
        setQuotes(quotesData.quotes);
      }
    } catch (error) {
      console.error('Error fetching B2B data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (applicationId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/b2b/applications/${applicationId}/action`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminNotes })
      });

      if (response.ok) {
        setShowApplicationModal(false);
        setAdminNotes('');
        fetchB2BData();
      }
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const handleQuoteAction = async (quoteId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/b2b/quotes/${quoteId}/action`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminNotes })
      });

      if (response.ok) {
        setShowQuoteModal(false);
        setAdminNotes('');
        fetchB2BData();
      }
    } catch (error) {
      console.error('Error updating quote:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'REQUESTED':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'REVIEWED':
        return 'bg-blue-100 text-blue-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      case 'CONVERTED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
                B2B Management
              </h1>
              <p className="mt-2 text-gray-600">
                Manage business accounts, quotes, and sales workflows
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {/* TODO: Implement bulk actions */}}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Bulk Actions
              </button>
              <button
                onClick={() => {/* TODO: Implement create quote */}}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Create Quote
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('applications')}
              className={`${
                activeTab === 'applications'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
            >
              Applications ({applications.filter(app => app.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setActiveTab('quotes')}
              className={`${
                activeTab === 'quotes'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
            >
              Quotes ({quotes.filter(quote => quote.status === 'REQUESTED').length})
            </button>
          </nav>
        </div>

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expected Volume
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.businessName}
                          </div>
                          <div className="text-sm text-gray-500">{application.businessType}</div>
                          {application.gstVatNumber && (
                            <div className="text-xs text-gray-400">GST: {application.gstVatNumber}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.contactPerson}
                          </div>
                          <div className="text-sm text-gray-500">{application.contactPhone}</div>
                          <div className="text-sm text-gray-500">{application.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {application.businessCity}, {application.businessState}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {application.expectedMonthlyVolume}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedApplication(application);
                              setShowApplicationModal(true);
                            }}
                            className="text-emerald-600 hover:text-emerald-900"
                          >
                            Review
                          </button>
                          {application.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApplicationAction(application.id, 'approve')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleApplicationAction(application.id, 'reject')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quotes Tab */}
        {activeTab === 'quotes' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quote
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valid Until
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{quote.quoteNumber}
                          </div>
                          <div className="text-sm text-gray-500">ID: {quote.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {quote.user.name}
                          </div>
                          <div className="text-sm text-gray-500">{quote.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {quote.items.length} item{quote.items.length > 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(quote.totalAmount, quote.currency)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quote.status)}`}>
                          {quote.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedQuote(quote);
                              setShowQuoteModal(true);
                            }}
                            className="text-emerald-600 hover:text-emerald-900"
                          >
                            View
                          </button>
                          {quote.status === 'REQUESTED' && (
                            <>
                              <button
                                onClick={() => handleQuoteAction(quote.id, 'approve')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleQuoteAction(quote.id, 'reject')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Application Review Modal */}
        {showApplicationModal && selectedApplication && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowApplicationModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      Review Application: {selectedApplication.businessName}
                    </h3>
                    <button
                      onClick={() => setShowApplicationModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Business Name</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.businessName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Business Type</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.businessType}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.contactPerson}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.contactPhone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.user.email}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Business Address</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedApplication.businessAddress}<br />
                        {selectedApplication.businessCity}, {selectedApplication.businessState}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expected Monthly Volume</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.expectedMonthlyVolume}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Add your notes here..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={() => handleApplicationAction(selectedApplication.id, 'approve')}
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApplicationAction(selectedApplication.id, 'reject')}
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quote Review Modal */}
        {showQuoteModal && selectedQuote && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowQuoteModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      Quote #{selectedQuote.quoteNumber}
                    </h3>
                    <button
                      onClick={() => setShowQuoteModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Quote Items */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Quote Items</h4>
                      <div className="space-y-3">
                        {selectedQuote.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">{item.variant.product.name}</div>
                              <div className="text-sm text-gray-500">{item.variant.weightInGrams}g</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-gray-900">
                                {formatCurrency(item.totalPrice, selectedQuote.currency)}
                              </div>
                              <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quote Details */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Quote Details</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Customer</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedQuote.user.name}</p>
                          <p className="text-sm text-gray-500">{selectedQuote.user.email}</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                          <p className="mt-1 text-lg font-semibold text-gray-900">
                            {formatCurrency(selectedQuote.totalAmount, selectedQuote.currency)}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Valid Until</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedQuote.validUntil ? new Date(selectedQuote.validUntil).toLocaleDateString() : 'No expiry'}
                          </p>
                        </div>

                        {selectedQuote.customerNotes && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Customer Notes</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedQuote.customerNotes}</p>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                          <textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Add your notes here..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={() => handleQuoteAction(selectedQuote.id, 'approve')}
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleQuoteAction(selectedQuote.id, 'reject')}
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}


