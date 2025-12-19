'use client';

/**
 * CatalogLayoutV4 - Split View Abstracto
 *
 * Vista dividida con filtros flotantes sobre fondo con shapes geometricos
 * Panel de filtros como card flotante con sombra
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterSection } from '../filters/FilterSection';
import { FilterChips } from '../filters/FilterChips';
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
import { PriceRangeFilter } from '../filters/PriceRangeFilter';
import { QuotaRangeFilter } from '../filters/QuotaRangeFilter';
import { UsageFilter } from '../filters/UsageFilter';
import { TechnicalFilters } from '../filters/TechnicalFilters';
import { CommercialFilters } from '../filters/CommercialFilters';
import { SortDropdown } from '../sorting/SortDropdown';
import { brandOptions, usageOptions } from '../../../data/mockCatalogData';
import {
  CatalogConfig,
  FilterState,
  SortOption,
  AppliedFilter,
  defaultFilterState,
} from '../../../types/catalog';

interface CatalogLayoutV4Props {
  config: CatalogConfig;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  productCount: number;
  children: React.ReactNode;
}

export const CatalogLayoutV4: React.FC<CatalogLayoutV4Props> = ({
  config,
  filters,
  onFiltersChange,
  sortOption,
  onSortChange,
  productCount,
  children,
}) => {
  const [showFilters, setShowFilters] = useState(true);

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
  if (filters.usage.length > 0) {
    filters.usage.forEach((usage) => {
      const option = usageOptions.find((o) => o.value === usage);
      if (option) {
        appliedFilters.push({
          id: `usage-${usage}`,
          category: 'Uso',
          label: option.label,
          value: usage,
        });
      }
    });
  }

  const handleRemoveFilter = (filterId: string) => {
    if (filterId.startsWith('brand-')) {
      const brand = filterId.replace('brand-', '');
      onFiltersChange({ ...filters, brands: filters.brands.filter((b) => b !== brand) });
    } else if (filterId.startsWith('usage-')) {
      const usage = filterId.replace('usage-', '');
      onFiltersChange({ ...filters, usage: filters.usage.filter((u) => u !== usage) as any });
    }
  };

  const handleClearAll = () => onFiltersChange(defaultFilterState);
  const handlePartialChange = (partial: Partial<FilterState>) => onFiltersChange({ ...filters, ...partial });

  return (
    <div className="min-h-screen bg-neutral-50 relative overflow-hidden">
      {/* Abstract shapes background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#4654CD]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-[#03DBD0]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-[#4654CD]/3 rounded-full blur-2xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Floating Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="hidden lg:block w-[300px] flex-shrink-0"
              >
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-neutral-200/50 p-5 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-neutral-800 font-['Baloo_2'] flex items-center gap-2">
                      <SlidersHorizontal className="w-5 h-5 text-[#4654CD]" />
                      Filtros
                    </h2>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-1.5 hover:bg-neutral-100 rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4 text-neutral-400" />
                    </button>
                  </div>

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

                  <FilterSection title="Precio total">
                    <PriceRangeFilter
                      min={1000}
                      max={5000}
                      value={filters.priceRange}
                      onChange={(range) => onFiltersChange({ ...filters, priceRange: range })}
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

                  <TechnicalFilters filters={filters} onChange={handlePartialChange} />
                  <CommercialFilters filters={filters} onChange={handlePartialChange} />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Toggle filters button when hidden */}
            {!showFilters && (
              <div className="hidden lg:block mb-4">
                <Button
                  className="bg-white shadow-md cursor-pointer"
                  startContent={<SlidersHorizontal className="w-4 h-4" />}
                  onPress={() => setShowFilters(true)}
                >
                  Mostrar filtros
                </Button>
              </div>
            )}

            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <Button
                className="w-full bg-white border border-neutral-200 text-neutral-700 cursor-pointer"
                startContent={<SlidersHorizontal className="w-4 h-4" />}
                onPress={() => setShowFilters(true)}
              >
                Filtros
              </Button>
            </div>

            {/* Sort and Filter Chips */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-neutral-200/50 p-4 mb-4">
              <SortDropdown value={sortOption} onChange={onSortChange} productCount={productCount} />
              {appliedFilters.length > 0 && (
                <div className="mt-4">
                  <FilterChips
                    appliedFilters={appliedFilters}
                    onRemoveFilter={handleRemoveFilter}
                    onClearAll={handleClearAll}
                  />
                </div>
              )}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CatalogLayoutV4;
