'use client';

/**
 * FilterChips - Chips de filtros aplicados
 *
 * Muestra los filtros activos como chips removibles
 * Con boton para limpiar todos los filtros
 */

import React from 'react';
import { Chip, Button } from '@nextui-org/react';
import { X, Trash2 } from 'lucide-react';
import { AppliedFilter } from '../../../types/catalog';

interface FilterChipsProps {
  appliedFilters: AppliedFilter[];
  onRemoveFilter: (filterId: string) => void;
  onClearAll: () => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  appliedFilters,
  onRemoveFilter,
  onClearAll,
}) => {
  if (appliedFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 py-3 px-4 bg-neutral-50 rounded-lg">
      <span className="text-sm text-neutral-600 font-medium">Filtros:</span>

      {appliedFilters.map((filter) => (
        <Chip
          key={filter.id}
          variant="flat"
          onClose={() => onRemoveFilter(filter.id)}
          classNames={{
            base: 'bg-white border border-neutral-200 h-7',
            content: 'text-sm text-neutral-700',
            closeButton: 'text-neutral-400 hover:text-neutral-600 cursor-pointer',
          }}
        >
          <span className="text-xs text-neutral-500 mr-1">{filter.category}:</span>
          {filter.label}
        </Chip>
      ))}

      <Button
        size="sm"
        variant="light"
        className="text-neutral-500 hover:text-[#4654CD] min-w-0 px-2 cursor-pointer"
        startContent={<Trash2 className="w-3 h-3" />}
        onPress={onClearAll}
      >
        Limpiar todo
      </Button>
    </div>
  );
};

export default FilterChips;
