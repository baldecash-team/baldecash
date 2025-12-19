'use client';

/**
 * CatalogLayoutV8 - Data-Driven Stats
 *
 * Header con estadisticas del catalogo
 * Filtros con contadores de productos por opcion
 */

import React, { useState } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { SlidersHorizontal, Package, TrendingUp, Star, Laptop } from 'lucide-react';
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

interface CatalogLayoutV8Props {
  config: CatalogConfig;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  productCount: number;
  children: React.ReactNode;
}

export const CatalogLayoutV8: React.FC<CatalogLayoutV8Props> = ({
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

  // Stats data
  const stats = [
    { icon: Package, label: 'Productos', value: productCount, color: 'text-[#4654CD]' },
    { icon: Laptop, label: 'Marcas', value: brandOptions.length, color: 'text-[#03DBD0]' },
    { icon: TrendingUp, label: 'Desde', value: 'S/40/mes', color: 'text-green-500' },
    { icon: Star, label: 'Rating', value: '4.5+', color: 'text-amber-500' },
  ];

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
      {/* Stats Header */}
      <div className="bg-gradient-to-r from-[#4654CD] to-[#5a68e0] text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold font-['Baloo_2'] mb-6">
            Catalogo de Laptops
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <Card key={idx} className="bg-white/10 backdrop-blur-sm border-none">
                <CardBody className="flex flex-row items-center gap-3 p-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs">{stat.label}</p>
                    <p className="text-white font-bold text-lg">{stat.value}</p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar with counter badges */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="bg-white rounded-lg border border-neutral-200 p-4 sticky top-4">
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
              </Button>
            </div>

            {/* Sort and Chips */}
            <div className="bg-white rounded-lg border border-neutral-200 p-4 mb-4">
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

export default CatalogLayoutV8;
