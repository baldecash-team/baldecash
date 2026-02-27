'use client';

/**
 * PricingCalculator - Cards por plazo con opciones precalculadas del backend
 * Las cuotas para cada combinación de plazo + % inicial vienen precalculadas
 */

import { useState, useMemo } from 'react';
import { PricingCalculatorProps, PaymentPlan, InitialPaymentOption, InitialPaymentPercentage } from '../../../types/detail';
import { formatMoneyNoDecimals } from '../../../utils/formatMoney';

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  paymentPlans,
  defaultTerm = 36,
  productPrice: productPriceProp,
}) => {
  const [selectedTerm, setSelectedTerm] = useState(paymentPlans[0]?.term ?? defaultTerm);
  const [selectedInitialPercent, setSelectedInitialPercent] = useState<InitialPaymentPercentage>(0);
  const [hoveredTerm, setHoveredTerm] = useState<number | null>(null);

  // Obtener opciones de pago inicial del primer plan (son iguales para todos los plazos)
  const initialPaymentOptions = useMemo(() => {
    const firstPlan = paymentPlans[0];
    if (!firstPlan?.options) return [];

    return firstPlan.options.map((opt) => ({
      percent: opt.initialPercent,
      amount: opt.initialAmount,
      label: opt.initialPercent === 0
        ? 'Sin inicial'
        : `S/${formatMoneyNoDecimals(Math.round(opt.initialAmount))}`,
    }));
  }, [paymentPlans]);

  // Obtener la opción seleccionada para un plazo específico
  const getOptionForTerm = (term: number): InitialPaymentOption | null => {
    const plan = paymentPlans.find(p => p.term === term);
    if (!plan?.options) return null;

    return plan.options.find(opt => opt.initialPercent === selectedInitialPercent) || plan.options[0];
  };

  // Opción seleccionada actual
  const selectedOption = useMemo(() => {
    return getOptionForTerm(selectedTerm);
  }, [selectedTerm, selectedInitialPercent, paymentPlans]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h3 className="text-xl font-semibold text-neutral-800 mb-2">
        Calcula tu cuota mensual
      </h3>
      <p className="text-sm text-neutral-500 mb-4">
        Selecciona el plazo que mejor se ajuste a tu presupuesto
      </p>

      {/* Precio de lista del equipo */}
      {productPriceProp && (
        <div className="mb-6 p-4 bg-neutral-50 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Precio de lista del equipo</span>
            <span className="text-lg font-bold text-neutral-800">
              S/{formatMoneyNoDecimals(Math.round(productPriceProp))}
            </span>
          </div>
        </div>
      )}

      {/* Initial Payment Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Cuota inicial (opcional)
        </label>
        <div className="flex flex-wrap gap-2">
          {initialPaymentOptions.map((option) => (
            <button
              key={option.percent}
              onClick={() => setSelectedInitialPercent(option.percent)}
              className={`py-2 px-4 text-sm font-medium rounded-full transition-all cursor-pointer ${
                selectedInitialPercent === option.percent
                  ? 'bg-[var(--color-primary)] text-white shadow-md'
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
          const option = getOptionForTerm(plan.term);
          if (!option) return null;

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
                    ? 'bg-[var(--color-primary)] text-white shadow-xl scale-105'
                    : 'bg-white border-2 border-neutral-200 hover:border-[var(--color-primary)] hover:shadow-lg'
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

                {option.originalQuota && (
                  <p
                    className={`text-xs line-through mb-1 ${
                      isSelected ? 'text-white/60' : 'text-neutral-400'
                    }`}
                  >
                    S/{formatMoneyNoDecimals(Math.round(option.originalQuota))}
                  </p>
                )}

                <p
                  className={`text-xl font-bold ${
                    isSelected ? 'text-white' : 'text-[var(--color-primary)]'
                  }`}
                >
                  S/{formatMoneyNoDecimals(Math.round(option.monthlyQuota))}
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
          {selectedOption?.originalQuota && (
            <p className="line-through text-neutral-400 text-xl mb-1">
              S/{formatMoneyNoDecimals(Math.round(selectedOption.originalQuota))}/mes
            </p>
          )}
          <p className="text-4xl font-bold text-[var(--color-primary)]">
            S/{formatMoneyNoDecimals(Math.round(selectedOption?.monthlyQuota || 0))}/mes
          </p>
          <p className="text-sm text-neutral-500 mt-2">
            durante {selectedTerm} meses
            {selectedInitialPercent > 0 && selectedOption && (
              <span className="block text-xs text-neutral-400 mt-1">
                + S/{formatMoneyNoDecimals(Math.round(selectedOption.initialAmount))} de inicial
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;
