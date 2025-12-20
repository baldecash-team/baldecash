'use client';

import React from 'react';
import { Button } from '@nextui-org/react';
import { Trash2 } from 'lucide-react';
import { CatalogLayoutProps } from '../../../types/catalog';
import { FilterSection } from '../filters/FilterSection';
import { PriceRangeFilter } from '../filters/PriceRangeFilter';
import { QuotaRangeFilter } from '../filters/QuotaRangeFilter';
import { UsageFilter } from '../filters/UsageFilter';
import { CommercialFilters } from '../filters/CommercialFilters';
import { TechnicalFilters } from '../filters/TechnicalFilters';
import { FilterChips } from '../filters/FilterChips';
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
  ramOptions,
  storageOptions,
  displaySizeOptions,
  gamaOptions,
  conditionOptions,
  resolutionOptions,
  displayTypeOptions,
  processorBrandOptions,
  filterTooltips,
} from '../../../data/mockCatalogData';

/**
 * CatalogLayoutV1 - Sidebar Clásico
 * Sidebar fijo izquierdo 280px con filtros expandidos
 * Referencia: Amazon, Mercado Libre, Falabella
 */
export const CatalogLayoutV1: React.FC<CatalogLayoutProps> = ({
  products,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  config,
  children,
}) => {
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

    filters.ram.forEach((ram) => {
      applied.push({ id: `ram-${ram}`, category: 'RAM', label: `${ram} GB`, value: ram });
    });

    filters.gama.forEach((gama) => {
      const opt = gamaOptions.find((o) => o.value === gama);
      applied.push({ id: `gama-${gama}`, category: 'Gama', label: opt?.label || gama, value: gama });
    });

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
      case 'ram':
        updateFilter('ram', filters.ram.filter((r) => r !== parseInt(value)));
        break;
      case 'gama':
        updateFilter('gama', filters.gama.filter((g) => g !== value));
        break;
    }
  };

  const handleClearAll = () => {
    onFiltersChange({
      ...filters,
      brands: [],
      usage: [],
      ram: [],
      gama: [],
      condition: [],
      priceRange: [1000, 8000],
      quotaRange: [40, 400],
    });
  };

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
      {/* Sidebar - Hidden on mobile */}
      <aside className="hidden lg:block w-[280px] bg-white border-r border-neutral-200 p-4 sticky top-0 h-screen overflow-y-auto">
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

        {/* Price Filters */}
        <FilterSection title="Precio total" defaultExpanded={true}>
          <PriceRangeFilter
            value={filters.priceRange}
            onChange={(val) => updateFilter('priceRange', val)}
          />
        </FilterSection>

        <FilterSection title="Cuota mensual" defaultExpanded={true}>
          <QuotaRangeFilter
            value={filters.quotaRange}
            onChange={(val) => updateFilter('quotaRange', val)}
            frequency={filters.quotaFrequency}
            onFrequencyChange={(freq) => updateFilter('quotaFrequency', freq)}
          />
        </FilterSection>

        {/* Usage Filter */}
        <FilterSection title="Uso recomendado" tooltip={filterTooltips.ram} defaultExpanded={true}>
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

        {/* Technical Filters */}
        <TechnicalFilters
          ramOptions={ramOptions}
          selectedRam={filters.ram}
          onRamChange={(ram) => updateFilter('ram', ram)}
          ramExpandable={filters.ramExpandable}
          onRamExpandableChange={(val) => updateFilter('ramExpandable', val)}
          storageOptions={storageOptions}
          selectedStorage={filters.storage}
          onStorageChange={(storage) => updateFilter('storage', storage)}
          displaySizeOptions={displaySizeOptions}
          selectedDisplaySize={filters.displaySize}
          onDisplaySizeChange={(sizes) => updateFilter('displaySize', sizes)}
          resolutionOptions={resolutionOptions}
          selectedResolution={filters.resolution}
          onResolutionChange={(res) => updateFilter('resolution', res)}
          displayTypeOptions={displayTypeOptions}
          selectedDisplayType={filters.displayType}
          onDisplayTypeChange={(types) => updateFilter('displayType', types)}
          touchScreen={filters.touchScreen}
          onTouchScreenChange={(val) => updateFilter('touchScreen', val)}
          processorOptions={processorBrandOptions}
          selectedProcessor={filters.processorBrand}
          onProcessorChange={(brands) => updateFilter('processorBrand', brands)}
          gpuDedicated={filters.gpuType.includes('dedicated')}
          onGpuDedicatedChange={(val) => updateFilter('gpuType', val ? ['dedicated'] : [])}
          backlitKeyboard={filters.backlitKeyboard}
          onBacklitChange={(val) => updateFilter('backlitKeyboard', val)}
          numericKeypad={filters.numericKeypad}
          onNumericChange={(val) => updateFilter('numericKeypad', val)}
          fingerprint={filters.fingerprint}
          onFingerprintChange={(val) => updateFilter('fingerprint', val)}
          hasWindows={filters.hasWindows}
          onWindowsChange={(val) => updateFilter('hasWindows', val)}
          hasThunderbolt={filters.hasThunderbolt}
          onThunderboltChange={(val) => updateFilter('hasThunderbolt', val)}
          hasEthernet={filters.hasEthernet}
          onEthernetChange={(val) => updateFilter('hasEthernet', val)}
          showCounts={config.showFilterCounts}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#4654CD] font-['Baloo_2']">
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
        </div>

        {/* Applied Filters Chips */}
        <FilterChips
          filters={appliedFilters}
          onRemove={handleRemoveFilter}
          onClearAll={handleClearAll}
        />

        {/* Products Grid */}
        <div
          className={`grid gap-4 ${
            config.productsPerRow.desktop === 4
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : config.productsPerRow.desktop === 5
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {children}
        </div>
      </main>
    </div>
  );
};
