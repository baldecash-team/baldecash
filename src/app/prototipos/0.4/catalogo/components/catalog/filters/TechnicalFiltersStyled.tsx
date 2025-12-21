'use client';

import React from 'react';
import { Checkbox, Switch, Chip } from '@nextui-org/react';
import { FilterSection } from './FilterSection';
import { filterTooltips } from '../../../data/mockCatalogData';
import {
  FilterOption,
  Resolution,
  DisplayType,
  ProcessorModel,
  ProductCondition,
  UsageType,
  TechnicalFiltersVersion
} from '../../../types/catalog';
import {
  Cpu,
  HardDrive,
  Monitor,
  Maximize,
  Layers,
  CheckCircle2,
  MemoryStick,
  Briefcase,
  Package,
  GraduationCap,
  Gamepad2,
  Palette,
  Code,
  PenTool
} from 'lucide-react';

// Define which filters to show
type FilterVisibility = 'all' | 'main' | 'advanced';
// main = Uso recomendado, Condición
// advanced = RAM, Almacenamiento, Tamaño pantalla, Resolución, Tipo pantalla, Procesador

interface TechnicalFiltersStyledProps {
  version: TechnicalFiltersVersion;
  // Which filters to show: 'all', 'main' (uso, condición), 'advanced' (ram, storage, etc.)
  showFilters?: FilterVisibility;
  // Usage
  usageOptions?: FilterOption[];
  selectedUsage?: UsageType[];
  onUsageChange?: (usage: UsageType[]) => void;
  // RAM
  ramOptions?: FilterOption[];
  selectedRam?: number[];
  onRamChange?: (ram: number[]) => void;
  // Storage
  storageOptions?: FilterOption[];
  selectedStorage?: number[];
  onStorageChange?: (storage: number[]) => void;
  // Display Size
  displaySizeOptions?: FilterOption[];
  selectedDisplaySize?: number[];
  onDisplaySizeChange?: (sizes: number[]) => void;
  // Resolution
  resolutionOptions?: FilterOption[];
  selectedResolution?: Resolution[];
  onResolutionChange?: (res: Resolution[]) => void;
  // Display Type
  displayTypeOptions?: FilterOption[];
  selectedDisplayType?: DisplayType[];
  onDisplayTypeChange?: (types: DisplayType[]) => void;
  // Condition
  conditionOptions?: FilterOption[];
  selectedCondition?: ProductCondition[];
  onConditionChange?: (condition: ProductCondition[]) => void;
  // Processor
  processorOptions?: FilterOption[];
  selectedProcessor?: ProcessorModel[];
  onProcessorChange?: (models: ProcessorModel[]) => void;
  // Counts
  showCounts?: boolean;
}

// Helper to toggle array values
const toggleArrayValue = <T,>(arr: T[], value: T, setter: (arr: T[]) => void) => {
  if (arr.includes(value)) {
    setter(arr.filter((v) => v !== value));
  } else {
    setter([...arr, value]);
  }
};

