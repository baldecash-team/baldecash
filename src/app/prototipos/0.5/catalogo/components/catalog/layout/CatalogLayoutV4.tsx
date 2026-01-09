'use client';

import React, { useState } from 'react';
import { Button, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import { Trash2, ChevronDown, Settings2, SlidersHorizontal, Filter, Laptop, Tablet, Smartphone, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { CatalogLayoutProps, CatalogDeviceType } from '../../../types/catalog';
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
  brandsByDeviceType,
  deviceTypeOptions,
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
  onFilterDrawerChange,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Notify parent when drawer state changes
  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
    onFilterDrawerChange?.(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    onFilterDrawerChange?.(false);
  };

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
  const dynamicDeviceTypeOptions = React.useMemo(() =>
    filterCounts ? applyDynamicCounts(deviceTypeOptions, filterCounts.deviceType) : deviceTypeOptions,
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

  const appliedFiltersCount = React.useMemo(() => {
    return (
      filters.brands.length +
      filters.usage.length +
      filters.ram.length +
      filters.gama.length +
      filters.condition.length +
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
      (filters.ramExpandable ? 1 : 0)
    );
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

  // Device type icons mapping
  const deviceTypeIcons: Record<string, React.ElementType> = {
    laptop: Laptop,
    tablet: Tablet,
    celular: Smartphone,
  };

  // Get filtered brand options based on selected device types
  const getFilteredBrandOptions = () => {
    if (filters.deviceTypes.length === 0) {
      return dynamicBrandOptions;
    }

    // Get all brands available for selected device types
    const availableBrands = new Set<string>();
    filters.deviceTypes.forEach((deviceType) => {
      const brands = brandsByDeviceType[deviceType] || [];
      brands.forEach((brand) => availableBrands.add(brand));
    });

    return dynamicBrandOptions.filter((opt) => availableBrands.has(opt.value));
  };

  const renderBrandFilter = () => {
    const filteredBrands = getFilteredBrandOptions();
    const props = {
      options: filteredBrands,
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
              <CardBody className="p-4 max-h-[calc(100vh-24px)] overflow-y-auto lg:pb-30">
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

                {/* Device Type Filter */}
                <FilterSection title="Tipo de equipo" defaultExpanded={true}>
                  <div className="grid grid-cols-3 gap-2">
                    {dynamicDeviceTypeOptions.map((opt) => {
                      const isSelected = filters.deviceTypes.includes(opt.value as CatalogDeviceType);
                      const Icon = deviceTypeIcons[opt.value];
                      return (
                        <button
                          key={opt.value}
                          onClick={() => {
                            const deviceType = opt.value as CatalogDeviceType;
                            if (filters.deviceTypes.includes(deviceType)) {
                              updateFilter('deviceTypes', filters.deviceTypes.filter((d) => d !== deviceType));
                            } else {
                              updateFilter('deviceTypes', [...filters.deviceTypes, deviceType]);
                            }
                          }}
                          className={`relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#4654CD] bg-[#4654CD]/5'
                              : 'border-neutral-200 bg-white hover:border-[#4654CD]/50'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-4 h-4 bg-[#4654CD] rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <div className="w-12 h-8 flex items-center justify-center mb-1">
                            {Icon && (
                              <Icon className={`w-6 h-6 transition-all ${
                                isSelected ? 'text-[#4654CD]' : 'text-neutral-400'
                              }`} />
                            )}
                          </div>
                          <span className={`text-xs font-medium ${
                            isSelected ? 'text-[#4654CD]' : 'text-neutral-600'
                          }`}>
                            {opt.label} ({opt.count})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </FilterSection>

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
                    className="flex items-center justify-between w-full py-2 text-sm font-medium text-neutral-700 hover:text-[#4654CD] transition-colors cursor-pointer"
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
              className="grid gap-6 pb-20 lg:pb-0 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>

      {/* Mobile Filter Button - Only visible on mobile (lg:hidden) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden">
        <button
          onClick={handleDrawerOpen}
          className="flex items-center gap-3 bg-[#4654CD] text-white shadow-xl hover:bg-[#3a47b3] transition-all cursor-pointer px-5 py-3 rounded-xl hover:shadow-2xl hover:scale-105"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="font-medium text-base">Filtros</span>
          {appliedFiltersCount > 0 && (
            <span className="bg-[#2a3499] text-white text-sm font-semibold rounded-full min-w-[24px] h-6 flex items-center justify-center px-2">
              {appliedFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filter Drawer Modal */}
      <Modal
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
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
          <ModalHeader className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
              <Filter className="w-4 h-4 text-[#4654CD]" />
            </div>
            <span className="text-lg font-semibold text-neutral-800">Filtros</span>
          </ModalHeader>

          <ModalBody className="px-4 py-6 overflow-y-auto">
            {/* Device Type Filter */}
            <FilterSection title="Tipo de equipo" defaultExpanded={true}>
              <div className="grid grid-cols-3 gap-2">
                {deviceTypeOptions.map((opt) => {
                  const isSelected = filters.deviceTypes.includes(opt.value as CatalogDeviceType);
                  const Icon = deviceTypeIcons[opt.value];
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        const deviceType = opt.value as CatalogDeviceType;
                        if (filters.deviceTypes.includes(deviceType)) {
                          updateFilter('deviceTypes', filters.deviceTypes.filter((d) => d !== deviceType));
                        } else {
                          updateFilter('deviceTypes', [...filters.deviceTypes, deviceType]);
                        }
                      }}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#4654CD] bg-[#4654CD]/5'
                          : 'border-neutral-200 bg-white hover:border-[#4654CD]/50'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-[#4654CD] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="w-12 h-8 flex items-center justify-center mb-1">
                        {Icon && (
                          <Icon className={`w-6 h-6 transition-all ${
                            isSelected ? 'text-[#4654CD]' : 'text-neutral-400'
                          }`} />
                        )}
                      </div>
                      <span className={`text-xs font-medium ${
                        isSelected ? 'text-[#4654CD]' : 'text-neutral-600'
                      }`}>
                        {opt.label} ({opt.count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </FilterSection>

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

            {/* Main Filters (Uso recomendado, Condición) */}
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
                className="flex items-center justify-between w-full py-2 text-sm font-medium text-neutral-700 hover:text-[#4654CD] transition-colors cursor-pointer"
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
              onPress={handleDrawerClose}
            >
              Ver {products.length} resultados
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
