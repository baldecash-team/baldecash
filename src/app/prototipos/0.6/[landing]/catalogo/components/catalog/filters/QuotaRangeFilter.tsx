'use client';

import React from 'react';
import { Slider } from '@nextui-org/react';
import { formatMoney } from '../../../utils/formatMoney';

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
    <div className="space-y-4">
      {/* Value badges */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 bg-[#4654CD]/10 rounded-lg px-3 py-2 text-center">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Desde</p>
          <p className="text-sm font-bold text-[#4654CD]">S/{formatMoney(value[0])}</p>
        </div>
        <div className="text-neutral-300 text-xs">—</div>
        <div className="flex-1 bg-[#4654CD]/10 rounded-lg px-3 py-2 text-center">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Hasta</p>
          <p className="text-sm font-bold text-[#4654CD]">S/{formatMoney(value[1])}</p>
        </div>
      </div>

      {/* Slider */}
      <div className="px-1">
        <Slider
          aria-label="Rango de cuota mensual"
          step={10}
          minValue={min}
          maxValue={max}
          value={value}
          onChange={(val) => {
            onChange(val as [number, number]);
          }}
          size="md"
          classNames={{
            base: 'max-w-full gap-3',
            filler: 'bg-gradient-to-r from-[#4654CD] to-[#5a68d9]',
            thumb: [
              'bg-white border-2 border-[#4654CD] w-5 h-5 shadow-md cursor-grab active:cursor-grabbing',
              'hover:scale-110 hover:border-[#3a47b3] transition-transform',
              'after:bg-[#4654CD] after:w-2 after:h-2 after:rounded-full',
              'data-[dragging=true]:scale-110 data-[dragging=true]:shadow-lg',
            ].join(' '),
            track: 'bg-neutral-200 h-2 rounded-full',
          }}
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between text-[10px] text-neutral-400 px-1">
        <span>S/{formatMoney(min)}</span>
        <span>S/{formatMoney(max)}</span>
      </div>
    </div>
  );
};
