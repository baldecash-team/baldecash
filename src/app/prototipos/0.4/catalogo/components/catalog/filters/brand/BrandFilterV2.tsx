'use client';

import React, { useState } from 'react';
import { Checkbox } from '@nextui-org/react';
import { BrandFilterProps } from '../../../../types/catalog';

/**
 * BrandFilterV2 - Logo + Texto
 * Logo pequeno 24px + nombre + checkbox
 * Balance visual entre reconocimiento y compacidad
 */
export const BrandFilterV2: React.FC<BrandFilterProps> = ({
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
    <div className="space-y-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        const hasError = imageErrors[option.value];

        return (
          <label
            key={option.value}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors group"
          >
            <Checkbox
              isSelected={isSelected}
              onValueChange={() => handleToggle(option.value)}
              classNames={{
                base: 'cursor-pointer',
                wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD] group-data-[selected=true]:after:bg-[#4654CD] before:transition-colors after:transition-all',
                icon: 'text-white transition-opacity',
              }}
            />

            <div className="w-8 h-6 flex items-center justify-center flex-shrink-0">
              {option.logo && !hasError ? (
                <img
                  src={option.logo}
                  alt={option.label}
                  className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all"
                  loading="lazy"
                  onError={() => handleImageError(option.value)}
                />
              ) : (
                <span className="text-xs font-bold text-neutral-500">
                  {option.label.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <span
              className={`text-sm flex-1 transition-colors ${
                isSelected ? 'text-[#4654CD] font-medium' : 'text-neutral-700'
              }`}
            >
              {option.label}
            </span>
            {showCounts && (
              <span className="text-xs text-neutral-400">({option.count})</span>
            )}
          </label>
        );
      })}
    </div>
  );
};
