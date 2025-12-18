'use client';

/**
 * QuotaRangeFilter - Slider de rango de cuota
 *
 * Filtro principal para estudiantes que piensan en cuotas
 * Incluye selector de frecuencia (semanal, quincenal, mensual)
 */

import React from 'react';
import { Slider, ButtonGroup, Button } from '@nextui-org/react';
import { QuotaFrequency } from '../../../types/catalog';

interface QuotaRangeFilterProps {
  min: number;
  max: number;
  value: [number, number];
  frequency: QuotaFrequency;
  onChange: (range: [number, number]) => void;
  onFrequencyChange: (frequency: QuotaFrequency) => void;
}

const frequencyLabels: Record<QuotaFrequency, string> = {
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
};

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

  return (
    <div className="space-y-4">
      {/* Frequency Selector */}
      <div>
        <label className="text-xs text-neutral-500 mb-2 block">Frecuencia de pago</label>
        <ButtonGroup size="sm" className="w-full">
          {(Object.keys(frequencyLabels) as QuotaFrequency[]).map((freq) => (
            <Button
              key={freq}
              className={`flex-1 cursor-pointer ${
                frequency === freq
                  ? 'bg-[#4654CD] text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
              onPress={() => onFrequencyChange(freq)}
            >
              {frequencyLabels[freq]}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {/* Slider */}
      <Slider
        label="Cuota"
        step={10}
        minValue={min}
        maxValue={max}
        value={value}
        onChange={(val) => onChange(val as [number, number])}
        classNames={{
          base: 'max-w-full',
          filler: 'bg-[#03DBD0]',
          thumb: 'bg-[#03DBD0] border-[#03DBD0]',
          track: 'bg-neutral-200',
          label: 'text-sm font-medium text-neutral-700',
          value: 'text-sm text-neutral-500',
        }}
      />
      <div className="flex justify-between text-sm">
        <span className="text-[#02C3BA] font-bold">{formatQuota(value[0])}/mes</span>
        <span className="text-neutral-400">-</span>
        <span className="text-[#02C3BA] font-bold">{formatQuota(value[1])}/mes</span>
      </div>
    </div>
  );
};

export default QuotaRangeFilter;
