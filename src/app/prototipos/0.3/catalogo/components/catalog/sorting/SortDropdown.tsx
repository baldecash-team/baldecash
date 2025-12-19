'use client';

/**
 * SortDropdown - Dropdown de ordenamiento
 *
 * Permite ordenar productos por diferentes criterios
 * Muestra el conteo total de productos
 */

import React from 'react';
import { Select, SelectItem } from '@nextui-org/react';
import { ArrowUpDown } from 'lucide-react';
import { SortOption, sortOptions } from '../../../types/catalog';

interface SortDropdownProps {
  value: SortOption;
  onChange: (sort: SortOption) => void;
  productCount: number;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  value,
  onChange,
  productCount,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <p className="text-sm text-neutral-600">
        <span className="font-semibold text-neutral-800">{productCount}</span> productos
        encontrados
      </p>

      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-600 whitespace-nowrap">Ordenar por</span>
        <Select
          aria-label="Ordenar por"
          selectedKeys={[value]}
          onChange={(e) => onChange(e.target.value as SortOption)}
          selectorIcon={<ArrowUpDown className="w-4 h-4 text-neutral-400" />}
          classNames={{
            base: 'min-w-[200px]',
            trigger: 'h-10 min-h-10 bg-white border border-neutral-200 hover:border-[#4654CD]/50 transition-colors cursor-pointer',
            value: 'text-sm text-neutral-700',
            popoverContent: 'bg-white border border-neutral-200 shadow-lg rounded-lg p-0',
            listbox: 'p-1 bg-white',
            listboxWrapper: 'max-h-[300px] bg-white',
          }}
          popoverProps={{
            classNames: {
              base: 'bg-white',
              content: 'p-0 bg-white border border-neutral-200 shadow-lg rounded-lg',
            },
          }}
        >
          {sortOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              classNames={{
                base: `px-3 py-2 rounded-md text-sm cursor-pointer transition-colors
                  text-neutral-700
                  data-[selected=false]:data-[hover=true]:bg-[#4654CD]/10
                  data-[selected=false]:data-[hover=true]:text-[#4654CD]
                  data-[selected=true]:bg-[#4654CD]
                  data-[selected=true]:text-white`,
              }}
            >
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default SortDropdown;
