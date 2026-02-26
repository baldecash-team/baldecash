'use client';

import React, { useState } from 'react';
import { Button, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import { Trash2, ChevronDown, Settings2, SlidersHorizontal, Filter, Laptop, Tablet, Smartphone, Check, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { CatalogLayoutProps, CatalogDeviceType, ProductTagType } from '../../../types/catalog';
import type { CatalogFiltersResponse } from '../../../../../types/filters';
import { FilterSection } from '../filters/FilterSection';
import { QuotaRangeFilter } from '../filters/QuotaRangeFilter';
import { CommercialFilters } from '../filters/CommercialFilters';
import { TechnicalFiltersStyled } from '../filters/TechnicalFiltersStyled';
import { FilterChips } from '../filters/FilterChips';
import { TagsFilter } from '../filters/TagsFilter';
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
  tagOptions,
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
  searchQuery,
  onSearchClear,
  apiFilters,
  isApiFiltersLoading,
  totalProducts,
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

  // Apply dynamic counts to options - use API data when available
  const dynamicBrandOptions = React.useMemo(() => {
    // If API filters have brands, use those
    if (apiFilters?.brands && apiFilters.brands.length > 0) {
      return apiFilters.brands.map(b => ({
        value: b.slug,
        label: b.name,
        count: b.count || 0,
        logo: b.logo_url || undefined, // Convert null to undefined for FilterOption type
      }));
    }
    // Fallback to mock data with filterCounts
    return filterCounts ? applyDynamicCounts(brandOptions, filterCounts.brands) : brandOptions;
  }, [apiFilters, filterCounts]);
  const dynamicUsageOptions = React.useMemo(() => {
    // Use API usages if available
    if (apiFilters?.usages && apiFilters.usages.length > 0) {
      return apiFilters.usages.map(u => ({
        value: u.value,
        label: u.label,
        count: u.count || 0,
        icon: u.icon,
      }));
    }
    // Fallback to mock data
    return filterCounts ? applyDynamicCounts(usageOptions, filterCounts.usage) : usageOptions;
  }, [apiFilters, filterCounts]);
  const dynamicGamaOptions = React.useMemo(() => {
    // Use API gamas if available
    if (apiFilters?.gamas && apiFilters.gamas.length > 0) {
      return apiFilters.gamas.map(g => ({
        value: g.value,
        label: g.label,
        count: g.count || 0,
      }));
    }
    // Fallback to mock data
    return filterCounts ? applyDynamicCounts(gamaOptions, filterCounts.gama) : gamaOptions;
  }, [apiFilters, filterCounts]);
  const dynamicConditionOptions = React.useMemo(() => {
    // If API filters have conditions, use those
    if (apiFilters?.conditions && apiFilters.conditions.length > 0) {
      return apiFilters.conditions.map(c => ({
        value: c.value,
        label: c.label,
        count: c.count || 0,
      }));
    }
    // Fallback to mock data with filterCounts
    return filterCounts ? applyDynamicCounts(conditionOptions, filterCounts.condition) : conditionOptions;
  }, [apiFilters, filterCounts]);
  const dynamicRamOptions = React.useMemo(() => {
    // Use API specs if available
    if (apiFilters?.specs?.ram?.values && apiFilters.specs.ram.values.length > 0) {
      return apiFilters.specs.ram.values.map(v => ({
        value: String(v.value),
        label: v.display,
        count: v.count || 0,
      }));
    }
    // Fallback to mock data
    return filterCounts ? applyDynamicCounts(ramOptions, filterCounts.ram) : ramOptions;
  }, [apiFilters, filterCounts]);
  const dynamicStorageOptions = React.useMemo(() => {
    // Use API specs if available
    if (apiFilters?.specs?.storage?.values && apiFilters.specs.storage.values.length > 0) {
      return apiFilters.specs.storage.values.map(v => ({
        value: String(v.value),
        label: v.display,
        count: v.count || 0,
      }));
    }
    // Fallback to mock data
    return filterCounts ? applyDynamicCounts(storageOptions, filterCounts.storage) : storageOptions;
  }, [apiFilters, filterCounts]);
  const dynamicDisplaySizeOptions = React.useMemo(() => {
    // Use API specs if available (screen_size)
    if (apiFilters?.specs?.screen_size?.values && apiFilters.specs.screen_size.values.length > 0) {
      return apiFilters.specs.screen_size.values.map(v => ({
        value: String(v.value),
        label: v.display,
        count: v.count || 0,
      }));
    }
    // Fallback to mock data
    return filterCounts ? applyDynamicCounts(displaySizeOptions, filterCounts.displaySize) : displaySizeOptions;
  }, [apiFilters, filterCounts]);
  const dynamicResolutionOptions = React.useMemo(() => {
    // Use API specs if available (screen_resolution)
    if (apiFilters?.specs?.screen_resolution?.values && apiFilters.specs.screen_resolution.values.length > 0) {
      return apiFilters.specs.screen_resolution.values.map(v => ({
        value: String(v.value),
        label: v.display,
        count: v.count || 0,
      }));
    }
    // Fallback to mock data
    return filterCounts ? applyDynamicCounts(resolutionOptions, filterCounts.resolution) : resolutionOptions;
  }, [apiFilters, filterCounts]);
  const dynamicDisplayTypeOptions = React.useMemo(() => {
    // Use API specs if available (screen_type)
    if (apiFilters?.specs?.screen_type?.values && apiFilters.specs.screen_type.values.length > 0) {
      return apiFilters.specs.screen_type.values.map(v => ({
        value: String(v.value),
        label: v.display,
        count: v.count || 0,
      }));
    }
    // Fallback to mock data
    return filterCounts ? applyDynamicCounts(displayTypeOptions, filterCounts.displayType) : displayTypeOptions;
  }, [apiFilters, filterCounts]);
  const dynamicDeviceTypeOptions = React.useMemo(() => {
    // If API filters have types, use those
    if (apiFilters?.types && apiFilters.types.length > 0) {
      return apiFilters.types.map(t => ({
        value: t.value,
        label: t.label,
        count: t.count || 0,
      }));
    }
    // Fallback to mock data with filterCounts
    return filterCounts ? applyDynamicCounts(deviceTypeOptions, filterCounts.deviceType) : deviceTypeOptions;
  }, [apiFilters, filterCounts]);
  const dynamicTagOptions = React.useMemo(() => {
    // If API filters have labels (tags), use those
    if (apiFilters?.labels && apiFilters.labels.length > 0) {
      return apiFilters.labels.map(l => ({
        value: l.code,   // API returns 'code', not 'value'
        label: l.name,   // API returns 'name', not 'label'
        count: l.count || 0,
        color: l.color,  // Include color from API
      }));
    }
    // Fallback to mock data with filterCounts
    return filterCounts ? applyDynamicCounts(tagOptions, filterCounts.tags) : tagOptions;
  }, [apiFilters, filterCounts]);
  const dynamicProcessorOptions = React.useMemo(() => {
    // Use API specs if available (processor)
    if (apiFilters?.specs?.processor?.values && apiFilters.specs.processor.values.length > 0) {
      return apiFilters.specs.processor.values.map(v => ({
        value: String(v.value),
        label: v.display,
        count: v.count || 0,
      }));
    }
    // Fallback to mock data
    return processorModelOptions;
  }, [apiFilters]);

  const updateFilter = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const appliedFilters = React.useMemo(() => {
    const applied: { id: string; category: string; label: string; value: string | number | boolean }[] = [];

    // Search query chip (mostrar primero)
    if (searchQuery && searchQuery.trim()) {
      applied.push({ id: 'search-query', category: 'Búsqueda', label: searchQuery.trim(), value: searchQuery.trim() });
    }

    filters.deviceTypes.forEach((deviceType) => {
      const opt = deviceTypeOptions.find((o) => o.value === deviceType);
      applied.push({ id: `deviceType-${deviceType}`, category: 'Tipo', label: opt?.label || deviceType, value: deviceType });
    });

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

    filters.tags.forEach((tag) => {
      const opt = tagOptions.find((o) => o.value === tag);
      applied.push({ id: `tag-${tag}`, category: 'Destacados', label: opt?.label || tag, value: tag });
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

    // Quota range (si difiere del default)
    if (filters.quotaRange[0] !== 25 || filters.quotaRange[1] !== 500) {
      applied.push({ id: 'quota-range', category: 'Cuota', label: `S/${filters.quotaRange[0]} - S/${filters.quotaRange[1]}/mes`, value: `${filters.quotaRange[0]}-${filters.quotaRange[1]}` });
    }

    return applied;
  }, [filters, searchQuery]);

  const appliedFiltersCount = React.useMemo(() => {
    return (
      filters.deviceTypes.length +
      filters.brands.length +
      filters.usage.length +
      filters.ram.length +
      filters.gama.length +
      filters.condition.length +
      filters.tags.length +
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
      (filters.ramExpandable ? 1 : 0) +
      (filters.quotaRange[0] !== 25 || filters.quotaRange[1] !== 500 ? 1 : 0)
    );
  }, [filters]);

  const handleRemoveFilter = (id: string) => {
    const [category, value] = id.split('-');
    switch (category) {
      case 'search':
        onSearchClear?.();
        break;
      case 'deviceType':
        updateFilter('deviceTypes', filters.deviceTypes.filter((d) => d !== value));
        break;
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
      case 'tag':
        updateFilter('tags', filters.tags.filter((t) => t !== value));
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
      case 'quota':
        updateFilter('quotaRange', [25, 500]);
        break;
    }
  };

  const handleClearAll = () => {
    onFiltersChange({
      ...filters,
      deviceTypes: [],
      brands: [],
      usage: [],
      gama: [],
      condition: [],
      tags: [],
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
      quotaRange: [25, 500],
    });
    // También limpiar búsqueda
    onSearchClear?.();
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
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(var(--color-primary-rgb),0.1)] flex items-center justify-center">
                    <Search className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-800 font-['Baloo_2']">
                      Encuentra tu laptop ideal
                    </h2>
                    <p className="text-sm text-neutral-500">
                      Selecciona según tu necesidad principal
                    </p>
                  </div>
                </div>

                <div id="onboarding-sort">
                  <SortDropdown
                    value={sort}
                    onChange={onSortChange}
                    totalProducts={totalProducts}
                  />
                </div>
              </motion.div>

              {/* Quick Usage Cards - "Encuentra tu laptop ideal" - Full Width */}
              <div id="onboarding-quick-cards">
                <QuickUsageCards
                  selected={filters.usage}
                  onChange={(usage) => updateFilter('usage', usage)}
                  className=""
                />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Content with Sidebar and Products */}
        <div className="flex items-start">
          {/* Floating Filter Card - Sticky */}
          <aside id="onboarding-filters-desktop" className="hidden lg:block w-[320px] p-6 pt-0 sticky top-0 self-start">
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
                    {dynamicDeviceTypeOptions.map((opt, idx) => {
                      const isSelected = filters.deviceTypes.includes(opt.value as CatalogDeviceType);
                      const Icon = deviceTypeIcons[opt.value];
                      return (
                        <button
                          key={`device-${opt.value || idx}`}
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
                              ? 'border-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.05)]'
                              : 'border-neutral-200 bg-white hover:border-[rgba(var(--color-primary-rgb),0.5)]'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-4 h-4 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <div className="w-12 h-8 flex items-center justify-center mb-1">
                            {Icon && (
                              <Icon className={`w-6 h-6 transition-all ${
                                isSelected ? 'text-[var(--color-primary)]' : 'text-neutral-400'
                              }`} />
                            )}
                          </div>
                          <span className={`text-xs font-medium ${
                            isSelected ? 'text-[var(--color-primary)]' : 'text-neutral-600'
                          }`}>
                            {opt.label} ({opt.count})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </FilterSection>

                {/* Tags Filter */}
                <TagsFilter
                  tagOptions={dynamicTagOptions}
                  selectedTags={filters.tags}
                  onTagsChange={(tags) => updateFilter('tags', tags)}
                  showCounts={config.showFilterCounts}
                />

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
                    className="flex items-center justify-between w-full py-2 text-sm font-medium text-neutral-700 hover:text-[var(--color-primary)] transition-colors cursor-pointer"
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
                        processorOptions={dynamicProcessorOptions}
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
              className="w-full grid gap-6 pb-20 lg:pb-0 grid-cols-[repeat(auto-fill,minmax(min(305px,100%),1fr))] justify-items-center"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>

      {/* Mobile Filter Button - Only visible on mobile (lg:hidden) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden">
        <button
          id="onboarding-filters-mobile"
          onClick={handleDrawerOpen}
          className="flex items-center gap-3 bg-[var(--color-primary)] text-white shadow-xl hover:brightness-90 transition-all cursor-pointer px-5 py-3 rounded-xl hover:shadow-2xl hover:scale-105"
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
          wrapper: 'z-[100]',
          backdrop: 'z-[99]',
          base: 'bg-white m-0 rounded-none sm:rounded-l-xl sm:ml-auto sm:max-w-md h-full',
          header: 'border-b border-neutral-200 bg-white py-4',
          body: 'bg-white p-0',
          footer: 'border-t border-neutral-200 bg-white',
          closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer',
        }}
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(var(--color-primary-rgb),0.1)] flex items-center justify-center">
              <Filter className="w-4 h-4 text-[var(--color-primary)]" />
            </div>
            <span className="text-lg font-semibold text-neutral-800">Filtros</span>
          </ModalHeader>

          <ModalBody className="px-4 py-6 overflow-y-auto">
            {/* Device Type Filter */}
            <FilterSection title="Tipo de equipo" defaultExpanded={true}>
              <div className="grid grid-cols-3 gap-2">
                {dynamicDeviceTypeOptions.map((opt, idx) => {
                  const isSelected = filters.deviceTypes.includes(opt.value as CatalogDeviceType);
                  const Icon = deviceTypeIcons[opt.value];
                  return (
                    <button
                      key={`mobile-device-${opt.value || idx}`}
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
                          ? 'border-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.05)]'
                          : 'border-neutral-200 bg-white hover:border-[rgba(var(--color-primary-rgb),0.5)]'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="w-12 h-8 flex items-center justify-center mb-1">
                        {Icon && (
                          <Icon className={`w-6 h-6 transition-all ${
                            isSelected ? 'text-[var(--color-primary)]' : 'text-neutral-400'
                          }`} />
                        )}
                      </div>
                      <span className={`text-xs font-medium ${
                        isSelected ? 'text-[var(--color-primary)]' : 'text-neutral-600'
                      }`}>
                        {opt.label} ({opt.count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </FilterSection>

            {/* Tags Filter */}
            <TagsFilter
              tagOptions={dynamicTagOptions}
              selectedTags={filters.tags}
              onTagsChange={(tags) => updateFilter('tags', tags)}
              showCounts={config.showFilterCounts}
            />

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
                className="flex items-center justify-between w-full py-2 text-sm font-medium text-neutral-700 hover:text-[var(--color-primary)] transition-colors cursor-pointer"
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
                    processorOptions={dynamicProcessorOptions}
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
              className="bg-[var(--color-primary)] text-white flex-1 cursor-pointer"
              onPress={handleDrawerClose}
            >
              Ver {totalProducts} resultados
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
