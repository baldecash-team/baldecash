'use client';

/**
 * BrandFilterV8 - Stats por Marca
 *
 * Logo + barra de cantidad visual
 * Muestra distribucion de productos por marca
 */

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { FilterOption } from '../../../../types/catalog';

interface BrandFilterV8Props {
  options: FilterOption[];
  selected: string[];
  onChange: (brands: string[]) => void;
}

const BrandLogo: React.FC<{ logo?: string; label: string }> = ({ logo, label }) => {
  const [hasError, setHasError] = useState(false);

  if (!logo || hasError) {
    return (
      <span className="text-xs font-semibold text-neutral-600">{label}</span>
    );
  }

  return (
    <img
      src={logo}
      alt={label}
      className="w-10 h-6 object-contain"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
};

export const BrandFilterV8: React.FC<BrandFilterV8Props> = ({
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

  // Calculate max count for percentage bars
  const maxCount = Math.max(...options.map((o) => o.count));

  // Sort by count descending
  const sortedOptions = [...options].sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-2">
      {sortedOptions.map((option) => {
        const isSelected = selected.includes(option.value);
        const percentage = (option.count / maxCount) * 100;

        return (
          <button
            key={option.value}
            onClick={() => handleToggle(option.value)}
            className={`w-full p-3 rounded-lg border-2 transition-all cursor-pointer ${
              isSelected
                ? 'border-[#4654CD] bg-[#4654CD]/5'
                : 'border-neutral-200 bg-white hover:border-[#4654CD]/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {isSelected && (
                  <div className="w-5 h-5 bg-[#4654CD] rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="w-12 h-6 flex items-center">
                  <BrandLogo logo={option.logo} label={option.label} />
                </div>
              </div>
              <span className="text-sm font-medium text-neutral-700">
                {option.count} laptops
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isSelected ? 'bg-[#4654CD]' : 'bg-[#4654CD]/40'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default BrandFilterV8;
