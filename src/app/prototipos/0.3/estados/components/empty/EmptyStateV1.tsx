'use client';

/**
 * EmptyStateV1 - Estándar con icono y mensaje empático
 *
 * Diseño centrado con icono grande, mensaje claro y acciones
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { SearchX, RefreshCw, SlidersHorizontal, Sparkles } from 'lucide-react';
import { EmptyStateConfig } from '../../types/estados';

interface EmptyStateV1Props {
  config: EmptyStateConfig;
  activeFilters: number;
  filterDescription?: string;
  onClearFilters?: () => void;
  onExpandPriceRange?: () => void;
}

export const EmptyStateV1: React.FC<EmptyStateV1Props> = ({
  config,
  activeFilters,
  filterDescription,
  onClearFilters,
  onExpandPriceRange,
}) => {
  const animationProps = config.animationLevel !== 'none' ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  } : {};

  return (
    <motion.div
      {...animationProps}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Ilustración */}
      <div className="relative mb-6">
        <div className="w-32 h-32 rounded-full bg-neutral-100 flex items-center justify-center">
          <SearchX className="w-16 h-16 text-neutral-300" />
        </div>
        {config.animationLevel === 'full' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-[#4654CD]/10 flex items-center justify-center"
          >
            <Sparkles className="w-5 h-5 text-[#4654CD]" />
          </motion.div>
        )}
      </div>

      {/* Mensaje */}
      <h3 className="text-xl font-bold text-neutral-800 mb-2">
        No encontramos laptops con estos filtros
      </h3>
      <p className="text-neutral-600 mb-2 max-w-md">
        {activeFilters > 0
          ? `Tienes ${activeFilters} filtro${activeFilters > 1 ? 's' : ''} activo${activeFilters > 1 ? 's' : ''}. Prueba ajustándolos para ver más opciones.`
          : 'Prueba con diferentes criterios de búsqueda.'}
      </p>
      {filterDescription && (
        <p className="text-sm text-neutral-400 mb-6 max-w-md">
          Filtros: {filterDescription}
        </p>
      )}

      {/* Acciones */}
      {config.showFilterActions && (
        <div className="flex flex-wrap gap-3 justify-center">
          {activeFilters > 0 && (
            <Button
              variant="bordered"
              className="border-[#4654CD] text-[#4654CD] cursor-pointer"
              startContent={<RefreshCw className="w-4 h-4" />}
              onPress={onClearFilters}
            >
              Limpiar todos los filtros
            </Button>
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
      )}
    </motion.div>
  );
};

export default EmptyStateV1;
