'use client';

/**
 * BrandFilterV5 - Dropdown con Logos
 *
 * Select con logos en las opciones
 * Compacto y familiar para usuarios
 */

import React, { useState } from 'react';
import { Select, SelectItem } from '@nextui-org/react';
import { Check } from 'lucide-react';
import { FilterOption } from '../../../../types/catalog';

interface BrandFilterV5Props {
  options: FilterOption[];
  selected: string[];
  onChange: (brands: string[]) => void;
}

const BrandLogo: React.FC<{ logo?: string; label: string }> = ({ logo, label }) => {
  const [hasError, setHasError] = useState(false);

  if (!logo || hasError) {
    return (
      <span className="text-xs font-medium text-neutral-600">
        {label}
      </span>
    );
  }

  return (
    <img
      src={logo}
      alt={label}
      className="w-6 h-4 object-contain"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
};

export const BrandFilterV5: React.FC<BrandFilterV5Props> = ({
  options,
  selected,
  onChange,
}) => {
  const handleSelectionChange = (keys: Set<string> | 'all') => {
    if (keys === 'all') {
      onChange(options.map(o => o.value));
    } else {
      onChange(Array.from(keys));
    }
  };

  return (
    <div className="space-y-2">
      <Select
        aria-label="Seleccionar marcas"
        placeholder="Seleccionar marcas..."
        selectionMode="multiple"
        selectedKeys={new Set(selected)}
        onSelectionChange={(keys) => handleSelectionChange(keys as Set<string>)}
        classNames={{
          base: 'w-full',
          trigger: 'min-h-12 bg-white border-2 border-neutral-200 hover:border-[#4654CD]/50 transition-colors cursor-pointer',
          value: 'text-sm text-neutral-700',
          popoverContent: 'bg-white border border-neutral-200 shadow-lg rounded-lg p-1',
          listbox: 'p-0 bg-white',
          listboxWrapper: 'max-h-[250px] bg-white',
          innerWrapper: 'pr-8',
          selectorIcon: 'right-3',
        }}
        popoverProps={{
          classNames: {
            base: 'bg-white',
            content: 'p-0 bg-white border border-neutral-200 shadow-lg rounded-lg',
          },
        }}
        renderValue={(items) => {
          if (items.length === 0) return null;
          return (
            <div className="flex flex-wrap gap-1">
              {items.map((item) => (
                <span
                  key={item.key}
                  className="bg-[#4654CD]/10 text-[#4654CD] text-xs px-2 py-0.5 rounded"
                >
                  {item.textValue}
                </span>
              ))}
            </div>
          );
        }}
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            textValue={option.label}
            classNames={{
              base: `px-3 py-2 rounded-md text-sm cursor-pointer transition-colors
                data-[selected=false]:data-[hover=true]:bg-[#4654CD]/10
                data-[selected=true]:bg-[#4654CD]/10`,
            }}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="w-8 h-5 flex items-center justify-center">
                  <BrandLogo logo={option.logo} label={option.label} />
                </div>
                <span className="text-neutral-700">{option.label}</span>
              </div>
              <span className="text-xs text-neutral-400">({option.count})</span>
            </div>
          </SelectItem>
        ))}
      </Select>

      {selected.length > 0 && (
        <p className="text-xs text-neutral-500">
          {selected.length} marca{selected.length > 1 ? 's' : ''} seleccionada{selected.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default BrandFilterV5;