// ============================================
// VERSION 1: Checkboxes Clásicos
// ============================================
const TechnicalFiltersV1: React.FC<TechnicalFiltersStyledProps> = ({
  showFilters = 'all',
  usageOptions = [],
  selectedUsage = [],
  onUsageChange,
  ramOptions = [],
  selectedRam = [],
  onRamChange,
  storageOptions = [],
  selectedStorage = [],
  onStorageChange,
  displaySizeOptions = [],
  selectedDisplaySize = [],
  onDisplaySizeChange,
  resolutionOptions = [],
  selectedResolution = [],
  onResolutionChange,
  displayTypeOptions = [],
  selectedDisplayType = [],
  onDisplayTypeChange,
  conditionOptions = [],
  selectedCondition = [],
  onConditionChange,
  processorOptions = [],
  selectedProcessor = [],
  onProcessorChange,
  showCounts = true,
}) => {
  const showMain = showFilters === 'all' || showFilters === 'main';
  const showAdvanced = showFilters === 'all' || showFilters === 'advanced';

  return (
    <div className="space-y-0 bg-white">
      {/* Main Filters: Usage & Condition */}
      {showMain && usageOptions.length > 0 && onUsageChange && (
        <FilterSection title="Uso recomendado" tooltip={filterTooltips.usage} defaultExpanded={false}>
          <div className="space-y-2">
            {usageOptions.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer"
              >
                <Checkbox
                  isSelected={selectedUsage.includes(opt.value as UsageType)}
                  onValueChange={() => toggleArrayValue(selectedUsage, opt.value as UsageType, onUsageChange)}
                  classNames={{
                    base: 'cursor-pointer',
                    wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD]',
                    icon: 'text-white',
                  }}
                />
                <span className="text-sm text-neutral-700 flex-1">{opt.label}</span>
                {showCounts && <span className="text-xs text-neutral-400">({opt.count})</span>}
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {showMain && conditionOptions.length > 0 && onConditionChange && (
        <FilterSection title="Condición" tooltip={filterTooltips.condition} defaultExpanded={false}>
          <div className="space-y-2">
            {conditionOptions.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer"
              >
                <Checkbox
                  isSelected={selectedCondition.includes(opt.value as ProductCondition)}
                  onValueChange={() => toggleArrayValue(selectedCondition, opt.value as ProductCondition, onConditionChange)}
                  classNames={{
                    base: 'cursor-pointer',
                    wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD]',
                    icon: 'text-white',
                  }}
                />
                <span className="text-sm text-neutral-700 flex-1">{opt.label}</span>
                {showCounts && <span className="text-xs text-neutral-400">({opt.count})</span>}
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Advanced Filters */}
      {showAdvanced && ramOptions.length > 0 && onRamChange && (
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
                    wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD]',
                    icon: 'text-white',
                  }}
                />
                <span className="text-sm text-neutral-700 flex-1">{opt.label}</span>
                {showCounts && <span className="text-xs text-neutral-400">({opt.count})</span>}
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {showAdvanced && storageOptions.length > 0 && onStorageChange && (
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
                    wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD]',
                    icon: 'text-white',
                  }}
                />
                <span className="text-sm text-neutral-700 flex-1">{opt.label}</span>
                {showCounts && <span className="text-xs text-neutral-400">({opt.count})</span>}
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {showAdvanced && displaySizeOptions.length > 0 && onDisplaySizeChange && (
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
                    wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD]',
                    icon: 'text-white',
                  }}
                />
                <span className="text-sm text-neutral-700 flex-1">{opt.label}</span>
                {showCounts && <span className="text-xs text-neutral-400">({opt.count})</span>}
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {showAdvanced && resolutionOptions.length > 0 && onResolutionChange && (
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
                    wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD]',
                    icon: 'text-white',
                  }}
                />
                <span className="text-sm text-neutral-700 flex-1">{opt.label}</span>
                {showCounts && <span className="text-xs text-neutral-400">({opt.count})</span>}
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {showAdvanced && displayTypeOptions.length > 0 && onDisplayTypeChange && (
        <FilterSection title="Tipo de pantalla" tooltip={filterTooltips.displayType} defaultExpanded={false}>
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
                    wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD]',
                    icon: 'text-white',
                  }}
                />
                <span className="text-sm text-neutral-700 flex-1">{opt.label.toUpperCase()}</span>
                {showCounts && <span className="text-xs text-neutral-400">({opt.count})</span>}
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {showAdvanced && processorOptions.length > 0 && onProcessorChange && (
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
                    wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD]',
                    icon: 'text-white',
                  }}
                />
                <span className="text-sm text-neutral-700 flex-1">{opt.label}</span>
                {showCounts && <span className="text-xs text-neutral-400">({opt.count})</span>}
              </label>
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  );
};

