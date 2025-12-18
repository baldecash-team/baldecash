'use client';

/**
 * BrandFilterV2 - Logo pequeno + texto con checkbox
 *
 * Version con logos de marca para mejor reconocimiento visual
 * Balance entre informacion y espacio
 */

import React from 'react';
import { Checkbox, Image } from '@nextui-org/react';
import { FilterOption } from '../../../types/catalog';

interface BrandFilterV2Props {
  options: FilterOption[];
  selected: string[];
  onChange: (brands: string[]) => void;
}

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
    <div className="space-y-2">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <Checkbox
              isSelected={selected.includes(option.value)}
              onValueChange={() => handleToggle(option.value)}
              classNames={{
                base: 'cursor-pointer',
                wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD] group-data-[selected=true]:after:bg-[#4654CD] before:transition-colors after:transition-all',
                icon: 'text-white transition-opacity',
              }}
            />
            {option.logo && (
              <div className="w-16 h-6 flex items-center justify-center bg-white rounded">
                <Image
                  src={option.logo}
                  alt={option.label}
                  className="max-w-full max-h-full object-contain"
                  removeWrapper
                />
              </div>
            )}
            <span className="text-sm text-neutral-700">{option.label}</span>
          </div>
          <span className="text-xs text-neutral-400">({option.count})</span>
        </label>
      ))}
    </div>
  );
};

export default BrandFilterV2;
