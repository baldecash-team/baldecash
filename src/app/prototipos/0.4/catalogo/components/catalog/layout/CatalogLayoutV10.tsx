'use client';

/**
 * CatalogLayoutV10 - Comparador Inline
 *
 * Grid con checkbox de comparacion integrado en cada card
 * Barra flotante inferior para comparar productos seleccionados
 */

import React, { useState } from 'react';
import { Button, Badge } from '@nextui-org/react';
import { SlidersHorizontal, GitCompare, X, ChevronRight } from 'lucide-react';
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
import { brandOptions, usageOptions, mockProducts } from '../../../data/mockCatalogData';
import {
  CatalogConfig,
  FilterState,
  SortOption,
  AppliedFilter,
  defaultFilterState,
} from '../../../types/catalog';

interface CatalogLayoutV10Props {
  config: CatalogConfig;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  productCount: number;
  children: React.ReactNode;
}

export const CatalogLayoutV10: React.FC<CatalogLayoutV10Props> = ({
  config,
  filters,
  onFiltersChange,
  sortOption,
  onSortChange,
  productCount,
  children,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [compareList, setCompareList] = useState<string[]>([]);

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

  const handleRemoveFromCompare = (productId: string) => {
    setCompareList((prev) => prev.filter((id) => id !== productId));
  };

  const handleClearCompare = () => setCompareList([]);

  const compareProducts = compareList
    .map((id) => mockProducts.find((p) => p.id === id))
    .filter(Boolean);

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
    <div className="min-h-screen bg-neutral-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-neutral-800 font-['Baloo_2']">
              Catalogo de Laptops
            </h1>
            {compareList.length > 0 && (
              <Badge content={compareList.length} color="primary">
                <Button
                  variant="flat"
                  startContent={<GitCompare className="w-4 h-4" />}
                  className="bg-[#4654CD]/10 text-[#4654CD] cursor-pointer"
                >
                  Comparar
                </Button>
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="bg-white rounded-lg border border-neutral-200 p-4 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-800 font-['Baloo_2'] flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-[#4654CD]" />
                  Filtros
                </h2>
              </div>
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

            {/* Compare instruction */}
            <div className="bg-[#4654CD]/5 border border-[#4654CD]/20 rounded-lg p-3 mb-4">
              <p className="text-sm text-[#4654CD] flex items-center gap-2">
                <GitCompare className="w-4 h-4" />
                Selecciona hasta 4 productos para comparar
              </p>
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

      {/* Compare Bar */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-2xl z-50"
          >
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center gap-4">
                {/* Selected products */}
                <div className="flex-1 flex items-center gap-3 overflow-x-auto">
                  {compareProducts.map((product) => (
                    <div
                      key={product!.id}
                      className="flex items-center gap-2 bg-neutral-100 rounded-lg p-2 pr-3 flex-shrink-0"
                    >
                      <img
                        src={product!.thumbnail}
                        alt={product!.displayName}
                        className="w-10 h-10 object-contain rounded"
                      />
                      <span className="text-sm font-medium text-neutral-700 max-w-[100px] truncate">
                        {product!.displayName}
                      </span>
                      <button
                        onClick={() => handleRemoveFromCompare(product!.id)}
                        className="p-1 hover:bg-neutral-200 rounded cursor-pointer"
                      >
                        <X className="w-3 h-3 text-neutral-500" />
                      </button>
                    </div>
                  ))}

                  {/* Empty slots */}
                  {Array.from({ length: 4 - compareList.length }).map((_, idx) => (
                    <div
                      key={`empty-${idx}`}
                      className="w-[120px] h-14 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center flex-shrink-0"
                    >
                      <span className="text-xs text-neutral-400">Agregar</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="light"
                    size="sm"
                    onPress={handleClearCompare}
                    className="text-neutral-500 cursor-pointer"
                  >
                    Limpiar
                  </Button>
                  <Button
                    color="primary"
                    size="lg"
                    endContent={<ChevronRight className="w-4 h-4" />}
                    isDisabled={compareList.length < 2}
                    className="bg-[#4654CD] cursor-pointer"
                  >
                    Comparar ({compareList.length})
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

export default CatalogLayoutV10;
