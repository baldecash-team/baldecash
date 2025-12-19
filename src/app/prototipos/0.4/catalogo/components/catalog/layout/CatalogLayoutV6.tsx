'use client';

/**
 * CatalogLayoutV6 - Centrado con Filtros Sticky
 *
 * Grid centrado con barra de filtros sticky superior
 * Scroll suave con filtros siempre visibles
 */

import React, { useState } from 'react';
import { Button, Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
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
import { SortDropdown } from '../sorting/SortDropdown';
import { brandOptions, usageOptions } from '../../../data/mockCatalogData';
import {
  CatalogConfig,
  FilterState,
  SortOption,
  AppliedFilter,
  defaultFilterState,
} from '../../../types/catalog';

interface CatalogLayoutV6Props {
  config: CatalogConfig;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  productCount: number;
  children: React.ReactNode;
}

export const CatalogLayoutV6: React.FC<CatalogLayoutV6Props> = ({
  config,
  filters,
  onFiltersChange,
  sortOption,
  onSortChange,
  productCount,
  children,
}) => {
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
      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Desktop Filter Popovers */}
            <div className="hidden lg:flex items-center gap-2">
              <Popover placement="bottom-start">
                <PopoverTrigger>
                  <Button
                    variant="flat"
                    endContent={<ChevronDown className="w-4 h-4" />}
                    className="bg-neutral-100 cursor-pointer"
                  >
                    Cuota
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4">
                  <QuotaRangeFilter
                    min={40}
                    max={400}
                    value={filters.quotaRange}
                    frequency={filters.quotaFrequency}
                    onChange={(range) => onFiltersChange({ ...filters, quotaRange: range })}
                    onFrequencyChange={(freq) => onFiltersChange({ ...filters, quotaFrequency: freq })}
                  />
                </PopoverContent>
              </Popover>

              <Popover placement="bottom-start">
                <PopoverTrigger>
                  <Button
                    variant="flat"
                    endContent={<ChevronDown className="w-4 h-4" />}
                    className="bg-neutral-100 cursor-pointer"
                  >
                    Marca
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4">
                  <BrandFilter
                    options={brandOptions}
                    selected={filters.brands}
                    onChange={(brands) => onFiltersChange({ ...filters, brands })}
                  />
                </PopoverContent>
              </Popover>

              <Popover placement="bottom-start">
                <PopoverTrigger>
                  <Button
                    variant="flat"
                    endContent={<ChevronDown className="w-4 h-4" />}
                    className="bg-neutral-100 cursor-pointer"
                  >
                    Uso
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4">
                  <UsageFilter
                    options={usageOptions}
                    selected={filters.usage}
                    onChange={(usage) => onFiltersChange({ ...filters, usage })}
                  />
                </PopoverContent>
              </Popover>

              <Button
                variant="flat"
                startContent={<SlidersHorizontal className="w-4 h-4" />}
                className="bg-neutral-100 cursor-pointer"
                onPress={() => setDrawerOpen(true)}
              >
                Mas filtros
              </Button>
            </div>

            {/* Mobile */}
            <div className="lg:hidden flex-1">
              <Button
                className="w-full bg-neutral-100 cursor-pointer"
                startContent={<SlidersHorizontal className="w-4 h-4" />}
                onPress={() => setDrawerOpen(true)}
              >
                Filtros
              </Button>
            </div>

            {/* Sort */}
            <div className="flex-shrink-0">
              <SortDropdown value={sortOption} onChange={onSortChange} productCount={productCount} />
            </div>
          </div>

          {/* Filter Chips */}
          {appliedFilters.length > 0 && (
            <div className="mt-3 pt-3 border-t border-neutral-200">
              <FilterChips
                appliedFilters={appliedFilters}
                onRemoveFilter={handleRemoveFilter}
                onClearAll={handleClearAll}
              />
            </div>
          )}
        </div>
      </div>

      {/* Centered Grid */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

export default CatalogLayoutV6;
