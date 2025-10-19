'use client';

import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface ProductFilters {
  category: string;
  subcategory: string;
  priceMin: number | null;
  priceMax: number | null;
  weight: string;
  certification: string[];
  inStock: boolean;
  organic: boolean;
  giftPack: boolean;
}

interface ProductFiltersProps {
  filters: ProductFilters;
  onChange: (key: keyof ProductFilters, value: any) => void;
  onClose?: () => void;
}

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'whole-spices', label: 'Whole Spices' },
  { value: 'ground-spices', label: 'Ground Spices' },
  { value: 'herbs', label: 'Herbs' },
  { value: 'blends', label: 'Spice Blends' },
  { value: 'gift-packs', label: 'Gift Packs' },
];

const subcategories = {
  'whole-spices': [
    { value: '', label: 'All Whole Spices' },
    { value: 'cardamom', label: 'Cardamom' },
    { value: 'cinnamon', label: 'Cinnamon' },
    { value: 'cloves', label: 'Cloves' },
    { value: 'pepper', label: 'Pepper' },
    { value: 'cumin', label: 'Cumin' },
  ],
  'ground-spices': [
    { value: '', label: 'All Ground Spices' },
    { value: 'turmeric', label: 'Turmeric' },
    { value: 'coriander', label: 'Coriander' },
    { value: 'cumin', label: 'Cumin' },
    { value: 'garam-masala', label: 'Garam Masala' },
  ],
  'herbs': [
    { value: '', label: 'All Herbs' },
    { value: 'basil', label: 'Basil' },
    { value: 'oregano', label: 'Oregano' },
    { value: 'thyme', label: 'Thyme' },
    { value: 'rosemary', label: 'Rosemary' },
  ],
  'blends': [
    { value: '', label: 'All Blends' },
    { value: 'curry-powder', label: 'Curry Powder' },
    { value: 'garam-masala', label: 'Garam Masala' },
    { value: 'tandoori-masala', label: 'Tandoori Masala' },
  ],
  'gift-packs': [
    { value: '', label: 'All Gift Packs' },
    { value: 'starter-kit', label: 'Starter Kit' },
    { value: 'premium-kit', label: 'Premium Kit' },
    { value: 'deluxe-kit', label: 'Deluxe Kit' },
  ],
};

const weightOptions = [
  { value: '', label: 'All Weights' },
  { value: '50g', label: '50g' },
  { value: '100g', label: '100g' },
  { value: '250g', label: '250g' },
  { value: '500g', label: '500g' },
  { value: '1kg', label: '1kg' },
];

const certifications = [
  { value: 'organic', label: 'Organic' },
  { value: 'fssai', label: 'FSSAI Certified' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
];

export default function ProductFilters({ filters, onChange, onClose }: ProductFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    weight: true,
    certification: true,
    features: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCertificationChange = (cert: string, checked: boolean) => {
    const newCerts = checked
      ? [...filters.certification, cert]
      : filters.certification.filter(c => c !== cert);
    onChange('certification', newCerts);
  };

  const currentSubcategories = subcategories[filters.category as keyof typeof subcategories] || [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg text-neutral-900">Filters</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Category */}
        <div>
          <button
            onClick={() => toggleSection('category')}
            className="flex items-center justify-between w-full text-left font-medium text-neutral-900 mb-3"
          >
            Category
            {expandedSections.category ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.category && (
            <div className="space-y-2">
              <select
                value={filters.category}
                onChange={(e) => onChange('category', e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              
              {currentSubcategories.length > 0 && (
                <select
                  value={filters.subcategory}
                  onChange={(e) => onChange('subcategory', e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                >
                  {currentSubcategories.map(subcategory => (
                    <option key={subcategory.value} value={subcategory.value}>
                      {subcategory.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div>
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full text-left font-medium text-neutral-900 mb-3"
          >
            Price Range
            {expandedSections.price ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.price && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-neutral-600 mb-1">Min Price</label>
                  <input
                    type="number"
                    value={filters.priceMin || ''}
                    onChange={(e) => onChange('priceMin', e.target.value ? Number(e.target.value) : null)}
                    placeholder="0"
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-600 mb-1">Max Price</label>
                  <input
                    type="number"
                    value={filters.priceMax || ''}
                    onChange={(e) => onChange('priceMax', e.target.value ? Number(e.target.value) : null)}
                    placeholder="10000"
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Weight */}
        <div>
          <button
            onClick={() => toggleSection('weight')}
            className="flex items-center justify-between w-full text-left font-medium text-neutral-900 mb-3"
          >
            Weight
            {expandedSections.weight ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.weight && (
            <div className="space-y-2">
              <select
                value={filters.weight}
                onChange={(e) => onChange('weight', e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
              >
                {weightOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Certifications */}
        <div>
          <button
            onClick={() => toggleSection('certification')}
            className="flex items-center justify-between w-full text-left font-medium text-neutral-900 mb-3"
          >
            Certifications
            {expandedSections.certification ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.certification && (
            <div className="space-y-2">
              {certifications.map(cert => (
                <label key={cert.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.certification.includes(cert.value)}
                    onChange={(e) => handleCertificationChange(cert.value, e.target.checked)}
                    className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-sm text-neutral-700">{cert.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Features */}
        <div>
          <button
            onClick={() => toggleSection('features')}
            className="flex items-center justify-between w-full text-left font-medium text-neutral-900 mb-3"
          >
            Features
            {expandedSections.features ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.features && (
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => onChange('inStock', e.target.checked)}
                  className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="ml-2 text-sm text-neutral-700">In Stock Only</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.organic}
                  onChange={(e) => onChange('organic', e.target.checked)}
                  className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="ml-2 text-sm text-neutral-700">Organic Only</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.giftPack}
                  onChange={(e) => onChange('giftPack', e.target.checked)}
                  className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="ml-2 text-sm text-neutral-700">Gift Packs Only</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

