'use client';

/**
 * TechnicalFilters - Filtros de specs tecnicas
 *
 * Agrupa filtros de RAM, SSD, pantalla, procesador, GPU, etc.
 * Incluye tooltips explicativos para usuarios no tecnicos
 */

import React from 'react';
import { Checkbox, Switch } from '@nextui-org/react';
import { FilterSection } from './FilterSection';
import { filterTooltips, ramOptions, storageOptions, displaySizeOptions, resolutionOptions, processorBrandOptions, displayTypeOptions } from '../../../data/mockCatalogData';
import { FilterState } from '../../../types/catalog';

interface TechnicalFiltersProps {
  filters: FilterState;
  onChange: (filters: Partial<FilterState>) => void;
}

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

  return (
    <>
      {/* RAM */}
      <FilterSection title="RAM" tooltip={filterTooltips.ram}>
        <div className="space-y-2">
          {ramOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-neutral-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  isSelected={filters.ram.includes(Number(option.value))}
                  onValueChange={() =>
                    handleToggleArray('ram', Number(option.value), filters.ram)
                  }
                  classNames={{
                    base: 'cursor-pointer',
                    wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD] group-data-[selected=true]:after:bg-[#4654CD] before:transition-colors after:transition-all',
                    icon: 'text-white transition-opacity',
                  }}
                />
                <span className="text-sm text-neutral-700">{option.label}</span>
              </div>
              <span className="text-xs text-neutral-400">({option.count})</span>
            </label>
          ))}
          <div className="pt-2 border-t border-neutral-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                size="sm"
                isSelected={filters.ramExpandable === true}
                onValueChange={(val) =>
                  onChange({ ramExpandable: val ? true : null })
                }
                classNames={{
                  wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
                  thumb: 'bg-white shadow-md',
                }}
              />
              <span className="text-sm text-neutral-600">RAM expandible</span>
            </label>
          </div>
        </div>
      </FilterSection>

      {/* Storage */}
      <FilterSection title="Almacenamiento" tooltip={filterTooltips.ssd}>
        <div className="space-y-2">
          {storageOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-neutral-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  isSelected={filters.storage.includes(Number(option.value))}
                  onValueChange={() =>
                    handleToggleArray('storage', Number(option.value), filters.storage)
                  }
                  classNames={{
                    base: 'cursor-pointer',
                    wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD] group-data-[selected=true]:after:bg-[#4654CD] before:transition-colors after:transition-all',
                    icon: 'text-white transition-opacity',
                  }}
                />
                <span className="text-sm text-neutral-700">{option.label}</span>
              </div>
              <span className="text-xs text-neutral-400">({option.count})</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Display Size */}
      <FilterSection title="Tamano de pantalla" defaultExpanded={false}>
        <div className="space-y-2">
          {displaySizeOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-neutral-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  isSelected={filters.displaySize.includes(Number(option.value))}
                  onValueChange={() =>
                    handleToggleArray(
                      'displaySize',
                      Number(option.value),
                      filters.displaySize
                    )
                  }
                  classNames={{
                    base: 'cursor-pointer',
                    wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD] group-data-[selected=true]:after:bg-[#4654CD] before:transition-colors after:transition-all',
                    icon: 'text-white transition-opacity',
                  }}
                />
                <span className="text-sm text-neutral-700">{option.label}</span>
              </div>
              <span className="text-xs text-neutral-400">({option.count})</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Resolution */}
      <FilterSection title="Resolucion" tooltip={filterTooltips.resolution} defaultExpanded={false}>
        <div className="space-y-2">
          {resolutionOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-neutral-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  isSelected={filters.resolution.includes(option.value as any)}
                  onValueChange={() =>
                    handleToggleArray('resolution', option.value as any, filters.resolution)
                  }
                  classNames={{
                    base: 'cursor-pointer',
                    wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD] group-data-[selected=true]:after:bg-[#4654CD] before:transition-colors after:transition-all',
                    icon: 'text-white transition-opacity',
                  }}
                />
                <span className="text-sm text-neutral-700">{option.label}</span>
              </div>
              <span className="text-xs text-neutral-400">({option.count})</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Processor */}
      <FilterSection title="Procesador" tooltip={filterTooltips.processor} defaultExpanded={false}>
        <div className="space-y-2">
          {processorBrandOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-neutral-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  isSelected={filters.processorBrand.includes(option.value as any)}
                  onValueChange={() =>
                    handleToggleArray(
                      'processorBrand',
                      option.value as any,
                      filters.processorBrand
                    )
                  }
                  classNames={{
                    base: 'cursor-pointer',
                    wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD] group-data-[selected=true]:after:bg-[#4654CD] before:transition-colors after:transition-all',
                    icon: 'text-white transition-opacity',
                  }}
                />
                <span className="text-sm text-neutral-700">{option.label}</span>
              </div>
              <span className="text-xs text-neutral-400">({option.count})</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* GPU */}
      <FilterSection title="Tarjeta de video" tooltip={filterTooltips.gpu} defaultExpanded={false}>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-neutral-50">
            <Switch
              size="sm"
              isSelected={filters.gpuType.includes('dedicated')}
              onValueChange={(val) =>
                onChange({ gpuType: val ? ['dedicated'] : [] })
              }
              color="primary"
              classNames={{
                wrapper: 'group-data-[selected=true]:bg-[#4654CD]',
              }}
            />
            <span className="text-sm text-neutral-600">Solo con GPU dedicada</span>
          </label>
        </div>
      </FilterSection>

      {/* Additional Features */}
      <FilterSection title="Caracteristicas" defaultExpanded={false}>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-neutral-50">
            <Switch
              size="sm"
              isSelected={filters.touchScreen === true}
              onValueChange={(val) => onChange({ touchScreen: val ? true : null })}
              color="primary"
              classNames={{
                wrapper: 'group-data-[selected=true]:bg-[#4654CD]',
              }}
            />
            <span className="text-sm text-neutral-600">Pantalla tactil</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-neutral-50">
            <Switch
              size="sm"
              isSelected={filters.backlitKeyboard === true}
              onValueChange={(val) => onChange({ backlitKeyboard: val ? true : null })}
              color="primary"
              classNames={{
                wrapper: 'group-data-[selected=true]:bg-[#4654CD]',
              }}
            />
            <span className="text-sm text-neutral-600">Teclado retroiluminado</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-neutral-50">
            <Switch
              size="sm"
              isSelected={filters.numericKeypad === true}
              onValueChange={(val) => onChange({ numericKeypad: val ? true : null })}
              color="primary"
              classNames={{
                wrapper: 'group-data-[selected=true]:bg-[#4654CD]',
              }}
            />
            <span className="text-sm text-neutral-600">Teclado numerico</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-neutral-50">
            <Switch
              size="sm"
              isSelected={filters.fingerprint === true}
              onValueChange={(val) => onChange({ fingerprint: val ? true : null })}
              color="primary"
              classNames={{
                wrapper: 'group-data-[selected=true]:bg-[#4654CD]',
              }}
            />
            <span className="text-sm text-neutral-600">Lector de huella</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-neutral-50">
            <Switch
              size="sm"
              isSelected={filters.hasWindows === true}
              onValueChange={(val) => onChange({ hasWindows: val ? true : null })}
              color="primary"
              classNames={{
                wrapper: 'group-data-[selected=true]:bg-[#4654CD]',
              }}
            />
            <span className="text-sm text-neutral-600">Con Windows incluido</span>
          </label>
        </div>
      </FilterSection>

      {/* Connectivity */}
      <FilterSection title="Conectividad" defaultExpanded={false}>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-neutral-50">
            <Switch
              size="sm"
              isSelected={filters.hasThunderbolt === true}
              onValueChange={(val) => onChange({ hasThunderbolt: val ? true : null })}
              color="primary"
              classNames={{
                wrapper: 'group-data-[selected=true]:bg-[#4654CD]',
              }}
            />
            <span className="text-sm text-neutral-600">Thunderbolt</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-neutral-50">
            <Switch
              size="sm"
              isSelected={filters.hasEthernet === true}
              onValueChange={(val) => onChange({ hasEthernet: val ? true : null })}
              color="primary"
              classNames={{
                wrapper: 'group-data-[selected=true]:bg-[#4654CD]',
              }}
            />
            <span className="text-sm text-neutral-600">Puerto Ethernet</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-neutral-50">
            <Switch
              size="sm"
              isSelected={filters.hasSDCard === true}
              onValueChange={(val) => onChange({ hasSDCard: val ? true : null })}
              color="primary"
              classNames={{
                wrapper: 'group-data-[selected=true]:bg-[#4654CD]',
              }}
            />
            <span className="text-sm text-neutral-600">Lector SD</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-neutral-50">
            <Switch
              size="sm"
              isSelected={filters.hasHDMI === true}
              onValueChange={(val) => onChange({ hasHDMI: val ? true : null })}
              color="primary"
              classNames={{
                wrapper: 'group-data-[selected=true]:bg-[#4654CD]',
              }}
            />
            <span className="text-sm text-neutral-600">Puerto HDMI</span>
          </label>
        </div>
      </FilterSection>
    </>
  );
};

export default TechnicalFilters;
