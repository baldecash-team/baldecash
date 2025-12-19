'use client';

/**
 * CatalogLayoutV1 - Sidebar Clasico
 *
 * Layout con sidebar de 280px a la izquierda en desktop
 * En movil los filtros se muestran en drawer
 * Grid: 3 columnas desktop, 2 tablet, 1 movil
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { SlidersHorizontal } from 'lucide-react';
import { FilterSection } from '../filters/FilterSection';
import { FilterChips } from '../filters/FilterChips';
import { FilterDrawer } from '../filters/FilterDrawer';
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

interface CatalogLayoutV1Props {
  config: CatalogConfig;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  productCount: number;
  children: React.ReactNode;
}

export const CatalogLayoutV1: React.FC<CatalogLayoutV1Props> = ({
  config,
  filters,
  onFiltersChange,
  sortOption,
  onSortChange,
  productCount,
  children,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  // Sidebar content (shared between desktop and drawer)
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
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="bg-white rounded-lg border border-neutral-200 p-4 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto overscroll-contain">
              <h2 className="text-lg font-semibold text-neutral-800 font-['Baloo_2'] mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#4654CD]" />
                Filtros
              </h2>
              {FilterContent}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <Button
                className="w-full bg-white border border-neutral-200 text-neutral-700 cursor-pointer"
                startContent={<SlidersHorizontal className="w-4 h-4" />}
                onPress={() => setDrawerOpen(true)}
              >
                Filtros
                {appliedFilters.length > 0 && (
                  <span className="ml-2 bg-[#4654CD] text-white text-xs px-2 py-0.5 rounded-full">
                    {appliedFilters.length}
                  </span>
                )}
              </Button>
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

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
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

export default CatalogLayoutV1;
