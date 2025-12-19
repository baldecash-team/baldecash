'use client';

/**
 * CommercialFilters - Filtros comerciales
 *
 * Filtros de condicion, stock, y gama de producto
 */

import React from 'react';
import { CustomSwitch } from '@/app/prototipos/_shared/components/CustomSwitch';
import { FilterSection } from './FilterSection';
import { conditionOptions, gamaOptions } from '../../../data/mockCatalogData';
import { FilterState, ProductCondition, GamaTier } from '../../../types/catalog';

interface CommercialFiltersProps {
  filters: FilterState;
  onChange: (filters: Partial<FilterState>) => void;
}

export const CommercialFilters: React.FC<CommercialFiltersProps> = ({
  filters,
  onChange,
}) => {
  const handleToggleCondition = (value: ProductCondition) => {
    if (filters.condition.includes(value)) {
      onChange({ condition: filters.condition.filter((v) => v !== value) });
    } else {
      onChange({ condition: [...filters.condition, value] });
    }
  };

  const handleToggleGama = (value: GamaTier) => {
    if (filters.gama.includes(value)) {
      onChange({ gama: filters.gama.filter((v) => v !== value) });
    } else {
      onChange({ gama: [...filters.gama, value] });
    }
  };

  return (
    <>
      {/* Condition */}
      <FilterSection title="Condicion">
        <div className="grid grid-cols-2 gap-2">
          {conditionOptions.map((option) => {
            const isSelected = filters.condition.includes(option.value as ProductCondition);
            return (
              <button
                key={option.value}
                onClick={() => handleToggleCondition(option.value as ProductCondition)}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer overflow-hidden ${
                  isSelected
                    ? 'border-[#4654CD] bg-[#4654CD] text-white'
                    : 'border-neutral-200 bg-white hover:border-[#4654CD]/50 text-neutral-700'
                }`}
              >
                <span className="text-sm font-medium truncate flex-1 text-left" title={option.label}>{option.label}</span>
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

      {/* Gama */}
      <FilterSection title="Gama">
        <div className="grid grid-cols-2 gap-2">
          {gamaOptions.map((option) => {
            const isSelected = filters.gama.includes(option.value as GamaTier);
            return (
              <button
                key={option.value}
                onClick={() => handleToggleGama(option.value as GamaTier)}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer overflow-hidden ${
                  isSelected
                    ? 'border-[#4654CD] bg-[#4654CD] text-white'
                    : 'border-neutral-200 bg-white hover:border-[#4654CD]/50 text-neutral-700'
                }`}
              >
                <span className="text-sm font-medium truncate flex-1 text-left" title={option.label}>{option.label}</span>
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

      {/* Availability */}
      <FilterSection title="Disponibilidad">
        <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-neutral-50 border border-neutral-200">
          <CustomSwitch
            defaultSelected
            size="sm"
            color="primary"
            aria-label="Disponible ahora"
            onValueChange={(val) => onChange({ availableNow: val })}
          />
          <div className="flex-1 min-w-0">
            <span className="text-sm text-neutral-700 font-medium block">Disponible ahora</span>
            <span className="text-xs text-neutral-400 block truncate">Stock para entrega inmediata</span>
          </div>
        </div>
      </FilterSection>
    </>
  );
};

export default CommercialFilters;
