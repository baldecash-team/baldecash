'use client';

/**
 * CommercialFilters - Filtros comerciales
 *
 * Filtros de condicion, stock, y gama de producto
 */

import React from 'react';
import { Checkbox, Switch, Chip } from '@nextui-org/react';
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
        <div className="flex flex-wrap gap-2">
          {conditionOptions.map((option) => {
            const isSelected = filters.condition.includes(option.value as ProductCondition);
            return (
              <Chip
                key={option.value}
                variant={isSelected ? 'solid' : 'bordered'}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#4654CD] text-white border-[#4654CD]'
                    : 'border-neutral-300 text-neutral-600 hover:border-[#4654CD]'
                }`}
                onClick={() => handleToggleCondition(option.value as ProductCondition)}
              >
                {option.label} ({option.count})
              </Chip>
            );
          })}
        </div>
      </FilterSection>

      {/* Gama */}
      <FilterSection title="Gama">
        <div className="space-y-2">
          {gamaOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-neutral-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  isSelected={filters.gama.includes(option.value as GamaTier)}
                  onValueChange={() => handleToggleGama(option.value as GamaTier)}
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

      {/* Availability */}
      <FilterSection title="Disponibilidad">
        <label className="flex items-center gap-2 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-neutral-50">
          <Switch
            size="sm"
            isSelected={filters.availableNow}
            onValueChange={(val) => onChange({ availableNow: val })}
            classNames={{
              wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
              thumb: 'bg-white shadow-md',
            }}
          />
          <span className="text-sm text-neutral-600">Disponible ahora</span>
        </label>
        <p className="text-xs text-neutral-400 mt-1 px-2">
          Solo muestra laptops con stock disponible para entrega inmediata
        </p>
      </FilterSection>
    </>
  );
};

export default CommercialFilters;
