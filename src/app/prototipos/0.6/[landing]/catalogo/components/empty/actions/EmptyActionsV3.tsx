'use client';

import React from 'react';
import { Chip } from '@nextui-org/react';
import { RefreshCw, Layers } from 'lucide-react';
import { EmptyActionsProps } from '../../../types/empty';

/**
 * EmptyActionsV3 - Chips Ilustrados
 * Chips de sugerencias con iconos flat
 * Referencia: Notion, Linear - chips con iconos
 */
export const EmptyActionsV3: React.FC<EmptyActionsProps> = ({
  appliedFilters,
  onClearFilters,
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
          className="bg-[rgba(var(--color-primary-rgb),0.1)] text-[var(--color-primary)] px-4 py-2 h-auto cursor-pointer hover:bg-[rgba(var(--color-primary-rgb),0.2)] transition-colors"
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
          onClick={onClearFilters}
          startContent={<Layers className="w-4 h-4" />}
          className="bg-[var(--surface-2,#f3f4f6)] text-[var(--text,#374151)] px-4 py-2 h-auto cursor-pointer hover:bg-[var(--surface-2,#e5e7eb)] transition-colors"
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
          <p className="text-xs text-[var(--text-muted,#6b7280)]">Filtros aplicados:</p>
          <div className="flex flex-wrap gap-1.5 justify-center max-w-md">
            {appliedFilters.slice(0, 5).map((filter) => (
              <Chip
                key={filter.key}
                onClose={() => onRemoveFilter(filter.key)}
                variant="flat"
                size="sm"
                className="bg-[var(--surface-2,#f3f4f6)] text-[var(--text-muted,#4b5563)] cursor-pointer"
                classNames={{
                  closeButton: 'text-[var(--text-faint,#9ca3af)] hover:text-[var(--text-muted,#4b5563)]',
                }}
              >
                {filter.label}
              </Chip>
            ))}
            {appliedFilters.length > 5 && (
              <Chip size="sm" variant="flat" className="bg-[var(--surface-bg,#fafafa)] text-[var(--text-muted,#6b7280)]">
                +{appliedFilters.length - 5} más
              </Chip>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
