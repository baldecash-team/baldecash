'use client';

import React, { useState } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { Trash2, ChevronDown, Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { CatalogLayoutProps } from '../../../types/catalog';
import { FilterSection } from '../filters/FilterSection';
import { QuotaRangeFilter } from '../filters/QuotaRangeFilter';
import { CommercialFilters } from '../filters/CommercialFilters';
import { TechnicalFiltersStyled } from '../filters/TechnicalFiltersStyled';
import { FilterChips } from '../filters/FilterChips';
import { SortDropdown } from '../sorting/SortDropdown';
import { QuickUsageCards } from '../QuickUsageCards';
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
 * CatalogLayoutV4 - Header con Quick Cards + Sidebar Flotante
 * Header con tarjetas de uso rápido y filtros en sidebar flotante
 * Referencia: Nubank, Revolut (secciones de productos)
 */
export const CatalogLayoutV4: React.FC<CatalogLayoutProps> = ({
  products,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  config,
  filterCounts,
  children,
}) => {
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

  const appliedFilters = React.useMemo(() => {
    const applied: { id: string; category: string; label: string; value: string | number | boolean }[] = [];

    filters.brands.forEach((brand) => {
      const opt = brandOptions.find((o) => o.value === brand);
      applied.push({ id: `brand-${brand}`, category: 'Marca', label: opt?.label || brand, value: brand });
    });

    filters.usage.forEach((usage) => {
      const opt = usageOptions.find((o) => o.value === usage);
      applied.push({ id: `usage-${usage}`, category: 'Uso', label: opt?.label || usage, value: usage });
    });

    filters.gama.forEach((gama) => {
      const opt = gamaOptions.find((o) => o.value === gama);
      applied.push({ id: `gama-${gama}`, category: 'Gama', label: opt?.label || gama, value: gama });
    });

    filters.condition.forEach((condition) => {
      const opt = conditionOptions.find((o) => o.value === condition);
      applied.push({ id: `condition-${condition}`, category: 'Condición', label: opt?.label || condition, value: condition });
    });

    // Technical filters
    filters.ram.forEach((ram) => {
      const opt = ramOptions.find((o) => parseInt(o.value) === ram);
      applied.push({ id: `ram-${ram}`, category: 'RAM', label: opt?.label || `${ram} GB`, value: ram });
    });

    filters.storage.forEach((storage) => {
      const opt = storageOptions.find((o) => parseInt(o.value) === storage);
      applied.push({ id: `storage-${storage}`, category: 'Almacenamiento', label: opt?.label || `${storage} GB`, value: storage });
    });

    filters.processorModel.forEach((processor) => {
      const opt = processorModelOptions.find((o) => o.value === processor);
      applied.push({ id: `processor-${processor}`, category: 'Procesador', label: opt?.label || processor, value: processor });
    });

    filters.displaySize.forEach((size) => {
      const opt = displaySizeOptions.find((o) => parseFloat(o.value) === size);
      applied.push({ id: `displaySize-${size}`, category: 'Pantalla', label: opt?.label || `${size}"`, value: size });
    });

    filters.resolution.forEach((res) => {
      const opt = resolutionOptions.find((o) => o.value === res);
      applied.push({ id: `resolution-${res}`, category: 'Resolución', label: opt?.label || res, value: res });
    });

    filters.displayType.forEach((type) => {
      const opt = displayTypeOptions.find((o) => o.value === type);
      applied.push({ id: `displayType-${type}`, category: 'Tipo Pantalla', label: opt?.label || type, value: type });
    });

    if (filters.gpuType.includes('dedicated')) {
      applied.push({ id: 'gpu-dedicated', category: 'GPU', label: 'GPU Dedicada', value: 'dedicated' });
    }

    if (filters.touchScreen) {
      applied.push({ id: 'touch-true', category: 'Pantalla', label: 'Táctil', value: true });
    }

    if (filters.backlitKeyboard) {
      applied.push({ id: 'backlit-true', category: 'Teclado', label: 'Retroiluminado', value: true });
    }

    if (filters.numericKeypad) {
      applied.push({ id: 'numeric-true', category: 'Teclado', label: 'Numérico', value: true });
    }

    if (filters.fingerprint) {
      applied.push({ id: 'fingerprint-true', category: 'Seguridad', label: 'Huella Digital', value: true });
    }

    if (filters.hasWindows) {
      applied.push({ id: 'windows-true', category: 'SO', label: 'Windows', value: true });
    }

    if (filters.hasThunderbolt) {
      applied.push({ id: 'thunderbolt-true', category: 'Puertos', label: 'Thunderbolt', value: true });
    }

    if (filters.hasEthernet) {
      applied.push({ id: 'ethernet-true', category: 'Puertos', label: 'Ethernet', value: true });
    }

    if (filters.ramExpandable) {
      applied.push({ id: 'ramExpandable-true', category: 'RAM', label: 'Expandible', value: true });
    }

    return applied;
  }, [filters]);

  const handleRemoveFilter = (id: string) => {
    const [category, value] = id.split('-');
    switch (category) {
      case 'brand':
        updateFilter('brands', filters.brands.filter((b) => b !== value));
        break;
      case 'usage':
        updateFilter('usage', filters.usage.filter((u) => u !== value));
        break;
      case 'gama':
        updateFilter('gama', filters.gama.filter((g) => g !== value));
        break;
      case 'condition':
        updateFilter('condition', filters.condition.filter((c) => c !== value));
        break;
      case 'ram':
        updateFilter('ram', filters.ram.filter((r) => r !== parseInt(value)));
        break;
      case 'storage':
        updateFilter('storage', filters.storage.filter((s) => s !== parseInt(value)));
        break;
      case 'processor':
        updateFilter('processorModel', filters.processorModel.filter((p) => p !== value));
        break;
      case 'displaySize':
        updateFilter('displaySize', filters.displaySize.filter((d) => d !== parseFloat(value)));
        break;
      case 'resolution':
        updateFilter('resolution', filters.resolution.filter((r) => r !== value));
        break;
      case 'displayType':
        updateFilter('displayType', filters.displayType.filter((t) => t !== value));
        break;
      case 'gpu':
        updateFilter('gpuType', []);
        break;
      case 'touch':
        updateFilter('touchScreen', false);
        break;
      case 'backlit':
        updateFilter('backlitKeyboard', false);
        break;
      case 'numeric':
        updateFilter('numericKeypad', false);
        break;
      case 'fingerprint':
        updateFilter('fingerprint', false);
        break;
      case 'windows':
        updateFilter('hasWindows', false);
        break;
      case 'thunderbolt':
        updateFilter('hasThunderbolt', false);
        break;
      case 'ethernet':
        updateFilter('hasEthernet', false);
        break;
      case 'ramExpandable':
        updateFilter('ramExpandable', false);
        break;
    }
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
      priceRange: [1000, 8000],
      quotaRange: [40, 400],
    });
  };

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
    <div className="min-h-screen bg-neutral-50">
      <div className="min-h-screen">
        {/* Full Width Header Section - Inside Card */}
        <div className="w-full p-4 lg:p-6">
          <Card className="bg-white/95 backdrop-blur-sm shadow-lg border border-neutral-200/50">
            <CardBody className="p-6">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
              >
                <div>
                  <h1 className="text-3xl font-bold text-[#4654CD] font-['Baloo_2']">
                    Catálogo de Equipos
                  </h1>
                  <p className="text-sm text-neutral-500">
                    Encuentra el equipo perfecto para tus estudios
                  </p>
                </div>

                <SortDropdown
                  value={sort}
                  onChange={onSortChange}
                  totalProducts={products.length}
                />
              </motion.div>

              {/* Quick Usage Cards - "Encuentra tu laptop ideal" - Full Width */}
              <QuickUsageCards
                selected={filters.usage}
                onChange={(usage) => updateFilter('usage', usage)}
                className=""
              />
            </CardBody>
          </Card>
        </div>

        {/* Content with Sidebar and Products */}
        <div className="flex items-start">
          {/* Floating Filter Card - Sticky */}
          <aside className="hidden lg:block w-[320px] p-6 pt-0 sticky top-0 self-start">
            <Card className="bg-white/95 backdrop-blur-sm shadow-lg border border-neutral-200/50">
              <CardBody className="p-4 max-h-[calc(100vh-24px)] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-200">
                  <h2 className="font-semibold text-neutral-800">Filtros</h2>
                  {appliedFilters.length > 0 && (
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
              </CardBody>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-6 pt-0">
            {/* Applied Filters Chips */}
            <FilterChips
              filters={appliedFilters}
              onRemove={handleRemoveFilter}
              onClearAll={handleClearAll}
            />

            {/* Products Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`grid gap-4 ${
                config.productsPerRow.desktop === 4
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : config.productsPerRow.desktop === 5
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};
