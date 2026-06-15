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
    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
      <span className="text-xs sm:text-sm text-[var(--text-muted,#4b5563)] whitespace-nowrap flex-shrink-0">
        <span className="font-semibold text-[var(--text-strong,#1f2937)]">{totalProducts}</span> equipos
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
        startContent={<ArrowUpDown className="w-4 h-4 text-[var(--text-faint,#9ca3af)] flex-shrink-0" />}
        renderValue={(items) => {
          return items.map((item) => (
            <span key={item.key} className="text-sm text-[var(--text,#374151)] truncate">
              {item.textValue}
            </span>
          ));
        }}
        classNames={{
          base: 'min-w-[160px] sm:min-w-[200px]',
          trigger: 'h-10 min-h-10 bg-[var(--surface,#fff)] border border-[var(--border-soft,#e5e7eb)] hover:border-[rgba(var(--color-primary-rgb),0.5)] transition-colors cursor-pointer',
          value: 'text-sm text-[var(--text,#374151)]',
          popoverContent: 'bg-[var(--surface,#fff)] border border-[var(--border-soft,#e5e7eb)] shadow-lg rounded-lg p-0',
          listbox: 'p-1 bg-[var(--surface,#fff)]',
          listboxWrapper: 'max-h-[300px] bg-[var(--surface,#fff)]',
          innerWrapper: 'pr-8',
          selectorIcon: 'right-3 pointer-events-none',
        }}
        popoverProps={{
          classNames: {
            base: 'bg-[var(--surface,#fff)]',
            content: 'p-0 bg-[var(--surface,#fff)] border border-[var(--border-soft,#e5e7eb)] shadow-lg rounded-lg',
          },
        }}
      >
        {sortOptions.map((opt) => (
          <SelectItem
            key={opt.value}
            textValue={opt.label}
            classNames={{
              base: `px-3 py-2 rounded-md text-sm cursor-pointer transition-colors
                text-[var(--text,#374151)]
                data-[selected=false]:data-[hover=true]:bg-[rgba(var(--color-primary-rgb),0.1)]
                data-[selected=false]:data-[hover=true]:text-[var(--color-primary)]
                data-[selected=true]:bg-[var(--color-primary)]
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
