'use client';

/**
 * PricingCalculator - Cards por plazo con opciones precalculadas del backend
 * Las cuotas para cada combinación de plazo + % inicial vienen precalculadas.
 * Soporta selector de frecuencia (semanal / quincenal / mensual) para celulares.
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { PricingCalculatorProps, PaymentPlan, InitialPaymentOption, InitialPaymentPercentage } from '../../../types/detail';
import { formatMoneyNoDecimals } from '../../../utils/formatMoney';
import { fetchProductDetail } from '../../../api/productDetailApi';

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
  paymentFrequency: string;
}

/** Labels for each payment frequency (cuota suffix) */
const FREQ_LABELS: Record<string, { short: string; title: string; summary: string }> = {
  semanal:   { short: '/sem', title: 'a la semana',   summary: 'Tu cuota semanal' },
  quincenal: { short: '/qcn', title: 'a la quincena', summary: 'Tu cuota quincenal' },
  mensual:   { short: '/mes', title: 'al mes',        summary: 'Tu cuota mensual' },
};

const FREQ_DISPLAY: Record<string, string> = {
  semanal:   'Semanal',
  quincenal: 'Quincenal',
  mensual:   'Mensual',
};

function getFreqLabel(freq: string) {
  return FREQ_LABELS[freq] ?? FREQ_LABELS.mensual;
}

/** Convert raw installment count to months for display */
function termToMonths(term: number, frequency: string): number {
  if (frequency === 'semanal') return Math.round(term / 4);
  if (frequency === 'quincenal') return Math.round(term / 2);
  return term;
}