// ============================================
// VERSION 2: Chips Compactos
// ============================================
const TechnicalFiltersV2: React.FC<TechnicalFiltersStyledProps> = ({
  showFilters = 'all',
  usageOptions = [],
  selectedUsage = [],
  onUsageChange,
  ramOptions = [],
  selectedRam = [],
  onRamChange,
  storageOptions = [],
  selectedStorage = [],
  onStorageChange,
  displaySizeOptions = [],
  selectedDisplaySize = [],
  onDisplaySizeChange,
  resolutionOptions = [],
  selectedResolution = [],
  onResolutionChange,
  displayTypeOptions = [],
  selectedDisplayType = [],
  onDisplayTypeChange,
  conditionOptions = [],
  selectedCondition = [],
  onConditionChange,
  processorOptions = [],
  selectedProcessor = [],
  onProcessorChange,
  showCounts = true,
}) => {
  const showMain = showFilters === 'all' || showFilters === 'main';
  const showAdvanced = showFilters === 'all' || showFilters === 'advanced';

  const ChipFilter = ({
    title,
    tooltip,
    options,
    selected,
    onToggle,
    parseValue = (v: string) => v
  }: {
    title: string;
    tooltip?: any;
    options: FilterOption[];
    selected: any[];
    onToggle: (value: any) => void;
    parseValue?: (v: string) => any;
  }) => (
    <FilterSection title={title} tooltip={tooltip} defaultExpanded={false}>
      <div className="flex flex-wrap gap-2 bg-white">
        {options.map((opt) => {
          const value = parseValue(opt.value);
          const isSelected = selected.includes(value);
          return (
            <Chip
              key={opt.value}
              size="sm"
              radius="md"
              variant={isSelected ? 'solid' : 'bordered'}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-[#4654CD] text-white border-[#4654CD] shadow-sm'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-[#4654CD] hover:text-[#4654CD]'
              }`}
              classNames={{
                base: 'px-3 py-1.5 h-auto',
                content: 'text-xs font-medium',
              }}
              onClick={() => onToggle(value)}
            >
              {opt.label}
              {showCounts && (
                <span className={`ml-1 ${isSelected ? 'opacity-80' : 'opacity-50'}`}>
                  ({opt.count})
                </span>
              )}
            </Chip>
          );
        })}
      </div>
    </FilterSection>
  );

  return (
    <div className="space-y-0 bg-white">
      {/* Main Filters */}
      {showMain && usageOptions.length > 0 && onUsageChange && (
        <ChipFilter
          title="Uso recomendado"
          tooltip={filterTooltips.usage}
          options={usageOptions}
          selected={selectedUsage}
          onToggle={(val) => toggleArrayValue(selectedUsage, val as UsageType, onUsageChange)}
        />
      )}
      {showMain && conditionOptions.length > 0 && onConditionChange && (
        <ChipFilter
          title="Condición"
          tooltip={filterTooltips.condition}
          options={conditionOptions}
          selected={selectedCondition}
          onToggle={(val) => toggleArrayValue(selectedCondition, val as ProductCondition, onConditionChange)}
        />
      )}
      {/* Advanced Filters */}
      {showAdvanced && ramOptions.length > 0 && onRamChange && (
        <ChipFilter
          title="RAM"
          tooltip={filterTooltips.ram}
          options={ramOptions}
          selected={selectedRam}
          onToggle={(val) => toggleArrayValue(selectedRam, val, onRamChange)}
          parseValue={(v) => parseInt(v)}
        />
      )}
      {showAdvanced && storageOptions.length > 0 && onStorageChange && (
        <ChipFilter
          title="Almacenamiento"
          tooltip={filterTooltips.ssd}
          options={storageOptions}
          selected={selectedStorage}
          onToggle={(val) => toggleArrayValue(selectedStorage, val, onStorageChange)}
          parseValue={(v) => parseInt(v)}
        />
      )}
      {showAdvanced && displaySizeOptions.length > 0 && onDisplaySizeChange && (
        <ChipFilter
          title="Tamaño de pantalla"
          tooltip={filterTooltips.display}
          options={displaySizeOptions}
          selected={selectedDisplaySize}
          onToggle={(val) => toggleArrayValue(selectedDisplaySize, val, onDisplaySizeChange)}
          parseValue={(v) => parseFloat(v)}
        />
      )}
      {showAdvanced && resolutionOptions.length > 0 && onResolutionChange && (
        <ChipFilter
          title="Resolución"
          tooltip={filterTooltips.resolution}
          options={resolutionOptions}
          selected={selectedResolution}
          onToggle={(val) => toggleArrayValue(selectedResolution, val as Resolution, onResolutionChange)}
        />
      )}
      {showAdvanced && displayTypeOptions.length > 0 && onDisplayTypeChange && (
        <ChipFilter
          title="Tipo de pantalla"
          tooltip={filterTooltips.displayType}
          options={displayTypeOptions.map(o => ({ ...o, label: o.label.toUpperCase() }))}
          selected={selectedDisplayType}
          onToggle={(val) => toggleArrayValue(selectedDisplayType, val as DisplayType, onDisplayTypeChange)}
        />
      )}
      {showAdvanced && processorOptions.length > 0 && onProcessorChange && (
        <ChipFilter
          title="Procesador"
          tooltip={filterTooltips.processor}
          options={processorOptions}
          selected={selectedProcessor}
          onToggle={(val) => toggleArrayValue(selectedProcessor, val as ProcessorModel, onProcessorChange)}
        />
      )}
    </div>
  );
};

// ============================================
// VERSION 3: Cards con Iconos
// ============================================
// Mapping of usage types to specific icons
const usageIconMap: Record<string, React.ElementType> = {
  estudiante: GraduationCap,
  oficina: Briefcase,
  gaming: Gamepad2,
  diseño: Palette,
  programacion: Code,
  creativo: PenTool,
};

// Mapping of condition types to specific icons
const conditionIconMap: Record<string, React.ElementType> = {
  nuevo: Package,
  reacondicionado: CheckCircle2,
};

const TechnicalFiltersV3: React.FC<TechnicalFiltersStyledProps> = ({
  showFilters = 'all',
  usageOptions = [],
  selectedUsage = [],
  onUsageChange,
  ramOptions = [],
  selectedRam = [],
  onRamChange,
  storageOptions = [],
  selectedStorage = [],
  onStorageChange,
  displaySizeOptions = [],
  selectedDisplaySize = [],
  onDisplaySizeChange,
  resolutionOptions = [],
  selectedResolution = [],
  onResolutionChange,
  displayTypeOptions = [],
  selectedDisplayType = [],
  onDisplayTypeChange,
  conditionOptions = [],
  selectedCondition = [],
  onConditionChange,
  processorOptions = [],
  selectedProcessor = [],
  onProcessorChange,
  showCounts = true,
}) => {
  const showMain = showFilters === 'all' || showFilters === 'main';
  const showAdvanced = showFilters === 'all' || showFilters === 'advanced';

  // Special card filter with per-option icons
  const IconCardFilterWithMapping = ({
    title,
    tooltip,
    iconMap,
    defaultIcon,
    options,
    selected,
    onToggle,
    parseValue = (v: string) => v,
    columns = 2
  }: {
    title: string;
    tooltip?: any;
    iconMap: Record<string, React.ElementType>;
    defaultIcon: React.ElementType;
    options: FilterOption[];
    selected: any[];
    onToggle: (value: any) => void;
    parseValue?: (v: string) => any;
    columns?: number;
  }) => (
    <FilterSection title={title} tooltip={tooltip} defaultExpanded={false}>
      <div className={`grid gap-2 bg-white ${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {options.map((opt) => {
          const value = parseValue(opt.value);
          const isSelected = selected.includes(value);
          const Icon = iconMap[opt.value] || defaultIcon;
          return (
            <button
              key={opt.value}
              onClick={() => onToggle(value)}
              className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-[#4654CD]/10 border-[#4654CD] shadow-sm'
                  : 'bg-white border-neutral-200 hover:border-[#4654CD]/50 hover:bg-neutral-50'
              }`}
            >
              {isSelected && (
                <div className="absolute top-1.5 right-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#4654CD]" />
                </div>
              )}
              <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-[#4654CD]' : 'text-neutral-400'}`} />
              <span className={`text-xs font-medium text-center leading-tight ${isSelected ? 'text-[#4654CD]' : 'text-neutral-700'}`}>
                {opt.label}
              </span>
              {showCounts && (
                <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-[#4654CD]/70' : 'text-neutral-400'}`}>
                  {opt.count} equipos
                </span>
              )}
            </button>
          );
        })}
      </div>
    </FilterSection>
  );

  const IconCardFilter = ({
    title,
    tooltip,
    icon: Icon,
    options,
    selected,
    onToggle,
    parseValue = (v: string) => v,
    columns = 2
  }: {
    title: string;
    tooltip?: any;
    icon: React.ElementType;
    options: FilterOption[];
    selected: any[];
    onToggle: (value: any) => void;
    parseValue?: (v: string) => any;
    columns?: number;
  }) => (
    <FilterSection title={title} tooltip={tooltip} defaultExpanded={false}>
      <div className={`grid gap-2 bg-white ${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {options.map((opt) => {
          const value = parseValue(opt.value);
          const isSelected = selected.includes(value);
          return (
            <button
              key={opt.value}
              onClick={() => onToggle(value)}
              className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-[#4654CD]/10 border-[#4654CD] shadow-sm'
                  : 'bg-white border-neutral-200 hover:border-[#4654CD]/50 hover:bg-neutral-50'
              }`}
            >
              {isSelected && (
                <div className="absolute top-1.5 right-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#4654CD]" />
                </div>
              )}
              <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-[#4654CD]' : 'text-neutral-400'}`} />
              <span className={`text-xs font-medium text-center leading-tight ${isSelected ? 'text-[#4654CD]' : 'text-neutral-700'}`}>
                {opt.label}
              </span>
              {showCounts && (
                <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-[#4654CD]/70' : 'text-neutral-400'}`}>
                  {opt.count} equipos
                </span>
              )}
            </button>
          );
        })}
      </div>
    </FilterSection>
  );

  return (
    <div className="space-y-0 bg-white">
      {/* Main Filters */}
      {showMain && usageOptions.length > 0 && onUsageChange && (
        <IconCardFilterWithMapping
          title="Uso recomendado"
          tooltip={filterTooltips.usage}
          iconMap={usageIconMap}
          defaultIcon={Briefcase}
          options={usageOptions}
          selected={selectedUsage}
          onToggle={(val) => toggleArrayValue(selectedUsage, val as UsageType, onUsageChange)}
        />
      )}
      {showMain && conditionOptions.length > 0 && onConditionChange && (
        <IconCardFilterWithMapping
          title="Condición"
          tooltip={filterTooltips.condition}
          iconMap={conditionIconMap}
          defaultIcon={Package}
          options={conditionOptions}
          selected={selectedCondition}
          onToggle={(val) => toggleArrayValue(selectedCondition, val as ProductCondition, onConditionChange)}
        />
      )}
      {/* Advanced Filters */}
      {showAdvanced && ramOptions.length > 0 && onRamChange && (
        <IconCardFilter
          title="RAM"
          tooltip={filterTooltips.ram}
          icon={MemoryStick}
          options={ramOptions}
          selected={selectedRam}
          onToggle={(val) => toggleArrayValue(selectedRam, val, onRamChange)}
          parseValue={(v) => parseInt(v)}
        />
      )}
      {showAdvanced && storageOptions.length > 0 && onStorageChange && (
        <IconCardFilter
          title="Almacenamiento"
          tooltip={filterTooltips.ssd}
          icon={HardDrive}
          options={storageOptions}
          selected={selectedStorage}
          onToggle={(val) => toggleArrayValue(selectedStorage, val, onStorageChange)}
          parseValue={(v) => parseInt(v)}
        />
      )}
      {showAdvanced && displaySizeOptions.length > 0 && onDisplaySizeChange && (
        <IconCardFilter
          title="Tamaño de pantalla"
          tooltip={filterTooltips.display}
          icon={Monitor}
          options={displaySizeOptions}
          selected={selectedDisplaySize}
          onToggle={(val) => toggleArrayValue(selectedDisplaySize, val, onDisplaySizeChange)}
          parseValue={(v) => parseFloat(v)}
          columns={3}
        />
      )}
      {showAdvanced && resolutionOptions.length > 0 && onResolutionChange && (
        <IconCardFilter
          title="Resolución"
          tooltip={filterTooltips.resolution}
          icon={Maximize}
          options={resolutionOptions}
          selected={selectedResolution}
          onToggle={(val) => toggleArrayValue(selectedResolution, val as Resolution, onResolutionChange)}
        />
      )}
      {showAdvanced && displayTypeOptions.length > 0 && onDisplayTypeChange && (
        <IconCardFilter
          title="Tipo de pantalla"
          tooltip={filterTooltips.displayType}
          icon={Layers}
          options={displayTypeOptions.map(o => ({ ...o, label: o.label.toUpperCase() }))}
          selected={selectedDisplayType}
          onToggle={(val) => toggleArrayValue(selectedDisplayType, val as DisplayType, onDisplayTypeChange)}
        />
      )}
      {showAdvanced && processorOptions.length > 0 && onProcessorChange && (
        <IconCardFilter
          title="Procesador"
          tooltip={filterTooltips.processor}
          icon={Cpu}
          options={processorOptions}
          selected={selectedProcessor}
          onToggle={(val) => toggleArrayValue(selectedProcessor, val as ProcessorModel, onProcessorChange)}
          columns={2}
        />
      )}
    </div>
  );
};

// ============================================
// MAIN COMPONENT: Export based on version
// ============================================
export const TechnicalFiltersStyled: React.FC<TechnicalFiltersStyledProps> = (props) => {
  switch (props.version) {
    case 2:
      return <TechnicalFiltersV2 {...props} />;
    case 3:
      return <TechnicalFiltersV3 {...props} />;
    default:
      return <TechnicalFiltersV1 {...props} />;
  }
};

export { TechnicalFiltersV1, TechnicalFiltersV2, TechnicalFiltersV3 };
