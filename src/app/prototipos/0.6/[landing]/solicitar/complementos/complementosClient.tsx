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
import { Loader2, Shield, AlertTriangle, Package } from 'lucide-react';
import { useProduct } from '../context/ProductContext';
import { SelectedProductBar, SelectedProductSpacer } from '../components/solicitar/product/SelectedProductBar';
import { formatMoneyNoDecimals } from '../utils/formatMoney';
import { CubeGridSpinner, useScrollToTop, Toast, useToast } from '@/app/prototipos/_shared';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { useWizardConfig } from '../context/WizardConfigContext';
import { getStepSlug } from '../../../services/wizardApi';
import { useSolicitarFlow } from '@/app/prototipos/0.6/hooks/useSolicitarFlow';
import { useSubmitApplication } from '../hooks/useSubmitApplication';
import { SectionRenderer } from '../components/solicitar/sections';

function ComplementosContent() {
  const router = useRouter();
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  // Scroll to top on page load
  useScrollToTop();

  // Get data from ProductContext (includes insurance, accessories, products, coupon)
  const { getDiscountedMonthlyPayment, selectedAccessories, selectedInsurance, appliedCoupon, hasUnifiedTerms, cartProducts, isOverQuotaLimit } = useProduct();

  // Toast notifications
  const { toast, showToast, hideToast, isVisible: isToastVisible } = useToast(4000);

  // Submit application hook
  const { submit: submitApplication, isSubmitting, submitMessage } = useSubmitApplication({
    onToast: showToast,
  });

  // Get layout data from context
  const { navbarProps, footerData, isLoading: isLayoutLoading, hasError: hasLayoutError } = useLayout();

  // Get wizard config for back navigation
  const { steps } = useWizardConfig();

  // Get solicitar flow configuration
  const {
    sectionsAfterWizard,
    isEnabled,
    isCouponRequired,
    isLoading: isFlowConfigLoading,
  } = useSolicitarFlow({ slug: landing });

  // Redirect to /solicitar if coupon is required but not applied
  useEffect(() => {
    if (!isFlowConfigLoading && isCouponRequired && !appliedCoupon) {
      router.push(`/prototipos/0.6/${landing}/solicitar`);
    }
  }, [isFlowConfigLoading, isCouponRequired, appliedCoupon, landing, router]);

  // Redirect to /solicitar if terms are not unified (multiple products with different terms)
  useEffect(() => {
    if (cartProducts.length > 1 && !hasUnifiedTerms()) {
      router.push(`/prototipos/0.6/${landing}/solicitar`);
    }
  }, [cartProducts.length, hasUnifiedTerms, landing, router]);

  // Redirect to /solicitar if monthly quota is exceeded
  useEffect(() => {
    if (isOverQuotaLimit) {
      router.push(`/prototipos/0.6/${landing}/solicitar`);
    }
  }, [isOverQuotaLimit, landing, router]);

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
    router.push(`/prototipos/0.6/${landing}/solicitar/${lastStepSlug}`);
  };

  const handleSubmit = async () => {
    // Pass insurance ID from context (selectedInsurance is now the full plan object)
    await submitApplication({ insuranceId: selectedInsurance?.id || null });
  };

  // Total monthly is now calculated in ProductContext (includes insurance + accessories)
  const totalMonthly = getDiscountedMonthlyPayment();

  // If no sections after wizard, redirect to confirmation (shouldn't happen normally)
  useEffect(() => {
    if (!isFlowConfigLoading && sectionsAfterWizard.length === 0) {
      // No sections to show, submit should have happened in wizard
      router.replace(`/prototipos/0.6/${landing}/solicitar/confirmacion`);
    }
  }, [isFlowConfigLoading, sectionsAfterWizard.length, router, landing]);

  const pageContent = (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Navbar */}
      <Navbar {...navbarProps} />

      {/* Spacer for fixed navbar + promo banner */}
      <div className="h-[104px]" />

      <div className="max-w-3xl mx-auto px-4 pt-14 pb-32 lg:pb-6">
        {/* Alert Banner - Show if insurance or accessories sections are included */}
        {(hasInsuranceSection || hasAccessoriesSection) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-800">
                  Personaliza tu solicitud
                </h2>
                <p className="text-sm text-neutral-600 mt-1">
                  Selecciona las opciones que mejor se adapten a tus necesidades
                </p>
              </div>
            </div>
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
          className="mt-6 bg-white rounded-xl border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Cuota mensual total</p>
              {(selectedInsurance || selectedAccessories.length > 0) && (
                <p className="text-xs text-[var(--color-secondary)] flex items-center gap-1 mt-0.5">
                  {selectedInsurance && <Shield className="w-3 h-3" />}
                  {selectedAccessories.length > 0 && <Package className="w-3 h-3" />}
                  {selectedInsurance && selectedAccessories.length > 0
                    ? 'Incluye seguro y accesorios'
                    : selectedInsurance
                      ? 'Incluye seguro'
                      : 'Incluye accesorios'}
                </p>
              )}
            </div>
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
  if (isLayoutLoading || isFlowConfigLoading) {
    return <LoadingFallback />;
  }

  // Show 404 if landing not found
  if (hasLayoutError || !navbarProps) {
    return <NotFoundContent homeUrl="/prototipos/0.6/home" />;
  }

  return (
    <>
      {pageContent}
      <SelectedProductSpacer />
      <Footer data={footerData} />

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
