'use client';

/**
 * BrandFilterV1 - Grid de botones de marca
 *
 * Version con grid buttons uniforme con UsageFilter
 * Mejor para mostrar marcas de forma visual y consistente
 */

import React from 'react';
import { FilterOption } from '../../../../types/catalog';

interface BrandFilterV1Props {
  options: FilterOption[];
  selected: string[];
  onChange: (brands: string[]) => void;
}

export const BrandFilterV1: React.FC<BrandFilterV1Props> = ({
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
            className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
              isSelected
                ? 'border-[#4654CD] bg-[#4654CD] text-white'
                : 'border-neutral-200 bg-white hover:border-[#4654CD]/50 text-neutral-700'
            }`}
          >
            <span className="text-sm font-medium">{option.label}</span>
            <span
              className={`text-xs ${
                isSelected ? 'text-white/80' : 'text-neutral-400'
              }`}
            >
              ({option.count})
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default BrandFilterV1;
