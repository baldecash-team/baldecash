'use client';

import React, { useState, useEffect } from 'react';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react';
import { ChevronDown, Trash2, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { CatalogLayoutProps } from '../../../types/catalog';
import { FilterChips } from '../filters/FilterChips';
import { SortDropdown } from '../sorting/SortDropdown';
import { QuotaRangeFilter } from '../filters/QuotaRangeFilter';
import { UsageFilter } from '../filters/UsageFilter';
import {
  BrandFilterV1,
  BrandFilterV2,
  BrandFilterV3,
  BrandFilterV4,
  BrandFilterV5,
  BrandFilterV6,
} from '../filters/brand';
import { TechnicalFiltersStyled } from '../filters/TechnicalFiltersStyled';
import { Checkbox, Switch, Chip } from '@nextui-org/react';
import {
  brandOptions,
  usageOptions,
  ramOptions,
  storageOptions,
  displaySizeOptions,
  gamaOptions,
  conditionOptions,
  processorModelOptions,
  resolutionOptions,
  displayTypeOptions,
} from '../../../data/mockCatalogData';
import { GamaTier, ProductCondition, ProcessorModel, Resolution, DisplayType } from '../../../types/catalog';

/**
 * CatalogLayoutV6 - Centrado con Filtros Sticky
 * Grid centrado, filtros como barra sticky superior
 * Referencia: Spotify Browse, Netflix categorías
 */
export const CatalogLayoutV6: React.FC<CatalogLayoutProps> = ({
  products,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  config,
  children,
}) => {
  const [isSticky, setIsSticky] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
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
      ram: [],
      storage: [],
      processorModel: [],
      displaySize: [],
      resolution: [],
      displayType: [],
      gpuType: [],
      touchScreen: false,
      backlitKeyboard: false,
      numericKeypad: false,
      fingerprint: false,
      hasWindows: false,
      hasThunderbolt: false,
      hasEthernet: false,
      ramExpandable: false,
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

  const FilterDropdown = ({
    id,
    label,
    count,
    children: dropdownContent
  }: {
    id: string;
    label: string;
    count: number;
    children: React.ReactNode;
  }) => (
    <Dropdown
      isOpen={openDropdown === id}
      onOpenChange={(open) => setOpenDropdown(open ? id : null)}
    >
      <DropdownTrigger>
        <Button
          size="sm"
          variant="bordered"
          endContent={<ChevronDown className="w-3 h-3" />}
          className={`cursor-pointer border-neutral-200 hover:border-[#4654CD]/50 ${
            count > 0 ? 'border-[#4654CD] bg-[#4654CD]/5 text-[#4654CD]' : ''
          }`}
        >
          {label}
          {count > 0 && (
            <span className="ml-1 w-4 h-4 bg-[#4654CD] text-white rounded-full text-[10px] flex items-center justify-center">
              {count}
            </span>
          )}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={label}
        closeOnSelect={false}
        className="min-w-[280px] p-4 bg-white"
        classNames={{
          base: "bg-white shadow-lg border border-neutral-200 rounded-lg",
        }}
      >
        <DropdownItem
          key="content"
          isReadOnly
          classNames={{
            base: "cursor-default bg-white hover:bg-white data-[hover=true]:bg-white data-[selectable=true]:focus:bg-white p-0",
          }}
        >
          {dropdownContent}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Header */}
      <div className="bg-[#4654CD] text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold font-['Baloo_2'] mb-2"
          >
            Catálogo de Equipos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/80"
          >
            Encuentra el equipo perfecto para tus estudios
          </motion.p>
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <motion.div
        className={`sticky top-0 z-40 bg-white border-b border-neutral-200 transition-shadow ${
          isSticky ? 'shadow-md' : ''
        }`}
        initial={{ y: 0 }}
        animate={{ y: 0 }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-neutral-500 flex items-center gap-1">
                <SlidersHorizontal className="w-4 h-4" />
                Filtros:
              </span>

              {/* Brand Dropdown */}
              <FilterDropdown id="brand" label="Marca" count={filters.brands.length}>
                {renderBrandFilter()}
              </FilterDropdown>

              {/* Quota Dropdown */}
              <FilterDropdown id="quota" label="Cuota" count={0}>
                <div>
                  <p className="text-sm font-medium text-neutral-700 mb-2">Cuota mensual</p>
                  <QuotaRangeFilter
                    value={filters.quotaRange}
                    onChange={(val) => updateFilter('quotaRange', val)}
                  />
                </div>
              </FilterDropdown>

              {/* Usage Dropdown - usa TechnicalFiltersStyled según versión */}
              <FilterDropdown id="usage" label="Uso" count={filters.usage.length}>
                <TechnicalFiltersStyled
                  version={config.technicalFiltersVersion}
                  showFilters="main"
                  usageOptions={usageOptions}
                  selectedUsage={filters.usage}
                  onUsageChange={(usage) => updateFilter('usage', usage)}
                  showCounts={config.showFilterCounts}
                />
              </FilterDropdown>

              {/* Gama Dropdown */}
              <FilterDropdown id="gama" label="Gama" count={filters.gama.length}>
                <div className="flex flex-wrap gap-2">
                  {gamaOptions.map((opt) => {
                    const isSelected = filters.gama.includes(opt.value as GamaTier);
                    return (
                      <Chip
                        key={opt.value}
                        size="sm"
                        variant={isSelected ? 'solid' : 'bordered'}
                        className={`cursor-pointer ${isSelected ? 'bg-[#4654CD] text-white' : ''}`}
                        onClick={() => {
                          const gama = opt.value as GamaTier;
                          if (filters.gama.includes(gama)) {
                            updateFilter('gama', filters.gama.filter((g) => g !== gama));
                          } else {
                            updateFilter('gama', [...filters.gama, gama]);
                          }
                        }}
                      >
                        {opt.label}
                      </Chip>
                    );
                  })}
                </div>
              </FilterDropdown>

              {/* Condición Dropdown - usa TechnicalFiltersStyled según versión */}
              <FilterDropdown id="condition" label="Condición" count={filters.condition.length}>
                <TechnicalFiltersStyled
                  version={config.technicalFiltersVersion}
                  showFilters="main"
                  conditionOptions={conditionOptions}
                  selectedCondition={filters.condition}
                  onConditionChange={(condition) => updateFilter('condition', condition)}
                  showCounts={config.showFilterCounts}
                />
              </FilterDropdown>

              {/* Más Filtros Dropdown - usa TechnicalFiltersStyled según versión */}
              <FilterDropdown
                id="advanced"
                label="Más filtros"
                count={filters.ram.length + filters.storage.length + filters.processorModel.length + filters.displaySize.length + filters.resolution.length + filters.displayType.length}
              >
                <div className="max-h-[450px] overflow-y-auto">
                  <TechnicalFiltersStyled
                    version={config.technicalFiltersVersion}
                    showFilters="advanced"
                    ramOptions={ramOptions}
                    selectedRam={filters.ram}
                    onRamChange={(ram) => updateFilter('ram', ram)}
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
                    processorOptions={processorModelOptions}
                    selectedProcessor={filters.processorModel}
                    onProcessorChange={(models) => updateFilter('processorModel', models)}
                    showCounts={config.showFilterCounts}
                  />
                </div>
              </FilterDropdown>

              {/* Clear All */}
              {appliedFilters.length > 0 && (
                <Button
                  size="sm"
                  variant="light"
                  startContent={<Trash2 className="w-3 h-3" />}
                  onPress={handleClearAll}
                  className="text-neutral-500 hover:text-red-500 cursor-pointer text-xs"
                >
                  Limpiar
                </Button>
              )}
            </div>

            <SortDropdown
              value={sort}
              onChange={onSortChange}
              totalProducts={products.length}
            />
          </div>
        </div>
      </motion.div>

      {/* Main Content - Centered */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Applied Filters Chips */}
        <FilterChips
          filters={appliedFilters}
          onRemove={handleRemoveFilter}
          onClearAll={handleClearAll}
        />

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
  );
};
