'use client';

import React from 'react';
import { Checkbox } from '@nextui-org/react';
import {
  GraduationCap,
  Gamepad2,
  Palette,
  Briefcase,
  Code,
} from 'lucide-react';
import { UsageType, FilterOption } from '../../../types/catalog';

interface UsageFilterProps {
  options: FilterOption[];
  selected: UsageType[];
  onChange: (usage: UsageType[]) => void;
  showCounts?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  GraduationCap: <GraduationCap className="w-4 h-4" />,
  Gamepad2: <Gamepad2 className="w-4 h-4" />,
  Palette: <Palette className="w-4 h-4" />,
  Briefcase: <Briefcase className="w-4 h-4" />,
  Code: <Code className="w-4 h-4" />,
};

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
                wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD] group-data-[selected=true]:after:bg-[#4654CD] before:transition-colors after:transition-all',
                icon: 'text-white transition-opacity',
              }}
            />
            <div className="flex items-center gap-1.5 flex-1">
              <span
                className={`transition-colors ${
                  isSelected ? 'text-[#4654CD]' : 'text-neutral-500'
                }`}
              >
                {option.icon && iconMap[option.icon]}
              </span>
              <span
                className={`text-xs transition-colors ${
                  isSelected ? 'text-[#4654CD] font-medium' : 'text-neutral-700'
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
