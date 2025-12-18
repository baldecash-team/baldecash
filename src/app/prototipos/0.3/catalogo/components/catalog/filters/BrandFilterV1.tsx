'use client';

/**
 * BrandFilterV1 - Solo texto con checkbox
 *
 * Version minimalista con checkboxes y conteo de productos
 * Mejor para listas largas de marcas
 */

import React from 'react';
import { Checkbox } from '@nextui-org/react';
import { FilterOption } from '../../../types/catalog';

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
    <div className="space-y-2">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2">
            <Checkbox
              isSelected={selected.includes(option.value)}
              onValueChange={() => handleToggle(option.value)}
              classNames={{
                base: 'cursor-pointer',
                wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD] group-data-[selected=true]:after:bg-[#4654CD] before:transition-colors after:transition-all',
                icon: 'text-white transition-opacity',
              }}
            />
            <span className="text-sm text-neutral-700">{option.label}</span>
          </div>
          <span className="text-xs text-neutral-400">({option.count})</span>
        </label>
      ))}
    </div>
  );
};

export default BrandFilterV1;
