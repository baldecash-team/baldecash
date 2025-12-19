'use client';

/**
 * CatalogLayoutV7 - Asimetrico con Filtros Flotantes
 *
 * Grid asimetrico con panel de filtros flotante minimizable
 * Diseno editorial, menos estructurado
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { SlidersHorizontal, Minimize2, Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterSection } from '../filters/FilterSection';
import { FilterChips } from '../filters/FilterChips';
import { FilterDrawer } from '../filters/FilterDrawer';
import {
  BrandFilterV1,
  BrandFilterV2,
  BrandFilterV3,
  BrandFilterV4,
  BrandFilterV5,
  BrandFilterV6,
  BrandFilterV7,
  BrandFilterV8,
  BrandFilterV9,
  BrandFilterV10,
} from '../filters/brand';
import { QuotaRangeFilter } from '../filters/QuotaRangeFilter';
import { UsageFilter } from '../filters/UsageFilter';
import { SortDropdown } from '../sorting/SortDropdown';
import { brandOptions, usageOptions } from '../../../data/mockCatalogData';
import {
  CatalogConfig,
  FilterState,
  SortOption,
  AppliedFilter,
  defaultFilterState,
} from '../../../types/catalog';

interface CatalogLayoutV7Props {
  config: CatalogConfig;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  productCount: number;
  children: React.ReactNode;
}

export const CatalogLayoutV7: React.FC<CatalogLayoutV7Props> = ({
  config,
  filters,
  onFiltersChange,
  sortOption,
  onSortChange,
  productCount,
  children,
}) => {
  const [showFilters, setShowFilters] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const BrandFilter = {
    1: BrandFilterV1,
    2: BrandFilterV2,
    3: BrandFilterV3,
    4: BrandFilterV4,
    5: BrandFilterV5,
    6: BrandFilterV6,
    7: BrandFilterV7,
    8: BrandFilterV8,
    9: BrandFilterV9,
    10: BrandFilterV10,
  }[config.brandFilterVersion];

  const appliedFilters: AppliedFilter[] = [];
  if (filters.brands.length > 0) {
    filters.brands.forEach((brand) => {
      const option = brandOptions.find((o) => o.value === brand);
      if (option) {
        appliedFilters.push({
          id: `brand-${brand}`,
          category: 'Marca',
          label: option.label,
          value: brand,
        });
      }
    });
  }

  const handleRemoveFilter = (filterId: string) => {
    if (filterId.startsWith('brand-')) {
      const brand = filterId.replace('brand-', '');
      onFiltersChange({ ...filters, brands: filters.brands.filter((b) => b !== brand) });
    }
  };

  const handleClearAll = () => onFiltersChange(defaultFilterState);

  const FilterContent = (
    <>
      <FilterSection title="Cuota mensual">
        <QuotaRangeFilter
          min={40}
          max={400}
          value={filters.quotaRange}
          frequency={filters.quotaFrequency}
          onChange={(range) => onFiltersChange({ ...filters, quotaRange: range })}
          onFrequencyChange={(freq) => onFiltersChange({ ...filters, quotaFrequency: freq })}
        />
      </FilterSection>

      <FilterSection title="Uso recomendado">
        <UsageFilter
          options={usageOptions}
          selected={filters.usage}
          onChange={(usage) => onFiltersChange({ ...filters, usage })}
        />
      </FilterSection>

      <FilterSection title="Marca">
        <BrandFilter
          options={brandOptions}
          selected={filters.brands}
          onChange={(brands) => onFiltersChange({ ...filters, brands })}
        />
      </FilterSection>
    </>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-6 relative">
        {/* Floating Filter Panel (Desktop) */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 20 }}
              className="hidden lg:block fixed right-8 top-24 z-50"
            >
              <div className={`bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden transition-all ${minimized ? 'w-14' : 'w-72'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-3 bg-neutral-50 border-b border-neutral-200">
                  {!minimized && (
                    <span className="text-sm font-semibold text-neutral-700">Filtros</span>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setMinimized(!minimized)}
                      className="p-1.5 hover:bg-neutral-200 rounded cursor-pointer"
                    >
                      {minimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-1.5 hover:bg-neutral-200 rounded cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                {!minimized && (
                  <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {FilterContent}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header with Sort */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-neutral-800 font-['Baloo_2']">
            Catalogo de Laptops
          </h1>
          <div className="flex items-center gap-3">
            {!showFilters && (
              <Button
                className="hidden lg:flex bg-[#4654CD] text-white cursor-pointer"
                startContent={<SlidersHorizontal className="w-4 h-4" />}
                onPress={() => setShowFilters(true)}
              >
                Filtros
              </Button>
            )}
            <SortDropdown value={sortOption} onChange={onSortChange} productCount={productCount} />
          </div>
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <Button
            className="w-full bg-white border border-neutral-200 text-neutral-700 cursor-pointer"
            startContent={<SlidersHorizontal className="w-4 h-4" />}
            onPress={() => setDrawerOpen(true)}
          >
            Filtros
          </Button>
        </div>

        {/* Filter Chips */}
        {appliedFilters.length > 0 && (
          <div className="mb-4">
            <FilterChips
              appliedFilters={appliedFilters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearAll}
            />
          </div>
        )}

        {/* Asymmetric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {children}
        </div>
      </div>

      <FilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        appliedCount={appliedFilters.length}
        onClearAll={handleClearAll}
      >
        {FilterContent}
      </FilterDrawer>
    </div>
  );
};

export default CatalogLayoutV7;
