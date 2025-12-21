'use client';

import { useState } from 'react';

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

      {/* Term Selection - Range Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-neutral-700">
            Selecciona el plazo
          </label>
          <span className="text-sm font-bold text-[#4654CD] bg-[#4654CD]/10 px-3 py-1 rounded-full">
            {selectedTerm} meses
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={TERMS.length - 1}
          value={TERMS.indexOf(selectedTerm)}
          onChange={(e) => setSelectedTerm(TERMS[parseInt(e.target.value)])}
          className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#4654CD]"
        />
        <div className="flex justify-between mt-2 px-1">
          {TERMS.map((term) => (
            <span
              key={term}
              className={`text-xs transition-colors ${
                selectedTerm === term ? 'text-[#4654CD] font-bold' : 'text-neutral-400'
              }`}
            >
              {term}m
            </span>
          ))}
        </div>
      </div>

      {/* Initial Payment Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Cuota inicial (opcional)
        </label>
        <div className="grid grid-cols-4 gap-2">
          {INITIAL_PAYMENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setInitialPayment(option.value)}
              className={`py-2.5 px-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                initialPayment === option.value
                  ? 'bg-[#4654CD] text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
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
