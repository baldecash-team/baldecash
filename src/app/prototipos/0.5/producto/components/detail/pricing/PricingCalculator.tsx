'use client';

/**
 * PricingCalculator - Cards por plazo con animacion (basado en V4)
 * Usa datos de ejemplo (paymentPlans) para mostrar cuotas diferentes por plazo
 */

import { useState, useMemo } from 'react';
import { PricingCalculatorProps, PaymentPlan } from '../../../types/detail';
import { formatMoney } from '../../../../utils/formatMoney';

const INITIAL_PAYMENT_OPTIONS = [
  { value: '0', label: '0%' },
  { value: '10', label: '10%' },
  { value: '20', label: '20%' },
  { value: '30', label: '30%' },
];

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  paymentPlans,
  defaultTerm = 36,
}) => {
  const [selectedTerm, setSelectedTerm] = useState(defaultTerm);
  const [initialPayment, setInitialPayment] = useState('0');
  const [hoveredTerm, setHoveredTerm] = useState<number | null>(null);

  // Obtener cuota del plan según el plazo
  const getQuotaForTerm = (term: number): { quota: number; originalQuota?: number } => {
    const plan = paymentPlans.find(p => p.term === term);
    if (!plan) return { quota: 0 };

    const initialPercent = parseInt(initialPayment);
    // Aplicar descuento por cuota inicial
    const quota = Math.ceil(plan.monthlyQuota * (1 - initialPercent / 100));
    const originalQuota = plan.originalQuota
      ? Math.ceil(plan.originalQuota * (1 - initialPercent / 100))
      : undefined;

    return { quota, originalQuota };
  };

  // Cuota del plazo seleccionado
  const selectedPlan = useMemo(() => getQuotaForTerm(selectedTerm), [selectedTerm, initialPayment, paymentPlans]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h3 className="text-xl font-semibold text-neutral-800 mb-2">
        Calcula tu cuota mensual
      </h3>
      <p className="text-sm text-neutral-500 mb-6">
        Selecciona el plazo que mejor se ajuste a tu presupuesto
      </p>

      {/* Initial Payment Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Cuota inicial (opcional)
        </label>
        <div className="flex flex-wrap gap-2">
          {INITIAL_PAYMENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setInitialPayment(option.value)}
              className={`py-2 px-4 text-sm font-medium rounded-full transition-all cursor-pointer ${
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

      {/* Term Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {paymentPlans.map((plan) => {
          const { quota, originalQuota: originalQuotaForTerm } = getQuotaForTerm(plan.term);
          const isSelected = selectedTerm === plan.term;
          const isHovered = hoveredTerm === plan.term;

          return (
            <div
              key={plan.term}
              onClick={() => setSelectedTerm(plan.term)}
              onMouseEnter={() => setHoveredTerm(plan.term)}
              onMouseLeave={() => setHoveredTerm(null)}
              className={`
                relative p-4 rounded-xl cursor-pointer transition-all duration-300
                ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#4654CD] to-[#3644BD] text-white shadow-xl scale-105'
                    : 'bg-white border-2 border-neutral-200 hover:border-[#4654CD] hover:shadow-lg'
                }
                ${isHovered && !isSelected ? 'scale-102' : ''}
              `}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  ✓
                </div>
              )}

              <div className="text-center">
                <p
                  className={`text-sm font-medium mb-2 ${
                    isSelected ? 'text-white/80' : 'text-neutral-500'
                  }`}
                >
                  {plan.term} meses
                </p>

                {originalQuotaForTerm && (
                  <p
                    className={`text-xs line-through mb-1 ${
                      isSelected ? 'text-white/60' : 'text-neutral-400'
                    }`}
                  >
                    S/{formatMoney(originalQuotaForTerm)}
                  </p>
                )}

                <p
                  className={`text-xl font-bold ${
                    isSelected ? 'text-white' : 'text-[#4654CD]'
                  }`}
                >
                  S/{formatMoney(quota)}
                </p>

                <p
                  className={`text-xs mt-1 ${
                    isSelected ? 'text-white/80' : 'text-neutral-500'
                  }`}
                >
                  al mes
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Quote Summary */}
      <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
        <div className="text-center">
          <p className="text-sm text-neutral-600 mb-2">Pagarías</p>
          {selectedPlan.originalQuota && (
            <p className="line-through text-neutral-400 text-xl mb-1">
              S/{formatMoney(selectedPlan.originalQuota)}/mes
            </p>
          )}
          <p className="text-4xl font-bold text-[#4654CD]">
            S/{formatMoney(selectedPlan.quota)}/mes
          </p>
          <p className="text-sm text-neutral-500 mt-2">
            durante {selectedTerm} meses
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;
