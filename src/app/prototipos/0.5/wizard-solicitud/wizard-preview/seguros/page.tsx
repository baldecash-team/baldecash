'use client';

/**
 * Seguros - Paso de selección de seguros (opcional u obligatorio).
 * Replica la lógica de la vista Vue: hidrata seguros heredados, soporta seguro
 * obligatorio, modal "ver detalles" y modal "¿continuar sin seguro?".
 */

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@nextui-org/react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Code,
  Loader2,
  Lock,
  Package,
  Plus,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import Image from 'next/image';
import { useProduct } from '../../context/ProductContext';
import { SelectedProductBar, SelectedProductSpacer } from '../../components/wizard-solicitud/product/SelectedProductBar';
import { formatMoney } from '../../../utils/formatMoney';
import {
  FeedbackButton,
  CubeGridSpinner,
  Toast,
  useScrollToTop,
  useToast,
} from '@/app/prototipos/_shared';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { Footer } from '@/app/prototipos/0.5/hero/components/hero/Footer';
import { Navbar } from '@/app/prototipos/0.5/hero/components/hero/Navbar';

// Upsell components
import {
  InsuranceIntro,
  PlanComparison,
  InsuranceDetailModal,
  InsuranceWarningModal,
} from '../../../upsell/components/upsell';

// Data + telemetry (batch v0.6)
import { mockInsurancePlans } from '../../../upsell/data/mockUpsellData';
import {
  insuranceTracking,
  flushInsuranceEvents,
} from '../../../upsell/utils/insuranceTelemetry';
import type { InsurancePlan } from '../../../upsell/types/upsell';

const WIZARD_CONFIG = {
  section: 'wizard-solicitud',
  step: 'seguros',
  version: '0.5',
};

// Llaves de sessionStorage que el flujo previo (revisión de solicitud) puede llenar
const INHERITED_INSURANCE_KEY = 'baldecash-wizard-inherited-insurance';
const INSURANCE_MANDATORY_KEY = 'baldecash-wizard-insurance-mandatory';
const INSURANCE_WARNING_SEEN_KEY = 'baldecash-wizard-insurance-warning-seen';

