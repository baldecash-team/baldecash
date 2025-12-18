'use client';

/**
 * EmptyState - Estado vacio del catalogo
 *
 * Aparece cuando los filtros no devuelven resultados
 * Incluye mensaje empatico, ilustracion y acciones sugeridas
 */

import React from 'react';
import { motion } from 'framer-motion';
import { SearchX, Sparkles } from 'lucide-react';
import { FilterReset } from './FilterReset';
import { SuggestionsPanel } from './SuggestionsPanel';
import { CatalogProduct, FilterState, defaultFilterState } from '../../../types/catalog';

interface EmptyStateProps {
  filters: FilterState;
  onClearFilters: () => void;
  onExpandPriceRange: () => void;
  onRemoveLastFilter: () => void;
  suggestedProducts?: CatalogProduct[];
  onProductClick?: (productId: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  filters,
  onClearFilters,
  onExpandPriceRange,
  onRemoveLastFilter,
  suggestedProducts = [],
  onProductClick,
}) => {
  // Count active filters
  const activeFilterCount = countActiveFilters(filters);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-12 px-4"
    >
      {/* Ilustracion */}
      <div className="relative mb-6">
        <div className="w-32 h-32 rounded-full bg-neutral-100 flex items-center justify-center">
          <SearchX className="w-16 h-16 text-neutral-300" />
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-[#4654CD]/10 flex items-center justify-center"
        >
          <Sparkles className="w-5 h-5 text-[#4654CD]" />
        </motion.div>
      </div>

      {/* Mensaje */}
      <h3 className="text-xl font-bold text-neutral-800 mb-2 text-center">
        No encontramos laptops con estos filtros
      </h3>
      <p className="text-neutral-600 mb-6 max-w-md text-center">
        {activeFilterCount > 0
          ? `Tienes ${activeFilterCount} filtro${activeFilterCount > 1 ? 's' : ''} activo${activeFilterCount > 1 ? 's' : ''}. Prueba ajustandolos para ver mas opciones.`
          : 'Prueba con diferentes criterios o explora otras opciones que podrian interesarte.'}
      </p>

      {/* Acciones de filtros */}
      <FilterReset
        hasActiveFilters={activeFilterCount > 0}
        onClearFilters={onClearFilters}
        onExpandPriceRange={onExpandPriceRange}
        onRemoveLastFilter={onRemoveLastFilter}
      />

      {/* Productos sugeridos */}
      {suggestedProducts.length > 0 && (
        <SuggestionsPanel
          products={suggestedProducts}
          onProductClick={onProductClick}
        />
      )}
    </motion.div>
  );
};

// Helper function to count active filters
function countActiveFilters(filters: FilterState): number {
  let count = 0;

  if (filters.brands.length > 0) count++;
  if (filters.usage.length > 0) count++;
  if (filters.ram.length > 0) count++;
  if (filters.storage.length > 0) count++;
  if (filters.gama.length > 0) count++;
  if (filters.condition.length > 0) count++;
  if (filters.availableNow) count++;
  if (
    filters.priceRange[0] !== defaultFilterState.priceRange[0] ||
    filters.priceRange[1] !== defaultFilterState.priceRange[1]
  )
    count++;
  if (
    filters.quotaRange[0] !== defaultFilterState.quotaRange[0] ||
    filters.quotaRange[1] !== defaultFilterState.quotaRange[1]
  )
    count++;

  return count;
}

export default EmptyState;
