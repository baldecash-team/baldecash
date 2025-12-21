'use client';

/**
 * PricingCalculatorV5 - Comparador Visual de Plazos
 *
 * Shows all term options as comparison cards with visual savings indicators.
 * Features a recommended badge and progress bar for savings visualization.
 */

import { useState } from 'react';
import { Check, TrendingDown, Clock, Sparkles } from 'lucide-react';

export interface PricingCalculatorProps {
  monthlyQuota: number;
  originalQuota?: number;
  defaultTerm?: number;
}

const TERMS = [12, 18, 24, 36, 48];
const INITIAL_PAYMENT_OPTIONS = [
  { value: 0, label: 'Sin inicial' },
  { value: 10, label: '10%' },
  { value: 20, label: '20%' },
  { value: 30, label: '30%' },
];

// Recommended term (best balance between monthly payment and total cost)
const RECOMMENDED_TERM = 24;

export default function PricingCalculatorV5({
  monthlyQuota,
  originalQuota,
  defaultTerm = 36,
}: PricingCalculatorProps) {
  const [selectedTerm, setSelectedTerm] = useState(defaultTerm);
  const [initialPayment, setInitialPayment] = useState(0);

  const calculateQuota = (term: number) => {
    if (initialPayment === 0) return monthlyQuota;
    const reduction = (monthlyQuota * initialPayment) / 100 / term;
    return monthlyQuota - reduction;
  };

  const calculateTotalCost = (term: number) => {
    const quota = calculateQuota(term);
    return quota * term;
  };

  const selectedQuota = calculateQuota(selectedTerm);

  // Calculate max savings for percentage display
  const maxTotal = calculateTotalCost(48);
  const minTotal = calculateTotalCost(12);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-neutral-900 mb-1">
          Compara y elige tu plan ideal
        </h3>
        <p className="text-sm text-neutral-500">
          Selecciona el plazo que mejor se adapte a tu presupuesto
        </p>
      </div>

      {/* Initial Payment Toggle */}
      <div className="mb-6">
        <p className="text-sm font-medium text-neutral-700 mb-3 text-center">
          ¿Deseas dar una cuota inicial?
        </p>
        <div className="flex justify-center gap-2">
          {INITIAL_PAYMENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setInitialPayment(option.value)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all cursor-pointer ${
                initialPayment === option.value
                  ? 'bg-[#4654CD] text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Term Comparison Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {TERMS.map((term) => {
          const quota = calculateQuota(term);
          const totalCost = calculateTotalCost(term);
          const isSelected = selectedTerm === term;
          const isRecommended = term === RECOMMENDED_TERM;

          // Savings compared to longest term (as percentage)
          const savingsVsMax = ((maxTotal - totalCost) / maxTotal) * 100;

          return (
            <button
              key={term}
              onClick={() => setSelectedTerm(term)}
              className={`relative p-4 rounded-xl transition-all cursor-pointer text-left ${
                isSelected
                  ? 'bg-[#4654CD] text-white shadow-lg ring-2 ring-[#4654CD] ring-offset-2'
                  : 'bg-white border-2 border-neutral-200 hover:border-[#4654CD]/50 hover:shadow-md'
              }`}
            >
              {/* Recommended Badge */}
              {isRecommended && (
                <div className={`absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                  isSelected ? 'bg-yellow-400 text-yellow-900' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  <Sparkles className="w-3 h-3" />
                  Ideal
                </div>
              )}

              {/* Selected Check */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-[#4654CD]" />
                </div>
              )}

              {/* Term */}
              <div className={`text-xs font-medium mb-2 flex items-center gap-1 ${
                isSelected ? 'text-white/80' : 'text-neutral-500'
              }`}>
                <Clock className="w-3 h-3" />
                {term} meses
              </div>

              {/* Quota */}
              <div className={`text-2xl font-bold mb-1 ${
                isSelected ? 'text-white' : 'text-neutral-900'
              }`}>
                S/{quota.toFixed(0)}
              </div>
              <div className={`text-xs ${isSelected ? 'text-white/70' : 'text-neutral-400'}`}>
                al mes
              </div>

              {/* Savings Indicator */}
              {savingsVsMax > 0 && (
                <div className={`mt-3 pt-3 border-t ${
                  isSelected ? 'border-white/20' : 'border-neutral-100'
                }`}>
                  <div className={`flex items-center gap-1 text-xs ${
                    isSelected ? 'text-green-300' : 'text-green-600'
                  }`}>
                    <TrendingDown className="w-3 h-3" />
                    <span className="font-medium">
                      {savingsVsMax.toFixed(0)}% menos
                    </span>
                  </div>
                  {/* Savings Bar */}
                  <div className={`mt-1.5 h-1 rounded-full overflow-hidden ${
                    isSelected ? 'bg-white/20' : 'bg-neutral-100'
                  }`}>
                    <div
                      className={`h-full rounded-full transition-all ${
                        isSelected ? 'bg-green-300' : 'bg-green-500'
                      }`}
                      style={{ width: `${savingsVsMax}%` }}
                    />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Plan Summary */}
      <div className="bg-gradient-to-br from-[#4654CD]/5 to-[#4654CD]/10 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Plan Details */}
          <div className="text-center sm:text-left">
            <p className="text-sm text-neutral-600 mb-1">Tu plan seleccionado</p>
            <div className="flex items-baseline gap-2">
              {originalQuota && (
                <span className="text-lg text-neutral-400 line-through">
                  S/{originalQuota.toFixed(0)}
                </span>
              )}
              <span className="text-4xl font-bold text-[#4654CD]">
                S/{selectedQuota.toFixed(2)}
              </span>
              <span className="text-neutral-500">/mes</span>
            </div>
            <p className="text-sm text-neutral-500 mt-1">
              durante {selectedTerm} meses
            </p>
          </div>

          {/* Right: Total & CTA */}
          <div className="text-center sm:text-right">
            <p className="text-xs text-neutral-500 mb-1">Total a pagar</p>
            <p className="text-xl font-bold text-neutral-800">
              S/{calculateTotalCost(selectedTerm).toFixed(2)}
            </p>
            {initialPayment > 0 && (
              <p className="text-xs text-green-600 font-medium mt-1">
                + {initialPayment}% inicial
              </p>
            )}
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-4 pt-4 border-t border-neutral-200/50">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-green-500" />
              Sin comisiones ocultas
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-green-500" />
              Tasa fija
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-green-500" />
              Aprobación en minutos
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
