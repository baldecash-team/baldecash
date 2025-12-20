'use client';

import React, { useState } from 'react';
import { BrandFilterProps } from '../../../../types/catalog';
import { Check } from 'lucide-react';

/**
 * BrandFilterV3 - Grid de Logos
 * Grid 3x2 de logos clickeables sin texto
 * Maximo impacto visual, minimo espacio
 */
export const BrandFilterV3: React.FC<BrandFilterProps> = ({
  options,
  selected,
  onChange,
  showCounts = true,
}) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleToggle = (brand: string) => {
    if (selected.includes(brand)) {
      onChange(selected.filter((b) => b !== brand));
    } else {
      onChange([...selected, brand]);
    }
  };

  const handleImageError = (brand: string) => {
    setImageErrors((prev) => ({ ...prev, [brand]: true }));
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        const hasError = imageErrors[option.value];

        return (
          <button
            key={option.value}
            onClick={() => handleToggle(option.value)}
            className={`relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
              isSelected
                ? 'border-[#4654CD] bg-[#4654CD]/5'
                : 'border-neutral-200 bg-white hover:border-[#4654CD]/50'
            }`}
          >
            {isSelected && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-[#4654CD] rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}

            <div className="w-12 h-8 flex items-center justify-center mb-1">
              {option.logo && !hasError ? (
                <img
                  src={option.logo}
                  alt={option.label}
                  className={`max-w-full max-h-full object-contain transition-all ${
                    isSelected ? '' : 'grayscale hover:grayscale-0'
                  }`}
                  loading="lazy"
                  onError={() => handleImageError(option.value)}
                />
              ) : (
                <span className="text-sm font-bold text-neutral-500 text-center leading-tight">
                  {option.label}
                </span>
              )}
            </div>

            {showCounts && (
              <span className="text-[10px] text-neutral-400">({option.count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
