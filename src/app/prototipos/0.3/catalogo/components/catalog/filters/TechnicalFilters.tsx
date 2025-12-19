'use client';

/**
 * TechnicalFilters - Filtros de specs tecnicas
 *
 * Agrupa filtros de RAM, SSD, pantalla, procesador, GPU, etc.
 * Usa formato de grid buttons uniforme con UsageFilter
 * Incluye tooltips explicativos para usuarios no tecnicos
 */

import React from 'react';
import { Switch } from '@nextui-org/react';
import { FilterSection } from './FilterSection';
import {
  filterTooltips,
  ramOptions,
  storageOptions,
  displaySizeOptions,
  resolutionOptions,
  processorBrandOptions,
  gpuTypeOptions,
  featureOptions,
  connectivityOptions,
} from '../../../data/mockCatalogData';
import { FilterState, GpuType } from '../../../types/catalog';

interface TechnicalFiltersProps {
  filters: FilterState;
  onChange: (filters: Partial<FilterState>) => void;
}

// Feature keys mapping
type FeatureKey = 'touchScreen' | 'backlitKeyboard' | 'numericKeypad' | 'fingerprint' | 'hasWindows';
type ConnectivityKey = 'hasThunderbolt' | 'hasEthernet' | 'hasSDCard' | 'hasHDMI';

