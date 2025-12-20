'use client';

import React from 'react';
import { Checkbox, Switch, Chip } from '@nextui-org/react';
import { FilterSection } from './FilterSection';
import { FilterOption, GamaTier, ProductCondition, StockStatus } from '../../../types/catalog';

interface CommercialFiltersProps {
  // Gama
  gamaOptions: FilterOption[];
  selectedGama: GamaTier[];
  onGamaChange: (gama: GamaTier[]) => void;
  // Condition
  conditionOptions: FilterOption[];
  selectedCondition: ProductCondition[];
  onConditionChange: (condition: ProductCondition[]) => void;
  // Stock
  onlyAvailable: boolean;
  onAvailableChange: (value: boolean) => void;
  // Counts
  showCounts?: boolean;
}

const gamaColors: Record<GamaTier, { bg: string; text: string; border: string }> = {
  entry: { bg: 'bg-neutral-100', text: 'text-neutral-700', border: 'border-neutral-300' },
  media: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
  alta: { bg: 'bg-[#4654CD]/10', text: 'text-[#4654CD]', border: 'border-[#4654CD]' },
  premium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
};

export const CommercialFilters: React.FC<CommercialFiltersProps> = ({
  gamaOptions,
  selectedGama,
  onGamaChange,
  conditionOptions,
  selectedCondition,
  onConditionChange,
  onlyAvailable,
  onAvailableChange,
  showCounts = true,
}) => {
  const toggleGama = (gama: GamaTier) => {
    if (selectedGama.includes(gama)) {
      onGamaChange(selectedGama.filter((g) => g !== gama));
    } else {
      onGamaChange([...selectedGama, gama]);
    }
  };

  const toggleCondition = (condition: ProductCondition) => {
    if (selectedCondition.includes(condition)) {
      onConditionChange(selectedCondition.filter((c) => c !== condition));
    } else {
      onConditionChange([...selectedCondition, condition]);
    }
  };

  return (
    <div className="space-y-0">
      {/* Gama */}
      <FilterSection title="Gama" defaultExpanded={true}>
        <div className="flex flex-wrap gap-2">
          {gamaOptions.map((opt) => {
            const isSelected = selectedGama.includes(opt.value as GamaTier);
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
                    : `${colors.bg} ${colors.text} ${colors.border} hover:border-[#4654CD]`
                }`}
                classNames={{
                  base: 'px-3 py-1 h-auto',
                  content: 'text-xs font-medium',
                }}
                onClick={() => toggleGama(opt.value as GamaTier)}
              >
                {opt.label}
                {showCounts && <span className="ml-1 opacity-70">({opt.count})</span>}
              </Chip>
            );
          })}
        </div>
      </FilterSection>

      {/* Condition */}
      <FilterSection title="Condicion" defaultExpanded={true}>
        <div className="space-y-2">
          {conditionOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer"
            >
              <Checkbox
                isSelected={selectedCondition.includes(opt.value as ProductCondition)}
                onValueChange={() => toggleCondition(opt.value as ProductCondition)}
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

      {/* Stock */}
      <FilterSection title="Disponibilidad" defaultExpanded={true}>
        <div className="flex items-center justify-between p-2">
          <div>
            <span className="text-sm text-neutral-700">Solo disponibles ahora</span>
            <p className="text-xs text-neutral-400">Envio inmediato</p>
          </div>
          <Switch
            size="sm"
            isSelected={onlyAvailable}
            onValueChange={onAvailableChange}
            classNames={{
              base: 'cursor-pointer',
              wrapper: 'bg-neutral-300 group-data-[selected=true]:bg-[#4654CD]',
              thumb: 'bg-white shadow-md',
              hiddenInput: 'z-0',
            }}
          />
        </div>
      </FilterSection>
    </div>
  );
};
