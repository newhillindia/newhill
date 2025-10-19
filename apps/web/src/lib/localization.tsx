import { createContext, useContext, useEffect, useState } from 'react';

// Supported regions and their configurations
export const REGIONS = {
  IN: {
    code: 'IN',
    name: 'India',
    currency: 'INR',
    language: 'en',
    timezone: 'Asia/Kolkata',
    phoneCode: '+91',
    addressFormat: 'IN',
    taxRate: 18,
    shippingZones: ['IN'],
    currencySymbol: '₹',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      decimal: '.',
      thousands: ',',
    },
  },
  AE: {
    code: 'AE',
    name: 'United Arab Emirates',
    currency: 'AED',
    language: 'en',
    timezone: 'Asia/Dubai',
    phoneCode: '+971',
    addressFormat: 'AE',
    taxRate: 5,
    shippingZones: ['AE'],
    currencySymbol: 'د.إ',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      decimal: '.',
      thousands: ',',
    },
  },
  SA: {
    code: 'SA',
    name: 'Saudi Arabia',
    currency: 'SAR',
    language: 'ar',
    timezone: 'Asia/Riyadh',
    phoneCode: '+966',
    addressFormat: 'SA',
    taxRate: 15,
    shippingZones: ['SA'],
    currencySymbol: 'ر.س',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      decimal: '.',
      thousands: ',',
    },
  },
  QA: {
    code: 'QA',
    name: 'Qatar',
    currency: 'QAR',
    language: 'ar',
    timezone: 'Asia/Qatar',
    phoneCode: '+974',
    addressFormat: 'QA',
    taxRate: 0,
    shippingZones: ['QA'],
    currencySymbol: 'ر.ق',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      decimal: '.',
      thousands: ',',
    },
  },
  KW: {
    code: 'KW',
    name: 'Kuwait',
    currency: 'KWD',
    language: 'ar',
    timezone: 'Asia/Kuwait',
    phoneCode: '+965',
    addressFormat: 'KW',
    taxRate: 0,
    shippingZones: ['KW'],
    currencySymbol: 'د.ك',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      decimal: '.',
      thousands: ',',
    },
  },
  BH: {
    code: 'BH',
    name: 'Bahrain',
    currency: 'BHD',
    language: 'ar',
    timezone: 'Asia/Bahrain',
    phoneCode: '+973',
    addressFormat: 'BH',
    taxRate: 10,
    shippingZones: ['BH'],
    currencySymbol: 'د.ب',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      decimal: '.',
      thousands: ',',
    },
  },
  OM: {
    code: 'OM',
    name: 'Oman',
    currency: 'OMR',
    language: 'ar',
    timezone: 'Asia/Muscat',
    phoneCode: '+968',
    addressFormat: 'OM',
    taxRate: 5,
    shippingZones: ['OM'],
    currencySymbol: 'ر.ع.',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      decimal: '.',
      thousands: ',',
    },
  },
} as const;

export type RegionCode = keyof typeof REGIONS;
export type CurrencyCode = typeof REGIONS[RegionCode]['currency'];
export type LanguageCode = typeof REGIONS[RegionCode]['language'];

// Currency conversion rates (mock - in production, use real-time API)
export const CURRENCY_RATES: Record<string, Record<string, number>> = {
  INR: { INR: 1, AED: 0.044, SAR: 0.045, QAR: 0.044, KWD: 0.0037, BHD: 0.0045, OMR: 0.0046 },
  AED: { INR: 22.7, AED: 1, SAR: 1.02, QAR: 1, KWD: 0.084, BHD: 0.102, OMR: 0.105 },
  SAR: { INR: 22.2, AED: 0.98, SAR: 1, QAR: 0.98, KWD: 0.082, BHD: 0.1, OMR: 0.103 },
  QAR: { INR: 22.7, AED: 1, SAR: 1.02, QAR: 1, KWD: 0.084, BHD: 0.102, OMR: 0.105 },
  KWD: { INR: 270, AED: 11.9, SAR: 12.2, QAR: 11.9, KWD: 1, BHD: 1.22, OMR: 1.25 },
  BHD: { INR: 221, AED: 9.8, SAR: 10, QAR: 9.8, KWD: 0.82, BHD: 1, OMR: 1.03 },
  OMR: { INR: 215, AED: 9.5, SAR: 9.7, QAR: 9.5, KWD: 0.8, BHD: 0.97, OMR: 1 },
};

