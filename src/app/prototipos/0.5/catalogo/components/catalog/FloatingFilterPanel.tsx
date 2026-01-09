'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardBody, Button, Checkbox, Switch, Chip } from '@nextui-org/react';
import { Minus, Maximize2, GripHorizontal, SlidersHorizontal, Trash2, ChevronDown, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterState, CatalogLayoutConfig, CatalogDeviceType, GamaTier, ProductCondition, ProcessorModel, Resolution, DisplayType } from '../../types/catalog';
import { FilterSection } from './filters/FilterSection';
import { QuotaRangeFilter } from './filters/QuotaRangeFilter';
import { UsageFilter } from './filters/UsageFilter';
import {
  BrandFilterV1,
  BrandFilterV2,
  BrandFilterV3,
  BrandFilterV4,
  BrandFilterV5,
  BrandFilterV6,
} from './filters/brand';
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
  processorModelOptions,
  resolutionOptions,
  displayTypeOptions,
} from '../../data/mockCatalogData';
import { Laptop, Tablet, Smartphone } from 'lucide-react';

interface FloatingFilterPanelProps {
  isVisible: boolean;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  config: CatalogLayoutConfig;
  appliedFiltersCount: number;
  onClearAll: () => void;
}

export const FloatingFilterPanel: React.FC<FloatingFilterPanelProps> = ({
  isVisible,
  filters,
  onFiltersChange,
  config,
  appliedFiltersCount,
  onClearAll,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });

  // Initialize position on mount (right side of screen)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({
        x: window.innerWidth - 340,
        y: 100,
      });
    }
  }, []);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      initialPos.current = { ...position };
      e.preventDefault();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStartPos.current.x;
        const deltaY = e.clientY - dragStartPos.current.y;

        const newX = Math.max(0, Math.min(window.innerWidth - 320, initialPos.current.x + deltaX));
        const newY = Math.max(0, Math.min(window.innerHeight - 100, initialPos.current.y + deltaY));

        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Get filtered brand options based on selected device types
  const getFilteredBrandOptions = () => {
    if (filters.deviceTypes.length === 0) {
      return brandOptions;
    }

    // Get all brands available for selected device types
    const availableBrands = new Set<string>();
    filters.deviceTypes.forEach((deviceType) => {
      const brands = brandsByDeviceType[deviceType] || [];
      brands.forEach((brand) => availableBrands.add(brand));
    });

    return brandOptions.filter((opt) => availableBrands.has(opt.value));
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

  const deviceTypeIcons: Record<string, React.ElementType> = {
    laptop: Laptop,
    tablet: Tablet,
    celular: Smartphone,
  };

  const gamaColors: Record<GamaTier, { bg: string; text: string }> = {
    economica: { bg: 'bg-neutral-100', text: 'text-neutral-700' },
    estudiante: { bg: 'bg-blue-50', text: 'text-blue-700' },
    profesional: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
    creativa: { bg: 'bg-purple-50', text: 'text-purple-700' },
    gamer: { bg: 'bg-red-50', text: 'text-red-700' },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, scale: 0.9, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, x: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed z-50"
          style={{
            left: position.x,
            top: position.y,
            cursor: isDragging ? 'grabbing' : 'default',
          }}
          onMouseDown={handleMouseDown}
        >
          <Card
            className={`bg-white/95 backdrop-blur-md shadow-2xl border border-neutral-200/50 transition-all ${
              isDragging ? 'shadow-3xl scale-[1.02]' : ''
            } ${isMinimized ? 'w-auto' : 'w-[300px]'}`}
          >
            {/* Header - Draggable */}
            {isMinimized ? (
              /* Minimized: Filter icon + expand button */
              <div className="flex items-center gap-1 p-2">
                {/* Filter icon - draggable */}
                <div className="drag-handle relative w-10 h-10 rounded-lg bg-[#4654CD] flex items-center justify-center cursor-grab active:cursor-grabbing">
                  <SlidersHorizontal className="w-5 h-5 text-white" />
                  {appliedFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-medium">
                      {appliedFiltersCount}
                    </span>
                  )}
                </div>
                {/* Expand button */}
                <button
                  onClick={() => setIsMinimized(false)}
                  className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <Maximize2 className="w-4 h-4 text-neutral-600" />
                </button>
              </div>
            ) : (
              /* Expanded: Full header */
              <div className="drag-handle flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-gradient-to-r from-[#4654CD]/5 to-transparent cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-2">
                  <GripHorizontal className="w-4 h-4 text-neutral-400" />
                  <SlidersHorizontal className="w-4 h-4 text-[#4654CD]" />
                  <span className="font-semibold text-neutral-800 text-sm">Filtros</span>
                  {appliedFiltersCount > 0 && (
                    <span className="w-5 h-5 bg-[#4654CD] text-white rounded-full text-xs flex items-center justify-center">
                      {appliedFiltersCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    className="w-7 h-7 min-w-0 cursor-pointer"
                    onPress={() => setIsMinimized(true)}
                  >
                    <Minus className="w-3.5 h-3.5 text-neutral-500" />
                  </Button>
                </div>
              </div>
            )}

            {/* Content - Collapsible */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardBody className="p-4 max-h-[70vh] overflow-y-auto">
                    {/* Clear All Button */}
                    {appliedFiltersCount > 0 && (
                      <Button
                        size="sm"
                        variant="light"
                        startContent={<Trash2 className="w-3.5 h-3.5" />}
                        onPress={onClearAll}
                        className="w-full mb-4 text-neutral-500 hover:text-red-500 cursor-pointer justify-start"
                      >
                        Limpiar todos los filtros
                      </Button>
                    )}

                    {/* Device Type Filter */}
                    <FilterSection title="Tipo de equipo" defaultExpanded={true}>
                      <div className="flex flex-wrap gap-2">
                        {deviceTypeOptions.map((opt) => {
                          const isSelected = filters.deviceTypes.includes(opt.value as CatalogDeviceType);
                          const Icon = deviceTypeIcons[opt.value];
                          return (
                            <Chip
                              key={opt.value}
                              size="sm"
                              radius="sm"
                              variant={isSelected ? 'solid' : 'bordered'}
                              startContent={Icon ? <Icon className="w-3.5 h-3.5" /> : null}
                              className={`cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-[#4654CD] text-white border-[#4654CD]'
                                  : 'bg-white text-neutral-700 hover:border-[#4654CD]'
                              }`}
                              onClick={() => {
                                const deviceType = opt.value as CatalogDeviceType;
                                if (filters.deviceTypes.includes(deviceType)) {
                                  updateFilter('deviceTypes', filters.deviceTypes.filter((d) => d !== deviceType));
                                } else {
                                  updateFilter('deviceTypes', [...filters.deviceTypes, deviceType]);
                                }
                              }}
                            >
                              {opt.label} ({opt.count})
                            </Chip>
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

                    {/* Usage Filter */}
                    <FilterSection title="Uso" defaultExpanded={false}>
                      <UsageFilter
                        options={usageOptions}
                        selected={filters.usage}
                        onChange={(usage) => updateFilter('usage', usage)}
                        showCounts={config.showFilterCounts}
                      />
                    </FilterSection>

                    {/* Gama Filter */}
                    <FilterSection title="Gama" defaultExpanded={false}>
                      <div className="flex flex-wrap gap-2">
                        {gamaOptions.map((opt) => {
                          const isSelected = filters.gama.includes(opt.value as GamaTier);
                          const colors = gamaColors[opt.value as GamaTier];
                          return (
                            <Chip
                              key={opt.value}
                              size="sm"
                              radius="sm"
                              variant={isSelected ? 'solid' : 'bordered'}
                              className={`cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-[#4654CD] text-white border-[#4654CD]'
                                  : `${colors.bg} ${colors.text} hover:border-[#4654CD]`
                              }`}
                              onClick={() => {
                                const gama = opt.value as GamaTier;
                                if (filters.gama.includes(gama)) {
                                  updateFilter('gama', filters.gama.filter((g) => g !== gama));
                                } else {
                                  updateFilter('gama', [...filters.gama, gama]);
                                }
                              }}
                            >
                              {opt.label} ({opt.count})
                            </Chip>
                          );
                        })}
                      </div>
                    </FilterSection>

                    {/* Condition Filter */}
                    <FilterSection title="Condición" defaultExpanded={false}>
                      <div className="space-y-2">
                        {conditionOptions.map((opt) => (
                          <label
                            key={opt.value}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer"
                          >
                            <Checkbox
                              isSelected={filters.condition.includes(opt.value as ProductCondition)}
                              onValueChange={() => {
                                const cond = opt.value as ProductCondition;
                                if (filters.condition.includes(cond)) {
                                  updateFilter('condition', filters.condition.filter((c) => c !== cond));
                                } else {
                                  updateFilter('condition', [...filters.condition, cond]);
                                }
                              }}
                              classNames={{
                                base: 'cursor-pointer',
                                wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD]',
                                icon: 'text-white',
                              }}
                            />
                            <span className="text-sm text-neutral-700 flex-1">{opt.label} ({opt.count})</span>
                          </label>
                        ))}
                      </div>
                    </FilterSection>

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
                        <div className="mt-3 space-y-4">
                          {/* RAM */}
                          <div>
                            <p className="text-xs font-medium text-neutral-500 mb-2">RAM</p>
                            <div className="space-y-1">
                              {ramOptions.map((opt) => (
                                <label key={opt.value} className="flex items-center gap-2 p-1.5 rounded hover:bg-neutral-50 cursor-pointer">
                                  <Checkbox
                                    size="sm"
                                    isSelected={filters.ram.includes(parseInt(opt.value))}
                                    onValueChange={() => {
                                      const ramVal = parseInt(opt.value);
                                      if (filters.ram.includes(ramVal)) {
                                        updateFilter('ram', filters.ram.filter((r) => r !== ramVal));
                                      } else {
                                        updateFilter('ram', [...filters.ram, ramVal]);
                                      }
                                    }}
                                    classNames={{
                                      wrapper: 'before:border-neutral-300 after:bg-[#4654CD]',
                                      icon: 'text-white',
                                    }}
                                  />
                                  <span className="text-sm text-neutral-700">{opt.label} ({opt.count})</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Storage */}
                          <div>
                            <p className="text-xs font-medium text-neutral-500 mb-2">Almacenamiento</p>
                            <div className="space-y-1">
                              {storageOptions.map((opt) => (
                                <label key={opt.value} className="flex items-center gap-2 p-1.5 rounded hover:bg-neutral-50 cursor-pointer">
                                  <Checkbox
                                    size="sm"
                                    isSelected={filters.storage.includes(parseInt(opt.value))}
                                    onValueChange={() => {
                                      const storageVal = parseInt(opt.value);
                                      if (filters.storage.includes(storageVal)) {
                                        updateFilter('storage', filters.storage.filter((s) => s !== storageVal));
                                      } else {
                                        updateFilter('storage', [...filters.storage, storageVal]);
                                      }
                                    }}
                                    classNames={{
                                      wrapper: 'before:border-neutral-300 after:bg-[#4654CD]',
                                      icon: 'text-white',
                                    }}
                                  />
                                  <span className="text-sm text-neutral-700">{opt.label} ({opt.count})</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Processor */}
                          <div>
                            <p className="text-xs font-medium text-neutral-500 mb-2">Procesador</p>
                            <div className="space-y-1 max-h-[150px] overflow-y-auto">
                              {processorModelOptions.map((opt) => (
                                <label key={opt.value} className="flex items-center gap-2 p-1.5 rounded hover:bg-neutral-50 cursor-pointer">
                                  <Checkbox
                                    size="sm"
                                    isSelected={filters.processorModel.includes(opt.value as ProcessorModel)}
                                    onValueChange={() => {
                                      const proc = opt.value as ProcessorModel;
                                      if (filters.processorModel.includes(proc)) {
                                        updateFilter('processorModel', filters.processorModel.filter((p) => p !== proc));
                                      } else {
                                        updateFilter('processorModel', [...filters.processorModel, proc]);
                                      }
                                    }}
                                    classNames={{
                                      wrapper: 'before:border-neutral-300 after:bg-[#4654CD]',
                                      icon: 'text-white',
                                    }}
                                  />
                                  <span className="text-sm text-neutral-700">{opt.label} ({opt.count})</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* GPU */}
                          <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
                            <span className="text-sm text-neutral-600">GPU dedicada</span>
                            <Switch
                              size="sm"
                              isSelected={filters.gpuType.includes('dedicated')}
                              onValueChange={(val) => updateFilter('gpuType', val ? ['dedicated'] : [])}
                              classNames={{
                                wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                              }}
                            />
                          </div>

                          {/* Display Size */}
                          <div>
                            <p className="text-xs font-medium text-neutral-500 mb-2">Tamaño de pantalla</p>
                            <div className="flex flex-wrap gap-2">
                              {displaySizeOptions.map((opt) => (
                                <Chip
                                  key={opt.value}
                                  size="sm"
                                  variant={filters.displaySize.includes(parseFloat(opt.value)) ? 'solid' : 'bordered'}
                                  className={`cursor-pointer ${
                                    filters.displaySize.includes(parseFloat(opt.value)) ? 'bg-[#4654CD] text-white' : ''
                                  }`}
                                  onClick={() => {
                                    const size = parseFloat(opt.value);
                                    if (filters.displaySize.includes(size)) {
                                      updateFilter('displaySize', filters.displaySize.filter((s) => s !== size));
                                    } else {
                                      updateFilter('displaySize', [...filters.displaySize, size]);
                                    }
                                  }}
                                >
                                  {opt.label} ({opt.count})
                                </Chip>
                              ))}
                            </div>
                          </div>

                          {/* Resolution */}
                          <div>
                            <p className="text-xs font-medium text-neutral-500 mb-2">Resolución</p>
                            <div className="space-y-1">
                              {resolutionOptions.map((opt) => (
                                <label key={opt.value} className="flex items-center gap-2 p-1.5 rounded hover:bg-neutral-50 cursor-pointer">
                                  <Checkbox
                                    size="sm"
                                    isSelected={filters.resolution.includes(opt.value as Resolution)}
                                    onValueChange={() => {
                                      const res = opt.value as Resolution;
                                      if (filters.resolution.includes(res)) {
                                        updateFilter('resolution', filters.resolution.filter((r) => r !== res));
                                      } else {
                                        updateFilter('resolution', [...filters.resolution, res]);
                                      }
                                    }}
                                    classNames={{
                                      wrapper: 'before:border-neutral-300 after:bg-[#4654CD]',
                                      icon: 'text-white',
                                    }}
                                  />
                                  <span className="text-sm text-neutral-700">{opt.label} ({opt.count})</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Display Type */}
                          <div>
                            <p className="text-xs font-medium text-neutral-500 mb-2">Tipo de pantalla</p>
                            <div className="space-y-1">
                              {displayTypeOptions.map((opt) => (
                                <label key={opt.value} className="flex items-center gap-2 p-1.5 rounded hover:bg-neutral-50 cursor-pointer">
                                  <Checkbox
                                    size="sm"
                                    isSelected={filters.displayType.includes(opt.value as DisplayType)}
                                    onValueChange={() => {
                                      const type = opt.value as DisplayType;
                                      if (filters.displayType.includes(type)) {
                                        updateFilter('displayType', filters.displayType.filter((t) => t !== type));
                                      } else {
                                        updateFilter('displayType', [...filters.displayType, type]);
                                      }
                                    }}
                                    classNames={{
                                      wrapper: 'before:border-neutral-300 after:bg-[#4654CD]',
                                      icon: 'text-white',
                                    }}
                                  />
                                  <span className="text-sm text-neutral-700">{opt.label.toUpperCase()} ({opt.count})</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Touch Screen */}
                          <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
                            <span className="text-sm text-neutral-600">Pantalla táctil</span>
                            <Switch
                              size="sm"
                              isSelected={filters.touchScreen === true}
                              onValueChange={(val) => updateFilter('touchScreen', val ? true : false)}
                              classNames={{
                                wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                              }}
                            />
                          </div>

                          {/* RAM Expandable */}
                          <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
                            <span className="text-sm text-neutral-600">RAM expandible</span>
                            <Switch
                              size="sm"
                              isSelected={filters.ramExpandable === true}
                              onValueChange={(val) => updateFilter('ramExpandable', val ? true : false)}
                              classNames={{
                                wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                              }}
                            />
                          </div>

                          {/* Backlit Keyboard */}
                          <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
                            <span className="text-sm text-neutral-600">Teclado retroiluminado</span>
                            <Switch
                              size="sm"
                              isSelected={filters.backlitKeyboard === true}
                              onValueChange={(val) => updateFilter('backlitKeyboard', val ? true : false)}
                              classNames={{
                                wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                              }}
                            />
                          </div>

                          {/* Numeric Keypad */}
                          <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
                            <span className="text-sm text-neutral-600">Teclado numérico</span>
                            <Switch
                              size="sm"
                              isSelected={filters.numericKeypad === true}
                              onValueChange={(val) => updateFilter('numericKeypad', val ? true : false)}
                              classNames={{
                                wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                              }}
                            />
                          </div>

                          {/* Fingerprint */}
                          <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
                            <span className="text-sm text-neutral-600">Lector de huella</span>
                            <Switch
                              size="sm"
                              isSelected={filters.fingerprint === true}
                              onValueChange={(val) => updateFilter('fingerprint', val ? true : false)}
                              classNames={{
                                wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                              }}
                            />
                          </div>

                          {/* Has Windows */}
                          <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
                            <span className="text-sm text-neutral-600">Con Windows</span>
                            <Switch
                              size="sm"
                              isSelected={filters.hasWindows === true}
                              onValueChange={(val) => updateFilter('hasWindows', val ? true : false)}
                              classNames={{
                                wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                              }}
                            />
                          </div>

                          {/* Thunderbolt */}
                          <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
                            <span className="text-sm text-neutral-600">Thunderbolt</span>
                            <Switch
                              size="sm"
                              isSelected={filters.hasThunderbolt === true}
                              onValueChange={(val) => updateFilter('hasThunderbolt', val ? true : false)}
                              classNames={{
                                wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                              }}
                            />
                          </div>

                          {/* Ethernet */}
                          <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
                            <span className="text-sm text-neutral-600">Puerto Ethernet</span>
                            <Switch
                              size="sm"
                              isSelected={filters.hasEthernet === true}
                              onValueChange={(val) => updateFilter('hasEthernet', val ? true : false)}
                              classNames={{
                                wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
