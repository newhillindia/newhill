'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SortOption {
  value: string;
  label: string;
  direction: 'asc' | 'desc';
}

interface ProductSortProps {
  value: string;
  onChange: (value: string) => void;
  options: SortOption[];
}

export default function ProductSort({ value, onChange, options }: ProductSortProps) {
  const selectedOption = options.find(option => option.value === value) || options[0];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-neutral-600">Sort by:</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-white border border-neutral-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          {options.map((option) => (
            <option key={`${option.value}-${option.direction}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
      </div>
    </div>
  );
}

