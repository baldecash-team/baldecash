'use client';

import React from 'react';
import { Chip } from '@nextui-org/react';
import { X, Trash2 } from 'lucide-react';
import { AppliedFilter } from '../../../types/catalog';

interface FilterChipsProps {
  filters: AppliedFilter[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onRemove,
  onClearAll,
}) => {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-3">
      <span className="text-sm text-neutral-500">Filtros:</span>

      {filters.map((filter) => (
        <Chip
          key={filter.id}
          size="sm"
          radius="sm"
          variant="flat"
          onClose={() => onRemove(filter.id)}
          classNames={{
            base: 'bg-[rgba(var(--color-primary-rgb),0.1)] px-2.5 py-1 h-auto cursor-pointer hover:bg-[rgba(var(--color-primary-rgb),0.2)] transition-colors',
            content: 'text-[var(--color-primary)] text-xs font-medium',
            closeButton: 'text-[var(--color-primary)] hover:text-[rgba(var(--color-primary-rgb),0.7)] ml-1',
          }}
          endContent={<X className="w-3 h-3" />}
        >
          <span className="text-neutral-500 mr-1">{filter.category}:</span>
          {filter.label}
        </Chip>
      ))}

      {filters.length > 1 && (
        <button
          onClick={onClearAll}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-red-500 transition-colors cursor-pointer ml-2"
        >
          <Trash2 className="w-3 h-3" />
          Limpiar todo
        </button>
      )}
    </div>
  );
};
