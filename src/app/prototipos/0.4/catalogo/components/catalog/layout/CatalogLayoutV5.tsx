'use client';

/**
 * CatalogLayoutV5 - Split 50/50 con Preview
 *
 * Mitad filtros + preview del producto hover, mitad resultados
 * Hover en producto muestra preview en panel izquierdo
 */

import React, { useState } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { SlidersHorizontal, Monitor, Eye } from 'lucide-react';
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
import { PriceRangeFilter } from '../filters/PriceRangeFilter';
import { QuotaRangeFilter } from '../filters/QuotaRangeFilter';
import { UsageFilter } from '../filters/UsageFilter';
import { SortDropdown } from '../sorting/SortDropdown';
import { brandOptions, usageOptions, mockProducts } from '../../../data/mockCatalogData';
import {
  CatalogConfig,
  FilterState,
  SortOption,
  AppliedFilter,
  defaultFilterState,
  CatalogProduct,
} from '../../../types/catalog';

interface CatalogLayoutV5Props {
  config: CatalogConfig;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  productCount: number;
  children: React.ReactNode;
}

export const CatalogLayoutV5: React.FC<CatalogLayoutV5Props> = ({
  config,
  filters,
  onFiltersChange,
  sortOption,
  onSortChange,
  productCount,
  children,
}) => {
  const [previewProduct, setPreviewProduct] = useState<CatalogProduct | null>(mockProducts[0]);
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
      <div className="flex">
        {/* Left Panel - Filters + Preview (Desktop only) */}
        <aside className="hidden lg:block w-[45%] bg-white border-r border-neutral-200 min-h-screen sticky top-0 overflow-y-auto">
          <div className="p-6">
            {/* Filters Section */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-neutral-800 font-['Baloo_2'] mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#4654CD]" />
                Filtros
              </h2>
              {FilterContent}
            </div>

            {/* Preview Section */}
            <div className="border-t border-neutral-200 pt-6">
              <h3 className="text-sm font-medium text-neutral-500 mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Vista previa
              </h3>
              <AnimatePresence mode="wait">
                {previewProduct && (
                  <motion.div
                    key={previewProduct.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card className="border border-neutral-200">
                      <CardBody className="p-4">
                        <img
                          src={previewProduct.thumbnail}
                          alt={previewProduct.displayName}
                          className="w-full h-48 object-contain mb-4"
                        />
                        <h4 className="font-semibold text-neutral-800 mb-2">
                          {previewProduct.displayName}
                        </h4>
                        <p className="text-2xl font-bold text-[#4654CD]">
                          S/{previewProduct.lowestQuota}/mes
                        </p>
                        <p className="text-sm text-neutral-500">
                          Precio total: S/{previewProduct.price.toLocaleString()}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="text-xs bg-neutral-100 px-2 py-1 rounded">
                            {previewProduct.specs.ram}GB RAM
                          </span>
                          <span className="text-xs bg-neutral-100 px-2 py-1 rounded">
                            {previewProduct.specs.storage}GB SSD
                          </span>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </aside>

        {/* Right Panel - Products */}
        <main className="flex-1 p-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {children}
          </div>
        </main>
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

export default CatalogLayoutV5;
