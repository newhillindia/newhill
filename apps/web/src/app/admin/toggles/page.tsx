'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface Toggle {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'general' | 'features' | 'payments' | 'shipping' | 'marketing';
  lastUpdated: string;
  updatedBy: string;
}

export default function TogglesPage() {
  const [toggles, setToggles] = useState<Toggle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchToggles();
  }, []);

  const fetchToggles = async () => {
    try {
      const response = await fetch('/api/admin/toggles');
      if (response.ok) {
        const data = await response.json();
        setToggles(data.toggles);
      }
    } catch (error) {
      console.error('Error fetching toggles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChange = async (toggleId: string, enabled: boolean) => {
    setSaving(toggleId);
    try {
      const response = await fetch(`/api/admin/toggles/${toggleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });

      if (response.ok) {
        setToggles(prev => prev.map(toggle => 
          toggle.id === toggleId 
            ? { ...toggle, enabled, lastUpdated: new Date().toISOString() }
            : toggle
        ));
      }
    } catch (error) {
      console.error('Error updating toggle:', error);
    } finally {
      setSaving(null);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return 'bg-blue-100 text-blue-800';
      case 'features': return 'bg-green-100 text-green-800';
      case 'payments': return 'bg-purple-100 text-purple-800';
      case 'shipping': return 'bg-yellow-100 text-yellow-800';
      case 'marketing': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general': return '⚙️';
      case 'features': return '🚀';
      case 'payments': return '💳';
      case 'shipping': return '🚚';
      case 'marketing': return '📢';
      default: return '🔧';
    }
  };

  const groupedToggles = toggles.reduce((acc, toggle) => {
    if (!acc[toggle.category]) {
      acc[toggle.category] = [];
    }
    acc[toggle.category].push(toggle);
    return acc;
  }, {} as Record<string, Toggle[]>);

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
                Feature Toggles
              </h1>
              <p className="mt-2 text-gray-600">
                Control global site features and functionality
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {toggles.filter(t => t.enabled).length} of {toggles.length} features enabled
              </div>
              <button
                onClick={fetchToggles}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Toggles by Category */}
        <div className="space-y-8">
          {Object.entries(groupedToggles).map(([category, categoryToggles]) => (
            <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getCategoryIcon(category)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">
                      {category} Features
                    </h3>
                    <p className="text-sm text-gray-500">
                      {categoryToggles.length} toggle{categoryToggles.length > 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {categoryToggles.map((toggle) => (
                  <div key={toggle.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900">
                            {toggle.name}
                          </h4>
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(toggle.category)}`}>
                            {toggle.category}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {toggle.description}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Last updated: {new Date(toggle.lastUpdated).toLocaleString()}
                        </p>
                      </div>

                      <div className="ml-4 flex items-center">
                        {saving === toggle.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                        ) : (
                          <button
                            onClick={() => handleToggleChange(toggle.id, !toggle.enabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                              toggle.enabled ? 'bg-emerald-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                toggle.enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Global Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Global Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                toggles.forEach(toggle => {
                  if (!toggle.enabled) {
                    handleToggleChange(toggle.id, true);
                  }
                });
              }}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="text-2xl mb-2">✅</div>
              <div className="text-sm font-medium text-gray-900">Enable All</div>
              <div className="text-xs text-gray-500">Turn on all disabled features</div>
            </button>
            
            <button
              onClick={() => {
                toggles.forEach(toggle => {
                  if (toggle.enabled) {
                    handleToggleChange(toggle.id, false);
                  }
                });
              }}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="text-2xl mb-2">❌</div>
              <div className="text-sm font-medium text-gray-900">Disable All</div>
              <div className="text-xs text-gray-500">Turn off all enabled features</div>
            </button>
            
            <button
              onClick={() => {/* TODO: Implement reset to defaults */}}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="text-2xl mb-2">🔄</div>
              <div className="text-sm font-medium text-gray-900">Reset to Defaults</div>
              <div className="text-xs text-gray-500">Restore default settings</div>
            </button>
          </div>
        </div>

        {/* Status Summary */}
        <div className="mt-8 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {toggles.filter(t => t.enabled).length}
              </div>
              <div className="text-sm text-gray-500">Enabled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">
                {toggles.filter(t => !t.enabled).length}
              </div>
              <div className="text-sm text-gray-500">Disabled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(groupedToggles).length}
              </div>
              <div className="text-sm text-gray-500">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {toggles.length}
              </div>
              <div className="text-sm text-gray-500">Total Toggles</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}


