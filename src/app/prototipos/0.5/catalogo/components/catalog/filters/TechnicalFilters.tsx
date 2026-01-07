'use client';

import React from 'react';
import { Checkbox, Switch } from '@nextui-org/react';
import { FilterSection } from './FilterSection';
import { filterTooltips } from '../../../data/mockCatalogData';
import { FilterOption, Resolution, DisplayType, ProcessorModel } from '../../../types/catalog';

interface TechnicalFiltersProps {
  // RAM
  ramOptions: FilterOption[];
  selectedRam: number[];
  onRamChange: (ram: number[]) => void;
  ramExpandable: boolean | null;
  onRamExpandableChange: (value: boolean | null) => void;
  // Storage
  storageOptions: FilterOption[];
  selectedStorage: number[];
  onStorageChange: (storage: number[]) => void;
  // Display
  displaySizeOptions: FilterOption[];
  selectedDisplaySize: number[];
  onDisplaySizeChange: (sizes: number[]) => void;
  // Resolution
  resolutionOptions: FilterOption[];
  selectedResolution: Resolution[];
  onResolutionChange: (res: Resolution[]) => void;
  // Display Type
  displayTypeOptions: FilterOption[];
  selectedDisplayType: DisplayType[];
  onDisplayTypeChange: (types: DisplayType[]) => void;
  // Touch
  touchScreen: boolean | null;
  onTouchScreenChange: (value: boolean | null) => void;
  // Processor
  processorOptions: FilterOption[];
  selectedProcessor: ProcessorModel[];
  onProcessorChange: (models: ProcessorModel[]) => void;
  // GPU
  gpuDedicated: boolean | null;
  onGpuDedicatedChange: (value: boolean | null) => void;
  // Keyboard
  backlitKeyboard: boolean | null;
  onBacklitChange: (value: boolean | null) => void;
  numericKeypad: boolean | null;
  onNumericChange: (value: boolean | null) => void;
  // Security
  fingerprint: boolean | null;
  onFingerprintChange: (value: boolean | null) => void;
  // OS
  hasWindows: boolean | null;
  onWindowsChange: (value: boolean | null) => void;
  // Connectivity
  hasThunderbolt: boolean | null;
  onThunderboltChange: (value: boolean | null) => void;
  hasEthernet: boolean | null;
  onEthernetChange: (value: boolean | null) => void;
  // Counts
  showCounts?: boolean;
}

