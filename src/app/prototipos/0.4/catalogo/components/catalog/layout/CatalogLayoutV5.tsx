'use client';

import React, { useState } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { Trash2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CatalogLayoutProps, CatalogProduct } from '../../../types/catalog';
import { FilterSection } from '../filters/FilterSection';
import { PriceRangeFilter } from '../filters/PriceRangeFilter';
import { QuotaRangeFilter } from '../filters/QuotaRangeFilter';
import { UsageFilter } from '../filters/UsageFilter';
import { CommercialFilters } from '../filters/CommercialFilters';
import { SortDropdown } from '../sorting/SortDropdown';
import {
  BrandFilterV1,
  BrandFilterV2,
  BrandFilterV3,
  BrandFilterV4,
  BrandFilterV5,
  BrandFilterV6,
} from '../filters/brand';
import {
  brandOptions,
  usageOptions,
  gamaOptions,
  conditionOptions,
  filterTooltips,
} from '../../../data/mockCatalogData';

/**
 * CatalogLayoutV5 - Split 50/50 con Preview
 * Mitad filtros/preview, mitad resultados
 * Referencia: Notion database views, Figma asset panels
 */
export const CatalogLayoutV5: React.FC<CatalogLayoutProps> = ({
  products,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  config,
  children,
}) => {
  const [previewProduct, setPreviewProduct] = useState<CatalogProduct | null>(
    products.length > 0 ? products[0] : null
  );

  const updateFilter = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleClearAll = () => {
    onFiltersChange({
      ...filters,
      brands: [],
      usage: [],
      gama: [],
      condition: [],
      priceRange: [1000, 8000],
      quotaRange: [40, 400],
    });
  };

  const appliedFiltersCount =
    filters.brands.length +
    filters.usage.length +
    filters.gama.length +
    filters.condition.length;

  const renderBrandFilter = () => {
    const props = {
      options: brandOptions,
      selected: filters.brands,
      onChange: (brands: string[]) => updateFilter('brands', brands),
      showCounts: config.showFilterCounts,
    };

    switch (config.brandFilterVersion) {
      case 2: return <BrandFilterV2 {...props} />;
      case 3: return <BrandFilterV3 {...props} />;
      case 4: return <BrandFilterV4 {...props} />;
      case 5: return <BrandFilterV5 {...props} />;
      case 6: return <BrandFilterV6 {...props} />;
      default: return <BrandFilterV1 {...props} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Left Panel - Filters + Preview */}
      <aside className="hidden lg:flex lg:flex-col w-[400px] bg-white border-r border-neutral-200">
        {/* Filters Section */}
        <div className="flex-1 p-4 overflow-y-auto border-b border-neutral-200 max-h-[50vh]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-200">
            <h2 className="font-semibold text-neutral-800">Filtros</h2>
            {appliedFiltersCount > 0 && (
              <Button
                size="sm"
                variant="light"
                startContent={<Trash2 className="w-4 h-4" />}
                onPress={handleClearAll}
                className="text-neutral-500 hover:text-red-500 cursor-pointer"
              >
                Limpiar
              </Button>
            )}
          </div>

          {/* Brand Filter */}
          <FilterSection title="Marca" defaultExpanded={true}>
            {renderBrandFilter()}
          </FilterSection>

          {/* Price Filters */}
          <FilterSection title="Precio" defaultExpanded={true}>
            <PriceRangeFilter
              value={filters.priceRange}
              onChange={(val) => updateFilter('priceRange', val)}
            />
          </FilterSection>

          <FilterSection title="Cuota" defaultExpanded={false}>
            <QuotaRangeFilter
              value={filters.quotaRange}
              onChange={(val) => updateFilter('quotaRange', val)}
              frequency={filters.quotaFrequency}
              onFrequencyChange={(freq) => updateFilter('quotaFrequency', freq)}
            />
          </FilterSection>

          {/* Usage Filter */}
          <FilterSection title="Uso" tooltip={filterTooltips.ram} defaultExpanded={false}>
            <UsageFilter
              options={usageOptions}
              selected={filters.usage}
              onChange={(usage) => updateFilter('usage', usage)}
              showCounts={config.showFilterCounts}
            />
          </FilterSection>

          {/* Commercial Filters */}
          <CommercialFilters
            gamaOptions={gamaOptions}
            selectedGama={filters.gama}
            onGamaChange={(gama) => updateFilter('gama', gama)}
            conditionOptions={conditionOptions}
            selectedCondition={filters.condition}
            onConditionChange={(condition) => updateFilter('condition', condition)}
            onlyAvailable={filters.stock.includes('available')}
            onAvailableChange={(val) => updateFilter('stock', val ? ['available'] : [])}
            showCounts={config.showFilterCounts}
          />
        </div>

        {/* Preview Section */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-neutral-500" />
            <h3 className="font-semibold text-neutral-700">Vista previa</h3>
          </div>

          <AnimatePresence mode="wait">
            {previewProduct ? (
              <motion.div
                key={previewProduct.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border border-neutral-200">
                  <CardBody className="p-4">
                    <img
                      src={previewProduct.thumbnail}
                      alt={previewProduct.displayName}
                      className="w-full h-48 object-contain mb-4"
                    />

                    <h4 className="font-semibold text-neutral-800 text-lg mb-2">
                      {previewProduct.displayName}
                    </h4>

                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-bold text-[#4654CD]">
                        S/{previewProduct.quotaMonthly}
                      </span>
                      <span className="text-sm text-neutral-500">/mes</span>
                    </div>

                    <div className="space-y-2 text-sm text-neutral-600">
                      <div className="flex justify-between">
                        <span>Procesador</span>
                        <span className="font-medium">{previewProduct.specs.processor.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>RAM</span>
                        <span className="font-medium">{previewProduct.specs.ram.size}GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Almacenamiento</span>
                        <span className="font-medium">{previewProduct.specs.storage.size}GB SSD</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pantalla</span>
                        <span className="font-medium">{previewProduct.specs.display.size}"</span>
                      </div>
                    </div>

                    <Button
                      className="w-full mt-4 bg-[#4654CD] text-white cursor-pointer"
                    >
                      Ver detalles
                    </Button>
                  </CardBody>
                </Card>
              </motion.div>
            ) : (
              <div className="text-center text-neutral-400 py-8">
                <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Pasa el cursor sobre un producto para ver la vista previa</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Right Panel - Products Grid */}
      <main className="flex-1 p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#4654CD] font-['Baloo_2']">
              Catálogo de Equipos
            </h1>
            <p className="text-sm text-neutral-500">
              {products.length} equipos disponibles
            </p>
          </div>

          <SortDropdown
            value={sort}
            onChange={onSortChange}
            totalProducts={products.length}
          />
        </div>

        {/* Products Grid with hover preview */}
        <div
          className={`grid gap-4 ${
            config.productsPerRow.desktop === 4
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'
          }`}
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<{ onMouseEnter?: () => void }>, {
                onMouseEnter: () => {
                  const product = products.find((p) => p.id === (child as React.ReactElement<{ product?: CatalogProduct }>).props.product?.id);
                  if (product) setPreviewProduct(product);
                },
              });
            }
            return child;
          })}
        </div>
      </main>
    </div>
  );
};
