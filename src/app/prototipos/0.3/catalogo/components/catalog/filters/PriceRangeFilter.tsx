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
    <div className="space-y-4">
      <Slider
        label="Precio total"
        step={100}
        minValue={min}
        maxValue={max}
        value={value}
        onChange={(val) => onChange(val as [number, number])}
        formatOptions={{ style: 'currency', currency: 'PEN' }}
        classNames={{
          base: 'max-w-full',
          filler: 'bg-[#4654CD]',
          thumb: 'bg-[#4654CD] border-[#4654CD]',
          track: 'bg-neutral-200',
          label: 'text-sm font-medium text-neutral-700',
          value: 'text-sm text-neutral-500',
        }}
      />
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600 font-medium">{formatPrice(value[0])}</span>
        <span className="text-neutral-400">-</span>
        <span className="text-neutral-600 font-medium">{formatPrice(value[1])}</span>
      </div>
    </div>
  );
};

export default PriceRangeFilter;
