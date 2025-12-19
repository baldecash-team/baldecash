'use client';

/**
 * CatalogLayoutV3 - Mobile-First Drawer
 *
 * Layout minimalista con boton flotante para filtros
 * Drawer de filtros tanto en desktop como movil
 * Grid: 3 columnas desktop, 2 tablet, 1 movil
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
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

interface CatalogLayoutV3Props {
  config: CatalogConfig;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  productCount: number;
  children: React.ReactNode;
}

export const CatalogLayoutV3: React.FC<CatalogLayoutV3Props> = ({
  config,
  filters,
  onFiltersChange,
  sortOption,
  onSortChange,
  productCount,
  children,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Get brand filter component based on version (10 versions)
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

  // Filter content for drawer
  const FilterContent = (
    <>
      {/* Quota Range - Primary filter */}
      <FilterSection title="Cuota mensual">
        <QuotaRangeFilter
          min={40}
          max={400}
          value={filters.quotaRange}
          frequency={filters.quotaFrequency}
          onChange={(range) => onFiltersChange({ ...filters, quotaRange: range })}
          onFrequencyChange={(freq) =>
            onFiltersChange({ ...filters, quotaFrequency: freq })
          }
        />
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Precio total">
        <PriceRangeFilter
          min={1000}
          max={5000}
          value={filters.priceRange}
          onChange={(range) => onFiltersChange({ ...filters, priceRange: range })}
        />
      </FilterSection>

      {/* Usage Filter */}
      <FilterSection title="Uso recomendado">
        <UsageFilter
          options={usageOptions}
          selected={filters.usage}
          onChange={(usage) => onFiltersChange({ ...filters, usage })}
        />
      </FilterSection>

      {/* Brand Filter */}
      <FilterSection title="Marca">
        <BrandFilter
          options={brandOptions}
          selected={filters.brands}
          onChange={(brands) => onFiltersChange({ ...filters, brands })}
        />
      </FilterSection>

      {/* Technical Filters */}
      <TechnicalFilters filters={filters} onChange={handlePartialFilterChange} />

      {/* Commercial Filters */}
      <CommercialFilters filters={filters} onChange={handlePartialFilterChange} />
    </>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
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

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {children}
        </div>
      </div>

      {/* Floating Filter Button */}
      <motion.div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          size="lg"
          className="bg-[#4654CD] text-white shadow-lg px-6 cursor-pointer"
          startContent={<SlidersHorizontal className="w-5 h-5" />}
          onPress={() => setDrawerOpen(true)}
        >
          Filtros
          {appliedFilters.length > 0 && (
            <span className="ml-2 bg-white text-[#4654CD] text-xs font-bold px-2 py-0.5 rounded-full">
              {appliedFilters.length}
            </span>
          )}
        </Button>
      </motion.div>

      {/* Filter Drawer */}
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

export default CatalogLayoutV3;
