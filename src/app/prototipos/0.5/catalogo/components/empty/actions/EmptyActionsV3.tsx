'use client';

import React from 'react';
import { Chip } from '@nextui-org/react';
import { RefreshCw, TrendingUp, Layers, X } from 'lucide-react';
import { EmptyActionsProps } from '../../../types/empty';

/**
 * EmptyActionsV3 - Chips Ilustrados
 * Chips de sugerencias con iconos flat
 * Referencia: Notion, Linear - chips con iconos
 */
export const EmptyActionsV3: React.FC<EmptyActionsProps> = ({
  appliedFilters,
  onClearFilters,
  onExpandPriceRange,
  onRemoveFilter,
}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Sugerencias principales */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Chip
          as="button"
          onClick={onClearFilters}
          startContent={<RefreshCw className="w-4 h-4" />}
          className="bg-[#4654CD]/10 text-[#4654CD] px-4 py-2 h-auto cursor-pointer hover:bg-[#4654CD]/20 transition-colors"
          radius="lg"
          classNames={{
            base: 'cursor-pointer',
            content: 'font-medium',
          }}
        >
          Reiniciar búsqueda
        </Chip>

        <Chip
          as="button"
          onClick={onExpandPriceRange}
          startContent={<TrendingUp className="w-4 h-4" />}
          className="bg-[#03DBD0]/10 text-[#03DBD0] px-4 py-2 h-auto cursor-pointer hover:bg-[#03DBD0]/20 transition-colors"
          radius="lg"
          classNames={{
            base: 'cursor-pointer',
            content: 'font-medium',
          }}
        >
          Ampliar precio
        </Chip>

        <Chip
          as="button"
          onClick={onClearFilters}
          startContent={<Layers className="w-4 h-4" />}
          className="bg-neutral-100 text-neutral-700 px-4 py-2 h-auto cursor-pointer hover:bg-neutral-200 transition-colors"
          radius="lg"
          classNames={{
            base: 'cursor-pointer',
            content: 'font-medium',
          }}
        >
          Ver todo el catálogo
        </Chip>
      </div>

      {/* Filtros aplicados (removibles) */}
      {appliedFilters.length > 0 && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-neutral-500">Filtros aplicados:</p>
          <div className="flex flex-wrap gap-1.5 justify-center max-w-md">
            {appliedFilters.slice(0, 5).map((filter) => (
              <Chip
                key={filter.key}
                onClose={() => onRemoveFilter(filter.key)}
                variant="flat"
                size="sm"
                className="bg-neutral-100 text-neutral-600 cursor-pointer"
                classNames={{
                  closeButton: 'text-neutral-400 hover:text-neutral-600',
                }}
              >
                {filter.label}
              </Chip>
            ))}
            {appliedFilters.length > 5 && (
              <Chip size="sm" variant="flat" className="bg-neutral-50 text-neutral-500">
                +{appliedFilters.length - 5} más
              </Chip>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
