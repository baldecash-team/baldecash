'use client';

import React from 'react';
import { Button } from '@nextui-org/react';
import { RefreshCw, SlidersHorizontal } from 'lucide-react';
import { EmptyActionsProps } from '../../../types/empty';

/**
 * EmptyActionsV1 - Botones Simples
 * Limpiar filtros, Ampliar precio - estilo clásico
 * Referencia: Amazon, eBay - botones funcionales directos
 */
export const EmptyActionsV1: React.FC<EmptyActionsProps> = ({
  onClearFilters,
  onExpandPriceRange,
  totalProductsIfExpanded,
}) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <Button
        variant="bordered"
        className="border-[#4654CD] text-[#4654CD] cursor-pointer hover:bg-[#4654CD]/5 transition-colors"
        startContent={<RefreshCw className="w-4 h-4" />}
        onPress={onClearFilters}
      >
        Limpiar todos los filtros
      </Button>
      <Button
        variant="bordered"
        className="border-neutral-300 text-neutral-700 cursor-pointer hover:border-[#4654CD]/50 hover:bg-neutral-50 transition-colors"
        startContent={<SlidersHorizontal className="w-4 h-4" />}
        onPress={onExpandPriceRange}
      >
        Ampliar rango de precio
        {totalProductsIfExpanded && (
          <span className="ml-1 text-xs text-neutral-500">
            ({totalProductsIfExpanded} equipos)
          </span>
        )}
      </Button>
    </div>
  );
};
