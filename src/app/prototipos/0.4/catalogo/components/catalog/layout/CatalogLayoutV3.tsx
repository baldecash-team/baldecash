'use client';

import React, { useState } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Badge } from '@nextui-org/react';
import { Filter, X, Trash2 } from 'lucide-react';
import { CatalogLayoutProps } from '../../../types/catalog';
import { FilterSection } from '../filters/FilterSection';
import { FilterChips } from '../filters/FilterChips';
import { SortDropdown } from '../sorting/SortDropdown';
import { PriceRangeFilter } from '../filters/PriceRangeFilter';
import { QuotaRangeFilter } from '../filters/QuotaRangeFilter';
import { UsageFilter } from '../filters/UsageFilter';
import { CommercialFilters } from '../filters/CommercialFilters';
import { TechnicalFilters } from '../filters/TechnicalFilters';
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
 * CatalogLayoutV3 - Mobile-First Drawer
 * Botón flotante que abre drawer de filtros, mismo UX en desktop y móvil
 * Referencia: Airbnb, Booking, apps móviles
 */
export const CatalogLayoutV3: React.FC<CatalogLayoutProps> = ({
  products,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  config,
  children,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const updateFilter = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const appliedFiltersCount = React.useMemo(() => {
    return (
      filters.brands.length +
      filters.usage.length +
      filters.ram.length +
      filters.gama.length +
      filters.condition.length
    );
  }, [filters]);

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
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
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
      </div>

      {/* FAB - Filter Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Badge
          content={appliedFiltersCount}
          color="primary"
          isInvisible={appliedFiltersCount === 0}
          className="bg-[#4654CD]"
        >
          <Button
            isIconOnly
            size="lg"
            className="bg-[#4654CD] text-white shadow-lg hover:bg-[#3a47b3] transition-colors cursor-pointer w-14 h-14"
            onPress={() => setIsDrawerOpen(true)}
          >
            <Filter className="w-6 h-6" />
          </Button>
        </Badge>
      </div>

      {/* Filter Drawer Modal */}
      <Modal
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        size="full"
        scrollBehavior="inside"
        classNames={{
          base: 'bg-white m-0 rounded-none sm:rounded-l-xl sm:ml-auto sm:max-w-md h-full',
          header: 'border-b border-neutral-200 bg-white py-4',
          body: 'bg-white p-0',
          footer: 'border-t border-neutral-200 bg-white',
          closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer',
        }}
      >
        <ModalContent>
          <ModalHeader className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                <Filter className="w-4 h-4 text-[#4654CD]" />
              </div>
              <span className="text-lg font-semibold text-neutral-800">Filtros</span>
            </div>
            <Button
              isIconOnly
              variant="light"
              onPress={() => setIsDrawerOpen(false)}
              className="cursor-pointer"
            >
              <X className="w-5 h-5" />
            </Button>
          </ModalHeader>

          <ModalBody className="px-4 py-6 overflow-y-auto">
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
          </ModalBody>

          <ModalFooter className="gap-2">
            <Button
              variant="light"
              startContent={<Trash2 className="w-4 h-4" />}
              onPress={handleClearAll}
              className="cursor-pointer"
            >
              Limpiar
            </Button>
            <Button
              className="bg-[#4654CD] text-white flex-1 cursor-pointer"
              onPress={() => setIsDrawerOpen(false)}
            >
              Ver {products.length} resultados
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
