'use client';

/**
 * PricingCalculator - Cards por plazo con opciones precalculadas del backend
 * Las cuotas para cada combinación de plazo + % inicial vienen precalculadas.
 * Soporta selector de frecuencia (semanal / quincenal / mensual) para celulares.
 */

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { PricingCalculatorProps, PaymentPlan, InitialPaymentOption, InitialPaymentPercentage } from '../../../types/detail';
import { formatMoneyNoDecimals } from '../../../utils/formatMoney';
import { formatCuotaDeLanding } from '@/app/prototipos/0.6/utils/formatCuota';
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
  /**
   * En cuántas armadas se cobra la inicial de la opción elegida. 1 = pago
   * único, que es lo que trae todo el catálogo.
   *
   * No es una elección aparte: viene con la opción. Cada modalidad es una celda
   * propia del pricing con su plazo, así que al elegir el plazo el cliente ya
   * eligió cómo paga la inicial.
   */
  initialInstallments: number;
  /** Monto de cada armada. La última absorbe el sobrante del redondeo. */
  initialInstallmentAmounts: number[];
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

/**
 * Cómo se nombra el plazo de un plan, en la unidad en que se cobra.
 *
 * Un plan semanal de 17 semanas se mostraba como «5 meses» —el resultado de
 * `Math.round(17 / 4)`— y el número no coincidía con nada: ni con las 17
 * semanas que dura, ni con las cuotas que la persona va a pagar. En un
 * convenio de cosecha, además, la gente razona en semanas, no en meses.
 */
const UNIDAD_DE_PLAZO: Record<string, string> = {
  semanal: 'semanas',
  quincenal: 'quincenas',
  mensual: 'meses',
};

function unidadDePlazo(frequency: string): string {
  return UNIDAD_DE_PLAZO[frequency] ?? UNIDAD_DE_PLAZO.mensual;
}

