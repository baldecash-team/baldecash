'use client';

/**
 * BrandFilterV6 - Chips Seleccionables
 *
 * Chips con logo + nombre, toggle on/off
 * Estilo moderno y tactil
 */

import React, { useState } from 'react';
import { Chip } from '@nextui-org/react';
import { X } from 'lucide-react';
import { FilterOption } from '../../../../types/catalog';

interface BrandFilterV6Props {
  options: FilterOption[];
  selected: string[];
  onChange: (brands: string[]) => void;
}

const BrandLogo: React.FC<{ logo?: string; label: string; size?: 'sm' | 'md' }> = ({
  logo,
  label,
  size = 'md'
}) => {
  const [hasError, setHasError] = useState(false);
  const sizeClass = size === 'sm' ? 'w-4 h-3' : 'w-5 h-4';

  if (!logo || hasError) {
    return null;
  }

  return (
    <img
      src={logo}
      alt={label}
      className={`${sizeClass} object-contain`}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
};

export const BrandFilterV6: React.FC<BrandFilterV6Props> = ({
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
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <Chip
            key={option.value}
            onClick={() => handleToggle(option.value)}
            radius="md"
            classNames={{
              base: `cursor-pointer transition-all h-auto py-1.5 px-3 ${
                isSelected
                  ? 'bg-[#4654CD] border-[#4654CD]'
                  : 'bg-white border-2 border-neutral-200 hover:border-[#4654CD]/50'
              }`,
              content: `flex items-center gap-2 ${
                isSelected ? 'text-white' : 'text-neutral-700'
              }`,
            }}
            endContent={
              isSelected ? (
                <X className="w-3 h-3 text-white/80" />
              ) : (
                <span className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-neutral-400'}`}>
                  ({option.count})
                </span>
              )
            }
          >
            <div className="flex items-center gap-2">
              <BrandLogo logo={option.logo} label={option.label} size="sm" />
              <span className="text-sm font-medium">{option.label}</span>
            </div>
          </Chip>
        );
      })}
    </div>
  );
};

export default BrandFilterV6;
