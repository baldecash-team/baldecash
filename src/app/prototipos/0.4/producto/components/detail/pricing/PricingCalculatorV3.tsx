'use client';

import { useState } from 'react';

export interface PricingCalculatorProps {
  monthlyQuota: number;
  originalQuota?: number;
  defaultTerm?: number;
}

const TERMS = [12, 18, 24, 36, 48];
const INITIAL_PAYMENT_OPTIONS = [
  { value: 0, label: '0%' },
  { value: 10, label: '10%' },
  { value: 20, label: '20%' },
  { value: 30, label: '30%' },
];

export default function PricingCalculatorV3({
  monthlyQuota,
  originalQuota,
  defaultTerm = 36,
}: PricingCalculatorProps) {
  const [selectedTerm, setSelectedTerm] = useState(defaultTerm);
  const [initialPayment, setInitialPayment] = useState(0);

  const calculateQuota = () => {
    if (initialPayment === 0) return monthlyQuota;

    const reduction = (monthlyQuota * initialPayment) / 100 / selectedTerm;
    return monthlyQuota - reduction;
  };

  const calculatedQuota = calculateQuota();
  const calculatedOriginalQuota = originalQuota
    ? originalQuota - ((originalQuota * initialPayment) / 100 / selectedTerm)
    : undefined;

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h3 className="text-xl font-semibold text-neutral-800 mb-6">
        Calcula tu cuota mensual
      </h3>

      {/* Term Selection - Buttons */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Selecciona el plazo
        </label>
        <div className="grid grid-cols-5 gap-2">
          {TERMS.map((term) => (
            <button
              key={term}
              onClick={() => setSelectedTerm(term)}
              className={`py-2.5 px-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                selectedTerm === term
                  ? 'bg-[#4654CD] text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
              }`}
            >
              {term}
            </button>
          ))}
        </div>
        <p className="text-xs text-neutral-500 mt-2 text-center">meses</p>
      </div>

      {/* Initial Payment Selection - Buttons */}
      <div className="mb-6">
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
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quota Display */}
      <div className="mt-8 text-center py-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-[#4654CD]/20">
        <p className="text-xs uppercase tracking-wide text-neutral-500 mb-2">
          Tu cuota mensual
        </p>
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

      {initialPayment > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-800 font-medium">
              Cuota inicial: {initialPayment}%
            </span>
            <span className="text-sm text-green-600">
              Ahorra S/{((monthlyQuota - calculatedQuota) * selectedTerm).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
