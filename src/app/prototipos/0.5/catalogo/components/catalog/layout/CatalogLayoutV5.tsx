'use client';

import React, { useState } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { Trash2, Eye, ChevronDown, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CatalogLayoutProps, CatalogProduct } from '../../../types/catalog';
import { FilterSection } from '../filters/FilterSection';
import { QuotaRangeFilter } from '../filters/QuotaRangeFilter';
import { CommercialFilters } from '../filters/CommercialFilters';
import { TechnicalFiltersStyled } from '../filters/TechnicalFiltersStyled';
import { SortDropdown } from '../sorting/SortDropdown';
import {
  BrandFilterV1,
  BrandFilterV2,
  BrandFilterV3,
  BrandFilterV4,
  BrandFilterV5,
  BrandFilterV6,
} from '../filters/brand';
import { formatMoney } from '../../../../utils/formatMoney';
import {
  brandOptions,
  usageOptions,
  ramOptions,
  storageOptions,
  displaySizeOptions,
  gamaOptions,
  conditionOptions,
  resolutionOptions,
  displayTypeOptions,
  processorModelOptions,
  applyDynamicCounts,
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
  filterCounts,
  children,
}) => {
  const [previewProduct, setPreviewProduct] = useState<CatalogProduct | null>(
    products.length > 0 ? products[0] : null
  );
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Apply dynamic counts to options
  const dynamicBrandOptions = React.useMemo(() =>
    filterCounts ? applyDynamicCounts(brandOptions, filterCounts.brands) : brandOptions,
    [filterCounts]
  );
  const dynamicUsageOptions = React.useMemo(() =>
    filterCounts ? applyDynamicCounts(usageOptions, filterCounts.usage) : usageOptions,
    [filterCounts]
  );
  const dynamicGamaOptions = React.useMemo(() =>
    filterCounts ? applyDynamicCounts(gamaOptions, filterCounts.gama) : gamaOptions,
    [filterCounts]
  );
  const dynamicConditionOptions = React.useMemo(() =>
    filterCounts ? applyDynamicCounts(conditionOptions, filterCounts.condition) : conditionOptions,
    [filterCounts]
  );
  const dynamicRamOptions = React.useMemo(() =>
    filterCounts ? applyDynamicCounts(ramOptions, filterCounts.ram) : ramOptions,
    [filterCounts]
  );
  const dynamicStorageOptions = React.useMemo(() =>
    filterCounts ? applyDynamicCounts(storageOptions, filterCounts.storage) : storageOptions,
    [filterCounts]
  );
  const dynamicDisplaySizeOptions = React.useMemo(() =>
    filterCounts ? applyDynamicCounts(displaySizeOptions, filterCounts.displaySize) : displaySizeOptions,
    [filterCounts]
  );
  const dynamicResolutionOptions = React.useMemo(() =>
    filterCounts ? applyDynamicCounts(resolutionOptions, filterCounts.resolution) : resolutionOptions,
    [filterCounts]
  );
  const dynamicDisplayTypeOptions = React.useMemo(() =>
    filterCounts ? applyDynamicCounts(displayTypeOptions, filterCounts.displayType) : displayTypeOptions,
    [filterCounts]
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
      stock: [],
      ram: [],
      storage: [],
      storageType: [],
      processorBrand: [],
      processorModel: [],
      displaySize: [],
      resolution: [],
      displayType: [],
      refreshRate: [],
      gpuType: [],
      touchScreen: null,
      backlitKeyboard: null,
      numericKeypad: null,
      fingerprint: null,
      hasWindows: null,
      hasThunderbolt: null,
      hasEthernet: null,
      hasSDCard: null,
      hasHDMI: null,
      minUSBPorts: null,
      ramExpandable: null,
      quotaRange: [25, 400],
    });
  };

  const appliedFiltersCount =
    filters.brands.length +
    filters.usage.length +
    filters.gama.length +
    filters.condition.length +
    filters.ram.length +
    filters.storage.length +
    filters.processorModel.length +
    filters.displaySize.length +
    filters.resolution.length +
    filters.displayType.length +
    (filters.gpuType.includes('dedicated') ? 1 : 0) +
    (filters.touchScreen ? 1 : 0) +
    (filters.backlitKeyboard ? 1 : 0) +
    (filters.numericKeypad ? 1 : 0) +
    (filters.fingerprint ? 1 : 0) +
    (filters.hasWindows ? 1 : 0) +
    (filters.hasThunderbolt ? 1 : 0) +
    (filters.hasEthernet ? 1 : 0) +
    (filters.ramExpandable ? 1 : 0);

  const renderBrandFilter = () => {
    const props = {
      options: dynamicBrandOptions,
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
      {/* Left Panel - Filters + Preview (Sticky) */}
      <aside className="hidden lg:flex lg:flex-col w-[400px] bg-white border-r border-neutral-200 sticky top-0 h-screen overflow-y-auto">
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

          {/* Quota Filter */}
          <FilterSection title="Cuota mensual" defaultExpanded={true}>
            <QuotaRangeFilter
              value={filters.quotaRange}
              onChange={(val) => updateFilter('quotaRange', val)}
            />
          </FilterSection>

          {/* Commercial Filters - Solo Gama */}
          <CommercialFilters
            gamaOptions={dynamicGamaOptions}
            selectedGama={filters.gama}
            onGamaChange={(gama) => updateFilter('gama', gama)}
            showCounts={config.showFilterCounts}
          />

          {/* Main Filters (Uso recomendado, Condición) - styled based on version */}
          <TechnicalFiltersStyled
            version={config.technicalFiltersVersion}
            showFilters="main"
            usageOptions={dynamicUsageOptions}
            selectedUsage={filters.usage}
            onUsageChange={(usage) => updateFilter('usage', usage)}
            conditionOptions={dynamicConditionOptions}
            selectedCondition={filters.condition}
            onConditionChange={(condition) => updateFilter('condition', condition)}
            showCounts={config.showFilterCounts}
          />

          {/* Advanced Technical Filters */}
          <div className="border-t border-neutral-200 mt-4 pt-4">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center justify-between w-full py-2 text-sm font-medium text-neutral-700 hover:text-[#4654CD] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                <span>Filtros Avanzados</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
            </button>

            {showAdvancedFilters && (
              <div className="mt-2">
                <TechnicalFiltersStyled
                  version={config.technicalFiltersVersion}
                  showFilters="advanced"
                  ramOptions={dynamicRamOptions}
                  selectedRam={filters.ram}
                  onRamChange={(ram) => updateFilter('ram', ram)}
                  storageOptions={dynamicStorageOptions}
                  selectedStorage={filters.storage}
                  onStorageChange={(storage) => updateFilter('storage', storage)}
                  displaySizeOptions={dynamicDisplaySizeOptions}
                  selectedDisplaySize={filters.displaySize}
                  onDisplaySizeChange={(sizes) => updateFilter('displaySize', sizes)}
                  resolutionOptions={dynamicResolutionOptions}
                  selectedResolution={filters.resolution}
                  onResolutionChange={(res) => updateFilter('resolution', res)}
                  displayTypeOptions={dynamicDisplayTypeOptions}
                  selectedDisplayType={filters.displayType}
                  onDisplayTypeChange={(types) => updateFilter('displayType', types)}
                  processorOptions={processorModelOptions}
                  selectedProcessor={filters.processorModel}
                  onProcessorChange={(models) => updateFilter('processorModel', models)}
                  showCounts={config.showFilterCounts}
                />
              </div>
            )}
          </div>
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
                        S/{formatMoney(previewProduct.quotaMonthly)}
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
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              // Check if child is a Fragment - if so, process its children
              if (child.type === React.Fragment) {
                const fragmentProps = child.props as { children?: React.ReactNode };
                return React.Children.map(fragmentProps.children, (fragmentChild) => {
                  if (React.isValidElement(fragmentChild)) {
                    // Only add onMouseEnter if the element has a product prop (ProductCard)
                    const productId = (fragmentChild as React.ReactElement<{ product?: CatalogProduct }>).props.product?.id;
                    if (productId) {
                      return React.cloneElement(fragmentChild as React.ReactElement<{ onMouseEnter?: () => void }>, {
                        onMouseEnter: () => {
                          const product = products.find((p) => p.id === productId);
                          if (product) setPreviewProduct(product);
                        },
                      });
                    }
                  }
                  return fragmentChild;
                });
              }
              // For non-Fragment elements, only add onMouseEnter if it has a product prop
              const productId = (child as React.ReactElement<{ product?: CatalogProduct }>).props.product?.id;
              if (productId) {
                return React.cloneElement(child as React.ReactElement<{ onMouseEnter?: () => void }>, {
                  onMouseEnter: () => {
                    const product = products.find((p) => p.id === productId);
                    if (product) setPreviewProduct(product);
                  },
                });
              }
            }
            return child;
          })}
        </div>
      </main>
    </div>
  );
};
