'use client';

/**
 * Cronograma - Tabla de Cuotas Mensual (basado en V2)
 * Detailed table showing each month's payment with collapsible sections.
 * Usa datos de ejemplo (paymentPlans) para mostrar cuotas consistentes por plazo.
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'next/navigation';
import { Calendar, Check, ChevronDown, ChevronUp, Info, Download, FileText, Percent, AlertCircle, Scale, X, Loader2 } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Divider } from '@nextui-org/react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useIsMobile, Toast } from '@/app/prototipos/_shared';
import { CronogramaProps, CronogramaVersion, InitialPaymentPercentage } from '../../../types/detail';
import { generateCronogramaPDF } from '../../../utils/generateCronogramaPDF';
import { useAnalytics } from '@/app/prototipos/0.6/analytics/useAnalytics';
import { construirFilas } from './filasDelCronograma';
import { desgloseDeFila } from './desgloseDeFila';
import { formatCuota, landingMuestraCentavos } from '@/app/prototipos/0.6/utils/formatCuota';

// Cálculo de amortización francesa (cuota fija)
const calculateAmortization = (principal: number, annualRate: number, months: number) => {
  const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
  const schedule = [];
  let balance = principal;

  for (let i = 0; i < months; i++) {
    const interest = balance * monthlyRate;
    const quota = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const capital = quota - interest;
    balance = Math.max(0, balance - capital);

    schedule.push({
      month: i + 1,
      capital,
      interest,
      quota,
      balance,
    });
  }

  return schedule;
};

// Valores por defecto para datos financieros (usados si el backend no los provee)
const DEFAULT_FINANCIAL_DATA = {
  tea: 49.36,
  tcea: 52.18,
  comisionDesembolso: 0,
  seguroDesgravamen: 0,
  seguroMultiriesgo: 0,
  gastoNotarial: 0,
  itiConvenio: 0,
};

export const Cronograma: React.FC<CronogramaProps> = ({
  paymentPlans,
  term = 36,
  startDate = new Date(),
  version = 1,
  productId = '',
  productName = 'Producto',
  productBrand = 'BaldeCash',
  productPrice = 0,
  productUrl,
  // Sincronización con PricingCalculator
  selectedTerm: externalSelectedTerm,
  selectedInitialPercent: externalInitialPercent,
  paymentFrequency = 'mensual',
  onTermChange,
  financialData: externalFinancialData,
  showPlatformCommission = false,
}) => {
  const isMobile = useIsMobile();
  const dragControls = useDragControls();
  const params = useParams();
  const landing = (params.landing as string) || '';
  const analytics = useAnalytics();
  // Usar valores externos si están disponibles, sino usar estado interno
  const [internalSelectedTerm, setInternalSelectedTerm] = useState(paymentPlans[0]?.term ?? term);
  const [internalInitialPercent, setInternalInitialPercent] = useState<InitialPaymentPercentage>(0);

  // Determinar si estamos sincronizados con PricingCalculator
  const isSynced = externalSelectedTerm !== undefined;
  const selectedTerm = isSynced ? externalSelectedTerm : internalSelectedTerm;
  const selectedInitialPercent = externalInitialPercent ?? internalInitialPercent;

  // Combinar datos financieros: prioridad opción seleccionada > producto (external) > default
  const FINANCIAL_DATA = {
    ...DEFAULT_FINANCIAL_DATA,
    ...(externalFinancialData || {}),
  };

  // Override TEA/TCEA from selected option if available (backend returns per term+initial%)
  const planForRates = paymentPlans.find(p => p.term === selectedTerm) ?? paymentPlans[0];
  const selectedOption = planForRates?.options.find(o => o.initialPercent === selectedInitialPercent) ?? planForRates?.options[0];
  const effectiveTea = selectedOption?.teaIrr ?? selectedOption?.tea;
  if (effectiveTea != null) {
    FINANCIAL_DATA.tea = effectiveTea;
  }
  if (selectedOption?.tcea != null) {
    FINANCIAL_DATA.tcea = selectedOption.tcea;
  }

  const [showAll, setShowAll] = useState(false);
  const [isModalOpen, setIsModalOpenRaw] = useState(false);
  const setIsModalOpen = useCallback(
    (next: boolean) => {
      setIsModalOpenRaw((prev) => {
        if (prev !== next) {
          analytics.trackCronogramaModal({ open: next, product_id: productId });
        }
        return next;
      });
    },
    [analytics, productId]
  );
  const [showToast, setShowToast] = useState(false);

  // Block body scroll when modal is open (iOS Safari fix)
  useEffect(() => {
    if (isModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY) * -1);
      }
    }
    return () => {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY) * -1);
      }
    };
  }, [isModalOpen]);

  // Obtener cuota del plan según el plazo seleccionado
  const currentPlan = useMemo(() => {
    return paymentPlans.find(p => p.term === selectedTerm) || paymentPlans[0];
  }, [paymentPlans, selectedTerm]);

  /** Armadas de un plan para el % de inicial elegido. Mismo criterio que PricingCalculator. */
  const armadasDe = useCallback((plan: typeof paymentPlans[number] | undefined): number => {
    if (!plan?.options) return 1;
    const opt = plan.options.find(o => o.initialPercent === selectedInitialPercent) ?? plan.options[0];
    return opt?.initialInstallments ?? 1;
  }, [selectedInitialPercent]);

  /** Plazo total: cuotas + armadas. Un pago único es inmediato y no ocupa período. */
  const plazoTotalDe = useCallback((plan: typeof paymentPlans[number] | undefined): number => {
    if (!plan) return 0;
    const n = armadasDe(plan);
    return plan.term + (n > 1 ? n : 0);
  }, [armadasDe]);

  const armadasActuales = armadasDe(currentPlan);

  // Los montos del convenio tienen centavos reales (S/32,20 la cuota, S/33,50
  // la armada): truncarlos miente. El resto del catalogo sigue en enteros —el
  // motor los redondea con floor— y por eso el gate es por landing.
  const conCentavos = landingMuestraCentavos(landing);
  const money = (v: number) => formatCuota(v, { conCentavos });

  /**
   * Los planes que ofrecen los chips: los de la modalidad de inicial vigente.
   *
   * Family Farms trae seis planes que son dos plazos con tres modalidades cada
   * uno —6+4, 8+2 y 10+1 son las tres «10 semanas»—; listarlos crudos ofrecía
   * seis plazos donde hay dos, y encima con el número de cuotas en vez del
   * plazo que la persona eligió. Sin armadas todos los planes son de la misma
   * modalidad, así que para el resto del catálogo la lista queda igual.
   */
  const planesDeLosChips = useMemo(() => {
    const mismos = paymentPlans.filter(p => armadasDe(p) === armadasActuales);
    const porTotal = new Map<number, typeof paymentPlans[number]>();
    (mismos.length > 0 ? mismos : paymentPlans).forEach(p => {
      if (!porTotal.has(plazoTotalDe(p))) porTotal.set(plazoTotalDe(p), p);
    });
    return [...porTotal.entries()].sort((a, b) => a[0] - b[0]);
  }, [paymentPlans, armadasDe, armadasActuales, plazoTotalDe]);

  // Obtener la cuota según el % de inicial seleccionado (sincronizado con PricingCalculator)
  const currentOption = useMemo(() => {
    return currentPlan?.options?.find(opt => opt.initialPercent === selectedInitialPercent)
      || currentPlan?.options?.[0];
  }, [currentPlan, selectedInitialPercent]);

  const adjustedQuota = currentOption?.monthlyQuota || 0;
  const initialAmount = currentOption?.initialAmount || 0;
  const commissionAmount = currentOption?.commissionAmount ?? null;
  // showPlatformCommission is driven by landing config ingredient (platform-commission-on)

  // Calcular amortización para versión detallada
  const amortizationSchedule = useMemo(() => {
    // Derivar principal real desde la cuota usando fórmula inversa de amortización francesa
    // principal = cuota × [(1+r)^n - 1] / [r × (1+r)^n]
    const monthlyRate = Math.pow(1 + FINANCIAL_DATA.tea / 100, 1 / 12) - 1;
    const n = selectedTerm;
    const quota = commissionAmount != null ? adjustedQuota - commissionAmount : adjustedQuota;
    const principal = monthlyRate > 0
      ? quota * (Math.pow(1 + monthlyRate, n) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, n))
      : quota * n;
    return calculateAmortization(principal, FINANCIAL_DATA.tea, n);
  }, [adjustedQuota, selectedTerm, commissionAmount, FINANCIAL_DATA.tea]);

  /** Fecha de una fila. Mensual omite el día: la cuota cae el mismo día del mes. */
  const formatearFecha = useCallback((date: Date) => (
    paymentFrequency === 'mensual'
      ? date.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
      : date.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
  ), [paymentFrequency]);

  const freqLabel = paymentFrequency === 'semanal' ? 'semanal'
    : paymentFrequency === 'quincenal' ? 'quincenal'
    : 'mensual';
  // Inicial de la unidad de plazo para los chips: un plan de 17 SEMANAS
  // mostraba «17m» y esa m sugiere meses.
  const sufijoUnidad = paymentFrequency === 'semanal' ? 's'
    : paymentFrequency === 'quincenal' ? 'q'
    : 'm';

  const freqLabelPlural = paymentFrequency === 'semanal' ? 'semanales'
    : paymentFrequency === 'quincenal' ? 'quincenales'
    : 'mensuales';
  const termUnitPlural = paymentFrequency === 'semanal' ? 'semanas'
    : paymentFrequency === 'quincenal' ? 'quincenas'
    : 'meses';

  /**
   * El calendario completo: las armadas de la inicial y después las cuotas.
   * Sin armadas son exactamente las cuotas de siempre, así que el resto del
   * catálogo no cambia.
   */
  const filas = useMemo(() => construirFilas({
    cuotas: selectedTerm,
    montoCuota: adjustedQuota,
    frecuencia: paymentFrequency,
    inicio: startDate,
    armadas: armadasActuales,
    montosArmadas: currentOption?.initialInstallmentAmounts,
    montoInicial: initialAmount,
  }), [selectedTerm, adjustedQuota, paymentFrequency, startDate, armadasActuales, currentOption, initialAmount]);

  const filasVisibles = showAll ? filas : filas.slice(0, 6);
  const visibleMonths = filasVisibles.length;
  const hasMore = filas.length > 6;
  // Total = cuotas mensuales + cuota inicial (si aplica)
  const totalPayment = (adjustedQuota * selectedTerm) + initialAmount;

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    if (isGeneratingPDF) return;
    analytics.trackCronogramaDownload({
      product_id: productId,
      term: selectedTerm,
      initial_percent: selectedInitialPercent,
    });
    setIsGeneratingPDF(true);
    try {
      // Generar datos para el PDF
      const pdfCommission = commissionAmount != null && commissionAmount > 0 ? Math.floor(commissionAmount) : 0;
      // El PDF lleva las mismas filas que la pantalla: si la inicial se cobra
      // en armadas y el documento descargado solo mostrara las cuotas, se
      // contradiría con lo que la persona acaba de ver.
      const pdfSchedule = filas.map((fila) => {
        const monto = Math.floor(fila.monto);
        if (fila.esArmada) {
          return {
            month: fila.numero,
            date: formatearFecha(fila.fecha),
            capital: monto, interest: 0, commission: 0,
            quota: monto,
            balance: amortizationSchedule[0]?.balance ?? 0,
            label: fila.etiqueta,
          };
        }
        const row = amortizationSchedule[fila.indiceCuota ?? 0];
        const interest = Math.floor(row?.interest ?? 0);
        return {
          month: fila.numero,
          date: formatearFecha(fila.fecha),
          capital: monto - interest - pdfCommission,
          interest,
          commission: pdfCommission,
          quota: monto,
          balance: row?.balance ?? 0,
          label: fila.etiqueta,
        };
      });

      await generateCronogramaPDF({
        productName,
        productBrand,
        productPrice,
        productUrl: productUrl || (typeof window !== 'undefined' ? window.location.href : undefined),
        term: selectedTerm,
        monthlyQuota: adjustedQuota,
        totalPayment,
        amortizationSchedule: pdfSchedule,
        financialData: FINANCIAL_DATA,
        generatedDate: new Date(),
        // Cuota inicial (si aplica)
        initialAmount: selectedInitialPercent > 0 ? initialAmount : undefined,
        initialPercent: selectedInitialPercent > 0 ? selectedInitialPercent : undefined,
        commissionAmount: commissionAmount,
        paymentFrequency,
      });

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Error generando PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <>
      <div className="w-full bg-[var(--surface,#fff)] rounded-2xl p-6 shadow-sm border border-[var(--border-soft,#e5e7eb)]">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(var(--color-primary-rgb),0.10)] flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-strong,#111827)]">Detalle de Cuotas</h3>
              {/* Con la inicial fraccionada el encabezado nombra las dos cosas:
                  contar solo las cuotas escondía las armadas, y sumarlas todas
                  escondía que la inicial se paga aparte. */}
              {armadasActuales > 1 ? (
                <>
                  <p className="text-sm text-[var(--text-muted,#6b7280)]">{selectedTerm} cuotas {freqLabelPlural}</p>
                  <p className="text-sm text-[var(--color-primary)]">+ {armadasActuales} armadas de inicial</p>
                </>
              ) : (
                <p className="text-sm text-[var(--text-muted,#6b7280)]">{selectedTerm} pagos {freqLabelPlural}</p>
              )}
            </div>
          </div>

          {/* Term Pills */}
          <div className="flex gap-1 flex-wrap">
            {planesDeLosChips.map(([plazoTotal, plan]) => (
              <button
                key={plazoTotal}
                onClick={() => {
                  setShowAll(false);
                  if (isSynced) {
                    onTermChange?.(plan.term);
                  } else {
                    setInternalSelectedTerm(plan.term);
                  }
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                  plazoTotalDe(currentPlan) === plazoTotal
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--surface-2,#f3f4f6)] text-[var(--text-muted,#4b5563)] hover:bg-[var(--surface-2,#e5e7eb)]'
                }`}
              >
                {/* El plazo total que la persona eligió, en su unidad real: una
                    «m» en un plan semanal sugiere meses y confunde. */}
                {plazoTotal}{sufijoUnidad}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Table - Version 1: Simple.
            Mobile (< sm): card list fallback. Desktop (sm+): table. */}
        {version === 1 && (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden space-y-2">
              {filasVisibles.map((fila, i) => {
                const isLast = fila.numero === filas.length;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      isLast
                        ? 'bg-green-50 border-green-200'
                        : fila.esArmada
                          ? 'bg-[rgba(var(--color-primary-rgb),0.04)] border-[rgba(var(--color-primary-rgb),0.25)]'
                          : 'bg-[var(--surface,#fff)] border-[var(--border-soft,#e5e7eb)]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isLast
                        ? 'bg-green-100 text-green-600'
                        : 'bg-[rgba(var(--color-primary-rgb),0.10)] text-[var(--color-primary)]'
                    }`}>
                      {fila.numero}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--text-muted,#6b7280)] capitalize">{fila.etiqueta}</p>
                      <p className="text-sm text-[var(--text-muted,#4b5563)] capitalize truncate">{formatearFecha(fila.fecha)}</p>
                    </div>
                    <span className="text-sm font-semibold text-[var(--text-strong,#111827)] flex-shrink-0">
                      S/{money(fila.monto)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Desktop/tablet table */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-[var(--border-soft,#e5e7eb)]">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="bg-[var(--surface-bg,#fafafa)]">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-muted,#6b7280)] uppercase">Cuota</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-muted,#6b7280)] uppercase">Fecha</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-[var(--text-muted,#6b7280)] uppercase">Monto</th>
                </tr>
              </thead>
              <tbody>
                {filasVisibles.map((fila, i) => (
                  <tr
                    key={i}
                    className={`border-t border-[var(--border-soft,#f3f4f6)] ${i === visibleMonths - 1 && !showAll ? 'bg-gradient-to-t from-[var(--surface,#fff)] to-transparent' : ''} ${fila.esArmada ? 'bg-[rgba(var(--color-primary-rgb),0.04)]' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          fila.numero === filas.length
                            ? 'bg-green-100 text-green-600'
                            : 'bg-[rgba(var(--color-primary-rgb),0.10)] text-[var(--color-primary)]'
                        }`}>
                          {fila.numero}
                        </div>
                        {/* La armada se nombra: si no, se lee como una cuota
                            más y la inicial parece haber desaparecido. */}
                        {fila.esArmada && (
                          <span className="text-xs font-medium text-[var(--color-primary)]">{fila.etiqueta}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-[var(--text-muted,#4b5563)] capitalize">
                      {formatearFecha(fila.fecha)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-semibold text-[var(--text-strong,#111827)]">
                        S/{money(fila.monto)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}

        {/* Payment Table - Version 2: Detallado.
            Mobile (< sm): card list fallback with full breakdown.
            Desktop (sm+): 7-column table. */}
        {version === 2 && (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {filasVisibles.map((fila, i) => {
                const amort = fila.indiceCuota != null ? amortizationSchedule[fila.indiceCuota] : undefined;
                const isLast = fila.numero === filas.length;
                const { monto, capital, interest, commission, balance } =
                  desgloseDeFila(fila, { amort, commissionAmount, conCentavos });
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border ${
                      isLast
                        ? 'bg-green-50 border-green-200'
                        : fila.esArmada
                          ? 'bg-[rgba(var(--color-primary-rgb),0.04)] border-[rgba(var(--color-primary-rgb),0.25)]'
                          : 'bg-[var(--surface,#fff)] border-[var(--border-soft,#e5e7eb)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          isLast
                            ? 'bg-green-100 text-green-600'
                            : 'bg-[rgba(var(--color-primary-rgb),0.10)] text-[var(--color-primary)]'
                        }`}>
                          {fila.numero}
                        </div>
                        <p className="text-xs text-[var(--text-muted,#6b7280)] capitalize truncate">{formatearFecha(fila.fecha)}</p>
                      </div>
                      <span className="text-sm font-semibold text-[var(--text-strong,#111827)]">
                        S/{money(monto)}
                      </span>
                    </div>
                    {/* La armada no amortiza: es parte de la inicial, así que
                        desglosarla en capital/interés sería inventar números. */}
                    {fila.esArmada ? (
                      <div className="pt-2 border-t border-[var(--border-soft,#f3f4f6)] text-[11px] text-[var(--color-primary)] font-medium">
                        {fila.etiqueta} — parte de la cuota inicial
                      </div>
                    ) : (
                    <div className="pt-2 border-t border-[var(--border-soft,#f3f4f6)] grid grid-cols-2 gap-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-faint,#9ca3af)]">Capital</span>
                        <span className="text-[var(--text,#374151)]">S/{money(capital)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-faint,#9ca3af)]">Interés</span>
                        <span className="text-[var(--text,#374151)]">S/{money(interest)}</span>
                      </div>
                      {commissionAmount != null && commissionAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[var(--text-faint,#9ca3af)]">Comisión</span>
                          <span className="text-[var(--text,#374151)]">S/{money(commission)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-[var(--text-faint,#9ca3af)]">Saldo</span>
                        <span className="text-[var(--text,#374151)]">S/{money(amort?.balance ?? 0)}</span>
                      </div>
                    </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop/tablet table */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-[var(--border-soft,#e5e7eb)]">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-[var(--surface-bg,#fafafa)]">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-[var(--text-muted,#6b7280)] uppercase">Cuota</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-[var(--text-muted,#6b7280)] uppercase">Fecha</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-[var(--text-muted,#6b7280)] uppercase">Capital</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-[var(--text-muted,#6b7280)] uppercase">Interés</th>
                  {commissionAmount != null && commissionAmount > 0 && (
                    <th className="text-right py-3 px-3 text-xs font-semibold text-[var(--text-muted,#6b7280)] uppercase">Comisión</th>
                  )}
                  <th className="text-right py-3 px-3 text-xs font-semibold text-[var(--text-muted,#6b7280)] uppercase">Monto</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-[var(--text-muted,#6b7280)] uppercase">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {filasVisibles.map((fila, i) => {
                  const amort = fila.indiceCuota != null ? amortizationSchedule[fila.indiceCuota] : undefined;
                  return (
                    <tr
                      key={i}
                      className={`border-t border-[var(--border-soft,#f3f4f6)] ${i === visibleMonths - 1 && !showAll ? 'bg-gradient-to-t from-[var(--surface,#fff)] to-transparent' : ''} ${fila.esArmada ? 'bg-[rgba(var(--color-primary-rgb),0.04)]' : ''}`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            fila.numero === filas.length
                              ? 'bg-green-100 text-green-600'
                              : 'bg-[rgba(var(--color-primary-rgb),0.10)] text-[var(--color-primary)]'
                          }`}>
                            {fila.numero}
                          </div>
                          {fila.esArmada && (
                            <span className="text-xs font-medium text-[var(--color-primary)] whitespace-nowrap">{fila.etiqueta}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-sm text-[var(--text-muted,#4b5563)] capitalize">
                        {formatearFecha(fila.fecha)}
                      </td>
                      {(() => {
                        // Mismo desglose probado que el resto: el capital sale por
                        // resta para que las columnas sumen, y la armada no lleva
                        // desglose porque no amortiza.
                        const { monto, capital, interest, commission } =
                          desgloseDeFila(fila, { amort, commissionAmount, conCentavos });
                        return (
                          <>
                            <td className="py-3 px-3 text-right text-sm text-[var(--text,#374151)]">
                              {fila.esArmada ? '—' : `S/${money(capital)}`}
                            </td>
                            <td className="py-3 px-3 text-right text-sm text-[var(--text-muted,#6b7280)]">
                              {fila.esArmada ? '—' : `S/${money(interest)}`}
                            </td>
                            {commissionAmount != null && commissionAmount > 0 && (
                              <td className="py-3 px-3 text-right text-sm text-[var(--text-muted,#6b7280)]">
                                {fila.esArmada ? '—' : `S/${money(commission)}`}
                              </td>
                            )}
                            <td className="py-3 px-3 text-right">
                              <span className="text-sm font-semibold text-[var(--text-strong,#111827)]">
                                S/{money(monto)}
                              </span>
                            </td>
                          </>
                        );
                      })()}
                      <td className="py-3 px-3 text-right text-sm text-[var(--text-muted,#4b5563)]">
                        S/{money(amort?.balance ?? 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </>
        )}

        {/* Payment Table - Version 3: Cards */}
        {version === 3 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filasVisibles.map((fila, i) => {
              const amort = fila.indiceCuota != null ? amortizationSchedule[fila.indiceCuota] : undefined;
              const isLast = fila.numero === filas.length;
              return (
                <div
                  key={i}
                  className={`p-3 rounded-xl border transition-all ${
                    isLast
                      ? 'bg-green-50 border-green-200'
                      : fila.esArmada
                        ? 'bg-[rgba(var(--color-primary-rgb),0.04)] border-[rgba(var(--color-primary-rgb),0.25)]'
                        : 'bg-[var(--surface,#fff)] border-[var(--border-soft,#e5e7eb)] hover:border-[rgba(var(--color-primary-rgb),0.30)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isLast
                        ? 'bg-green-100 text-green-600'
                        : 'bg-[rgba(var(--color-primary-rgb),0.10)] text-[var(--color-primary)]'
                    }`}>
                      {fila.numero}
                    </div>
                    {isLast && <Check className="w-4 h-4 text-green-500" />}
                  </div>
                  <p className="text-xs text-[var(--text-muted,#6b7280)] capitalize mb-1">
                    {formatearFecha(fila.fecha)}
                  </p>
                  <p className="text-sm font-bold text-[var(--text-strong,#111827)]">
                    S/{money(fila.monto)}
                  </p>
                  <div className="mt-2 pt-2 border-t border-[var(--border-soft,#f3f4f6)]">
                    {fila.esArmada ? (
                      <p className="text-[10px] font-medium text-[var(--color-primary)]">{fila.etiqueta}</p>
                    ) : (
                      <>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-[var(--text-faint,#9ca3af)]">Capital</span>
                          <span className="text-[var(--text-muted,#4b5563)]">S/{money(amort?.capital || 0)}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-[var(--text-faint,#9ca3af)]">Interés</span>
                          <span className="text-[var(--text-muted,#4b5563)]">S/{money(amort?.interest || 0)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Show More/Less */}
        {hasMore && (
          <button
            onClick={() => {
              const next = !showAll;
              setShowAll(next);
              analytics.trackCronogramaExpand({
                product_id: productId,
                expanded: next,
                term: selectedTerm,
              });
            }}
            className="w-full mt-4 py-2 flex items-center justify-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[rgba(var(--color-primary-rgb),0.05)] rounded-lg transition-colors cursor-pointer"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Ver menos
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Ver los {filas.length - 6} pagos restantes
              </>
            )}
          </button>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex gap-3">
          <Button
            variant="bordered"
            className="flex-1 border-[var(--color-primary)] text-[var(--color-primary)] cursor-pointer"
            startContent={<Info className="w-4 h-4" />}
            onPress={() => setIsModalOpen(true)}
          >
            Ver detalle de pago
          </Button>
          <Button
            variant="bordered"
            className="flex-1 border-[var(--border-strong,#d1d5db)] text-[var(--text,#374151)] cursor-pointer"
            startContent={isGeneratingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            onPress={handleDownloadPDF}
            isDisabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? 'Generando...' : 'Descargar PDF'}
          </Button>
        </div>
      </div>

      {/* Payment Details - Mobile: Bottom Sheet */}
      {isMobile ? (
        createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsModalOpen(false)}
                onTouchMove={(e) => e.preventDefault()}
                className="fixed inset-0 bg-black/50 z-[10000]"
                style={{ touchAction: 'none' }}
              />

              {/* Bottom Sheet */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                drag="y"
                dragControls={dragControls}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.5 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 100) {
                    setIsModalOpen(false);
                  }
                }}
                className="fixed bottom-0 left-0 right-0 bg-[var(--surface,#fff)] rounded-t-3xl z-[10001] max-h-[calc(100vh-12rem)] flex flex-col"
                style={{ overscrollBehavior: 'contain' }}
              >
                {/* Drag Handle */}
                <div
                  onPointerDown={(e) => dragControls.start(e)}
                  className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
                >
                  <div className="w-10 h-1.5 bg-[var(--surface-2,#d4d4d4)] rounded-full" />
                </div>

                {/* Header */}
                <div className="bg-[var(--color-primary)] mx-4 rounded-xl px-4 py-3 flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-[var(--surface,#fff)]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold text-white">Detalle del Financiamiento</h2>
                    <p className="text-xs text-white/60">Información completa de tu crédito</p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-7 h-7 rounded-full bg-[var(--surface,#fff)]/20 hover:bg-[var(--surface,#fff)]/30 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Body - scrollable */}
                <div
                  className="flex-1 overflow-y-auto px-4 pb-4"
                  style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
                >
                  {/* Summary */}
                  <div className="bg-[rgba(var(--color-primary-rgb),0.05)] rounded-xl p-4 mb-1">
                    {productPrice > 0 && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[var(--text-muted,#4b5563)]">Precio de lista del equipo</span>
                        <span className="font-semibold text-[var(--text-strong,#111827)]">S/{money(productPrice)}</span>
                      </div>
                    )}
                    {selectedInitialPercent > 0 && initialAmount > 0 && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[var(--text-muted,#4b5563)]">Cuota inicial</span>
                        <span className="font-semibold text-[var(--text-strong,#111827)]">S/{money(initialAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[var(--text-muted,#4b5563)]">Cuota {freqLabel}</span>
                      <span className="text-xl font-bold text-[var(--color-primary)]">S/{money(adjustedQuota)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--text-muted,#4b5563)]">Plazo</span>
                      <span className="font-semibold text-[var(--text-strong,#111827)]">{selectedTerm} {termUnitPlural}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5 mb-4">
                    <Info className="w-3.5 h-3.5 text-[var(--text-faint,#9ca3af)] flex-shrink-0 mt-px" />
                    <p className="text-xs text-[var(--text-faint,#9ca3af)]">
                      La cuota está compuesta por capital + interés{commissionAmount != null && commissionAmount > 0 ? ' + comisión' : ''}.
                    </p>
                  </div>

                  {/* Financial Details */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-[var(--text,#374151)] flex items-center gap-2">
                      <Percent className="w-4 h-4 text-[var(--color-primary)]" />
                      Tasas de Interés
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[var(--surface-bg,#fafafa)] rounded-lg p-3">
                        <p className="text-xs text-[var(--text-muted,#6b7280)] mb-1">TEA</p>
                        <p className="text-lg font-bold text-[var(--text-strong,#111827)]">{FINANCIAL_DATA.tea}%</p>
                      </div>
                      <div className="bg-[var(--surface-bg,#fafafa)] rounded-lg p-3">
                        <p className="text-xs text-[var(--text-muted,#6b7280)] mb-1">TCEA</p>
                        <p className="text-lg font-bold text-[var(--text-strong,#111827)]">{FINANCIAL_DATA.tcea}%</p>
                      </div>
                    </div>

                    {/* <div className="border-t border-[var(--border-soft,#e5e7eb)] my-4" />

                    <h4 className="text-sm font-semibold text-[var(--text,#374151)] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[var(--color-primary)]" />
                      Seguros
                    </h4>
                    <div className="space-y-2">
                      {showPlatformCommission && commissionAmount != null && commissionAmount > 0 && (
                        <div className="flex justify-between py-2 border-b border-[var(--border-soft,#f3f4f6)]">
                          <span className="text-sm text-[var(--text-muted,#4b5563)]">Comisión de plataformas digitales</span>
                          <span className="text-sm font-medium text-[var(--text-strong,#111827)]">S/{commissionAmount}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 border-b border-[var(--border-soft,#f3f4f6)]">
                        <span className="text-sm text-[var(--text-muted,#4b5563)]">Seguro multiriesgo</span>
                        <span className="text-sm font-medium text-[var(--text-strong,#111827)]">
                          {FINANCIAL_DATA.seguroMultiriesgo > 0 ? `S/${FINANCIAL_DATA.seguroMultiriesgo}` : 'No aplica'}
                        </span>
                      </div>
                    </div> */}

                    <div className="border-t border-[var(--border-soft,#e5e7eb)] my-4" />

                    {/* Total */}
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-[var(--text-muted,#4b5563)]">Monto total a pagar</p>
                          <p className="text-xs text-[var(--text-muted,#6b7280)]">
                            {selectedInitialPercent > 0
                              ? `S/${money(initialAmount)} inicial + ${selectedTerm} cuotas ${freqLabelPlural} de S/${money(adjustedQuota)}`
                              : `${selectedTerm} cuotas ${freqLabelPlural} de S/${money(adjustedQuota)}`
                            }
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-green-600">S/{money(totalPayment)}</p>
                      </div>
                    </div>

                    {/* Legal Notice */}
                    <div className="flex items-start gap-2 text-xs text-[var(--text-muted,#6b7280)] mt-4">
                      <Scale className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>
                        Esta información es referencial. Las tasas y condiciones finales serán confirmadas al momento de la aprobación.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-[var(--border-soft,#e5e7eb)] bg-[var(--surface,#fff)] p-4 flex gap-3">
                  <Button
                    variant="bordered"
                    className="flex-1 border-[var(--border-strong,#d1d5db)] cursor-pointer"
                    onPress={() => setIsModalOpen(false)}
                  >
                    Cerrar
                  </Button>
                  <Button
                    className="flex-1 bg-[var(--color-primary)] text-white cursor-pointer"
                    startContent={isGeneratingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    onPress={handleDownloadPDF}
                    isDisabled={isGeneratingPDF}
                  >
                    {isGeneratingPDF ? 'Generando...' : 'Descargar PDF'}
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
        )
      ) : (
        /* Payment Details - Desktop: Modal */
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="lg"
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[9999]",
            backdrop: "bg-black/50 backdrop-blur-sm z-[9998]",
            base: "bg-[var(--surface,#fff)] rounded-2xl overflow-hidden max-h-[90vh]",
            body: "p-0",
            closeButton: "hidden",
          }}
        >
          <ModalContent className="bg-[var(--surface,#fff)] overflow-hidden">
            <ModalHeader className="bg-[var(--color-primary)] flex items-center gap-3 p-0 px-5 py-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface,#fff)]/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-white">Detalle del Financiamiento</h3>
                <p className="text-xs font-normal text-white/60">Información completa de tu crédito</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[var(--surface,#fff)]/20 hover:bg-[var(--surface,#fff)]/30 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </ModalHeader>
            <ModalBody className="p-5 pt-6 overflow-y-auto">
              {/* Summary */}
              <div className="bg-[rgba(var(--color-primary-rgb),0.05)] rounded-xl p-4 mb-1">
                {productPrice > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[var(--text-muted,#4b5563)]">Precio de lista del equipo</span>
                    <span className="font-semibold text-[var(--text-strong,#111827)]">S/{money(productPrice)}</span>
                  </div>
                )}
                {selectedInitialPercent > 0 && initialAmount > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[var(--text-muted,#4b5563)]">Cuota inicial</span>
                    <span className="font-semibold text-[var(--text-strong,#111827)]">S/{money(initialAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[var(--text-muted,#4b5563)]">Cuota {freqLabel}</span>
                  <span className="text-xl font-bold text-[var(--color-primary)]">S/{money(adjustedQuota)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted,#4b5563)]">Plazo</span>
                  <span className="font-semibold text-[var(--text-strong,#111827)]">{selectedTerm} {termUnitPlural}</span>
                </div>
              </div>

              <div className="flex items-start gap-1.5 mb-4">
                <Info className="w-3.5 h-3.5 text-[var(--text-faint,#9ca3af)] flex-shrink-0 mt-px" />
                <p className="text-xs text-[var(--text-faint,#9ca3af)]">
                  La cuota está compuesta por capital + interés{commissionAmount != null && commissionAmount > 0 ? ' + comisión' : ''}.
                </p>
              </div>

              {/* Financial Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-[var(--text,#374151)] flex items-center gap-2">
                  <Percent className="w-4 h-4 text-[var(--color-primary)]" />
                  Tasas de Interés
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--surface-bg,#fafafa)] rounded-lg p-3">
                    <p className="text-xs text-[var(--text-muted,#6b7280)] mb-1">TEA (Tasa Efectiva Anual)</p>
                    <p className="text-lg font-bold text-[var(--text-strong,#111827)]">{FINANCIAL_DATA.tea}%</p>
                  </div>
                  <div className="bg-[var(--surface-bg,#fafafa)] rounded-lg p-3">
                    <p className="text-xs text-[var(--text-muted,#6b7280)] mb-1">TCEA (Tasa de Costo Efectivo Anual)</p>
                    <p className="text-lg font-bold text-[var(--text-strong,#111827)]">{FINANCIAL_DATA.tcea}%</p>
                  </div>
                </div>

                {/* <Divider className="my-4" />

                <h4 className="text-sm font-semibold text-[var(--text,#374151)] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[var(--color-primary)]" />
                  Seguros
                </h4>
                <div className="space-y-2">
                  {showPlatformCommission && commissionAmount != null && commissionAmount > 0 && (
                    <div className="flex justify-between py-2 border-b border-[var(--border-soft,#f3f4f6)]">
                      <span className="text-sm text-[var(--text-muted,#4b5563)]">Comisión de plataformas digitales</span>
                      <span className="text-sm font-medium text-[var(--text-strong,#111827)]">S/{commissionAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-[var(--border-soft,#f3f4f6)]">
                    <span className="text-sm text-[var(--text-muted,#4b5563)]">Seguro multiriesgo</span>
                    <span className="text-sm font-medium text-[var(--text-strong,#111827)]">
                      {FINANCIAL_DATA.seguroMultiriesgo > 0 ? `S/${FINANCIAL_DATA.seguroMultiriesgo}` : 'No aplica'}
                    </span>
                  </div>
                </div> */}

                <Divider className="my-4" />

                {/* Total */}
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-[var(--text-muted,#4b5563)]">Monto total a pagar</p>
                      <p className="text-xs text-[var(--text-muted,#6b7280)]">
                        {selectedInitialPercent > 0
                          ? `S/${money(initialAmount)} inicial + ${selectedTerm} cuotas ${freqLabelPlural} de S/${money(adjustedQuota)}`
                          : `${selectedTerm} cuotas ${freqLabelPlural} de S/${money(adjustedQuota)}`
                        }
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">S/{money(totalPayment)}</p>
                  </div>
                </div>

                {/* Legal Notice */}
                <div className="flex items-start gap-2 text-xs text-[var(--text-muted,#6b7280)] mt-4">
                  <Scale className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>
                    Esta información es referencial. Las tasas y condiciones finales serán confirmadas al momento de la aprobación.
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="border-t border-[var(--border-soft,#f3f4f6)]">
              <Button
                variant="bordered"
                className="border-[var(--border-strong,#d1d5db)] cursor-pointer"
                onPress={() => setIsModalOpen(false)}
              >
                Cerrar
              </Button>
              <Button
                className="bg-[var(--color-primary)] text-white cursor-pointer"
                startContent={isGeneratingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                onPress={handleDownloadPDF}
                isDisabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? 'Generando...' : 'Descargar PDF'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Toast - Success */}
      <Toast
        message="Archivo PDF descargado correctamente"
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
        position="bottom"
      />
    </>
  );
};

export default Cronograma;
