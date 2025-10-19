import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { 
  SupportedCurrency, 
  PriceInfo, 
  getCurrencyPrice, 
  getBulkCurrencyPrices,
  formatPrice,
  getSupportedCurrencies,
  SUPPORTED_CURRENCIES 
} from '../lib/currency';

interface UseCurrencyReturn {
  currency: SupportedCurrency;
  setCurrency: (currency: SupportedCurrency) => void;
  getPrice: (variantId: string) => Promise<PriceInfo>;
  getBulkPrices: (variantIds: string[]) => Promise<Record<string, PriceInfo>>;
  formatPrice: (amount: number) => PriceInfo;
  supportedCurrencies: Array<{
    code: SupportedCurrency;
    name: string;
    symbol: string;
  }>;
  isLoading: boolean;
  error: string | null;
}

export function useCurrency(): UseCurrencyReturn {
  const { data: session } = useSession();
  const [currency, setCurrencyState] = useState<SupportedCurrency>('INR');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize currency from user profile or localStorage
  useEffect(() => {
    const initializeCurrency = () => {
      // Try to get from user profile first
      if (session?.user?.profile?.defaultCurrency) {
        const userCurrency = session.user.profile.defaultCurrency as SupportedCurrency;
        if (userCurrency in SUPPORTED_CURRENCIES) {
          setCurrencyState(userCurrency);
          return;
        }
      }

      // Fallback to localStorage
      const savedCurrency = localStorage.getItem('preferredCurrency') as SupportedCurrency;
      if (savedCurrency && savedCurrency in SUPPORTED_CURRENCIES) {
        setCurrencyState(savedCurrency);
        return;
      }

      // Default to INR
      setCurrencyState('INR');
    };

    initializeCurrency();
  }, [session]);

  const setCurrency = useCallback((newCurrency: SupportedCurrency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
    
    // Update user profile if logged in
    if (session?.user) {
      updateUserCurrency(newCurrency);
    }
  }, [session]);

  const updateUserCurrency = async (newCurrency: SupportedCurrency) => {
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultCurrency: newCurrency }),
      });
    } catch (error) {
      console.error('Failed to update user currency preference:', error);
    }
  };

  const getPrice = useCallback(async (variantId: string): Promise<PriceInfo> => {
    setIsLoading(true);
    setError(null);

    try {
      const price = await getCurrencyPrice(variantId, currency);
      return price;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get price';
      setError(errorMessage);
      console.error('Error getting price:', err);
      
      // Return fallback price
      return formatPrice(0, currency);
    } finally {
      setIsLoading(false);
    }
  }, [currency]);

  const getBulkPrices = useCallback(async (variantIds: string[]): Promise<Record<string, PriceInfo>> => {
    setIsLoading(true);
    setError(null);

    try {
      const prices = await getBulkCurrencyPrices(variantIds, currency);
      return prices;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get bulk prices';
      setError(errorMessage);
      console.error('Error getting bulk prices:', err);
      
      // Return fallback prices
      const fallbackPrices: Record<string, PriceInfo> = {};
      variantIds.forEach(id => {
        fallbackPrices[id] = formatPrice(0, currency);
      });
      return fallbackPrices;
    } finally {
      setIsLoading(false);
    }
  }, [currency]);

  const formatPriceAmount = useCallback((amount: number): PriceInfo => {
    return formatPrice(amount, currency);
  }, [currency]);

  return {
    currency,
    setCurrency,
    getPrice,
    getBulkPrices,
    formatPrice: formatPriceAmount,
    supportedCurrencies: getSupportedCurrencies(),
    isLoading,
    error,
  };
}

// Hook for currency conversion without state management
export function useCurrencyConversion() {
  const { currency } = useCurrency();

  const convertAmount = useCallback((amount: number, fromCurrency: string): PriceInfo => {
    // Simple conversion for display purposes
    // In production, you might want to use real-time rates
    return formatPrice(amount, currency);
  }, [currency]);

  return {
    convertAmount,
    currentCurrency: currency,
  };
}
