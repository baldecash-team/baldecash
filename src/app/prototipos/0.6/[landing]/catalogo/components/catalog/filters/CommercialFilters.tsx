'use client';

import React from 'react';
import { Checkbox, Chip } from '@nextui-org/react';
import { FilterSection } from './FilterSection';
import { FilterOption, GamaTier, ProductCondition } from '../../../types/catalog';

interface CommercialFiltersProps {
  // Gama
  gamaOptions: FilterOption[];
  selectedGama: GamaTier[];
  onGamaChange: (gama: GamaTier[]) => void;
  // Condition (optional - can be rendered via TechnicalFiltersStyled instead)
  conditionOptions?: FilterOption[];
  selectedCondition?: ProductCondition[];
  onConditionChange?: (condition: ProductCondition[]) => void;
  // Counts
  showCounts?: boolean;
}

const gamaColors: Record<GamaTier, { bg: string; text: string; border: string }> = {
  economica: { bg: 'bg-neutral-100', text: 'text-neutral-700', border: 'border-neutral-300' },
  estudiante: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
  profesional: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' },
  creativa: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
  gamer: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300' },
};

export const CommercialFilters: React.FC<CommercialFiltersProps> = ({
  gamaOptions,
  selectedGama,
  onGamaChange,
  conditionOptions,
  selectedCondition,
  onConditionChange,
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
    if (!selectedCondition || !onConditionChange) return;
    if (selectedCondition.includes(condition)) {
      onConditionChange(selectedCondition.filter((c) => c !== condition));
    } else {
      onConditionChange([...selectedCondition, condition]);
    }
  };

  const showCondition = conditionOptions && selectedCondition && onConditionChange;

  return (
    <div className="space-y-0">
      {/* Gama */}
      <FilterSection title="Gama" defaultExpanded={false}>
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
                {opt.label} ({opt.count})
              </Chip>
            );
          })}
        </div>
      </FilterSection>

      {/* Condition - only show if props are provided */}
      {showCondition && (
        <FilterSection title="Condición" defaultExpanded={false}>
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
                <span className="text-sm text-neutral-700 flex-1">{opt.label} ({opt.count})</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  );
};
