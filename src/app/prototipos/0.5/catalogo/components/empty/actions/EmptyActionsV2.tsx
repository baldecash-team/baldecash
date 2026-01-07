'use client';

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { RefreshCw, DollarSign, Laptop, ArrowRight } from 'lucide-react';
import { EmptyActionsProps } from '../../../types/empty';

/**
 * EmptyActionsV2 - Cards Preview
 * Cards con preview de qué cambia al expandir
 * Referencia: Apple, Samsung - cards con información detallada
 */
export const EmptyActionsV2: React.FC<EmptyActionsProps> = ({
  appliedFilters,
  onClearFilters,
  onExpandPriceRange,
  totalProductsIfExpanded,
}) => {
  const filterCount = appliedFilters.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
      {/* Card: Limpiar filtros */}
      <Card
        isPressable
        onPress={onClearFilters}
        className="border border-neutral-200 hover:border-[#4654CD]/50 hover:shadow-md transition-all cursor-pointer"
      >
        <CardBody className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-5 h-5 text-[#4654CD]" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-neutral-800 mb-1">
                Limpiar filtros
              </h4>
              <p className="text-sm text-neutral-600 mb-2">
                Quita los {filterCount} filtros activos para ver todo el catálogo
              </p>
              <div className="flex items-center gap-1 text-[#4654CD] text-sm font-medium">
                <span>Ver todos los equipos</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Card: Ampliar precio */}
      <Card
        isPressable
        onPress={onExpandPriceRange}
        className="border border-neutral-200 hover:border-[#4654CD]/50 hover:shadow-md transition-all cursor-pointer"
      >
        <CardBody className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#03DBD0]/10 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-[#03DBD0]" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-neutral-800 mb-1">
                Ampliar presupuesto
              </h4>
              <p className="text-sm text-neutral-600 mb-2">
                Incluye equipos de otros rangos de precio
              </p>
              {totalProductsIfExpanded && (
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-neutral-500">
                    {totalProductsIfExpanded} equipos disponibles
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
