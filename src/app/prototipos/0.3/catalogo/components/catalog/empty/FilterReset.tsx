'use client';

/**
 * FilterReset - Acciones para ajustar filtros
 *
 * Botones para limpiar, ampliar o ajustar filtros
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { RefreshCw, SlidersHorizontal, Undo2 } from 'lucide-react';

interface FilterResetProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onExpandPriceRange: () => void;
  onRemoveLastFilter: () => void;
}

export const FilterReset: React.FC<FilterResetProps> = ({
  hasActiveFilters,
  onClearFilters,
  onExpandPriceRange,
  onRemoveLastFilter,
}) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center mb-8">
      {hasActiveFilters && (
        <>
          <Button
            variant="bordered"
            className="border-[#4654CD] text-[#4654CD] cursor-pointer"
            startContent={<RefreshCw className="w-4 h-4" />}
            onPress={onClearFilters}
          >
            Limpiar todos los filtros
          </Button>
          <Button
            variant="bordered"
            className="border-neutral-300 text-neutral-700 cursor-pointer"
            startContent={<Undo2 className="w-4 h-4" />}
            onPress={onRemoveLastFilter}
          >
            Deshacer ultimo filtro
          </Button>
        </>
      )}
      <Button
        variant="bordered"
        className="border-neutral-300 text-neutral-700 cursor-pointer"
        startContent={<SlidersHorizontal className="w-4 h-4" />}
        onPress={onExpandPriceRange}
      >
        Ampliar rango de precio
      </Button>
    </div>
  );
};

export default FilterReset;
