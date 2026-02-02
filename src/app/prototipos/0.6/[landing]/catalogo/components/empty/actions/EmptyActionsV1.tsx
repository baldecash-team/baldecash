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
        className="border-[#4654CD] text-[#4654CD] cursor-pointer hover:bg-[#4654CD]/5 transition-colors"
        startContent={<RefreshCw className="w-4 h-4" />}
        onPress={onClearFilters}
      >
        Limpiar todos los filtros
      </Button>
    </div>
  );
};
