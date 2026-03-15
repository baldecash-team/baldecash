'use client';

import React from 'react';
import { Checkbox } from '@nextui-org/react';
import { UsageType, FilterOption } from '../../../types/catalog';
import { getUsageIcon, defaultUsageIcon } from '../iconRegistry';

interface UsageFilterProps {
  options: FilterOption[];
  selected: UsageType[];
  onChange: (usage: UsageType[]) => void;
  showCounts?: boolean;
}

export const UsageFilter: React.FC<UsageFilterProps> = ({
  options,
  selected,
  onChange,
  showCounts = true,
}) => {
  const handleToggle = (value: UsageType) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-1 bg-white">
      {options.map((option) => {
        const isSelected = selected.includes(option.value as UsageType);
        const Icon = getUsageIcon(option.value);

        return (
          <label
            key={option.value}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors group"
          >
            <Checkbox
              isSelected={isSelected}
              onValueChange={() => handleToggle(option.value as UsageType)}
              classNames={{
                base: 'cursor-pointer',
                wrapper: 'before:border-2 before:border-neutral-300 after:bg-[var(--color-primary)] group-data-[selected=true]:after:bg-[var(--color-primary)] before:transition-colors after:transition-all',
                icon: 'text-white transition-opacity',
              }}
            />
            <div className="flex items-center gap-1.5 flex-1">
              <span
                className={`transition-colors ${
                  isSelected ? 'text-[var(--color-primary)]' : 'text-neutral-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </span>
              <span
                className={`text-xs transition-colors ${
                  isSelected ? 'text-[var(--color-primary)] font-medium' : 'text-neutral-700'
                }`}
              >
                {option.label}
              </span>
            </div>
            {showCounts && (
              <span className="text-xs text-neutral-400">({option.count})</span>
            )}
          </label>
        );
      })}
    </div>
  );
};
