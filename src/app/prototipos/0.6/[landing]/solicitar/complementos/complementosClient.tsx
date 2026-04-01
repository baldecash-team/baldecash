'use client';

/**
 * Complementos - Dynamic post-wizard sections page
 * Renders all sections configured to appear after wizard_steps
 * Handles submission with insurance selection if applicable
 * Insurance and Accessories state is managed via ProductContext
 */

import React, { Suspense, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { Loader2, Shield, Package } from 'lucide-react';
import { useProduct } from '../context/ProductContext';
import { SelectedProductBar, SelectedProductSpacer } from '../components/solicitar/product/SelectedProductBar';
import { formatMoneyNoDecimals } from '../utils/formatMoney';
import { CubeGridSpinner, useScrollToTop, Toast, useToast } from '@/app/prototipos/_shared';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { ConvenioFooter } from '@/app/prototipos/0.6/components/hero/convenio';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { useWizardConfig } from '../context/WizardConfigContext';
import { useWizard, FILE_PENDING_REUPLOAD } from '../context/WizardContext';
import { getStepSlug, validateStep as validateStepFields } from '../../../services/wizardApi';
import { useSolicitarFlow } from '@/app/prototipos/0.6/hooks/useSolicitarFlow';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';
import { useSubmitApplication } from '../hooks/useSubmitApplication';
import { SectionRenderer } from '../components/solicitar/sections';
import { SubmitOverlay } from '../components/solicitar/submit/SubmitOverlay';

function ComplementosContent() {
  const router = useRouter();
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  // Scroll to top on page load
  useScrollToTop();

  // Get data from ProductContext (includes insurance, accessories, products, coupon)
  const { getDiscountedMonthlyPayment, selectedAccessories, selectedInsurance, selectedInsurances, appliedCoupon, hasUnifiedTerms, cartProducts, isOverQuotaLimit, unavailableProductIds, isValidatingAvailability } = useProduct();

  // Toast notifications
  const { toast, showToast, hideToast, isVisible: isToastVisible } = useToast(4000);

  // Submit application hook
  const { submit: submitApplication, isSubmitting, submitMessage, submitStage } = useSubmitApplication({
    onToast: showToast,
  });

  // Get layout data from context
  const { navbarProps, footerData, agreementData, isLoading: isLayoutLoading, hasError: hasLayoutError } = useLayout();

  // Get wizard config for back navigation and cross-step validation
  const { steps } = useWizardConfig();
  const { formData, setFieldError } = useWizard();

  // Preview mode
  const preview = usePreview();
  const previewKey = preview.isPreviewingLanding(landing) ? preview.previewKey : null;

  // Get solicitar flow configuration
  const {
    sectionsAfterWizard,
    isEnabled,
    isCouponRequired,
    isLoading: isFlowConfigLoading,
  } = useSolicitarFlow({ slug: landing, previewKey });

  // Redirect to /solicitar if coupon is required but not applied
  useEffect(() => {
    if (!isFlowConfigLoading && isCouponRequired && !appliedCoupon) {
      router.push(routes.solicitar(landing));
    }
  }, [isFlowConfigLoading, isCouponRequired, appliedCoupon, landing, router]);

  // Redirect to /solicitar if terms are not unified (multiple products with different terms)
  useEffect(() => {
    if (cartProducts.length > 1 && !hasUnifiedTerms()) {
      router.push(routes.solicitar(landing));
    }
  }, [cartProducts.length, hasUnifiedTerms, landing, router]);

  // Redirect to /solicitar if monthly quota is exceeded
  useEffect(() => {
    if (isOverQuotaLimit) {
      router.push(routes.solicitar(landing));
    }
  }, [isOverQuotaLimit, landing, router]);

  // Redirect to /solicitar if there are unavailable products
  useEffect(() => {
    if (unavailableProductIds.length > 0) {
      router.push(routes.solicitar(landing));
    }
  }, [unavailableProductIds, landing, router]);

  // Build form values for cross-step validation
  const formValues = useMemo(() => {
    const values: Record<string, string | string[]> = {};
    for (const [key, state] of Object.entries(formData)) {
      if (state?.value !== undefined) {
        if (state.value === FILE_PENDING_REUPLOAD) {
          values[key] = '';
          continue;
        }
        values[key] = state.value as string | string[];
      }
    }
    return values;
  }, [formData]);

  // Regular steps for validation
  const regularSteps = useMemo(() => {
    return steps.filter(s => !s.is_summary_step);
  }, [steps]);

  // Get the last wizard step for back navigation
  // Secuencia correcta: pasos regulares primero, luego pasos de resumen
  const lastStep = useMemo(() => {
    if (steps.length === 0) return null;

    // Separar y ordenar pasos
    const regularSteps = steps.filter(s => !s.is_summary_step).sort((a, b) => a.order - b.order);
    const summarySteps = steps.filter(s => s.is_summary_step).sort((a, b) => a.order - b.order);

    // El último paso es: último resumen si existe, sino último regular
    if (summarySteps.length > 0) {
      return summarySteps[summarySteps.length - 1];
    }
    return regularSteps.length > 0 ? regularSteps[regularSteps.length - 1] : null;
  }, [steps]);

  // Check if insurance section is included
  const hasInsuranceSection = useMemo(() => {
    return sectionsAfterWizard.some(s => s.type === 'insurance');
  }, [sectionsAfterWizard]);

  // Check if accessories section is included
  const hasAccessoriesSection = useMemo(() => {
    return sectionsAfterWizard.some(s => s.type === 'accessories');
  }, [sectionsAfterWizard]);

  const handleBack = () => {
    const lastStepSlug = lastStep ? getStepSlug(lastStep) : 'resumen';
    router.push(routes.solicitarStep(landing, lastStepSlug));
  };

  const handleSubmit = async () => {
    // Validate ALL wizard steps before submitting
    for (const s of regularSteps) {
      const firstError = validateStepFields(s, formValues, setFieldError);
      if (firstError) {
        showToast(
          `Hay campos incompletos en "${s.title || s.name}". Por favor, revísalos.`,
          'error'
        );
        const stepSlug = getStepSlug(s);
        setTimeout(() => {
          router.push(routes.solicitarStep(landing, stepSlug));
        }, 1500);
        return;
      }
    }

    // Pass insurance IDs from context (multi-select)
    const insuranceIds = selectedInsurances.map(i => i.id);
    await submitApplication({ insuranceId: insuranceIds.length > 0 ? insuranceIds[0] : null, insuranceIds });
  };

  // Total monthly is now calculated in ProductContext (includes insurance + accessories)
  const totalMonthly = getDiscountedMonthlyPayment();

  // If no sections after wizard, redirect to confirmation (shouldn't happen normally)
  useEffect(() => {
    if (!isFlowConfigLoading && sectionsAfterWizard.length === 0) {
      // No sections to show, submit should have happened in wizard
      router.replace(routes.solicitarConfirmacion(landing));
    }
  }, [isFlowConfigLoading, sectionsAfterWizard.length, router, landing]);

  const pageContent = (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Navbar */}
      <Navbar {...navbarProps} landing={landing} />

      {/* Spacer for fixed navbar + promo banner */}
      <div className="h-[104px]" />

      <div className="max-w-3xl mx-auto px-4 pt-14 pb-32 lg:pb-6">
        {/* Section Header */}
        {(hasInsuranceSection || hasAccessoriesSection) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl font-bold text-neutral-800">
              Personaliza tu solicitud
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Estas opciones son opcionales. Puedes continuar sin seleccionar ninguna.
            </p>
          </motion.div>
        )}

        {/* Product Summary - Desktop only */}
        <SelectedProductBar />

        {/* Dynamic Sections */}
        <div className="space-y-6">
          {sectionsAfterWizard.map((section, index) => (
            <motion.div
              key={section.type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <SectionRenderer type={section.type} />
            </motion.div>
          ))}
        </div>

        {/* Total Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * (sectionsAfterWizard.length + 1) }}
          className="mt-6 bg-white rounded-xl border border-neutral-200 overflow-hidden"
        >
          {/* Breakdown items */}
          {(selectedInsurances.length > 0 || selectedAccessories.length > 0) && (
            <div className="px-4 pt-4 pb-3 space-y-2">
              {selectedInsurances.map((ins) => (
                <div key={ins.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Shield className="w-3.5 h-3.5 text-[var(--color-secondary)] flex-shrink-0" />
                    <span className="text-sm text-neutral-600 truncate">{ins.name}</span>
                  </div>
                  <span className="text-sm text-[var(--color-secondary)] font-medium flex-shrink-0 ml-3">
                    +S/{formatMoneyNoDecimals(Math.floor(ins.monthlyPrice))}/mes
                  </span>
                </div>
              ))}
              {selectedAccessories.map((acc) => (
                <div key={acc.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Package className="w-3.5 h-3.5 text-[var(--color-primary)] flex-shrink-0" />
                    <span className="text-sm text-neutral-600 truncate">{acc.name}</span>
                  </div>
                  <span className="text-sm text-[var(--color-primary)] font-medium flex-shrink-0 ml-3">
                    +S/{formatMoneyNoDecimals(Math.floor(acc.monthlyQuota))}/mes
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Total row */}
          <div className={`px-4 py-4 flex items-center justify-between ${
            selectedInsurances.length > 0 || selectedAccessories.length > 0
              ? 'bg-[rgba(var(--color-primary-rgb),0.04)] border-t border-neutral-100'
              : ''
          }`}>
            <p className="text-sm font-semibold text-neutral-800">Cuota mensual total</p>
            <p className="text-2xl font-bold text-[var(--color-primary)]">
              S/{formatMoneyNoDecimals(Math.floor(totalMonthly))}/mes
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * (sectionsAfterWizard.length + 2) }}
          className="mt-6 flex flex-col-reverse gap-3 lg:flex-row"
        >
          <Button
            size="lg"
            variant="bordered"
            className="w-full lg:flex-1 border-neutral-300 text-neutral-700 cursor-pointer"
            onPress={handleBack}
          >
            Atrás
          </Button>
          <Button
            size="lg"
            className="w-full lg:flex-1 bg-[var(--color-primary)] text-white font-semibold cursor-pointer hover:brightness-90"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            spinner={<Loader2 className="w-5 h-5 animate-spin" />}
          >
            {isSubmitting ? (submitMessage || 'Enviando...') : 'Enviar Solicitud'}
          </Button>
        </motion.div>

        {/* Optional Note */}
        <p className="text-xs text-neutral-400 text-center mt-4">
          La selección de opciones adicionales es opcional. Puedes continuar sin seleccionar ninguna.
        </p>
      </div>
    </div>
  );

  // Show loading while data is loading
  if (isLayoutLoading || isFlowConfigLoading || isValidatingAvailability) {
    return <LoadingFallback />;
  }

  // Show 404 if landing not found
  if (hasLayoutError || !navbarProps) {
    return <NotFoundContent homeUrl={routes.home()} />;
  }

  return (
    <>
      {pageContent}
      <SelectedProductSpacer />
      {agreementData ? <ConvenioFooter data={footerData} agreementData={agreementData} landing={landing} /> : <Footer data={footerData} landing={landing} />}

      {/* Submit progress overlay */}
      <SubmitOverlay isOpen={isSubmitting} stage={submitStage} />

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={isToastVisible}
          onClose={hideToast}
          duration={4000}
        />
      )}
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <CubeGridSpinner />
    </div>
  );
}

export default function ComplementosClient() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ComplementosContent />
    </Suspense>
  );
}
