'use client';

import { useState } from 'react';
import { Slider, Select, SelectItem } from '@nextui-org/react';

export interface PricingCalculatorProps {
  monthlyQuota: number;
  originalQuota?: number;
  defaultTerm?: number;
}

const TERMS = [12, 18, 24, 36, 48];
const INITIAL_PAYMENT_OPTIONS = [
  { value: '0', label: '0%' },
  { value: '10', label: '10%' },
  { value: '20', label: '20%' },
  { value: '30', label: '30%' },
];

export default function PricingCalculatorV2({
  monthlyQuota,
  originalQuota,
  defaultTerm = 36,
}: PricingCalculatorProps) {
  const [selectedTermIndex, setSelectedTermIndex] = useState(
    TERMS.indexOf(defaultTerm)
  );
  const [initialPayment, setInitialPayment] = useState('0');

  const selectedTerm = TERMS[selectedTermIndex];

  const calculateQuota = () => {
    const initialPercent = parseInt(initialPayment);
    if (initialPercent === 0) return monthlyQuota;

    const reduction = (monthlyQuota * initialPercent) / 100 / selectedTerm;
    return monthlyQuota - reduction;
  };

  const calculatedQuota = calculateQuota();
  const calculatedOriginalQuota = originalQuota
    ? originalQuota - ((originalQuota * parseInt(initialPayment)) / 100 / selectedTerm)
    : undefined;

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h3 className="text-xl font-semibold text-neutral-800 mb-6">
        Calcula tu cuota mensual
      </h3>

      {/* Quota Display */}
      <div className="mb-8 text-center py-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
        {calculatedOriginalQuota && (
          <p className="line-through text-neutral-400 text-xl mb-1">
            S/{calculatedOriginalQuota.toFixed(2)}/mes
          </p>
        )}
        <p className="text-4xl font-bold text-[#4654CD]">
          S/{calculatedQuota.toFixed(2)}/mes
        </p>
        <p className="text-sm text-neutral-500 mt-2">x {selectedTerm} meses</p>
      </div>

      {/* Term Selection - Slider */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-neutral-700 mb-4">
          Selecciona el plazo
        </label>
        <Slider
          value={selectedTermIndex}
          onChange={(value) => setSelectedTermIndex(value as number)}
          step={1}
          minValue={0}
          maxValue={TERMS.length - 1}
          marks={TERMS.map((term, index) => ({
            value: index,
            label: `${term}`,
          }))}
          showTooltip={true}
          tooltipValueFormatOptions={{}}
          renderThumb={(props) => (
            <div
              {...props}
              className="group p-1 top-1/2 bg-[#4654CD] border-small border-white shadow-medium rounded-full cursor-pointer transition-transform data-[dragging=true]:scale-110"
            >
              <span className="transition-transform bg-white shadow-small rounded-full w-5 h-5 block group-data-[dragging=true]:scale-80" />
            </div>
          )}
          classNames={{
            track: 'bg-neutral-200',
            filler: 'bg-[#4654CD]',
            thumb: 'cursor-pointer',
          }}
        />
        <div className="flex justify-between mt-2 px-1">
          {TERMS.map((term) => (
            <span key={term} className="text-xs text-neutral-500">
              {term}m
            </span>
          ))}
        </div>
      </div>

      {/* Initial Payment Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Cuota inicial (opcional)
        </label>
        <Select
          selectedKeys={[initialPayment]}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string;
            setInitialPayment(value);
          }}
          placeholder="Selecciona cuota inicial"
          classNames={{
            trigger: 'cursor-pointer',
          }}
        >
          {INITIAL_PAYMENT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </div>

      {parseInt(initialPayment) > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            Ahorro: S/{((monthlyQuota - calculatedQuota) * selectedTerm).toFixed(2)} en total
          </p>
        </div>
      )}
    </div>
  );
}
