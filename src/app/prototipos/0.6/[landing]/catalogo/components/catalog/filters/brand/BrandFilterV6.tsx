'use client';

import React, { useState } from 'react';
import { BrandFilterProps } from '../../../../types/catalog';
import { Check } from 'lucide-react';

/**
 * BrandFilterV6 - Chips Seleccionables
 * Chips con logo + nombre, toggle on/off
 * Compacto y visual, ideal para filtros horizontales
 */
export const BrandFilterV6: React.FC<BrandFilterProps> = ({
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
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        const hasError = imageErrors[option.value];

        return (
          <button
            key={option.value}
            onClick={() => handleToggle(option.value)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all cursor-pointer ${
              isSelected
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                : 'border-neutral-200 bg-white text-neutral-700 hover:border-[rgba(var(--color-primary-rgb),0.5)]'
            }`}
          >
            {isSelected && (
              <Check className="w-3 h-3 flex-shrink-0" />
            )}

            <div className="w-5 h-4 flex items-center justify-center flex-shrink-0">
              {option.logo && !hasError ? (
                <img
                  src={option.logo}
                  alt={option.label}
                  className={`max-w-full max-h-full object-contain ${
                    isSelected ? 'brightness-0 invert' : ''
                  }`}
                  loading="lazy"
                  onError={() => handleImageError(option.value)}
                />
              ) : null}
            </div>

            <span className="text-sm font-medium whitespace-nowrap">
              {option.label}
            </span>

            {showCounts && (
              <span
                className={`text-xs ${
                  isSelected ? 'text-white/70' : 'text-neutral-400'
                }`}
              >
                ({option.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
