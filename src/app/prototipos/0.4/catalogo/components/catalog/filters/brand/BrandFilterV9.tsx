'use client';

/**
 * BrandFilterV9 - Favoritos
 *
 * Logos ordenados por popularidad con indicador
 * Destaca las marcas mas buscadas
 */

import React, { useState } from 'react';
import { Star, TrendingUp, Check } from 'lucide-react';
import { FilterOption } from '../../../../types/catalog';

interface BrandFilterV9Props {
  options: FilterOption[];
  selected: string[];
  onChange: (brands: string[]) => void;
}

const BrandLogo: React.FC<{ logo?: string; label: string }> = ({ logo, label }) => {
  const [hasError, setHasError] = useState(false);

  if (!logo || hasError) {
    return (
      <span className="text-sm font-semibold text-neutral-600">{label}</span>
    );
  }

  return (
    <img
      src={logo}
      alt={label}
      className="w-12 h-8 object-contain"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
};

export const BrandFilterV9: React.FC<BrandFilterV9Props> = ({
  options,
  selected,
  onChange,
}) => {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  // Sort by count (popularity) descending
  const sortedOptions = [...options].sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-2">
      {/* Popular section header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-200">
        <TrendingUp className="w-4 h-4 text-[#4654CD]" />
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          Marcas populares
        </span>
      </div>

      {sortedOptions.map((option, index) => {
        const isSelected = selected.includes(option.value);
        const isTopThree = index < 3;

        return (
          <button
            key={option.value}
            onClick={() => handleToggle(option.value)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
              isSelected
                ? 'border-[#4654CD] bg-[#4654CD]/5'
                : 'border-neutral-200 bg-white hover:border-[#4654CD]/50'
            }`}
          >
            {/* Rank indicator */}
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              isTopThree
                ? 'bg-amber-100 text-amber-600'
                : 'bg-neutral-100 text-neutral-400'
            }`}>
              {isTopThree ? (
                <Star className="w-3 h-3 fill-current" />
              ) : (
                <span className="text-xs font-medium">{index + 1}</span>
              )}
            </div>

            {/* Logo */}
            <div className="w-14 h-8 flex items-center">
              <BrandLogo logo={option.logo} label={option.label} />
            </div>

            {/* Name and count */}
            <div className="flex-1 text-left">
              <p className={`text-sm font-medium ${isSelected ? 'text-[#4654CD]' : 'text-neutral-700'}`}>
                {option.label}
              </p>
              <p className="text-xs text-neutral-400">
                {option.count} productos
              </p>
            </div>

            {/* Selection indicator */}
            {isSelected && (
              <div className="w-5 h-5 bg-[#4654CD] rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default BrandFilterV9;
