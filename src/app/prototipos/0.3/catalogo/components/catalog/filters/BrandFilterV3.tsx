'use client';

/**
 * BrandFilterV3 - Grid de logos clickeables
 *
 * Version e-commerce con logos grandes seleccionables
 * Mejor reconocimiento visual, ideal para pocas marcas
 */

import React from 'react';
import { Image } from '@nextui-org/react';
import { Check } from 'lucide-react';
import { FilterOption } from '../../../types/catalog';

interface BrandFilterV3Props {
  options: FilterOption[];
  selected: string[];
  onChange: (brands: string[]) => void;
}

export const BrandFilterV3: React.FC<BrandFilterV3Props> = ({
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
    <div className="grid grid-cols-3 gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.value}
            onClick={() => handleToggle(option.value)}
            className={`relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
              isSelected
                ? 'border-[#4654CD] bg-[#4654CD]/5'
                : 'border-neutral-200 hover:border-[#4654CD]/50 bg-white'
            }`}
          >
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-[#4654CD] rounded-full flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
            )}

            {/* Logo */}
            {option.logo && (
              <div className="w-12 h-8 flex items-center justify-center mb-1">
                <Image
                  src={option.logo}
                  alt={option.label}
                  className="max-w-full max-h-full object-contain"
                  removeWrapper
                />
              </div>
            )}

            {/* Count */}
            <span className="text-xs text-neutral-400">({option.count})</span>
          </button>
        );
      })}
    </div>
  );
};

export default BrandFilterV3;
