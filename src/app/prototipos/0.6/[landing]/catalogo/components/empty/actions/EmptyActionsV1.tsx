'use client';

import React from 'react';
import { Button } from '@nextui-org/react';
import { RefreshCw } from 'lucide-react';
import { EmptyActionsProps } from '../../../types/empty';

/**
 * EmptyActionsV1 - Botones Simples
 * Limpiar filtros - estilo clásico
 * Referencia: Amazon, eBay - botones funcionales directos
 */
export const EmptyActionsV1: React.FC<EmptyActionsProps> = ({
  onClearFilters,
}) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <Button
        variant="bordered"
        className="border-[var(--color-primary)] text-[var(--color-primary)] cursor-pointer hover:bg-[rgba(var(--color-primary-rgb),0.05)] transition-colors"
        startContent={<RefreshCw className="w-4 h-4" />}
        onPress={onClearFilters}
      >
        Limpiar todos los filtros
      </Button>
    </div>
  );
};
