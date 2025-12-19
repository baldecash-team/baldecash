'use client';

/**
 * QuotaRangeFilter - Slider de rango de cuota
 *
 * Filtro principal para estudiantes que piensan en cuotas
 * Incluye selector de frecuencia multi-select (semanal, quincenal, mensual)
 */

import React from 'react';
import { Slider } from '@nextui-org/react';
import { Calendar, CalendarDays, CalendarRange, LucideIcon } from 'lucide-react';
import { QuotaFrequency } from '../../../types/catalog';

interface QuotaRangeFilterProps {
  min: number;
  max: number;
  value: [number, number];
  frequency: QuotaFrequency[];
  onChange: (range: [number, number]) => void;
  onFrequencyChange: (frequency: QuotaFrequency[]) => void;
}

interface FrequencyOption {
  value: QuotaFrequency;
  label: string;
  icon: LucideIcon;
}

const frequencyOptions: FrequencyOption[] = [
  { value: 'weekly', label: 'Semanal', icon: Calendar },
  { value: 'biweekly', label: 'Quincenal', icon: CalendarDays },
  { value: 'monthly', label: 'Mensual', icon: CalendarRange },
];

export const QuotaRangeFilter: React.FC<QuotaRangeFilterProps> = ({
  min,
  max,
  value,
  frequency,
  onChange,
  onFrequencyChange,
}) => {
  const formatQuota = (quota: number) => {
    return `S/${quota}`;
  };

  const handleToggle = (freq: QuotaFrequency) => {
    if (frequency.includes(freq)) {
      onFrequencyChange(frequency.filter((f) => f !== freq));
    } else {
      onFrequencyChange([...frequency, freq]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Frequency Selector - Multi-select grid */}
      <div>
        <label className="text-xs text-neutral-500 mb-2 block">Frecuencia de pago</label>
        <div className="grid grid-cols-3 gap-2">
          {frequencyOptions.map((option) => {
            const isSelected = frequency.includes(option.value);
            const IconComponent = option.icon;

            return (
              <button
                key={option.value}
                onClick={() => handleToggle(option.value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#4654CD] bg-[#4654CD] text-white'
                    : 'border-neutral-200 bg-white hover:border-[#4654CD]/50 text-neutral-700'
                }`}
              >
                <IconComponent
                  className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#4654CD]'}`}
                />
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slider */}
      <Slider
        label="Cuota"
        size="sm"
        step={10}
        minValue={min}
        maxValue={max}
        value={value}
        onChange={(val) => onChange(val as [number, number])}
        classNames={{
          base: 'max-w-full',
          filler: 'bg-[#4654CD]/70',
          thumb: 'bg-white border-2 border-[#4654CD] w-4 h-4 shadow-sm',
          track: 'bg-neutral-200 h-1',
          label: 'text-xs font-medium text-neutral-600',
          value: 'text-xs text-neutral-500',
        }}
      />
      <div className="flex justify-between text-xs">
        <span className="text-neutral-700 font-medium">{formatQuota(value[0])}/mes</span>
        <span className="text-neutral-300">-</span>
        <span className="text-neutral-700 font-medium">{formatQuota(value[1])}/mes</span>
      </div>
    </div>
  );
};

export default QuotaRangeFilter;
