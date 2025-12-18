'use client';

/**
 * UsageFilter - Filtro de uso recomendado
 *
 * Traduce specs tecnicas a beneficios comprensibles
 * Usa iconos para mejor reconocimiento visual
 */

import React from 'react';
import {
  GraduationCap,
  Gamepad2,
  Palette,
  Briefcase,
  Code2,
  LucideIcon,
} from 'lucide-react';
import { FilterOption, UsageType } from '../../../types/catalog';

interface UsageFilterProps {
  options: FilterOption[];
  selected: UsageType[];
  onChange: (usage: UsageType[]) => void;
}

// Mapear por valor de uso (más confiable que por string de icono)
const usageIconMap: Record<string, LucideIcon> = {
  estudios: GraduationCap,
  gaming: Gamepad2,
  diseno: Palette,
  oficina: Briefcase,
  programacion: Code2,
};

export const UsageFilter: React.FC<UsageFilterProps> = ({
  options,
  selected,
  onChange,
}) => {
  const handleToggle = (value: string) => {
    const usageValue = value as UsageType;
    if (selected.includes(usageValue)) {
      onChange(selected.filter((v) => v !== usageValue));
    } else {
      onChange([...selected, usageValue]);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.value as UsageType);
        const IconComponent = usageIconMap[option.value];

        return (
          <button
            key={option.value}
            onClick={() => handleToggle(option.value)}
            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${
              isSelected
                ? 'border-[#4654CD] bg-[#4654CD] text-white'
                : 'border-neutral-200 bg-white hover:border-[#4654CD]/50 text-neutral-700'
            }`}
          >
            {IconComponent && (
              <IconComponent
                className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#4654CD]'}`}
              />
            )}
            <div className="flex-1 text-left">
              <span className="text-sm font-medium">{option.label}</span>
              <span
                className={`text-xs block ${
                  isSelected ? 'text-white/80' : 'text-neutral-400'
                }`}
              >
                ({option.count})
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default UsageFilter;
