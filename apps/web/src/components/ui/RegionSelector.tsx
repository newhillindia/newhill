'use client';

import React, { useState } from 'react';
import { useLocalization, REGIONS, RegionCode } from '@/lib/localization';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface RegionSelectorProps {
  className?: string;
  showLabel?: boolean;
}

export default function RegionSelector({ className = '', showLabel = true }: RegionSelectorProps) {
  const { region, setRegion, currency, language } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);

  const currentRegion = REGIONS[region];

  const handleRegionChange = (newRegion: RegionCode) => {
    setRegion(newRegion);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Region & Currency
        </label>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      >
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-gray-500" />
          <span className="font-medium">{currentRegion.name}</span>
          <span className="text-gray-500">({currentRegion.currency})</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="py-1">
            {Object.entries(REGIONS).map(([code, regionData]) => (
              <button
                key={code}
                onClick={() => handleRegionChange(code as RegionCode)}
                className={`flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-gray-50 ${
                  region === code ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col">
                    <span className="font-medium">{regionData.name}</span>
                    <span className="text-xs text-gray-500">
                      {regionData.currency} • {regionData.language.toUpperCase()}
                    </span>
                  </div>
                </div>
                {region === code && (
                  <Check className="w-4 h-4 text-emerald-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Currency converter component
export function CurrencyConverter({ 
  amount, 
  fromCurrency, 
  className = '' 
}: { 
  amount: number; 
  fromCurrency: string; 
  className?: string; 
}) {
  const { currency, convertCurrency, formatCurrency } = useLocalization();
  
  const convertedAmount = convertCurrency(amount, fromCurrency as any, currency);
  
  return (
    <div className={`text-sm ${className}`}>
      <span className="text-gray-600">
        {formatCurrency(amount, fromCurrency as any)}
      </span>
      {fromCurrency !== currency && (
        <>
          <span className="mx-2 text-gray-400">≈</span>
          <span className="font-medium text-emerald-600">
            {formatCurrency(convertedAmount)}
          </span>
        </>
      )}
    </div>
  );
}

// Language switcher component
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇮🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <span>{currentLanguage.flag}</span>
        <span>{currentLanguage.name}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as any);
                  setIsOpen(false);
                }}
                className={`flex items-center space-x-3 w-full px-3 py-2 text-sm hover:bg-gray-50 ${
                  language === lang.code ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                {language === lang.code && (
                  <Check className="w-4 h-4 text-emerald-600 ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

