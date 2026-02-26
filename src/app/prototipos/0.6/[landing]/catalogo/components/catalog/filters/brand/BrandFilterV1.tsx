'use client';

import React from 'react';
import { Checkbox } from '@nextui-org/react';
import { BrandFilterProps } from '../../../../types/catalog';

/**
 * BrandFilterV1 - Solo Texto
 * Checkboxes con nombre de marca + conteo "(12)"
 * Estilo clasico de e-commerce
 */
export const BrandFilterV1: React.FC<BrandFilterProps> = ({
  options,
  selected,
  onChange,
  showCounts = true,
}) => {
  const handleToggle = (brand: string) => {
    if (selected.includes(brand)) {
      onChange(selected.filter((b) => b !== brand));
    } else {
      onChange([...selected, brand]);
    }
  };

  return (
    <div className="space-y-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);

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
                wrapper: 'before:border-2 before:border-neutral-300 after:bg-[var(--color-primary)] group-data-[selected=true]:after:bg-[var(--color-primary)] before:transition-colors after:transition-all',
                icon: 'text-white transition-opacity',
              }}
            />
            <span
              className={`text-sm flex-1 transition-colors ${
                isSelected ? 'text-[var(--color-primary)] font-medium' : 'text-neutral-700'
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
