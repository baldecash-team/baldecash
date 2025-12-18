'use client';

/**
 * EmptyStateV3 - Minimalista con enfoque en acciones
 *
 * Diseño limpio y compacto que prioriza las acciones
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Button, Card, CardBody } from '@nextui-org/react';
import { Search, X, ArrowRight, Lightbulb } from 'lucide-react';
import { EmptyStateConfig } from '../../types/estados';

interface EmptyStateV3Props {
  config: EmptyStateConfig;
  activeFilters: number;
  filterDescription?: string;
  onClearFilters?: () => void;
  onExpandPriceRange?: () => void;
  onViewPopular?: () => void;
}

export const EmptyStateV3: React.FC<EmptyStateV3Props> = ({
  config,
  activeFilters,
  filterDescription,
  onClearFilters,
  onExpandPriceRange,
  onViewPopular,
}) => {
  const animationProps = config.animationLevel !== 'none' ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2 },
  } : {};

  const suggestions = [
    {
      icon: <X className="w-4 h-4" />,
      label: 'Limpiar filtros',
      description: 'Eliminar todos los filtros aplicados',
      action: onClearFilters,
      primary: true,
    },
    {
      icon: <Search className="w-4 h-4" />,
      label: 'Ampliar búsqueda',
      description: 'Incluir más rangos de precio',
      action: onExpandPriceRange,
      primary: false,
    },
    {
      icon: <Lightbulb className="w-4 h-4" />,
      label: 'Ver populares',
      description: 'Los más vendidos este mes',
      action: onViewPopular,
      primary: false,
    },
  ];

  return (
    <motion.div
      {...animationProps}
      className="py-8 px-4 max-w-2xl mx-auto"
    >
      {/* Header compacto */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center">
          <Search className="w-6 h-6 text-neutral-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-800">
            Sin resultados
          </h3>
          <p className="text-sm text-neutral-500">
            {activeFilters > 0 ? `${activeFilters} filtros activos` : 'No hay coincidencias'}
          </p>
        </div>
      </div>

      {/* Filtros actuales */}
      {filterDescription && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
          <p className="text-sm text-amber-800">
            <span className="font-medium">Búsqueda actual:</span> {filterDescription}
          </p>
        </div>
      )}

      {/* Acciones como cards */}
      {config.showFilterActions && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-neutral-700 mb-3">
            Prueba una de estas opciones:
          </p>

          {suggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              initial={config.animationLevel === 'full' ? { opacity: 0, x: -10 } : {}}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                isPressable
                className={`border transition-all ${
                  suggestion.primary
                    ? 'border-[#4654CD] bg-[#4654CD]/5 hover:bg-[#4654CD]/10'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
                onPress={() => suggestion.action?.()}
              >
                <CardBody className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        suggestion.primary
                          ? 'bg-[#4654CD] text-white'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {suggestion.icon}
                      </div>
                      <div>
                        <p className={`font-medium ${
                          suggestion.primary ? 'text-[#4654CD]' : 'text-neutral-800'
                        }`}>
                          {suggestion.label}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {suggestion.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className={`w-4 h-4 ${
                      suggestion.primary ? 'text-[#4654CD]' : 'text-neutral-400'
                    }`} />
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyStateV3;
