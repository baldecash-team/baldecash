'use client';

/**
 * CatalogLayoutV2 - Filtros Horizontales
 *
 * Layout con filtros colapsables arriba del grid
 * Ocupa todo el ancho, ideal para mas productos visibles
 * Grid: 4 columnas desktop, 2 tablet, 1 movil
 */

import React, { useState } from 'react';
import { Button, Accordion, AccordionItem } from '@nextui-org/react';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterSection } from '../filters/FilterSection';
import { FilterChips } from '../filters/FilterChips';
import { BrandFilterV1 } from '../filters/BrandFilterV1';
import { BrandFilterV2 } from '../filters/BrandFilterV2';
import { BrandFilterV3 } from '../filters/BrandFilterV3';
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

interface CatalogLayoutV2Props {
  config: CatalogConfig;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  productCount: number;
  children: React.ReactNode;
}

export const CatalogLayoutV2: React.FC<CatalogLayoutV2Props> = ({
  config,
  filters,
  onFiltersChange,
  sortOption,
  onSortChange,
  productCount,
  children,
}) => {
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Get brand filter component based on version
  const BrandFilter = {
    1: BrandFilterV1,
    2: BrandFilterV2,
    3: BrandFilterV3,
  }[config.brandFilterVersion];

  // Calculate applied filters for chips
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
  if (filters.availableNow) {
    appliedFilters.push({
      id: 'available-now',
      category: 'Stock',
      label: 'Disponible ahora',
      value: true,
    });
  }

  const handleRemoveFilter = (filterId: string) => {
    if (filterId.startsWith('brand-')) {
      const brand = filterId.replace('brand-', '');
      onFiltersChange({
        ...filters,
        brands: filters.brands.filter((b) => b !== brand),
      });
    } else if (filterId.startsWith('usage-')) {
      const usage = filterId.replace('usage-', '');
      onFiltersChange({
        ...filters,
        usage: filters.usage.filter((u) => u !== usage) as any,
      });
    } else if (filterId === 'available-now') {
      onFiltersChange({ ...filters, availableNow: false });
    }
  };

  const handleClearAll = () => {
    onFiltersChange(defaultFilterState);
  };

  const handlePartialFilterChange = (partial: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...partial });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Horizontal Filters */}
        <div className="bg-white rounded-lg border border-neutral-200 mb-4 overflow-hidden">
          {/* Toggle Header */}
          <button
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="w-5 h-5 text-[#4654CD]" />
              <span className="font-semibold text-neutral-800 font-['Baloo_2']">
                Filtros
              </span>
              {appliedFilters.length > 0 && (
                <span className="bg-[#4654CD] text-white text-xs px-2 py-0.5 rounded-full">
                  {appliedFilters.length} activos
                </span>
              )}
            </div>
            <ChevronDown
              className={`w-5 h-5 text-neutral-500 transition-transform ${
                filtersExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Expandable Content */}
          <AnimatePresence>
            {filtersExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 border-t border-neutral-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Column 1: Price & Quota */}
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                        Precio y Cuota
                      </h4>
                      <div className="space-y-4">
                        <QuotaRangeFilter
                          min={40}
                          max={400}
                          value={filters.quotaRange}
                          frequency={filters.quotaFrequency}
                          onChange={(range) =>
                            onFiltersChange({ ...filters, quotaRange: range })
                          }
                          onFrequencyChange={(freq) =>
                            onFiltersChange({ ...filters, quotaFrequency: freq })
                          }
                        />
                        <PriceRangeFilter
                          min={1000}
                          max={5000}
                          value={filters.priceRange}
                          onChange={(range) =>
                            onFiltersChange({ ...filters, priceRange: range })
                          }
                        />
                      </div>
                    </div>

                    {/* Column 2: Usage */}
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                        Uso Recomendado
                      </h4>
                      <UsageFilter
                        options={usageOptions}
                        selected={filters.usage}
                        onChange={(usage) => onFiltersChange({ ...filters, usage })}
                      />
                    </div>

                    {/* Column 3: Brand */}
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                        Marca
                      </h4>
                      <BrandFilter
                        options={brandOptions}
                        selected={filters.brands}
                        onChange={(brands) => onFiltersChange({ ...filters, brands })}
                      />
                    </div>

                    {/* Column 4: Quick Filters */}
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                        Filtros Rapidos
                      </h4>
                      <CommercialFilters
                        filters={filters}
                        onChange={handlePartialFilterChange}
                      />
                    </div>
                  </div>

                  {/* Expandable Technical Filters */}
                  <Accordion className="mt-4">
                    <AccordionItem
                      key="technical"
                      aria-label="Filtros tecnicos"
                      title="Filtros tecnicos avanzados"
                      classNames={{
                        title: 'text-sm text-neutral-600',
                        trigger: 'py-2',
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <TechnicalFilters
                          filters={filters}
                          onChange={handlePartialFilterChange}
                        />
                      </div>
                    </AccordionItem>
                  </Accordion>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sort and Filter Chips */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4 mb-4">
          <SortDropdown
            value={sortOption}
            onChange={onSortChange}
            productCount={productCount}
          />
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

        {/* Product Grid - 4 columns on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CatalogLayoutV2;
