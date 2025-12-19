'use client';

/**
 * PriceRangeFilter - Slider de rango de precio
 *
 * Permite filtrar productos por precio total
 * Muestra valores min/max seleccionados
 */

import React from 'react';
import { Slider } from '@nextui-org/react';

interface PriceRangeFilterProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (range: [number, number]) => void;
}

export const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  min,
  max,
  value,
  onChange,
}) => {
  const formatPrice = (price: number) => {
    return `S/${price.toLocaleString('es-PE')}`;
  };

  return (
    <div className="space-y-3">
      <Slider
        label="Precio total"
        size="sm"
        step={100}
        minValue={min}
        maxValue={max}
        value={value}
        onChange={(val) => onChange(val as [number, number])}
        formatOptions={{ style: 'currency', currency: 'PEN' }}
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
        <span className="text-neutral-600">{formatPrice(value[0])}</span>
        <span className="text-neutral-300">-</span>
        <span className="text-neutral-600">{formatPrice(value[1])}</span>
      </div>
    </div>
  );
};

export default PriceRangeFilter;
