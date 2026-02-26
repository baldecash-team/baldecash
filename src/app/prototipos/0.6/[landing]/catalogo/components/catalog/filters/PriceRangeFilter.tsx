'use client';

import React from 'react';
import { Slider } from '@nextui-org/react';

interface PriceRangeFilterProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
}

export const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  value,
  onChange,
  min = 1000,
  max = 8000,
}) => {
  return (
    <div className="space-y-3">
      <Slider
        aria-label="Rango de precio"
        step={100}
        minValue={min}
        maxValue={max}
        value={value}
        onChange={(val) => onChange(val as [number, number])}
        size="sm"
        classNames={{
          base: 'max-w-full',
          filler: 'bg-[rgba(var(--color-primary-rgb),0.7)]',
          thumb: 'bg-white border-2 border-[var(--color-primary)] w-4 h-4 shadow-lg cursor-pointer after:bg-[var(--color-primary)] after:w-1.5 after:h-1.5',
          track: 'bg-neutral-200 h-1',
          label: 'text-xs font-medium text-neutral-600',
          value: 'text-xs text-neutral-500',
        }}
        formatOptions={{ style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }}
      />
      <div className="flex justify-between text-xs">
        <span className="text-neutral-700 font-medium">S/{value[0].toLocaleString()}</span>
        <span className="text-neutral-300">-</span>
        <span className="text-neutral-700 font-medium">S/{value[1].toLocaleString()}</span>
      </div>
    </div>
  );
};
