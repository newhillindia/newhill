'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Feature flag types
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: 'boolean' | 'percentage' | 'region' | 'user_group';
  value?: any;
  conditions?: {
    regions?: string[];
    userGroups?: string[];
    percentage?: number;
    startDate?: string;
    endDate?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Feature flag context
interface FeatureFlagContextType {
  flags: Record<string, FeatureFlag>;
  isLoading: boolean;
  isEnabled: (flagName: string, userId?: string, region?: string) => boolean;
  getValue: (flagName: string, userId?: string, region?: string) => any;
  refreshFlags: () => Promise<void>;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

// Feature flag provider
export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<Record<string, FeatureFlag>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchFlags = async () => {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .eq('enabled', true);

      if (error) throw error;

      const flagsMap: Record<string, FeatureFlag> = {};
      data?.forEach(flag => {
        flagsMap[flag.name] = flag;
      });

      setFlags(flagsMap);
    } catch (error) {
      console.error('Failed to fetch feature flags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('feature_flags')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'feature_flags' },
        () => {
          fetchFlags();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isEnabled = (flagName: string, userId?: string, region?: string): boolean => {
    const flag = flags[flagName];
    if (!flag) return false;

    // Check if flag is globally disabled
    if (!flag.enabled) return false;

    // Check date conditions
    if (flag.conditions?.startDate && new Date() < new Date(flag.conditions.startDate)) {
      return false;
    }
    if (flag.conditions?.endDate && new Date() > new Date(flag.conditions.endDate)) {
      return false;
    }

    // Check region conditions
    if (flag.conditions?.regions && region) {
      if (!flag.conditions.regions.includes(region)) {
        return false;
      }
    }

    // Check user group conditions
    if (flag.conditions?.userGroups && userId) {
      // In a real implementation, you'd check user groups from the database
      // For now, we'll assume all users are in the 'default' group
      if (!flag.conditions.userGroups.includes('default')) {
        return false;
      }
    }

    // Check percentage rollout
    if (flag.conditions?.percentage && userId) {
      const hash = hashUserId(userId);
      const percentage = hash % 100;
      if (percentage >= flag.conditions.percentage) {
        return false;
      }
    }

    return true;
  };

  const getValue = (flagName: string, userId?: string, region?: string): any => {
    const flag = flags[flagName];
    if (!flag) return null;

    if (!isEnabled(flagName, userId, region)) {
      return null;
    }

    return flag.value;
  };

  const refreshFlags = async () => {
    setIsLoading(true);
    await fetchFlags();
  };

  return (
    <FeatureFlagContext.Provider value={{
      flags,
      isLoading,
      isEnabled,
      getValue,
      refreshFlags,
    }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

// Hook to use feature flags
export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
}

// Utility function to hash user ID for percentage rollouts
function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Feature flag components
export function FeatureFlagGate({ 
  flag, 
  children, 
  fallback = null,
  userId,
  region 
}: {
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  userId?: string;
  region?: string;
}) {
  const { isEnabled } = useFeatureFlags();
  
  if (isEnabled(flag, userId, region)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

export function FeatureFlagValue({ 
  flag, 
  children, 
  fallback = null,
  userId,
  region 
}: {
  flag: string;
  children: (value: any) => React.ReactNode;
  fallback?: React.ReactNode;
  userId?: string;
  region?: string;
}) {
  const { getValue } = useFeatureFlags();
  const value = getValue(flag, userId, region);
  
  if (value !== null) {
    return <>{children(value)}</>;
  }
  
  return <>{fallback}</>;
}

// Admin feature flag management
export function FeatureFlagManager() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);

  useEffect(() => {
    fetchAllFlags();
  }, []);

  const fetchAllFlags = async () => {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFlags(data || []);
    } catch (error) {
      console.error('Failed to fetch flags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFlag = async (flag: FeatureFlag) => {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({
          enabled: flag.enabled,
          value: flag.value,
          conditions: flag.conditions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', flag.id);

      if (error) throw error;
      
      await fetchAllFlags();
      setEditingFlag(null);
    } catch (error) {
      console.error('Failed to update flag:', error);
    }
  };

  const createFlag = async (flag: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .insert({
          ...flag,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      await fetchAllFlags();
    } catch (error) {
      console.error('Failed to create flag:', error);
    }
  };

  if (isLoading) {
    return <div>Loading feature flags...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Feature Flags</h2>
        <button
          onClick={() => setEditingFlag({
            id: '',
            name: '',
            description: '',
            enabled: false,
            type: 'boolean',
            createdAt: '',
            updatedAt: '',
          })}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
        >
          Add New Flag
        </button>
      </div>

      <div className="grid gap-4">
        {flags.map(flag => (
          <div key={flag.id} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{flag.name}</h3>
                <p className="text-gray-600 text-sm">{flag.description}</p>
                <div className="mt-2 flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    flag.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {flag.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {flag.type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEditingFlag(flag)}
                className="text-emerald-600 hover:text-emerald-700"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingFlag && (
        <FeatureFlagEditor
          flag={editingFlag}
          onSave={editingFlag.id ? updateFlag : createFlag}
          onCancel={() => setEditingFlag(null)}
        />
      )}
    </div>
  );
}

function FeatureFlagEditor({ 
  flag, 
  onSave, 
  onCancel 
}: {
  flag: FeatureFlag;
  onSave: (flag: FeatureFlag) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState(flag);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h3 className="text-xl font-bold mb-4">
          {flag.id ? 'Edit Feature Flag' : 'Create Feature Flag'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={3}
              required
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Enabled</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

