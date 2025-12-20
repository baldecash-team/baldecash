'use client';

import { useState } from 'react';
import { Button, Select, SelectItem } from '@nextui-org/react';

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

export default function PricingCalculatorV5({
  monthlyQuota,
  originalQuota,
  defaultTerm = 36,
}: PricingCalculatorProps) {
  const [selectedTerm, setSelectedTerm] = useState(defaultTerm);
  const [initialPayment, setInitialPayment] = useState('0');

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

  // Generate timeline markers
  const generateTimelineMarkers = () => {
    const markers = [];
    const interval = Math.max(1, Math.floor(selectedTerm / 6));

    for (let i = 0; i <= selectedTerm; i += interval) {
      if (i === selectedTerm || markers.length < 6) {
        markers.push(i);
      }
    }

    if (markers[markers.length - 1] !== selectedTerm) {
      markers.push(selectedTerm);
    }

    return markers;
  };

  const timelineMarkers = generateTimelineMarkers();

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h3 className="text-xl font-semibold text-neutral-800 mb-2">
        Calcula tu cuota mensual
      </h3>
      <p className="text-sm text-neutral-500 mb-6">
        Visualiza tu plan de pagos en el tiempo
      </p>

      {/* Controls Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Term Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Selecciona el plazo
          </label>
          <div className="flex gap-2">
            {TERMS.map((term) => (
              <Button
                key={term}
                size="sm"
                onClick={() => setSelectedTerm(term)}
                variant={selectedTerm === term ? 'solid' : 'bordered'}
                className={`cursor-pointer flex-1 ${
                  selectedTerm === term
                    ? 'bg-[#4654CD] text-white'
                    : 'border-neutral-300 text-neutral-700'
                }`}
              >
                {term}m
              </Button>
            ))}
          </div>
        </div>

        {/* Initial Payment */}
        <div>
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
      </div>

      {/* Timeline Visualization */}
      <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-[#4654CD]/20 rounded-full" />
          <div
            className="absolute top-6 left-0 h-1 bg-[#4654CD] rounded-full transition-all duration-500"
            style={{ width: '100%' }}
          />

          {/* Timeline Markers */}
          <div className="relative flex justify-between">
            {timelineMarkers.map((month, index) => (
              <div key={month} className="flex flex-col items-center">
                <div className="w-4 h-4 bg-[#4654CD] rounded-full border-4 border-white shadow-md mb-2 z-10" />
                <div className="text-center">
                  <p className="text-xs font-semibold text-[#4654CD]">
                    Mes {month}
                  </p>
                  {month > 0 && (
                    <p className="text-xs text-neutral-500 mt-1">
                      S/{calculatedQuota.toFixed(0)}
                    </p>
                  )}
                  {month === 0 && parseInt(initialPayment) > 0 && (
                    <p className="text-xs text-green-600 font-medium mt-1">
                      Inicial {initialPayment}%
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Info */}
        <div className="mt-8 pt-6 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Cuota mensual</p>
              {calculatedOriginalQuota && (
                <p className="line-through text-neutral-400 text-sm">
                  S/{calculatedOriginalQuota.toFixed(2)}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[#4654CD]">
                S/{calculatedQuota.toFixed(2)}
              </p>
              <p className="text-sm text-neutral-500">x {selectedTerm} meses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-neutral-200 rounded-lg">
          <p className="text-xs text-neutral-500 mb-1">Plazo</p>
          <p className="text-lg font-bold text-neutral-800">{selectedTerm} meses</p>
        </div>
        <div className="p-4 bg-white border border-neutral-200 rounded-lg">
          <p className="text-xs text-neutral-500 mb-1">Cuota inicial</p>
          <p className="text-lg font-bold text-neutral-800">{initialPayment}%</p>
        </div>
        <div className="p-4 bg-white border border-neutral-200 rounded-lg">
          <p className="text-xs text-neutral-500 mb-1">Total cuotas</p>
          <p className="text-lg font-bold text-neutral-800">{selectedTerm}</p>
        </div>
        <div className="p-4 bg-white border border-neutral-200 rounded-lg">
          <p className="text-xs text-neutral-500 mb-1">Por mes</p>
          <p className="text-lg font-bold text-[#4654CD]">
            S/{calculatedQuota.toFixed(0)}
          </p>
        </div>
      </div>
    </div>
  );
}
