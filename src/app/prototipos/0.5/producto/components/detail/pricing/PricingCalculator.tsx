'use client';

import { useState, useMemo, useEffect } from 'react';
import { PricingCalculatorProps, PaymentPlan, FrequencyType, InitialPaymentPercentage, frequencyLabels } from '../../../types/detail';
import { formatMoney } from '../../../../utils/formatMoney';

const INITIAL_PAYMENT_PERCENTAGES = [0, 10, 20, 30] as InitialPaymentPercentage[];
const FREQUENCY_ORDER: FrequencyType[] = ['mensual', 'quincenal', 'semanal'];

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  paymentPlans,
  defaultTerm = 36,
  productPrice: productPriceProp,
  defaultFrequency = 'mensual',
  defaultInitialPercent = 0,
  onSelectionChange,
}) => {
  const productPrice = productPriceProp || (paymentPlans[0]?.monthlyQuota || 0) * (paymentPlans[0]?.term || 24);

  const [frequency, setFrequency] = useState<FrequencyType>(
    FREQUENCY_ORDER.includes(defaultFrequency) ? defaultFrequency : FREQUENCY_ORDER[0]
  );

  const [selectedTerm, setSelectedTerm] = useState<number>(() => {
    const cuotasPerMonth = frequencyLabels[defaultFrequency].cuotasPerMonth;
    const validTerms = paymentPlans.map((p) => p.term * cuotasPerMonth);
    return validTerms.includes(defaultTerm) ? defaultTerm : validTerms[0];
  });

  const [initialPayment, setInitialPayment] = useState<InitialPaymentPercentage>(() => {
    return INITIAL_PAYMENT_PERCENTAGES.includes(defaultInitialPercent)
      ? defaultInitialPercent
      : INITIAL_PAYMENT_PERCENTAGES[0];
  });

  const [hoveredTerm, setHoveredTerm] = useState<number | null>(null);

  // Notify parent when selection changes
  useEffect(() => {
    onSelectionChange?.({ frequency, plazo: selectedTerm, inicial: initialPayment });
  }, [frequency, selectedTerm, initialPayment]);

  // Compute cuota based on frequency (divisor vs monthly)
  const getQuotaForPlan = (plan: PaymentPlan): { quota: number; originalQuota?: number } => {
    const divisor = frequencyLabels[frequency].divisor;
    const baseQuota = Math.ceil(plan.monthlyQuota / divisor * (1 - initialPayment / 100));
    const originalQuota = plan.originalQuota
      ? Math.ceil(plan.originalQuota / divisor * (1 - initialPayment / 100))
      : undefined;
    return { quota: baseQuota, originalQuota };
  };

  // Convert plans: number of cuotas changes by frequency
  const plansForFrequency = useMemo(() => {
    const cuotasPerMonth = frequencyLabels[frequency].cuotasPerMonth;
    return paymentPlans.map((p) => ({
      ...p,
      displayTerm: p.term * cuotasPerMonth,
    }));
  }, [paymentPlans, frequency]);

  // When frequency changes, keep equivalent duration snapping to nearest valid plan
  const handleFrequencyChange = (newFreq: FrequencyType) => {
    const oldCuotas = frequencyLabels[frequency].cuotasPerMonth;
    const newCuotas = frequencyLabels[newFreq].cuotasPerMonth;
    const months = selectedTerm / oldCuotas;
    const target = Math.round(months * newCuotas);
    const validTerms = paymentPlans.map((p) => p.term * newCuotas);
    const closest = validTerms.reduce((prev, curr) =>
      Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
    );
    setSelectedTerm(closest);
    setFrequency(newFreq);
  };

  const selectedPlanDisplay = plansForFrequency.find((p) => p.displayTerm === selectedTerm);
  const selectedQuota = selectedPlanDisplay ? getQuotaForPlan(selectedPlanDisplay) : { quota: 0 };

  const initialPaymentOptions = useMemo(() => {
    return INITIAL_PAYMENT_PERCENTAGES.map((percent) => ({
      value: percent,
      label: percent === 0
        ? 'Sin inicial'
        : `S/${Math.round(productPrice * percent / 100).toLocaleString()}`,
      percent,
    }));
  }, [productPrice]);

  const frequencyLabel = frequencyLabels[frequency];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h3 className="text-xl font-semibold text-neutral-800 mb-2">
        Calcula tu cuota
      </h3>
      <p className="text-sm text-neutral-500 mb-6">
        Elige frecuencia, plazo e inicial que se ajusten a tu presupuesto
      </p>

      {/* Frequency Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Frecuencia de pago
        </label>
        <div className="flex gap-2">
          {FREQUENCY_ORDER.map((freq) => (
            <button
              key={freq}
              onClick={() => handleFrequencyChange(freq)}
              className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                frequency === freq
                  ? 'bg-[#4654CD] text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {frequencyLabels[freq].name}
            </button>
          ))}
        </div>
      </div>

      {/* Initial Payment Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Cuota inicial (opcional)
        </label>
        <div className="flex flex-wrap gap-2">
          {initialPaymentOptions.map((option) => (
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
        {plansForFrequency.map((plan) => {
          const { quota, originalQuota: originalQuotaForTerm } = getQuotaForPlan(plan);
          const isSelected = selectedTerm === plan.displayTerm;
          const isHovered = hoveredTerm === plan.displayTerm;

          return (
            <div
              key={plan.displayTerm}
              onClick={() => setSelectedTerm(plan.displayTerm)}
              onMouseEnter={() => setHoveredTerm(plan.displayTerm)}
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
                  {plan.displayTerm} {frequency === 'mensual' ? 'meses' : frequency === 'quincenal' ? 'quincenas' : 'semanas'}
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
                  c/u
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
          {selectedQuota.originalQuota && (
            <p className="line-through text-neutral-400 text-xl mb-1">
              S/{formatMoney(selectedQuota.originalQuota)}/{frequencyLabel.name.toLowerCase()}
            </p>
          )}
          <p className="text-4xl font-bold text-[#4654CD]">
            S/{formatMoney(selectedQuota.quota)}/{frequencyLabel.name.toLowerCase()}
          </p>
          <p className="text-sm text-neutral-500 mt-2">
            durante {selectedTerm}{' '}
            {frequency === 'mensual' ? 'meses' : frequency === 'quincenal' ? 'quincenas' : 'semanas'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;