export const TechnicalFilters: React.FC<TechnicalFiltersProps> = ({
  filters,
  onChange,
}) => {
  const handleToggleArray = <T extends string | number>(
    key: keyof FilterState,
    value: T,
    currentArray: T[]
  ) => {
    if (currentArray.includes(value)) {
      onChange({ [key]: currentArray.filter((v) => v !== value) });
    } else {
      onChange({ [key]: [...currentArray, value] });
    }
  };

  // Check if a feature is selected
  const isFeatureSelected = (key: FeatureKey): boolean => {
    return filters[key] === true;
  };

  // Toggle a feature
  const handleToggleFeature = (key: FeatureKey) => {
    onChange({ [key]: filters[key] === true ? null : true });
  };

  // Check if connectivity option is selected
  const isConnectivitySelected = (key: ConnectivityKey): boolean => {
    return filters[key] === true;
  };

  // Toggle connectivity option
  const handleToggleConnectivity = (key: ConnectivityKey) => {
    onChange({ [key]: filters[key] === true ? null : true });
  };

  return (
    <>
      {/* RAM */}
      <FilterSection title="RAM" tooltip={filterTooltips.ram}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {ramOptions.map((option) => {
              const isSelected = filters.ram.includes(Number(option.value));
              return (
                <button
                  key={option.value}
                  onClick={() =>
                    handleToggleArray('ram', Number(option.value), filters.ram)
                  }
                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#4654CD] bg-[#4654CD] text-white'
                      : 'border-neutral-200 bg-white hover:border-[#4654CD]/50 text-neutral-700'
                  }`}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                  <span
                    className={`text-xs ${
                      isSelected ? 'text-white/80' : 'text-neutral-400'
                    }`}
                  >
                    ({option.count})
                  </span>
                </button>
              );
            })}
          </div>
          <div className="pt-2 border-t border-neutral-100">
            <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-neutral-50">
              <Switch
                size="sm"
                isSelected={filters.ramExpandable === true}
                onValueChange={(val) =>
                  onChange({ ramExpandable: val ? true : null })
                }
                classNames={{
                  base: 'flex-shrink-0 cursor-pointer',
                  wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                  thumb: 'bg-white shadow-md',
                  hiddenInput: 'z-0',
                }}
              />
              <span className="text-sm text-neutral-600 truncate">Expandible</span>
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Storage */}
      <FilterSection title="Almacenamiento" tooltip={filterTooltips.ssd}>
        <div className="grid grid-cols-2 gap-2">
          {storageOptions.map((option) => {
            const isSelected = filters.storage.includes(Number(option.value));
            return (
              <button
                key={option.value}
                onClick={() =>
                  handleToggleArray('storage', Number(option.value), filters.storage)
                }
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#4654CD] bg-[#4654CD] text-white'
                    : 'border-neutral-200 bg-white hover:border-[#4654CD]/50 text-neutral-700'
                }`}
              >
                <span className="text-sm font-medium">{option.label}</span>
                <span
                  className={`text-xs ${
                    isSelected ? 'text-white/80' : 'text-neutral-400'
                  }`}
                >
                  ({option.count})
                </span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Display Size */}
      <FilterSection title="Pantalla" defaultExpanded={false}>
        <div className="grid grid-cols-2 gap-2">
          {displaySizeOptions.map((option) => {
            const isSelected = filters.displaySize.includes(Number(option.value));
            return (
              <button
                key={option.value}
                onClick={() =>
                  handleToggleArray(
                    'displaySize',
                    Number(option.value),
                    filters.displaySize
                  )
                }
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#4654CD] bg-[#4654CD] text-white'
                    : 'border-neutral-200 bg-white hover:border-[#4654CD]/50 text-neutral-700'
                }`}
              >
                <span className="text-sm font-medium">{option.label}</span>
                <span
                  className={`text-xs ${
                    isSelected ? 'text-white/80' : 'text-neutral-400'
                  }`}
                >
                  ({option.count})
                </span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Resolution */}
      <FilterSection
        title="Resolucion"
        tooltip={filterTooltips.resolution}
        defaultExpanded={false}
      >
        <div className="grid grid-cols-2 gap-2">
          {resolutionOptions.map((option) => {
            const isSelected = filters.resolution.includes(option.value as any);
            return (
              <button
                key={option.value}
                onClick={() =>
                  handleToggleArray(
                    'resolution',
                    option.value as any,
                    filters.resolution
                  )
                }
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#4654CD] bg-[#4654CD] text-white'
                    : 'border-neutral-200 bg-white hover:border-[#4654CD]/50 text-neutral-700'
                }`}
              >
                <span className="text-sm font-medium truncate">{option.label}</span>
                <span
                  className={`text-xs flex-shrink-0 ml-1 ${
                    isSelected ? 'text-white/80' : 'text-neutral-400'
                  }`}
                >
                  ({option.count})
                </span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Processor */}
      <FilterSection
        title="Procesador"
        tooltip={filterTooltips.processor}
        defaultExpanded={false}
      >
        <div className="grid grid-cols-2 gap-2">
          {processorBrandOptions.map((option) => {
            const isSelected = filters.processorBrand.includes(option.value as any);
            return (
              <button
                key={option.value}
                onClick={() =>
                  handleToggleArray(
                    'processorBrand',
                    option.value as any,
                    filters.processorBrand
                  )
                }
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#4654CD] bg-[#4654CD] text-white'
                    : 'border-neutral-200 bg-white hover:border-[#4654CD]/50 text-neutral-700'
                }`}
              >
                <span className="text-sm font-medium">{option.label}</span>
                <span
                  className={`text-xs ${
                    isSelected ? 'text-white/80' : 'text-neutral-400'
                  }`}
                >
                  ({option.count})
                </span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* GPU */}
      <FilterSection
        title="Tarjeta de video"
        tooltip={filterTooltips.gpu}
        defaultExpanded={false}
      >
        <div className="grid grid-cols-2 gap-2">
          {gpuTypeOptions.map((option) => {
            const isSelected = filters.gpuType.includes(option.value as GpuType);
            return (
              <button
                key={option.value}
                onClick={() =>
                  handleToggleArray('gpuType', option.value as GpuType, filters.gpuType)
                }
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#4654CD] bg-[#4654CD] text-white'
                    : 'border-neutral-200 bg-white hover:border-[#4654CD]/50 text-neutral-700'
                }`}
              >
                <span className="text-sm font-medium">{option.label}</span>
                <span
                  className={`text-xs ${
                    isSelected ? 'text-white/80' : 'text-neutral-400'
                  }`}
                >
                  ({option.count})
                </span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Additional Features */}
      <FilterSection title="Caracteristicas" defaultExpanded={false}>
        <div className="grid grid-cols-2 gap-2">
          {featureOptions.map((option) => {
            const isSelected = isFeatureSelected(option.value as FeatureKey);
            return (
              <button
                key={option.value}
                onClick={() => handleToggleFeature(option.value as FeatureKey)}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#4654CD] bg-[#4654CD] text-white'
                    : 'border-neutral-200 bg-white hover:border-[#4654CD]/50 text-neutral-700'
                }`}
              >
                <span className="text-sm font-medium truncate">{option.label}</span>
                <span
                  className={`text-xs flex-shrink-0 ml-1 ${
                    isSelected ? 'text-white/80' : 'text-neutral-400'
                  }`}
                >
                  ({option.count})
                </span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Connectivity */}
      <FilterSection title="Conectividad" defaultExpanded={false}>
        <div className="grid grid-cols-2 gap-2">
          {connectivityOptions.map((option) => {
            const isSelected = isConnectivitySelected(option.value as ConnectivityKey);
            return (
              <button
                key={option.value}
                onClick={() => handleToggleConnectivity(option.value as ConnectivityKey)}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#4654CD] bg-[#4654CD] text-white'
                    : 'border-neutral-200 bg-white hover:border-[#4654CD]/50 text-neutral-700'
                }`}
              >
                <span className="text-sm font-medium truncate">{option.label}</span>
                <span
                  className={`text-xs flex-shrink-0 ml-1 ${
                    isSelected ? 'text-white/80' : 'text-neutral-400'
                  }`}
                >
                  ({option.count})
                </span>
              </button>
            );
          })}
        </div>
      </FilterSection>
    </>
  );
};

export default TechnicalFilters;
