'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { Trash2, ChevronDown, Settings2, SlidersHorizontal, X, GripVertical, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
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
 * CatalogLayoutV2 - Panel Flotante
 * Botón flotante draggable con panel de filtros expandible
 * - Header con Quick Cards de uso rápido
 * - Botón "Mostrar filtros" que expande panel colapsable
 * - Botón flotante draggable que aparece al hacer scroll
 * Referencia: Apple Store, Nike, Zara
 */
export const CatalogLayoutV2: React.FC<CatalogLayoutProps> = ({
  products,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  config,
  filterCounts,
  children,
}) => {
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [isFloatingExpanded, setIsFloatingExpanded] = useState(false);
  const [floatingAdvancedFilters, setFloatingAdvancedFilters] = useState(false);
  const [floatingPosition, setFloatingPosition] = useState({ x: 0, y: 0 });
  const [savedMinimizedPosition, setSavedMinimizedPosition] = useState({ x: 0, y: 0 });
  const headerRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const floatingRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);

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

  // Handle expand - move to safe position (reset to original corner)
  const handleFloatingExpand = () => {
    // Save current position to restore when minimizing
    setSavedMinimizedPosition(floatingPosition);
    // Reset to original position (0,0 = bottom-right corner) so expanded panel is always visible
    setFloatingPosition({ x: 0, y: 0 });
    setIsFloatingExpanded(true);
  };

  // Handle minimize - restore saved position
  const handleFloatingMinimize = () => {
    setFloatingPosition(savedMinimizedPosition);
    setIsFloatingExpanded(false);
  };

  // Scroll detection for floating button
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        // Show floating button when header card is out of view
        setShowFloatingButton(rect.bottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className="min-h-screen bg-neutral-50" ref={constraintsRef}>
      <div className="max-w-7xl mx-auto">
        {/* Full Width Header Section - Inside Card */}
        <div ref={headerRef} className="w-full p-4 lg:p-6">
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

        {/* Filters Toggle Button & Chips */}
        <div className="px-4 lg:px-6 mb-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Toggle Filters Button */}
            <Button
              variant={showFiltersPanel ? 'solid' : 'bordered'}
              startContent={<SlidersHorizontal className="w-4 h-4" />}
              endContent={
                appliedFilters.length > 0 && !showFiltersPanel ? (
                  <span className="ml-1 w-5 h-5 bg-[#4654CD] text-white rounded-full text-xs flex items-center justify-center">
                    {appliedFilters.length}
                  </span>
                ) : null
              }
              onPress={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`cursor-pointer transition-all ${
                showFiltersPanel
                  ? 'bg-[#4654CD] text-white'
                  : 'border-neutral-300 hover:border-[#4654CD] hover:text-[#4654CD]'
              }`}
            >
              {showFiltersPanel ? 'Ocultar filtros' : 'Mostrar filtros'}
            </Button>

            {/* Clear All Button (only when filters applied) */}
            {appliedFilters.length > 0 && (
              <Button
                size="sm"
                variant="light"
                startContent={<Trash2 className="w-4 h-4" />}
                onPress={handleClearAll}
                className="text-neutral-500 hover:text-red-500 cursor-pointer"
              >
                Limpiar todo
              </Button>
            )}
          </div>

          {/* Applied Filters Chips (always visible) */}
          <FilterChips
            filters={appliedFilters}
            onRemove={handleRemoveFilter}
            onClearAll={handleClearAll}
          />
        </div>

        {/* Collapsible Filters Panel */}
        <AnimatePresence>
          {showFiltersPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="px-4 lg:px-6 mb-6 overflow-hidden"
            >
              <Card className="bg-white/95 backdrop-blur-sm shadow-lg border border-neutral-200/50">
                <CardBody className="p-6">
                  {/* Filters Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
                    <h2 className="font-semibold text-neutral-800 flex items-center gap-2">
                      <SlidersHorizontal className="w-5 h-5 text-[#4654CD]" />
                      Filtros
                    </h2>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => setShowFiltersPanel(false)}
                      className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Filters Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Brand Filter */}
                    <div>
                      <FilterSection title="Marca" defaultExpanded={true}>
                        {renderBrandFilter()}
                      </FilterSection>
                    </div>

                    {/* Quota Filter */}
                    <div>
                      <FilterSection title="Cuota mensual" defaultExpanded={true}>
                        <QuotaRangeFilter
                          value={filters.quotaRange}
                          onChange={(val) => updateFilter('quotaRange', val)}
                        />
                      </FilterSection>
                    </div>

                    {/* Gama Filter */}
                    <div>
                      <CommercialFilters
                        gamaOptions={dynamicGamaOptions}
                        selectedGama={filters.gama}
                        onGamaChange={(gama) => updateFilter('gama', gama)}
                        showCounts={config.showFilterCounts}
                      />
                    </div>

                    {/* Main Filters (Uso recomendado, Condición) */}
                    <div>
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
                    </div>
                  </div>

                  {/* Advanced Technical Filters */}
                  <div className="border-t border-neutral-200 mt-6 pt-4">
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

                    <AnimatePresence>
                      {showAdvancedFilters && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
                            <div className="col-span-full">
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
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid - Full Width */}
        <main className="px-4 lg:px-6 pb-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Floating Draggable Filter Button */}
      <AnimatePresence>
        {showFloatingButton && (
          <motion.div
            ref={floatingRef}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: isFloatingExpanded ? 0 : floatingPosition.x,
              y: isFloatingExpanded ? 0 : floatingPosition.y
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            drag={!isFloatingExpanded}
            dragControls={dragControls}
            dragMomentum={false}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (!isFloatingExpanded) {
                setFloatingPosition(prev => ({
                  x: prev.x + info.offset.x,
                  y: prev.y + info.offset.y
                }));
              }
            }}
            className={`fixed z-50 ${
              isFloatingExpanded
                ? 'top-20 right-4 sm:right-6'
                : 'bottom-6 right-6'
            }`}
            style={{ touchAction: 'none' }}
          >
            <div className={`rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
              isFloatingExpanded ? 'w-[min(320px,calc(100vw-32px))] bg-white border border-neutral-200' : 'w-auto bg-[#4654CD]'
            }`}>
              {/* Minimized State - Compact icon button */}
              {!isFloatingExpanded ? (
                <div className="flex items-center">
                  {/* Drag Handle */}
                  <div
                    className="p-3 cursor-grab active:cursor-grabbing text-white/70 hover:text-white border-r border-white/20"
                    onPointerDown={(e) => dragControls.start(e)}
                  >
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Filter Button - Icon only */}
                  <button
                    onClick={handleFloatingExpand}
                    className="flex items-center gap-2 p-3 text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                    {appliedFilters.length > 0 && (
                      <span className="w-5 h-5 bg-white text-[#4654CD] rounded-full text-xs font-bold flex items-center justify-center">
                        {appliedFilters.length}
                      </span>
                    )}
                  </button>

                  {/* Expand Button */}
                  <button
                    onClick={handleFloatingExpand}
                    className="p-3 text-white/70 hover:text-white transition-colors cursor-pointer border-l border-white/20"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Expanded State - Full filters panel */
                <div className="max-h-[calc(100vh-100px)] overflow-hidden flex flex-col">
                  {/* Header with drag handle */}
                  <div className="flex items-center justify-between p-3 border-b border-neutral-200 bg-neutral-50">
                    <div className="flex items-center gap-2">
                      <div
                        className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-600"
                        onPointerDown={(e) => dragControls.start(e)}
                      >
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <SlidersHorizontal className="w-5 h-5 text-[#4654CD]" />
                      <span className="font-semibold text-neutral-800">Filtros</span>
                      {appliedFilters.length > 0 && (
                        <span className="w-5 h-5 bg-[#4654CD] text-white rounded-full text-xs flex items-center justify-center">
                          {appliedFilters.length}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {appliedFilters.length > 0 && (
                        <button
                          onClick={handleClearAll}
                          className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Limpiar filtros"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={handleFloatingMinimize}
                        className="p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                        title="Minimizar"
                      >
                        <Minimize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Filter Content */}
                  <div className="overflow-y-auto p-4 space-y-4 flex-1">
                    {/* Brand Filter */}
                    <FilterSection title="Marca" defaultExpanded={false}>
                      {renderBrandFilter()}
                    </FilterSection>

                    {/* Quota Filter */}
                    <FilterSection title="Cuota mensual" defaultExpanded={false}>
                      <QuotaRangeFilter
                        value={filters.quotaRange}
                        onChange={(val) => updateFilter('quotaRange', val)}
                      />
                    </FilterSection>

                    {/* Gama Filter */}
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
                    <div className="border-t border-neutral-200 pt-4">
                      <button
                        onClick={() => setFloatingAdvancedFilters(!floatingAdvancedFilters)}
                        className="flex items-center justify-between w-full py-2 text-sm font-medium text-neutral-700 hover:text-[#4654CD] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Settings2 className="w-4 h-4" />
                          <span>Filtros Avanzados</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${floatingAdvancedFilters ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {floatingAdvancedFilters && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
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
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
