'use client';

import React from 'react';
import { Button, Chip } from '@nextui-org/react';
import { X, ArrowRight } from 'lucide-react';
import { EmptyActionsProps } from '../../../types/empty';

/**
 * EmptyActionsV5 - Panel Split
 * Panel de filtros actuales con opción de limpiar
 * Referencia: Webflow, Framer - comparación visual
 */
export const EmptyActionsV5: React.FC<EmptyActionsProps> = ({
  appliedFilters,
  onClearFilters,
  onRemoveFilter,
}) => {
  return (
    <div className="w-full max-w-md mx-auto">
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
          className="w-full bg-[var(--color-primary)] text-white cursor-pointer hover:brightness-90 transition-colors"
          endContent={<ArrowRight className="w-4 h-4" />}
          onPress={onClearFilters}
        >
          Ver todos los equipos
        </Button>
      </div>
    </div>
  );
};