export const PricingCalculator: React.FC<PricingCalculatorProps & {
  onSelectionChange?: (selection: PricingSelection) => void;
}> = ({
  paymentPlans: initialPaymentPlans,
  defaultTerm,
  defaultInitialPercent = 0,
  productPrice: productPriceProp,
  paymentFrequencies,
  landing,
  productSlug,
  onPlansChange,
  onSelectionChange,
}) => {
  // Active plans (may change when frequency is switched)
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>(initialPaymentPlans);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  // Determine default frequency from the initial plans' structure or from paymentFrequencies
  const defaultFrequency = useMemo(() => {
    if (paymentFrequencies && paymentFrequencies.length > 0) {
      // Default to semanal if available, otherwise first
      return paymentFrequencies.includes('semanal') ? 'semanal' : paymentFrequencies[0];
    }
    return 'mensual';
  }, [paymentFrequencies]);

  const [selectedFrequency, setSelectedFrequency] = useState(defaultFrequency);

  const [selectedTerm, setSelectedTerm] = useState(() => {
    if (defaultTerm != null) {
      const hasDefaultTerm = initialPaymentPlans.some(p => p.term === defaultTerm);
      if (hasDefaultTerm) return defaultTerm;
    }
    if (initialPaymentPlans.length > 0) return Math.max(...initialPaymentPlans.map(p => p.term));
    return defaultTerm ?? 36;
  });
  const [selectedInitialPercent, setSelectedInitialPercent] = useState<InitialPaymentPercentage>(defaultInitialPercent as InitialPaymentPercentage);
  const [hoveredTerm, setHoveredTerm] = useState<number | null>(null);
  const isHoverCapable = useHoverCapable();

  // Re-fetch payment plans when frequency changes
  const handleFrequencyChange = useCallback(async (freq: string) => {
    if (freq === selectedFrequency) return;
    setSelectedFrequency(freq);

    if (!landing || !productSlug) return;

    setIsLoadingPlans(true);
    try {
      const result = await fetchProductDetail(landing, productSlug, freq);
      if (result?.paymentPlans && result.paymentPlans.length > 0) {
        setPaymentPlans(result.paymentPlans);
        onPlansChange?.(result.paymentPlans);
        // Default to longest term for new frequency
        const maxTerm = Math.max(...result.paymentPlans.map(p => p.term));
        setSelectedTerm(maxTerm);
      }
    } catch (err) {
      console.error('[PricingCalculator] Error fetching plans for frequency', freq, err);
    } finally {
      setIsLoadingPlans(false);
    }
  }, [selectedFrequency, landing, productSlug, onPlansChange]);

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
        paymentFrequency: selectedFrequency,
      });
    }
  }, [selectedTerm, selectedInitialPercent, selectedOption, onSelectionChange]);

  const freqLabel = getFreqLabel(selectedFrequency);
  const hasFrequencySelector = paymentFrequencies && paymentFrequencies.length > 1;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h3 className="text-xl font-semibold text-neutral-800 mb-2">
        Calcula tu cuota
      </h3>
      <p className="text-sm text-neutral-500 mb-4">
        Selecciona el plazo que mejor se ajuste a tu presupuesto
      </p>

      {/* Frequency Selector — only shown when multiple frequencies are available */}
      {hasFrequencySelector && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Frecuencia de pago
          </label>
          <div className="flex flex-wrap gap-2">
            {paymentFrequencies.map((freq) => (
              <button
                key={freq}
                onClick={() => handleFrequencyChange(freq)}
                disabled={isLoadingPlans}
                className={`py-2.5 px-5 text-sm font-semibold rounded-full transition-all cursor-pointer min-h-[40px] ${
                  selectedFrequency === freq
                    ? 'bg-[var(--color-primary)] text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                } ${isLoadingPlans ? 'opacity-60 cursor-wait' : ''}`}
              >
                {FREQ_DISPLAY[freq] ?? freq}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Initial Payment Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Cuota inicial{initialPaymentOptions.length > 1 ? ' (opcional)' : ''}
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
      {isLoadingPlans ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[100px] rounded-xl bg-neutral-100 animate-pulse" />
          ))}
        </div>
      ) : (
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
                onMouseEnter={isHoverCapable ? () => setHoveredTerm(plan.term) : undefined}
                onMouseLeave={isHoverCapable ? () => setHoveredTerm(null) : undefined}
                className={`
                  relative p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-300 min-w-0
                  ${
                    isSelected
                      ? 'bg-[var(--color-primary)] text-white shadow-xl scale-105'
                      : 'bg-white border-2 border-neutral-200 hover:border-[var(--color-primary)] hover:shadow-lg'
                  }
                  ${isHovered && !isSelected ? 'scale-[1.02]' : ''}
                `}
              >
                {isSelected && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    ✓
                  </div>
                )}

                <div className="text-center min-w-0">
                  <p
                    className={`text-xs sm:text-sm font-medium mb-2 ${
                      isSelected ? 'text-white/80' : 'text-neutral-500'
                    }`}
                  >
                    {plan.termMonths ?? termToMonths(plan.term, selectedFrequency)}<br />meses
                  </p>

                  {option.originalQuota && (
                    <p
                      className={`text-[10px] sm:text-xs line-through mb-1 break-words ${
                        isSelected ? 'text-white/60' : 'text-neutral-400'
                      }`}
                    >
                      S/{formatMoneyNoDecimals(Math.floor(option.originalQuota))}
                    </p>
                  )}

                  <p
                    className={`text-lg sm:text-xl font-bold break-words ${
                      isSelected ? 'text-white' : 'text-[var(--color-primary)]'
                    }`}
                  >
                    S/{formatMoneyNoDecimals(Math.floor(option.monthlyQuota))}
                  </p>

                  <p
                    className={`text-[10px] sm:text-xs mt-1 ${
                      isSelected ? 'text-white/80' : 'text-neutral-500'
                    }`}
                  >
                    {freqLabel.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Quote Summary */}
      <div className="mt-6 p-5 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/15 rounded-xl">
        <div className="text-center">
          <p className="text-sm text-neutral-500 mb-1">{freqLabel.summary}</p>
          {selectedOption?.originalQuota && (
            <p className="line-through text-neutral-400 text-xl mb-1">
              S/{formatMoneyNoDecimals(Math.floor(selectedOption.originalQuota))}{freqLabel.short}
            </p>
          )}
          <p className="text-4xl font-bold text-[var(--color-primary)]">
            S/{formatMoneyNoDecimals(Math.floor(selectedOption?.monthlyQuota || 0))}{freqLabel.short}
          </p>
          <p className="text-sm text-neutral-500 mt-2">
            durante {(paymentPlans.find(p => p.term === selectedTerm)?.termMonths ?? termToMonths(selectedTerm, selectedFrequency))} meses
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
