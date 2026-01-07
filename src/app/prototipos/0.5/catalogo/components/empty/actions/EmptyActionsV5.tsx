'use client';

import React from 'react';
import { Button, Chip } from '@nextui-org/react';
import { ArrowRight, X, Check } from 'lucide-react';
import { EmptyActionsProps } from '../../../types/empty';

/**
 * EmptyActionsV5 - Panel Split
 * Filtros actuales vs. sugeridos lado a lado
 * Referencia: Webflow, Framer - comparación visual
 */
export const EmptyActionsV5: React.FC<EmptyActionsProps> = ({
  appliedFilters,
  onClearFilters,
  onExpandPriceRange,
  onRemoveFilter,
  totalProductsIfExpanded,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Panel: Filtros actuales */}
        <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
          <div className="flex items-center gap-2 mb-3">
            <X className="w-4 h-4 text-red-500" />
            <h4 className="font-semibold text-neutral-800">Filtros actuales</h4>
          </div>
          <p className="text-sm text-neutral-600 mb-3">
            {appliedFilters.length} filtros sin resultados
          </p>
          {appliedFilters.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {appliedFilters.slice(0, 4).map((filter) => (
                <Chip
                  key={filter.key}
                  size="sm"
                  variant="flat"
                  onClose={() => onRemoveFilter(filter.key)}
                  className="bg-neutral-200 text-neutral-700"
                  classNames={{
                    closeButton: 'text-neutral-500 hover:text-neutral-700 cursor-pointer',
                    base: 'cursor-default',
                  }}
                >
                  {filter.label}
                </Chip>
              ))}
              {appliedFilters.length > 4 && (
                <span className="text-xs text-neutral-500 self-center">
                  +{appliedFilters.length - 4} más
                </span>
              )}
            </div>
          )}
          <Button
            size="sm"
            variant="flat"
            className="w-full bg-neutral-200 text-neutral-700 cursor-pointer hover:bg-neutral-300 transition-colors"
            onPress={onClearFilters}
          >
            Quitar todos
          </Button>
        </div>

        {/* Panel: Sugerencia */}
        <div className="bg-[#4654CD]/5 rounded-xl p-4 border border-[#4654CD]/20">
          <div className="flex items-center gap-2 mb-3">
            <Check className="w-4 h-4 text-[#4654CD]" />
            <h4 className="font-semibold text-neutral-800">Sugerencia</h4>
          </div>
          <p className="text-sm text-neutral-600 mb-3">
            Ampliando el rango de precio
          </p>
          {totalProductsIfExpanded && (
            <div className="bg-white rounded-lg p-3 mb-4 border border-[#4654CD]/20">
              <p className="text-2xl font-bold text-[#4654CD]">
                {totalProductsIfExpanded}
              </p>
              <p className="text-xs text-neutral-500">equipos disponibles</p>
            </div>
          )}
          <Button
            size="sm"
            className="w-full bg-[#4654CD] text-white cursor-pointer hover:bg-[#3a47b3] transition-colors"
            endContent={<ArrowRight className="w-4 h-4" />}
            onPress={onExpandPriceRange}
          >
            Aplicar sugerencia
          </Button>
        </div>
      </div>
    </div>
  );
};
