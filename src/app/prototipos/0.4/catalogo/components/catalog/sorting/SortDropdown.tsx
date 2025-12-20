'use client';

import React from 'react';
import { Select, SelectItem } from '@nextui-org/react';
import { ArrowUpDown } from 'lucide-react';
import { SortOption } from '../../../types/catalog';
import { sortOptions } from '../../../data/mockCatalogData';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  totalProducts: number;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  value,
  onChange,
  totalProducts,
}) => {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-neutral-600">
        <span className="font-semibold text-neutral-800">{totalProducts}</span> equipos
      </span>

      <Select
        aria-label="Ordenar por"
        size="sm"
        selectedKeys={new Set([value])}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0];
          if (selectedKey) {
            onChange(selectedKey as SortOption);
          }
        }}
        startContent={<ArrowUpDown className="w-4 h-4 text-neutral-400" />}
        renderValue={(items) => {
          return items.map((item) => (
            <span key={item.key} className="text-sm text-neutral-700">
              {item.textValue}
            </span>
          ));
        }}
        classNames={{
          base: 'min-w-[200px]',
          trigger: 'h-10 min-h-10 bg-white border border-neutral-200 hover:border-[#4654CD]/50 transition-colors cursor-pointer',
          value: 'text-sm text-neutral-700',
          popoverContent: 'bg-white border border-neutral-200 shadow-lg rounded-lg p-0',
          listbox: 'p-1 bg-white',
          listboxWrapper: 'max-h-[300px] bg-white',
          innerWrapper: 'pr-8',
          selectorIcon: 'right-3 pointer-events-none',
        }}
        popoverProps={{
          classNames: {
            base: 'bg-white',
            content: 'p-0 bg-white border border-neutral-200 shadow-lg rounded-lg',
          },
        }}
      >
        {sortOptions.map((opt) => (
          <SelectItem
            key={opt.value}
            textValue={opt.label}
            classNames={{
              base: `px-3 py-2 rounded-md text-sm cursor-pointer transition-colors
                text-neutral-700
                data-[selected=false]:data-[hover=true]:bg-[#4654CD]/10
                data-[selected=false]:data-[hover=true]:text-[#4654CD]
                data-[selected=true]:bg-[#4654CD]
                data-[selected=true]:text-white`,
            }}
          >
            {opt.label}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
};
