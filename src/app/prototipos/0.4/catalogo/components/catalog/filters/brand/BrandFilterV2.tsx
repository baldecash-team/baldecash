'use client';

/**
 * BrandFilterV2 - Grid de botones con logo pequeno
 *
 * Version con logos de marca para mejor reconocimiento visual
 * Usa formato grid buttons uniforme con UsageFilter
 */

import React, { useState } from 'react';
import { FilterOption } from '../../../../types/catalog';

interface BrandFilterV2Props {
  options: FilterOption[];
  selected: string[];
  onChange: (brands: string[]) => void;
}

// Brand logo component with fallback
const BrandLogo: React.FC<{ logo?: string; label: string; isSelected: boolean }> = ({
  logo,
  label,
  isSelected,
}) => {
  const [hasError, setHasError] = useState(false);

  if (!logo || hasError) {
    return null;
  }

  return (
    <div
      className={`w-8 h-6 flex items-center justify-center rounded ${
        isSelected ? 'bg-white/20' : 'bg-neutral-100'
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo}
        alt={label}
        className="max-w-full max-h-full object-contain"
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export const BrandFilterV2: React.FC<BrandFilterV2Props> = ({
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

  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.value}
            onClick={() => handleToggle(option.value)}
            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${
              isSelected
                ? 'border-[#4654CD] bg-[#4654CD] text-white'
                : 'border-neutral-200 bg-white hover:border-[#4654CD]/50 text-neutral-700'
            }`}
          >
            <BrandLogo logo={option.logo} label={option.label} isSelected={isSelected} />
            <div className="flex-1 text-left">
              <span className="text-sm font-medium">{option.label}</span>
              <span
                className={`text-xs block ${
                  isSelected ? 'text-white/80' : 'text-neutral-400'
                }`}
              >
                ({option.count})
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default BrandFilterV2;
