'use client';

/**
 * EmptyStateV2 - Ilustración con personaje y fondo decorativo
 *
 * Diseño más visual con ilustración de persona buscando
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { RefreshCw, SlidersHorizontal, Search, User, HelpCircle } from 'lucide-react';
import { EmptyStateConfig } from '../../types/estados';

interface EmptyStateV2Props {
  config: EmptyStateConfig;
  activeFilters: number;
  filterDescription?: string;
  onClearFilters?: () => void;
  onExpandPriceRange?: () => void;
}

export const EmptyStateV2: React.FC<EmptyStateV2Props> = ({
  config,
  activeFilters,
  filterDescription,
  onClearFilters,
  onExpandPriceRange,
}) => {
  const animationProps = config.animationLevel !== 'none' ? {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4 },
  } : {};

  return (
    <motion.div
      {...animationProps}
      className="flex flex-col items-center justify-center py-12 px-4"
    >
      {/* Ilustración con personaje */}
      <div className="relative mb-8">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 -m-8">
          <div className="w-full h-full bg-gradient-to-br from-[#4654CD]/5 to-transparent rounded-full" />
        </div>

        {/* Escena */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Persona buscando */}
          <motion.div
            initial={config.animationLevel === 'full' ? { x: -20, opacity: 0 } : {}}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute left-4 bottom-8"
          >
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
              <User className="w-8 h-8 text-amber-600" />
            </div>
          </motion.div>

          {/* Lupa grande */}
          <motion.div
            initial={config.animationLevel === 'full' ? { scale: 0 } : {}}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="absolute right-4 top-8"
          >
            <div className="w-20 h-20 rounded-full bg-neutral-100 border-4 border-neutral-200 flex items-center justify-center">
              <Search className="w-10 h-10 text-neutral-300" />
            </div>
            <div className="absolute -bottom-4 -right-2 w-4 h-12 bg-neutral-200 rounded-full transform rotate-45" />
          </motion.div>

          {/* Signo de interrogación */}
          <motion.div
            initial={config.animationLevel === 'full' ? { y: -10, opacity: 0 } : {}}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute top-0 left-1/2 -translate-x-1/2"
          >
            <HelpCircle className="w-8 h-8 text-[#4654CD]/40" />
          </motion.div>
        </div>
      </div>

      {/* Mensaje */}
      <div className="text-center max-w-md mb-6">
        <h3 className="text-2xl font-bold text-neutral-800 mb-3">
          ¡Hmm, no encontramos coincidencias!
        </h3>
        <p className="text-neutral-600">
          {activeFilters > 0
            ? 'Parece que tus filtros son muy específicos. ¿Qué tal si los ajustamos un poco?'
            : 'No hay productos que coincidan con tu búsqueda en este momento.'}
        </p>
        {filterDescription && (
          <p className="text-sm text-neutral-400 mt-2 bg-neutral-50 px-3 py-2 rounded-lg inline-block">
            {filterDescription}
          </p>
        )}
      </div>

      {/* Acciones con estilo diferente */}
      {config.showFilterActions && (
        <div className="flex flex-col sm:flex-row gap-3">
          {activeFilters > 0 && (
            <Button
              size="lg"
              className="bg-[#4654CD] text-white cursor-pointer"
              startContent={<RefreshCw className="w-4 h-4" />}
              onPress={onClearFilters}
            >
              Empezar de nuevo
            </Button>
          )}
          <Button
            size="lg"
            variant="bordered"
            className="border-neutral-300 cursor-pointer"
            startContent={<SlidersHorizontal className="w-4 h-4" />}
            onPress={onExpandPriceRange}
          >
            Ver más opciones
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default EmptyStateV2;