interface LocalizationContextType {
  region: RegionCode;
  currency: CurrencyCode;
  language: LanguageCode;
  timezone: string;
  currencySymbol: string;
  taxRate: number;
  shippingZones: string[];
  dateFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
  };
  setRegion: (region: RegionCode) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setLanguage: (language: LanguageCode) => void;
  formatCurrency: (amount: number, currency?: CurrencyCode) => string;
  formatNumber: (number: number) => string;
  convertCurrency: (amount: number, from: CurrencyCode, to: CurrencyCode) => number;
  detectRegion: () => Promise<RegionCode>;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export function LocalizationProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegionState] = useState<RegionCode>('IN');
  const [currency, setCurrencyState] = useState<CurrencyCode>('INR');
  const [language, setLanguageState] = useState<LanguageCode>('en');

  const currentRegion = REGIONS[region];

  // Auto-detect region on mount
  useEffect(() => {
    detectRegion().then((detectedRegion) => {
      setRegionState(detectedRegion);
      setCurrencyState(REGIONS[detectedRegion].currency);
      setLanguageState(REGIONS[detectedRegion].language);
    });
  }, []);

  const setRegion = (newRegion: RegionCode) => {
    setRegionState(newRegion);
    setCurrencyState(REGIONS[newRegion].currency);
    setLanguageState(REGIONS[newRegion].language);
    
    // Save to localStorage
    localStorage.setItem('preferred_region', newRegion);
  };

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('preferred_currency', newCurrency);
  };

  const setLanguage = (newLanguage: LanguageCode) => {
    setLanguageState(newLanguage);
    localStorage.setItem('preferred_language', newLanguage);
  };

  const formatCurrency = (amount: number, targetCurrency?: CurrencyCode): string => {
    const currencyCode = targetCurrency || currency;
    const region = Object.values(REGIONS).find(r => r.currency === currencyCode);
    const symbol = region?.currencySymbol || currencyCode;
    
    const formattedAmount = formatNumber(amount);
    return `${symbol} ${formattedAmount}`;
  };

  const formatNumber = (number: number): string => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };

  const convertCurrency = (amount: number, from: CurrencyCode, to: CurrencyCode): number => {
    if (from === to) return amount;
    
    const rates = CURRENCY_RATES[from];
    if (!rates || !rates[to]) return amount;
    
    return amount * rates[to];
  };

  const detectRegion = async (): Promise<RegionCode> => {
    // Check localStorage first
    const savedRegion = localStorage.getItem('preferred_region') as RegionCode;
    if (savedRegion && REGIONS[savedRegion]) {
      return savedRegion;
    }

    try {
      // Use IP geolocation API
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      const countryCode = data.country_code;
      if (countryCode && REGIONS[countryCode as RegionCode]) {
        return countryCode as RegionCode;
      }
    } catch (error) {
      console.warn('Failed to detect region:', error);
    }

    // Fallback to India
    return 'IN';
  };

  const value: LocalizationContextType = {
    region,
    currency,
    language,
    timezone: currentRegion.timezone,
    currencySymbol: currentRegion.currencySymbol,
    taxRate: currentRegion.taxRate,
    shippingZones: currentRegion.shippingZones,
    dateFormat: currentRegion.dateFormat,
    numberFormat: currentRegion.numberFormat,
    setRegion,
    setCurrency,
    setLanguage,
    formatCurrency,
    formatNumber,
    convertCurrency,
    detectRegion,
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
}

// Utility functions for server-side rendering
export function getRegionFromHeaders(headers: Headers): RegionCode {
  const acceptLanguage = headers.get('accept-language') || '';
  const cfCountry = headers.get('cf-ipcountry') || '';
  
  // Check Cloudflare country header first
  if (cfCountry && REGIONS[cfCountry as RegionCode]) {
    return cfCountry as RegionCode;
  }
  
  // Check Accept-Language header
  if (acceptLanguage.includes('ar')) {
    return 'SA'; // Default Arabic region
  }
  
  return 'IN'; // Default to India
}

export function getCurrencyFromRegion(region: RegionCode): CurrencyCode {
  return REGIONS[region].currency;
}

export function getLanguageFromRegion(region: RegionCode): LanguageCode {
  return REGIONS[region].language;
}

