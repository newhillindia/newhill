'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface USPCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features?: string[];
  image?: string;
  variant?: 'default' | 'featured' | 'minimal';
  className?: string;
}

export default function USPCard({
  icon: Icon,
  title,
  description,
  features = [],
  image,
  variant = 'default',
  className = ''
}: USPCardProps) {
  const baseClasses = "card-hover p-6 text-center group";
  
  const variantClasses = {
    default: "bg-white",
    featured: "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200",
    minimal: "bg-transparent border-0 shadow-none hover:shadow-none"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {/* Image (if provided) */}
      {image && (
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-neutral-100">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Icon */}
      <div className="mb-4">
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
          variant === 'featured' 
            ? 'bg-emerald-600 text-white' 
            : 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300'
        }`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>

      {/* Title */}
      <h3 className="font-heading text-xl font-semibold text-neutral-900 mb-3">
        {title}
      </h3>

      {/* Description */}
      <p className="text-neutral-600 mb-4 leading-relaxed">
        {description}
      </p>

      {/* Features List */}
      {features.length > 0 && (
        <ul className="space-y-2 text-sm text-neutral-500">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center justify-center space-x-2">
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Hover Effect Indicator */}
      {variant !== 'minimal' && (
        <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-8 h-0.5 bg-emerald-600 mx-auto rounded-full" />
        </div>
      )}
    </div>
  );
}