export const PricingCalculator: React.FC<PricingCalculatorProps & {
  onSelectionChange?: (selection: PricingSelection) => void;
  controlledTerm?: number;
}> = ({
  paymentPlans: initialPaymentPlans,
  defaultTerm,
  defaultInitialPercent = 0,
  defaultFrequency: defaultFrequencyProp,
  productPrice: productPriceProp,
  paymentFrequencies,
  landing,
  productSlug,
  onPlansChange,
  onSelectionChange,
  controlledTerm,
}) => {
  // Active plans (may change when frequency is switched)
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>(initialPaymentPlans);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  // Determine default frequency: URL param > paymentFrequencies hint > 'mensual'
  const defaultFrequency = useMemo(() => {
    if (defaultFrequencyProp && (!paymentFrequencies || paymentFrequencies.includes(defaultFrequencyProp))) {
      return defaultFrequencyProp;
    }
    if (paymentFrequencies && paymentFrequencies.length > 0) {
      if (paymentFrequencies.includes('quincenal')) return 'quincenal';
      return paymentFrequencies[0];
    }
    return 'mensual';
  }, [defaultFrequencyProp, paymentFrequencies]);

  const [selectedFrequency, setSelectedFrequency] = useState(defaultFrequency);

  const [selectedTerm, setSelectedTerm] = useState(() => {
    if (defaultTerm != null) {
      // Exact match (cuotas nativas)
      if (initialPaymentPlans.some(p => p.term === defaultTerm)) return defaultTerm;
      // Fallback: defaultTerm puede venir en meses — buscar por termMonths
      const byMonths = initialPaymentPlans.find(p => p.termMonths === defaultTerm);
      if (byMonths) return byMonths.term;
    }
    // Default: plan más largo disponible
    if (initialPaymentPlans.length > 0) return Math.max(...initialPaymentPlans.map(p => p.term));
    return defaultTerm ?? 36;
  });
  const [selectedInitialPercent, setSelectedInitialPercent] = useState<InitialPaymentPercentage>(defaultInitialPercent as InitialPaymentPercentage);
  const [hoveredTerm, setHoveredTerm] = useState<number | null>(null);
  const isHoverCapable = useHoverCapable();
  const onSelectionChangeRef = useRef(onSelectionChange);
  onSelectionChangeRef.current = onSelectionChange;

  // Sync term from external controller (e.g. Cronograma chips).
  // Guard: skip if already selected to avoid triggering the notification effect.
  useEffect(() => {
    if (controlledTerm == null) return;
    if (paymentPlans.some(p => p.term === controlledTerm)) {
      setSelectedTerm(prev => prev === controlledTerm ? prev : controlledTerm);
    }
  }, [controlledTerm, paymentPlans]);

  // On mount: if default frequency differs from mensual, fetch correct plans
  useEffect(() => {
    if (defaultFrequency === 'mensual' || !landing || !productSlug) return;
    // Si los planes iniciales YA vienen en la frecuencia deseada (el consumidor
    // los pidió con esa frecuencia), no hay nada que refetchear. Evita una
    // llamada redundante al detalle cuando el equipo se carga ya en su
    // frecuencia real (ej. celular semanal en la oferta).
    if (initialPaymentPlans.some((p) => p.paymentFrequency === defaultFrequency)) return;
    let cancelled = false;
    setIsLoadingPlans(true);
    fetchProductDetail(landing, productSlug, defaultFrequency)
      .then((result) => {
        if (cancelled) return;
        if (result?.paymentPlans && result.paymentPlans.length > 0) {
          setPaymentPlans(result.paymentPlans);
          onPlansChange?.(result.paymentPlans);
          // Intentar respetar defaultTerm: primero match exacto, luego por termMonths, luego el más largo
          const plans = result.paymentPlans;
          const resolved = defaultTerm != null
            ? (plans.find(p => p.term === defaultTerm)?.term
              ?? plans.find(p => p.termMonths === defaultTerm)?.term
              ?? Math.max(...plans.map(p => p.term)))
            : Math.max(...plans.map(p => p.term));
          setSelectedTerm(resolved);
        }
      })
      .catch((err) => {
        if (!cancelled) console.error('[PricingCalculator] Error fetching initial plans', err);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPlans(false);
      });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        const maxTerm = Math.max(...result.paymentPlans.map(p => p.term));
        setSelectedTerm(maxTerm);
        // Notificar directamente — no esperar el useEffect que puede tener timing issues
        const newOption = result.paymentPlans.find(p => p.term === maxTerm)?.options
          ?.find(o => o.initialPercent === selectedInitialPercent)
          ?? result.paymentPlans.find(p => p.term === maxTerm)?.options?.[0];
        if (newOption && onSelectionChange) {
          onSelectionChange({
            term: maxTerm,
            initialPercent: selectedInitialPercent,
            monthlyQuota: newOption.monthlyQuota,
            initialAmount: newOption.initialAmount,
            paymentFrequency: freq,
            initialInstallments: newOption.initialInstallments ?? 1,
            initialInstallmentAmounts: newOption.initialInstallmentAmounts ?? [],
          });
        }
      }
    } catch (err) {
      console.error('[PricingCalculator] Error fetching plans for frequency', freq, err);
    } finally {
      setIsLoadingPlans(false);
    }
  }, [selectedFrequency, selectedInitialPercent, landing, productSlug, onPlansChange, onSelectionChange]);

  // Obtener opciones de pago inicial del primer plan (son iguales para todos los plazos)
  const initialPaymentOptions = useMemo(() => {
    const firstPlan = paymentPlans[0];
    if (!firstPlan?.options) return [];

    return firstPlan.options.map((opt) => ({
      percent: opt.initialPercent,
      amount: opt.initialAmount,
      label: opt.initialPercent === 0
        ? 'Sin inicial'
        : `S/${formatCuotaDeLanding(opt.initialAmount, landing)}`,
    }));
  }, [paymentPlans]);

  // ── Armadas de la inicial ────────────────────────────────────────────────
  //
  // Cada modalidad (1, 2 o 4 armadas) es una celda propia del pricing con su
  // propio plazo de financiamiento, y las armadas SE DESCUENTAN del plazo
  // total: 13 cuotas + 4 armadas = 15 + 2 = 17 + 0 = 17 semanas. Por eso el
  // chip cambia el plazo de financiamiento pero deja intacto el plazo total,
  // que es lo que el cliente tiene en la cabeza ("son 17 semanas").

  /** Armadas de un plan, para el % de inicial elegido. */
  const armadasDe = useCallback((plan: PaymentPlan | undefined): number => {
    if (!plan?.options) return 1;
    const opt = plan.options.find(o => o.initialPercent === selectedInitialPercent) ?? plan.options[0];
    return opt?.initialInstallments ?? 1;
  }, [selectedInitialPercent]);

  /** Semanas/meses totales del plan: financiamiento + armadas. */
  const plazoTotalDe = useCallback((plan: PaymentPlan | undefined): number => {
    if (!plan) return 0;
    const n = armadasDe(plan);
    return plan.term + (n > 1 ? n : 0);
  }, [armadasDe]);

  /**
   * Modalidades ofrecidas. Con una sola no hay nada que elegir y los chips no
   * se renderizan: es el caso de todo el catálogo, que queda igual que antes.
   */
  const armadasDisponibles = useMemo(() => {
    const vistas = new Set<number>();
    paymentPlans.forEach(p => vistas.add(armadasDe(p)));
    return [...vistas].sort((a, b) => a - b);
  }, [paymentPlans, armadasDe]);

  const hayArmadas = armadasDisponibles.length > 1;

  const [selectedArmadas, setSelectedArmadas] = useState(1);

  // Si la modalidad elegida deja de existir (cambió el % de inicial o la
  // frecuencia), cae a la primera disponible en vez de quedar sin planes.
  useEffect(() => {
    if (hayArmadas && !armadasDisponibles.includes(selectedArmadas)) {
      setSelectedArmadas(armadasDisponibles[0]);
    }
  }, [armadasDisponibles, hayArmadas, selectedArmadas]);

  /** Planes de la modalidad elegida. Sin armadas, todos. */
  const planesVisibles = useMemo(
    () => (hayArmadas ? paymentPlans.filter(p => armadasDe(p) === selectedArmadas) : paymentPlans),
    [paymentPlans, hayArmadas, selectedArmadas, armadasDe],
  );

  /** Un plan cualquiera de esa modalidad — solo para leer los montos del chip. */
  const planesVisiblesPara = (n: number) => paymentPlans.find(p => armadasDe(p) === n);

  /** Cambia la modalidad conservando el plazo total. */
  const cambiarArmadas = (n: number) => {
    const totalActual = plazoTotalDe(paymentPlans.find(p => p.term === selectedTerm));
    setSelectedArmadas(n);

    const candidatos = paymentPlans.filter(p => armadasDe(p) === n);
    // El mismo plazo total; si no existe, el más cercano — nunca dejar al
    // usuario sin plazo seleccionado.
    const destino = candidatos.find(p => plazoTotalDe(p) === totalActual)
      ?? candidatos.sort((a, b) =>
        Math.abs(plazoTotalDe(a) - totalActual) - Math.abs(plazoTotalDe(b) - totalActual))[0];
    if (destino) setSelectedTerm(destino.term);
  };

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

  // Se avisa TAMBIEN en el montaje, no solo cuando el usuario cambia algo.
  //
  // Saltarse la primera emision dejaba a los consumidores sin saber que hay
  // seleccionado hasta que alguien tocara el calculador, y ellos caen a los
  // defaults del producto mientras tanto. En la barra de "Lo quiero" de
  // copia-home eso se veia entero: el calculador decia "S/52.90/sem, 17
  // semanas, + S/250 de inicial" y justo debajo la barra decia "S/52/mes, en
  // 15 meses, sin inicial" — los cuatro valores equivocados a la vez, sobre el
  // mismo equipo.
  //
  // No dispara analytics de mas: `handlePricingSelectionChange` solo trackea
  // cuando hay un `prev` con el que comparar, y en la primera emision no lo hay.
  useEffect(() => {
    if (onSelectionChangeRef.current && selectedOption) {
      onSelectionChangeRef.current({
        term: selectedTerm,
        initialPercent: selectedInitialPercent,
        monthlyQuota: selectedOption.monthlyQuota,
        initialAmount: selectedOption.initialAmount,
        paymentFrequency: selectedFrequency,
        initialInstallments: selectedOption.initialInstallments ?? 1,
        initialInstallmentAmounts: selectedOption.initialInstallmentAmounts ?? [],
      });
    }
  }, [selectedTerm, selectedInitialPercent, selectedOption]);

  const freqLabel = getFreqLabel(selectedFrequency);
  const hasFrequencySelector = paymentFrequencies && paymentFrequencies.length > 1;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-[var(--surface,#fff)] rounded-2xl shadow-lg">
      <h3 className="text-xl font-semibold text-[var(--text-strong,#1f2937)] mb-2">
        Calcula tu cuota
      </h3>
      <p className="text-sm text-[var(--text-muted,#6b7280)] mb-4">
        Selecciona el plazo que mejor se ajuste a tu presupuesto
      </p>

      {/* Frequency Selector — only shown when multiple frequencies are available */}
      {hasFrequencySelector && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text,#374151)] mb-3">
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
                    : 'bg-[var(--surface-2,#f3f4f6)] text-[var(--text,#374151)] hover:bg-[var(--surface-2,#e5e7eb)]'
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
        <label className="block text-sm font-medium text-[var(--text,#374151)] mb-3">
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
                  : 'bg-[var(--surface-2,#f3f4f6)] text-[var(--text,#374151)] hover:bg-[var(--surface-2,#e5e7eb)]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Armadas de la inicial — solo si hay mas de una modalidad */}
      {hayArmadas && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text,#374151)] mb-1">
            ¿Cómo pagas la inicial?
          </label>
          <p className="text-xs text-[var(--text-muted,#6b7280)] mb-3">
            Fraccionarla baja lo que pagas al inicio, pero sube la cuota: el
            plazo total no cambia.
          </p>
          <div className="flex flex-wrap gap-2">
            {armadasDisponibles.map((n) => {
              const plan = planesVisiblesPara(n);
              const opt = plan?.options?.find(o => o.initialPercent === selectedInitialPercent) ?? plan?.options?.[0];
              const cadaUna = opt?.initialInstallmentAmounts?.[0]
                ?? (opt ? opt.initialAmount / n : 0);
              const activo = selectedArmadas === n;

              return (
                <button
                  key={n}
                  onClick={() => cambiarArmadas(n)}
                  aria-pressed={activo}
                  className={`py-2.5 px-4 text-sm font-medium rounded-full transition-all cursor-pointer min-h-[40px] ${
                    activo
                      ? 'bg-[var(--color-primary)] text-white shadow-md'
                      : 'bg-[var(--surface-2,#f3f4f6)] text-[var(--text,#374151)] hover:bg-[var(--surface-2,#e5e7eb)]'
                  }`}
                >
                  {n === 1 ? 'En 1 pago' : `En ${n} partes`}
                  <span className={`block text-[11px] font-normal ${activo ? 'text-white/80' : 'text-[var(--text-muted,#6b7280)]'}`}>
                    {n === 1
                      ? `S/${formatCuotaDeLanding(opt?.initialAmount ?? 0, landing)}`
                      : `S/${formatCuotaDeLanding(cadaUna, landing)} c/u`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Term Cards */}
      {isLoadingPlans ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[100px] rounded-xl bg-[var(--surface-2,#f3f4f6)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...planesVisibles].sort((a, b) => a.term - b.term).map((plan) => {
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
                      : 'bg-[var(--surface,#fff)] border-2 border-[var(--border-soft,#e5e7eb)] hover:border-[var(--color-primary)] hover:shadow-lg'
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
                      isSelected ? 'text-white/80' : 'text-[var(--text-muted,#6b7280)]'
                    }`}
                  >
                    {/* El plazo TOTAL en la unidad en que se cobra. Un plan de 17
                        semanas decia «5 meses» y ese numero no coincidia con nada:
                        ni con lo que dura ni con las cuotas que se pagan. */}
                    {plazoTotalDe(plan)}<br />{unidadDePlazo(selectedFrequency)}
                  </p>

                  {option.originalQuota && (
                    <p
                      className={`text-[10px] sm:text-xs line-through mb-1 break-words ${
                        isSelected ? 'text-white/60' : 'text-[var(--text-faint,#9ca3af)]'
                      }`}
                    >
                      S/{formatCuotaDeLanding(option.originalQuota, landing)}
                    </p>
                  )}

                  <p
                    className={`font-bold whitespace-nowrap ${
                      option.monthlyQuota >= 1000 ? 'text-sm sm:text-base' : 'text-lg sm:text-xl'
                    } ${isSelected ? 'text-white' : 'text-[var(--color-primary)]'}`}
                  >
                    S/{formatCuotaDeLanding(option.monthlyQuota, landing)}
                  </p>

                  <p
                    className={`text-[10px] sm:text-xs mt-1 ${
                      isSelected ? 'text-white/80' : 'text-[var(--text-muted,#6b7280)]'
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
          <p className="text-sm text-[var(--text-muted,#6b7280)] mb-1">{freqLabel.summary}</p>
          {selectedOption?.originalQuota && (
            <p className="line-through text-[var(--text-faint,#9ca3af)] text-xl mb-1">
              S/{formatCuotaDeLanding(selectedOption.originalQuota, landing)}{freqLabel.short}
            </p>
          )}
          <p className="text-4xl font-bold text-[var(--color-primary)]">
            S/{formatCuotaDeLanding(selectedOption?.monthlyQuota || 0, landing)}{freqLabel.short}
          </p>
          <p className="text-sm text-[var(--text-muted,#6b7280)] mt-2">
            durante {plazoTotalDe(paymentPlans.find(p => p.term === selectedTerm))}{' '}
            {unidadDePlazo(selectedFrequency)}
            {selectedInitialPercent > 0 && selectedOption && (
              <span className="block text-xs text-[var(--text-faint,#9ca3af)] mt-1">
                + S/{formatCuotaDeLanding(selectedOption.initialAmount, landing)} de inicial
                {/* Con la inicial fraccionada el monto de arriba es el total, no
                    lo que se paga de una: sin este detalle el cliente cree que
                    debe juntar los S/114 completos antes de empezar. */}
                {(selectedOption.initialInstallments ?? 1) > 1 && (
                  <span className="block mt-0.5">
                    en {selectedOption.initialInstallments} armadas semanales de{' '}
                    S/{formatCuotaDeLanding(selectedOption.initialInstallmentAmounts?.[0]
                        ?? selectedOption.initialAmount / selectedOption.initialInstallments!, landing)}
                  </span>
                )}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;
