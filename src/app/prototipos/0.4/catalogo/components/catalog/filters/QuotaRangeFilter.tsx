'use client';

import React from 'react';
import { Slider, Select, SelectItem } from '@nextui-org/react';
import { QuotaFrequency } from '../../../types/catalog';

interface QuotaRangeFilterProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  frequency: QuotaFrequency;
  onFrequencyChange: (frequency: QuotaFrequency) => void;
  min?: number;
  max?: number;
}

const frequencyOptions = [
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quincenal' },
  { value: 'monthly', label: 'Mensual' },
];

export const QuotaRangeFilter: React.FC<QuotaRangeFilterProps> = ({
  value,
  onChange,
  frequency,
  onFrequencyChange,
  min = 40,
  max = 400,
}) => {
  const getMultiplier = () => {
    switch (frequency) {
      case 'weekly': return 0.25;
      case 'biweekly': return 0.5;
      default: return 1;
    }
  };

  const adjustedMin = Math.floor(min * getMultiplier());
  const adjustedMax = Math.floor(max * getMultiplier());
  const adjustedValue: [number, number] = [
    Math.floor(value[0] * getMultiplier()),
    Math.floor(value[1] * getMultiplier()),
  ];

  return (
    <div className="space-y-3">
      <Select
        aria-label="Frecuencia de cuota"
        size="sm"
        selectedKeys={new Set([frequency])}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0];
          if (selectedKey) {
            onFrequencyChange(selectedKey as QuotaFrequency);
          }
        }}
        renderValue={(items) => {
          return items.map((item) => (
            <span key={item.key} className="text-sm text-neutral-700">
              {item.textValue}
            </span>
          ));
        }}
        classNames={{
          trigger: 'h-9 min-h-9 bg-white border border-neutral-200 hover:border-[#4654CD]/50 transition-colors cursor-pointer',
          value: 'text-sm text-neutral-700',
          popoverContent: 'bg-white border border-neutral-200 shadow-lg rounded-lg p-0',
          listbox: 'p-1 bg-white',
          listboxWrapper: 'bg-white',
          innerWrapper: 'pr-8',
          selectorIcon: 'right-3',
        }}
        popoverProps={{
          classNames: {
            base: 'bg-white',
            content: 'p-0 bg-white border border-neutral-200 shadow-lg rounded-lg',
          },
        }}
      >
        {frequencyOptions.map((opt) => (
          <SelectItem
            key={opt.value}
            textValue={opt.label}
            classNames={{
              base: `px-3 py-2 rounded-md text-sm cursor-pointer transition-colors
                text-neutral-700
                data-[selected=false]:data-[hover=true]:bg-[#4654CD]/10
                data-[selected=false]:data-[hover=true]:text-[#4654CD]
                data-[selected=true]:bg-[#4654CD]
                data-[selected=true]:text-white`,
            }}
          >
            {opt.label}
          </SelectItem>
        ))}
      </Select>

      <Slider
        aria-label="Rango de cuota"
        step={frequency === 'weekly' ? 5 : frequency === 'biweekly' ? 10 : 20}
        minValue={adjustedMin}
        maxValue={adjustedMax}
        value={adjustedValue}
        onChange={(val) => {
          const [newMin, newMax] = val as [number, number];
          const multiplier = getMultiplier();
          onChange([Math.floor(newMin / multiplier), Math.floor(newMax / multiplier)]);
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
          S/{adjustedValue[0]}/{frequency === 'monthly' ? 'mes' : frequency === 'biweekly' ? 'quinc.' : 'sem.'}
        </span>
        <span className="text-neutral-300">-</span>
        <span className="text-neutral-700 font-medium">
          S/{adjustedValue[1]}/{frequency === 'monthly' ? 'mes' : frequency === 'biweekly' ? 'quinc.' : 'sem.'}
        </span>
      </div>
    </div>
  );
};