function readSessionString(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function readSessionBool(key: string): boolean {
  const value = readSessionString(key);
  return value === 'true' || value === '1';
}

function writeSessionBool(key: string, value: boolean): void {
  try {
    sessionStorage.setItem(key, value ? 'true' : 'false');
  } catch {
    // ignore
  }
}

function SegurosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';

  useScrollToTop();

  const [showConfig, setShowConfig] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState<string | null>(null);
  const [inheritedInsuranceId, setInheritedInsuranceId] = useState<string | null>(null);
  const [isInsuranceMandatory, setIsInsuranceMandatory] = useState(false);
  const [hasSeenInsuranceWarning, setHasSeenInsuranceWarning] = useState(false);
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [detailPlanId, setDetailPlanId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAccessoriesExpanded, setIsAccessoriesExpanded] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  const { selectedProduct, selectedAccessories, getTotalMonthlyPayment, isProductBarExpanded } = useProduct();
  const { toast, showToast, hideToast, isVisible } = useToast();
  const segurosSectionRef = useRef<HTMLDivElement | null>(null);

  // Hidratación: lee seguro heredado, flag de obligatoriedad y si ya se vio el modal
  useEffect(() => {
    const inherited = readSessionString(INHERITED_INSURANCE_KEY);
    const mandatory = readSessionBool(INSURANCE_MANDATORY_KEY);
    const seen = readSessionBool(INSURANCE_WARNING_SEEN_KEY);

    if (inherited && mockInsurancePlans.some((p) => p.id === inherited)) {
      setInheritedInsuranceId(inherited);
      setSelectedInsurance(inherited);
    }
    setIsInsuranceMandatory(mandatory);
    setHasSeenInsuranceWarning(seen);
    setHydrated(true);
  }, []);

  // Computed: cuotas y validaciones
  const insuranceMonthly = useMemo(() => {
    if (!selectedInsurance) return 0;
    return mockInsurancePlans.find((p) => p.id === selectedInsurance)?.monthlyPrice ?? 0;
  }, [selectedInsurance]);

  const accessoriesMonthly = useMemo(
    () => selectedAccessories.reduce((sum, acc) => sum + acc.monthlyQuota, 0),
    [selectedAccessories],
  );

  const valorInicialCuota = selectedProduct?.monthlyPayment ?? 0;
  const valorcuotaPerifericosIncluida = valorInicialCuota + accessoriesMonthly;
  const valorcuotaNueva = valorcuotaPerifericosIncluida + insuranceMonthly;

  const totalMonthly = getTotalMonthlyPayment() + insuranceMonthly;

  const hasSelectedSeguro = !!selectedInsurance;
  const showSegurosSection = mockInsurancePlans.length > 0;
  const detailPlan: InsurancePlan | null = useMemo(
    () => mockInsurancePlans.find((p) => p.id === detailPlanId) ?? null,
    [detailPlanId],
  );

  // Handlers ───────────────────────────────────────────────────────────────────

  const handleBack = useCallback(() => {
    const baseUrl = '/prototipos/0.5/wizard-solicitud/wizard-preview/resumen';
    const url = isCleanMode ? `${baseUrl}?mode=clean` : baseUrl;
    router.push(url);
  }, [isCleanMode, router]);

  const handleSelectInsurance = useCallback(
    (planId: string) => {
      if (inheritedInsuranceId === planId) {
        showToast('Este seguro fue heredado del paso anterior y no se puede quitar', 'warning');
        return;
      }

      const plan = mockInsurancePlans.find((p) => p.id === planId);
      if (!plan) return;

      const isCurrentlySelected = selectedInsurance === planId;

      if (isCurrentlySelected) {
        setSelectedInsurance(null);
        insuranceTracking.toggle({
          insurance_id: plan.id,
          insurance_name: plan.name,
          active: false,
          monthly_price: plan.monthlyPrice,
        });
        showToast(`Seguro "${plan.name}" removido`, 'info');
      } else {
        setSelectedInsurance(planId);
        insuranceTracking.toggle({
          insurance_id: plan.id,
          insurance_name: plan.name,
          active: true,
          monthly_price: plan.monthlyPrice,
        });
        showToast(`Seguro "${plan.name}" agregado`, 'success');
      }
    },
    [inheritedInsuranceId, selectedInsurance, showToast],
  );

  const handleViewDetails = useCallback((planId: string) => {
    const plan = mockInsurancePlans.find((p) => p.id === planId);
    if (!plan) return;
    setDetailPlanId(planId);
    insuranceTracking.viewTerms({
      insurance_id: plan.id,
      insurance_name: plan.name,
    });
  }, []);

  const closeDetailModal = useCallback(() => setDetailPlanId(null), []);

  const showInsuranceSection = useCallback(() => {
    insuranceTracking.warningChooseInsurance({
      is_mandatory: isInsuranceMandatory,
      has_seen_warning: hasSeenInsuranceWarning,
    });
    setShowInsuranceModal(false);
    setHasSeenInsuranceWarning(true);
    writeSessionBool(INSURANCE_WARNING_SEEN_KEY, true);

    requestAnimationFrame(() => {
      const node =
        segurosSectionRef.current ?? document.querySelector<HTMLElement>('.seguros-cards');
      if (!node) return;
      const top = node.getBoundingClientRect().top + window.scrollY - 200;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  }, [hasSeenInsuranceWarning, isInsuranceMandatory]);

  const closeInsuranceWarning = useCallback(() => {
    insuranceTracking.warningClose({
      is_mandatory: isInsuranceMandatory,
    });
    setShowInsuranceModal(false);
    setHasSeenInsuranceWarning(false);
    writeSessionBool(INSURANCE_WARNING_SEEN_KEY, false);
  }, [isInsuranceMandatory]);

  const finalizarSolicitudLaptop = useCallback(async () => {
    setIsSubmitting(true);
    insuranceTracking.finalize({
      insurance_selected: hasSelectedSeguro,
      insurance_id: selectedInsurance,
      accessory_count: selectedAccessories.length,
      total_monthly: totalMonthly,
    });
    // Forzar el envío del batch antes de navegar para no perder eventos.
    flushInsuranceEvents();

    // Simulación del POST /agregar_perifericos
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const baseUrl = '/prototipos/0.5/wizard-solicitud/wizard-preview/resultados';
    const url = isCleanMode ? `${baseUrl}?mode=clean` : baseUrl;
    router.push(url);
  }, [
    hasSelectedSeguro,
    isCleanMode,
    router,
    selectedAccessories.length,
    selectedInsurance,
    totalMonthly,
  ]);

  const continueWithoutInsurance = useCallback(() => {
    insuranceTracking.warningSkipInsurance({
      is_mandatory: isInsuranceMandatory,
    });
    setShowInsuranceModal(false);
    setHasSeenInsuranceWarning(true);
    writeSessionBool(INSURANCE_WARNING_SEEN_KEY, true);
    void finalizarSolicitudLaptop();
  }, [finalizarSolicitudLaptop, isInsuranceMandatory]);

  const checkPerifericosBeforeSubmit = useCallback(() => {
    if (isInsuranceMandatory && !hasSelectedSeguro) {
      insuranceTracking.mandatoryBlock({
        is_mandatory: true,
        selected_count: 0,
      });
      setShowInsuranceModal(true);
      return;
    }

    if (hasSelectedSeguro || hasSeenInsuranceWarning) {
      void finalizarSolicitudLaptop();
      return;
    }

    insuranceTracking.warningOpen({
      is_mandatory: false,
      has_seen_warning: false,
      selected_count: 0,
    });
    setShowInsuranceModal(true);
  }, [
    finalizarSolicitudLaptop,
    hasSeenInsuranceWarning,
    hasSelectedSeguro,
    isInsuranceMandatory,
  ]);

  // Render ─────────────────────────────────────────────────────────────────────

  const pageContent = (
    <div className="min-h-screen bg-neutral-50 relative">
      <Navbar isCleanMode={isCleanMode} />

      <div className="h-[104px]" />

      <div className="max-w-3xl mx-auto px-4 pt-14 pb-32 lg:pb-6">
        {/* Alert Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border rounded-xl p-4 mb-6 ${
            isInsuranceMandatory
              ? 'bg-red-50 border-red-200'
              : 'bg-amber-50 border-amber-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                isInsuranceMandatory ? 'bg-red-100' : 'bg-amber-100'
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 ${isInsuranceMandatory ? 'text-red-600' : 'text-amber-600'}`}
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-800">
                {isInsuranceMandatory
                  ? 'Tu universidad requiere un seguro'
                  : 'Accidentes pasan. Protege tu equipo desde S/15/mes'}
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                {isInsuranceMandatory
                  ? 'Selecciona un plan de seguro para finalizar tu solicitud'
                  : 'Selecciona un seguro para mayor tranquilidad (opcional)'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Inherited Insurance Banner */}
        {inheritedInsuranceId && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#4654CD]/5 border border-[#4654CD]/20 rounded-xl p-3 mb-6 flex items-center gap-3"
          >
            <Lock className="w-4 h-4 text-[#4654CD]" />
            <p className="text-sm text-neutral-700">
              Tu seguro <span className="font-semibold">heredado del paso anterior</span> está
              preseleccionado y no se puede quitar.
            </p>
          </motion.div>
        )}

        {/* Selected Product Card - Desktop */}
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden lg:block bg-white rounded-xl border border-neutral-200 p-4 mb-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-neutral-50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {selectedProduct.image ? (
                  <Image
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                ) : (
                  <Package className="w-8 h-8 text-neutral-300" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-500 uppercase tracking-wide">
                  {selectedProduct.brand}
                </p>
                <p className="text-base font-semibold text-neutral-800">
                  {selectedProduct.name}
                </p>
                {selectedProduct.specs && (
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {[
                      selectedProduct.specs.processor,
                      selectedProduct.specs.ram,
                      selectedProduct.specs.storage,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-[#4654CD]">
                  S/{formatMoney(selectedProduct.monthlyPayment)}/mes
                </p>
                <p className="text-sm text-neutral-500">
                  {selectedProduct.months} meses
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Accessories Accordion - Desktop */}
        {selectedAccessories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="hidden lg:block bg-[#4654CD]/5 rounded-xl border border-[#4654CD]/10 overflow-hidden mb-6"
          >
            <button
              onClick={() => setIsAccessoriesExpanded(!isAccessoriesExpanded)}
              className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-[#4654CD]/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#4654CD]" />
                <p className="text-sm font-semibold text-neutral-800">
                  Accesorios ({selectedAccessories.length})
                </p>
              </div>
              <div className="flex items-center gap-3">
                {!isAccessoriesExpanded && (
                  <span className="text-sm font-medium text-[#4654CD]">
                    +S/{formatMoney(accessoriesMonthly)}/mes
                  </span>
                )}
                {isAccessoriesExpanded ? (
                  <ChevronUp className="w-5 h-5 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-neutral-400" />
                )}
              </div>
            </button>

            <AnimatePresence>
              {isAccessoriesExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pt-2 pb-4 border-t border-[#4654CD]/10">
                    <div className="space-y-2">
                      {selectedAccessories.map((acc) => (
                        <div
                          key={acc.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Plus className="w-3 h-3 text-[#4654CD] flex-shrink-0" />
                            <span className="text-neutral-700 truncate">{acc.name}</span>
                          </div>
                          <span className="text-[#4654CD] font-medium flex-shrink-0 ml-4">
                            +S/{formatMoney(acc.monthlyQuota)}/mes
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Insurance Section */}
        {showSegurosSection && (
          <motion.div
            ref={segurosSectionRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-neutral-200"
          >
            <InsuranceIntro />
            <PlanComparison
              plans={mockInsurancePlans}
              selectedPlan={selectedInsurance}
              onSelect={handleSelectInsurance}
              onViewDetails={handleViewDetails}
              lockedPlanId={inheritedInsuranceId}
            />
          </motion.div>
        )}

        {/* Total Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-6 bg-white rounded-xl border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Cuota mensual total</p>
              {selectedInsurance && (
                <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                  <Shield className="w-3 h-3" />
                  Incluye seguro {inheritedInsuranceId ? '(heredado)' : ''}
                </p>
              )}
            </div>
            <p className="text-2xl font-bold text-[#4654CD]">
              S/{formatMoney(totalMonthly)}/mes
            </p>
          </div>
          {hydrated && (insuranceMonthly > 0 || accessoriesMonthly > 0) && (
            <div className="mt-3 pt-3 border-t border-neutral-100 grid grid-cols-3 gap-2 text-xs text-neutral-500">
              <div>
                <p>Equipo</p>
                <p className="text-neutral-800 font-medium">
                  S/{formatMoney(valorInicialCuota)}
                </p>
              </div>
              <div>
                <p>Accesorios</p>
                <p className="text-neutral-800 font-medium">
                  S/{formatMoney(accessoriesMonthly)}
                </p>
              </div>
              <div>
                <p>Seguro</p>
                <p className="text-neutral-800 font-medium">
                  S/{formatMoney(insuranceMonthly)}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex flex-col-reverse gap-3 lg:flex-row"
        >
          <Button
            size="lg"
            variant="bordered"
            className="w-full lg:flex-1 border-neutral-300 text-neutral-700 cursor-pointer"
            onPress={handleBack}
            isDisabled={isSubmitting}
          >
            Atrás
          </Button>
          <Button
            size="lg"
            className="w-full lg:flex-1 bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3]"
            onPress={checkPerifericosBeforeSubmit}
            isLoading={isSubmitting}
            spinner={<Loader2 className="w-5 h-5 animate-spin" />}
          >
            Enviar Solicitud
          </Button>
        </motion.div>

        {/* Optional Note */}
        <p className="text-xs text-neutral-400 text-center mt-4">
          {isInsuranceMandatory
            ? 'Tu universidad requiere que asegures el equipo para continuar.'
            : 'La selección de seguro es opcional. Puedes continuar sin seleccionar ninguno.'}
        </p>
      </div>

      {/* Modals */}
      <InsuranceDetailModal
        plan={detailPlan}
        isOpen={!!detailPlan}
        onClose={closeDetailModal}
        isSelected={selectedInsurance === detailPlan?.id}
        isLocked={inheritedInsuranceId === detailPlan?.id}
        onToggle={() => detailPlan && handleSelectInsurance(detailPlan.id)}
      />

      <InsuranceWarningModal
        isOpen={showInsuranceModal}
        isMandatory={isInsuranceMandatory && !hasSelectedSeguro}
        onClose={closeInsuranceWarning}
        onChooseInsurance={showInsuranceSection}
        onContinueWithout={continueWithoutInsurance}
      />

      {/* Toast feedback */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={isVisible}
          onClose={hideToast}
        />
      )}
    </div>
  );

  if (isCleanMode) {
    return (
      <>
        {pageContent}
        <SelectedProductSpacer />
        <Footer isCleanMode={isCleanMode} />
        <SelectedProductBar mobileOnly />
        {!isProductBarExpanded && (
          <FeedbackButton
            sectionId="wizard-solicitud-seguros"
            className="bottom-24 lg:bottom-6"
          />
        )}
      </>
    );
  }

  return (
    <div className="relative">
      {pageContent}
      <SelectedProductSpacer />
      <Footer isCleanMode={isCleanMode} />
      <SelectedProductBar mobileOnly />

      <div className="fixed bottom-24 right-6 z-[100] flex flex-col gap-2 lg:bottom-6">
        <TokenCounter sectionId="PROMPT_WIZARD" version="0.5" />
        <Button
          isIconOnly
          radius="md"
          className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
          onPress={() => setShowConfig(!showConfig)}
        >
          <Code className="w-5 h-5 text-neutral-600" />
        </Button>
        <Button
          isIconOnly
          radius="md"
          className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
          onPress={() => router.push('/prototipos/0.5')}
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </Button>
      </div>

      {showConfig && (
        <div className="fixed bottom-24 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-3 border border-neutral-200 max-w-sm lg:bottom-6">
          <p className="text-xs text-neutral-500 mb-2">Configuración v0.5:</p>
          <pre className="text-xs bg-neutral-50 p-2 rounded overflow-auto max-h-40 text-neutral-600">
            {JSON.stringify(
              {
                ...WIZARD_CONFIG,
                inheritedInsuranceId,
                isInsuranceMandatory,
                hasSeenInsuranceWarning,
                selectedInsurance,
                valorInicialCuota,
                accessoriesMonthly,
                insuranceMonthly,
                valorcuotaPerifericosIncluida,
                valorcuotaNueva,
              },
              null,
              2,
            )}
          </pre>
        </div>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <CubeGridSpinner />
    </div>
  );
}

export default function SegurosPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SegurosContent />
    </Suspense>
  );
}
