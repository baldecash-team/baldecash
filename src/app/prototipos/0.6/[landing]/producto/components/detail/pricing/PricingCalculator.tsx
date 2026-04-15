'use client';

/**
 * PricingCalculator - Cards por plazo con opciones precalculadas del backend
 * Las cuotas para cada combinación de plazo + % inicial vienen precalculadas
 */

import { useState, useMemo, useEffect } from 'react';
import { PricingCalculatorProps, PaymentPlan, InitialPaymentOption, InitialPaymentPercentage } from '../../../types/detail';
import { formatMoneyNoDecimals } from '../../../utils/formatMoney';

// Detect hover-capable devices (desktop) so touch-only devices don't keep a
// sticky :hover / scale effect applied after tapping a card.
function useHoverCapable() {
  const [isHoverCapable, setIsHoverCapable] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const handler = (e: MediaQueryListEvent) => setIsHoverCapable(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isHoverCapable;
}

export interface PricingSelection {
  term: number;
  initialPercent: InitialPaymentPercentage;
  monthlyQuota: number;
  initialAmount: number;
}

export const PricingCalculator: React.FC<PricingCalculatorProps & {
  onSelectionChange?: (selection: PricingSelection) => void;
}> = ({
  paymentPlans,
  defaultTerm,
  defaultInitialPercent = 0,
  productPrice: productPriceProp,
  onSelectionChange,
}) => {
  const [selectedTerm, setSelectedTerm] = useState(() => {
    // If a specific defaultTerm is provided and exists in plans, use it
    if (defaultTerm != null) {
      const hasDefaultTerm = paymentPlans.some(p => p.term === defaultTerm);
      if (hasDefaultTerm) return defaultTerm;
    }
    // Otherwise default to the longest available term
    if (paymentPlans.length > 0) return Math.max(...paymentPlans.map(p => p.term));
    return defaultTerm ?? 36;
  });
  const [selectedInitialPercent, setSelectedInitialPercent] = useState<InitialPaymentPercentage>(defaultInitialPercent as InitialPaymentPercentage);
  const [hoveredTerm, setHoveredTerm] = useState<number | null>(null);
  const isHoverCapable = useHoverCapable();

  // Obtener opciones de pago inicial del primer plan (son iguales para todos los plazos)
  const initialPaymentOptions = useMemo(() => {
    const firstPlan = paymentPlans[0];
    if (!firstPlan?.options) return [];

    return firstPlan.options.map((opt) => ({
      percent: opt.initialPercent,
      amount: opt.initialAmount,
      label: opt.initialPercent === 0
        ? 'Sin inicial'
        : `S/${formatMoneyNoDecimals(Math.floor(opt.initialAmount))}`,
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

  // Notify parent of selection changes
  useEffect(() => {
    if (onSelectionChange && selectedOption) {
      onSelectionChange({
        term: selectedTerm,
        initialPercent: selectedInitialPercent,
        monthlyQuota: selectedOption.monthlyQuota,
        initialAmount: selectedOption.initialAmount,
      });
    }
  }, [selectedTerm, selectedInitialPercent, selectedOption, onSelectionChange]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h3 className="text-xl font-semibold text-neutral-800 mb-2">
        Calcula tu cuota mensual
      </h3>
      <p className="text-sm text-neutral-500 mb-4">
        Selecciona el plazo que mejor se ajuste a tu presupuesto
      </p>

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
              className={`py-2.5 px-4 text-sm font-medium rounded-full transition-all cursor-pointer min-h-[40px] ${
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {paymentPlans.map((plan) => {
          const option = getOptionForTerm(plan.term);
          if (!option) return null;

          const isSelected = selectedTerm === plan.term;
          const isHovered = hoveredTerm === plan.term;

          return (
            <button
              type="button"
              key={plan.term}
              onClick={() => setSelectedTerm(plan.term)}
              onMouseEnter={isHoverCapable ? () => setHoveredTerm(plan.term) : undefined}
              onMouseLeave={isHoverCapable ? () => setHoveredTerm(null) : undefined}
              className={`
                relative p-4 rounded-xl cursor-pointer transition-all duration-200 min-w-0 text-center
                ${
                  isSelected
                    ? 'bg-[var(--color-primary)] text-white shadow-md ring-2 ring-[var(--color-primary)] ring-offset-2'
                    : 'bg-white border border-neutral-200 shadow-sm hover:border-[var(--color-primary)]/40 hover:shadow-md'
                }
                ${isHovered && !isSelected ? 'scale-[1.02]' : ''}
              `}
            >
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${
                  isSelected ? 'text-white/70' : 'text-neutral-400'
                }`}
              >
                {plan.term} meses
              </span>

              <span className="block mt-3">
                {option.originalQuota && (
                  <span
                    className={`block text-xs line-through mb-0.5 ${
                      isSelected ? 'text-white/50' : 'text-neutral-400'
                    }`}
                  >
                    S/{formatMoneyNoDecimals(Math.floor(option.originalQuota))}
                  </span>
                )}

                <span
                  className={`block text-xl sm:text-2xl font-bold leading-tight ${
                    isSelected ? 'text-white' : 'text-neutral-800'
                  }`}
                >
                  S/{formatMoneyNoDecimals(Math.floor(option.monthlyQuota))}
                </span>
              </span>

              <span
                className={`block text-[11px] mt-1.5 ${
                  isSelected ? 'text-white/70' : 'text-neutral-400'
                }`}
              >
                al mes
              </span>

              {isSelected && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-[var(--color-primary)] rounded-full flex items-center justify-center shadow-sm">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Quote Summary */}
      <div className="mt-6 p-5 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/15 rounded-xl">
        <div className="text-center">
          <p className="text-sm text-neutral-500 mb-1">Tu cuota mensual</p>
          {selectedOption?.originalQuota && (
            <p className="line-through text-neutral-400 text-lg mb-0.5">
              S/{formatMoneyNoDecimals(Math.floor(selectedOption.originalQuota))}/mes
            </p>
          )}
          <p className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)]">
            S/{formatMoneyNoDecimals(Math.floor(selectedOption?.monthlyQuota || 0))}
            <span className="text-lg font-medium text-neutral-500">/mes</span>
          </p>
          <p className="text-sm text-neutral-500 mt-2">
            durante {selectedTerm} meses
            {selectedInitialPercent > 0 && selectedOption && (
              <span className="block text-xs text-neutral-400 mt-1">
                + S/{formatMoneyNoDecimals(Math.floor(selectedOption.initialAmount))} de inicial
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;