export const TechnicalFilters: React.FC<TechnicalFiltersProps> = ({
  ramOptions,
  selectedRam,
  onRamChange,
  ramExpandable,
  onRamExpandableChange,
  storageOptions,
  selectedStorage,
  onStorageChange,
  displaySizeOptions,
  selectedDisplaySize,
  onDisplaySizeChange,
  resolutionOptions,
  selectedResolution,
  onResolutionChange,
  displayTypeOptions,
  selectedDisplayType,
  onDisplayTypeChange,
  touchScreen,
  onTouchScreenChange,
  processorOptions,
  selectedProcessor,
  onProcessorChange,
  gpuDedicated,
  onGpuDedicatedChange,
  backlitKeyboard,
  onBacklitChange,
  numericKeypad,
  onNumericChange,
  fingerprint,
  onFingerprintChange,
  hasWindows,
  onWindowsChange,
  hasThunderbolt,
  onThunderboltChange,
  hasEthernet,
  onEthernetChange,
  showCounts = true,
}) => {
  const toggleArrayValue = <T,>(arr: T[], value: T, setter: (arr: T[]) => void) => {
    if (arr.includes(value)) {
      setter(arr.filter((v) => v !== value));
    } else {
      setter([...arr, value]);
    }
  };

  return (
    <div className="space-y-0">
      {/* RAM */}
      <FilterSection title="RAM" tooltip={filterTooltips.ram} defaultExpanded={false}>
        <div className="space-y-2">
          {ramOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer"
            >
              <Checkbox
                isSelected={selectedRam.includes(parseInt(opt.value))}
                onValueChange={() => toggleArrayValue(selectedRam, parseInt(opt.value), onRamChange)}
                classNames={{
                  base: 'cursor-pointer',
                  wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD] before:transition-colors after:transition-all',
                  icon: 'text-white transition-opacity',
                }}
              />
              <span className="text-sm text-neutral-700 flex-1">{opt.label}</span>
              {showCounts && <span className="text-xs text-neutral-400">({opt.count})</span>}
            </label>
          ))}
          <div className="flex items-center justify-between p-2 mt-2 border-t border-neutral-100">
            <span className="text-sm text-neutral-600">RAM expandible</span>
            <Switch
              size="sm"
              isSelected={ramExpandable === true}
              onValueChange={(val) => onRamExpandableChange(val ? true : null)}
              classNames={{
                base: 'cursor-pointer',
                wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                thumb: 'bg-white shadow-md',
                hiddenInput: 'z-0',
              }}
            />
          </div>
        </div>
      </FilterSection>

      {/* Storage */}
      <FilterSection title="Almacenamiento" tooltip={filterTooltips.ssd} defaultExpanded={false}>
        <div className="space-y-2">
          {storageOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer"
            >
              <Checkbox
                isSelected={selectedStorage.includes(parseInt(opt.value))}
                onValueChange={() => toggleArrayValue(selectedStorage, parseInt(opt.value), onStorageChange)}
                classNames={{
                  base: 'cursor-pointer',
                  wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD] before:transition-colors after:transition-all',
                  icon: 'text-white transition-opacity',
                }}
              />
              <span className="text-sm text-neutral-700 flex-1">{opt.label}</span>
              {showCounts && <span className="text-xs text-neutral-400">({opt.count})</span>}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Display Size */}
      <FilterSection title="Tamaño de pantalla" tooltip={filterTooltips.display} defaultExpanded={false}>
        <div className="space-y-2">
          {displaySizeOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer"
            >
              <Checkbox
                isSelected={selectedDisplaySize.includes(parseFloat(opt.value))}
                onValueChange={() => toggleArrayValue(selectedDisplaySize, parseFloat(opt.value), onDisplaySizeChange)}
                classNames={{
                  base: 'cursor-pointer',
                  wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD] before:transition-colors after:transition-all',
                  icon: 'text-white transition-opacity',
                }}
              />
              <span className="text-sm text-neutral-700 flex-1">{opt.label}</span>
              {showCounts && <span className="text-xs text-neutral-400">({opt.count})</span>}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Resolution */}
      <FilterSection title="Resolución" tooltip={filterTooltips.resolution} defaultExpanded={false}>
        <div className="space-y-2">
          {resolutionOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer"
            >
              <Checkbox
                isSelected={selectedResolution.includes(opt.value as Resolution)}
                onValueChange={() => toggleArrayValue(selectedResolution, opt.value as Resolution, onResolutionChange)}
                classNames={{
                  base: 'cursor-pointer',
                  wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD] before:transition-colors after:transition-all',
                  icon: 'text-white transition-opacity',
                }}
              />
              <span className="text-sm text-neutral-700 flex-1">{opt.label}</span>
              {showCounts && <span className="text-xs text-neutral-400">({opt.count})</span>}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Display Type */}
      <FilterSection title="Tipo de pantalla" defaultExpanded={false}>
        <div className="space-y-2">
          {displayTypeOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer"
            >
              <Checkbox
                isSelected={selectedDisplayType.includes(opt.value as DisplayType)}
                onValueChange={() => toggleArrayValue(selectedDisplayType, opt.value as DisplayType, onDisplayTypeChange)}
                classNames={{
                  base: 'cursor-pointer',
                  wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD] before:transition-colors after:transition-all',
                  icon: 'text-white transition-opacity',
                }}
              />
              <span className="text-sm text-neutral-700 flex-1">{opt.label.toUpperCase()}</span>
              {showCounts && <span className="text-xs text-neutral-400">({opt.count})</span>}
            </label>
          ))}
          <div className="flex items-center justify-between p-2 mt-2 border-t border-neutral-100">
            <span className="text-sm text-neutral-600">Pantalla táctil</span>
            <Switch
              size="sm"
              isSelected={touchScreen === true}
              onValueChange={(val) => onTouchScreenChange(val ? true : null)}
              classNames={{
                base: 'cursor-pointer',
                wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                thumb: 'bg-white shadow-md',
                hiddenInput: 'z-0',
              }}
            />
          </div>
        </div>
      </FilterSection>

      {/* Processor */}
      <FilterSection title="Procesador" tooltip={filterTooltips.processor} defaultExpanded={false}>
        <div className="space-y-2">
          {processorOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer"
            >
              <Checkbox
                isSelected={selectedProcessor.includes(opt.value as ProcessorModel)}
                onValueChange={() => toggleArrayValue(selectedProcessor, opt.value as ProcessorModel, onProcessorChange)}
                classNames={{
                  base: 'cursor-pointer',
                  wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD] before:transition-colors after:transition-all',
                  icon: 'text-white transition-opacity',
                }}
              />
              <span className="text-sm text-neutral-700 flex-1">{opt.label}</span>
              {showCounts && <span className="text-xs text-neutral-400">({opt.count})</span>}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* GPU */}
      <FilterSection title="Tarjeta de video" tooltip={filterTooltips.gpu} defaultExpanded={false}>
        <div className="flex items-center justify-between p-2">
          <span className="text-sm text-neutral-600">GPU dedicada</span>
          <Switch
            size="sm"
            isSelected={gpuDedicated === true}
            onValueChange={(val) => onGpuDedicatedChange(val ? true : null)}
            classNames={{
              base: 'cursor-pointer',
              wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
              thumb: 'bg-white shadow-md',
              hiddenInput: 'z-0',
            }}
          />
        </div>
      </FilterSection>

      {/* Keyboard & Security */}
      <FilterSection title="Teclado y seguridad" defaultExpanded={false}>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2">
            <span className="text-sm text-neutral-600">Teclado retroiluminado</span>
            <Switch
              size="sm"
              isSelected={backlitKeyboard === true}
              onValueChange={(val) => onBacklitChange(val ? true : null)}
              classNames={{
                base: 'cursor-pointer',
                wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                thumb: 'bg-white shadow-md',
                hiddenInput: 'z-0',
              }}
            />
          </div>
          <div className="flex items-center justify-between p-2">
            <span className="text-sm text-neutral-600">Teclado numerico</span>
            <Switch
              size="sm"
              isSelected={numericKeypad === true}
              onValueChange={(val) => onNumericChange(val ? true : null)}
              classNames={{
                base: 'cursor-pointer',
                wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                thumb: 'bg-white shadow-md',
                hiddenInput: 'z-0',
              }}
            />
          </div>
          <div className="flex items-center justify-between p-2">
            <span className="text-sm text-neutral-600">Lector de huella</span>
            <Switch
              size="sm"
              isSelected={fingerprint === true}
              onValueChange={(val) => onFingerprintChange(val ? true : null)}
              classNames={{
                base: 'cursor-pointer',
                wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                thumb: 'bg-white shadow-md',
                hiddenInput: 'z-0',
              }}
            />
          </div>
        </div>
      </FilterSection>

      {/* OS & Connectivity */}
      <FilterSection title="Sistema y conectividad" tooltip={filterTooltips.thunderbolt} defaultExpanded={false}>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2">
            <span className="text-sm text-neutral-600">Con Windows</span>
            <Switch
              size="sm"
              isSelected={hasWindows === true}
              onValueChange={(val) => onWindowsChange(val ? true : null)}
              classNames={{
                base: 'cursor-pointer',
                wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                thumb: 'bg-white shadow-md',
                hiddenInput: 'z-0',
              }}
            />
          </div>
          <div className="flex items-center justify-between p-2">
            <span className="text-sm text-neutral-600">Thunderbolt</span>
            <Switch
              size="sm"
              isSelected={hasThunderbolt === true}
              onValueChange={(val) => onThunderboltChange(val ? true : null)}
              classNames={{
                base: 'cursor-pointer',
                wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                thumb: 'bg-white shadow-md',
                hiddenInput: 'z-0',
              }}
            />
          </div>
          <div className="flex items-center justify-between p-2">
            <span className="text-sm text-neutral-600">Puerto Ethernet</span>
            <Switch
              size="sm"
              isSelected={hasEthernet === true}
              onValueChange={(val) => onEthernetChange(val ? true : null)}
              classNames={{
                base: 'cursor-pointer',
                wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                thumb: 'bg-white shadow-md',
                hiddenInput: 'z-0',
              }}
            />
          </div>
        </div>
      </FilterSection>
    </div>
  );
};
