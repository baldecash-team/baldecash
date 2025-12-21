'use client';

import React from 'react';
import { Slider } from '@nextui-org/react';

interface QuotaRangeFilterProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
}

export const QuotaRangeFilter: React.FC<QuotaRangeFilterProps> = ({
  value,
  onChange,
  min = 40,
  max = 400,
}) => {
  return (
    <div className="space-y-3">
      <Slider
        aria-label="Rango de cuota mensual"
        step={20}
        minValue={min}
        maxValue={max}
        value={value}
        onChange={(val) => {
          onChange(val as [number, number]);
        }}
        size="sm"
        classNames={{
          base: 'max-w-full',
          filler: 'bg-[#4654CD]/70',
          thumb: 'bg-white border-2 border-[#4654CD] w-4 h-4 shadow-lg cursor-pointer after:bg-[#4654CD] after:w-1.5 after:h-1.5',
          track: 'bg-neutral-200 h-1',
          label: 'text-xs font-medium text-neutral-600',
          value: 'text-xs text-neutral-500',
        }}
      />
      <div className="flex justify-between text-xs">
        <span className="text-neutral-700 font-medium">
          S/{value[0]}/mes
        </span>
        <span className="text-neutral-300">-</span>
        <span className="text-neutral-700 font-medium">
          S/{value[1]}/mes
        </span>
      </div>
    </div>
  );
};
