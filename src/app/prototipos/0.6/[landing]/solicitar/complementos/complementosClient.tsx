'use client';

/**
 * Complementos - Dynamic post-wizard sections page
 * Renders all sections configured to appear after wizard_steps
 * Handles submission with insurance selection if applicable
 * Insurance and Accessories state is managed via ProductContext
 */

import React, { Suspense, useState, useEffect, useMemo } from 'react';
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
import { GamerNavbar } from '@/app/prototipos/0.6/components/zona-gamer/GamerNavbar';
import { GamerFooter } from '@/app/prototipos/0.6/components/zona-gamer/GamerFooter';
import { GamerNewsletter } from '@/app/prototipos/0.6/components/zona-gamer/GamerNewsletter';
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
import { LANDING_IDS } from '@/app/prototipos/0.6/utils/landingIds';

function ComplementosContent() {
  const router = useRouter();
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  // Scroll to top on page load
  useScrollToTop();

  // Get data from ProductContext (includes insurance, accessories, products, coupon)
  const { selectedProduct, isHydrated: isProductHydrated, getTotalMonthlyPayment, selectedAccessories, selectedInsurance, selectedInsurances, appliedCoupon, hasUnifiedTerms, cartProducts, isOverQuotaLimit, unavailableProductIds, isValidatingAvailability } = useProduct();

  // Redirect to /solicitar if no product selected (e.g. direct URL access)
  useEffect(() => {
    if (!isProductHydrated) return;
    if (!selectedProduct && cartProducts.length === 0) {
      router.replace(routes.solicitar(landing));
    }
  }, [isProductHydrated, selectedProduct, cartProducts.length, landing, router]);

  // Toast notifications
  const { toast, showToast, hideToast, isVisible: isToastVisible } = useToast(4000);

  // Submit application hook
  const { submit: submitApplication, isSubmitting, submitMessage, submitStage } = useSubmitApplication({
    onToast: showToast,
  });

  // Get layout data from context
  const { navbarProps, footerData, agreementData, landingId, isLoading: isLayoutLoading, hasError: hasLayoutError } = useLayout();

  // Get wizard config for back navigation and cross-step validation
  const { steps } = useWizardConfig();
  const { formData, setFieldError } = useWizard();

  // Preview mode
  const preview = usePreview();
  const previewKey = preview.isPreviewingLanding(landing) ? preview.previewKey : null;

  const isGamer = landingId === LANDING_IDS.ZONA_GAMER;

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
  const totalMonthly = getTotalMonthlyPayment();

  // If no sections after wizard, redirect to confirmation (shouldn't happen normally)
  useEffect(() => {
    if (!isFlowConfigLoading && sectionsAfterWizard.length === 0) {
      // No sections to show, submit should have happened in wizard
      router.replace(routes.solicitarConfirmacion(landing));
    }
  }, [isFlowConfigLoading, sectionsAfterWizard.length, router, landing]);

  const pageContent = (
    <div className={`min-h-screen relative ${isGamer ? '' : 'bg-neutral-50'}`}>
      {/* Navbar */}
      {!isGamer && <Navbar {...navbarProps} landing={landing} />}

      {/* Spacer — dynamic height (gamer has its own navbar spacing) */}
      {!isGamer && <div style={{ height: 'var(--header-total-height, 6.5rem)' }} />}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 lg:pt-14 pb-32 lg:pb-6">
        {/* Section Header */}
        {(hasInsuranceSection || hasAccessoriesSection) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 sm:mb-6"
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-800 font-['Baloo_2',_sans-serif] leading-tight">
              Personaliza tu solicitud
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Estas opciones son opcionales. Puedes continuar sin seleccionar ninguna.
            </p>
          </motion.div>
        )}

        {/* Product Summary - Desktop only */}
        <SelectedProductBar hideAddons />

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
          <div className={`px-4 py-4 flex items-center justify-between gap-3 ${
            selectedInsurances.length > 0 || selectedAccessories.length > 0
              ? 'bg-[rgba(var(--color-primary-rgb),0.04)] border-t border-neutral-100'
              : ''
          }`}>
            <p className="text-sm font-semibold text-neutral-800 min-w-0 break-words">Cuota mensual total</p>
            <p className="text-xl sm:text-2xl font-bold text-[var(--color-primary)] break-words text-right flex-shrink-0">
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

  // Zona Gamer: wrap BEFORE loading/error checks to ensure dark theme always shows
  if (isGamer) {
    if (isLayoutLoading || isFlowConfigLoading || isValidatingAvailability) {
      return <LoadingFallback />;
    }
    return (
      <GamerComplementosWrapper>
        {pageContent}
        <SelectedProductSpacer />
        <SubmitOverlay isOpen={isSubmitting} stage={submitStage} />
        {toast && (
          <Toast message={toast.message} type={toast.type} isVisible={isToastVisible} onClose={hideToast} duration={4000} />
        )}
      </GamerComplementosWrapper>
    );
  }

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
  const params = useParams();
  const isGamer = (params?.landing as string) === 'zona-gamer';

  if (isGamer) {
    return (
      <div className="gamer-loading-fallback">
        <CubeGridSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <CubeGridSpinner />
    </div>
  );
}

function GamerComplementosWrapper({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [hydrated, setHydrated] = useState(false);
  const params = useParams();
  const landing = (params.landing as string) || 'zona-gamer';

  useEffect(() => {
    const saved = localStorage.getItem('baldecash-theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
    setHydrated(true);
  }, []);

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('baldecash-theme', next);
  };
  const isDark = theme === 'dark';

  if (!hydrated) {
    return <div className="gamer-theme-bg" style={{ minHeight: '100vh' }} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#0e0e0e' : '#f5f5f5', color: isDark ? '#f0f0f0' : '#1a1a1a' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap');
        /* Gamer cyan overrides - both dark and light modes */
        .gamer-complementos-dark,
        .gamer-complementos-dark * {
          --color-primary: #00ffd5 !important;
          --color-primary-rgb: 0,255,213 !important;
          --color-secondary: #00ffd5 !important;
          --color-secondary-rgb: 0,255,213 !important;
        }
        .gamer-complementos-light,
        .gamer-complementos-light * {
          --color-primary: #00897a !important;
          --color-primary-rgb: 0,137,122 !important;
          --color-secondary: #00897a !important;
          --color-secondary-rgb: 0,137,122 !important;
        }
        /* Light mode button text */
        .gamer-complementos-light .bg-\[var\(--color-primary\)\].text-white {
          color: #fff !important;
        }
        .gamer-complementos-light button.bg-\[var\(--color-primary\)\] {
          color: #fff !important;
        }
        /* Light mode mobile product bar */
        .gamer-complementos-light .fixed.bottom-0 .bg-white {
          background: #fff !important;
          border-color: #e0e0e0 !important;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.08) !important;
        }
        /* Light mode: product bar text colors */
        .gamer-complementos-light .fixed.bottom-0 .text-neutral-800 {
          color: #1a1a1a !important;
        }
        .gamer-complementos-light .fixed.bottom-0 .text-neutral-500 {
          color: #888 !important;
        }
        .gamer-complementos-light .fixed.bottom-0 .bg-neutral-100 {
          background: #f5f5f5 !important;
        }
        /* Light mode: product bar expanded */
        .gamer-complementos-light .fixed.bottom-0 .border-neutral-100 {
          border-color: #e5e7eb !important;
        }
        .gamer-complementos-light .fixed.bottom-0 .bg-neutral-50 {
          background: #fafafa !important;
        }
        /* Light mode: term selector in product bar */
        .gamer-complementos-light .fixed.bottom-0 .rounded-lg.border-2.bg-white {
          background: #fff !important;
          border-color: #00897a !important;
        }
        .gamer-complementos-light .fixed.bottom-0 .rounded-lg.border-2.bg-white span {
          color: #1a1a1a !important;
        }
        /* Light mode: backdrop blur */
        .gamer-complementos-light .fixed.inset-0.bg-black\/20 {
          background: rgba(0,0,0,0.15) !important;
        }
        .gamer-complementos-dark {
          --color-primary: #00ffd5;
          --color-primary-rgb: 0,255,213;
          --color-secondary: #00ffd5;
        }
        .gamer-complementos-dark .min-h-screen { background: #0e0e0e !important; }
        .gamer-complementos-dark .bg-white { background: #1a1a1a !important; }
        .gamer-complementos-dark .bg-neutral-50 { background: #0e0e0e !important; }
        .gamer-complementos-dark .bg-neutral-100 { background: #252525 !important; }
        .gamer-complementos-dark .border-neutral-200,
        .gamer-complementos-dark .border-neutral-100,
        .gamer-complementos-dark .border-neutral-300 { border-color: #2a2a2a !important; }
        .gamer-complementos-dark .text-neutral-900,
        .gamer-complementos-dark .text-neutral-800 { color: #f0f0f0 !important; }
        .gamer-complementos-dark .text-neutral-700 { color: #d4d4d4 !important; }
        .gamer-complementos-dark .text-neutral-600 { color: #a0a0a0 !important; }
        .gamer-complementos-dark .text-neutral-500 { color: #707070 !important; }
        .gamer-complementos-dark .text-neutral-400 { color: #555 !important; }
        .gamer-complementos-dark .text-foreground { color: #f0f0f0 !important; }
        .gamer-complementos-dark .shadow-sm { box-shadow: 0 1px 3px rgba(0,0,0,0.3) !important; }
        .gamer-complementos-dark .shadow-lg { box-shadow: 0 8px 24px rgba(0,0,0,0.4) !important; }
        /* Primary color overrides */
        .gamer-complementos-dark .bg-\\[var\\(--color-primary\\)\\] { background: #00ffd5 !important; color: #0a0a0a !important; }
        .gamer-complementos-dark .text-\\[var\\(--color-primary\\)\\] { color: #00ffd5 !important; }
        .gamer-complementos-dark .text-\\[var\\(--color-secondary\\)\\] { color: #00ffd5 !important; }
        .gamer-complementos-dark .bg-\\[rgba\\(var\\(--color-primary-rgb\\)\\,0\\.04\\)\\] { background: rgba(0,255,213,0.04) !important; }
        /* Buttons */
        .gamer-complementos-dark .bg-\\[var\\(--color-primary\\)\\].text-white {
          background: #00ffd5 !important; color: #0a0a0a !important;
          color: #fff !important;
        }
        .gamer-complementos-dark .border-neutral-300.text-neutral-700 {
          border-color: #2a2a2a !important;
          color: #a0a0a0 !important;
        }
        /* Insurance/Accessories cards */
        .gamer-complementos-dark .bg-white.rounded-xl { background: #1a1a1a !important; border-color: #2a2a2a !important; }
        .gamer-complementos-dark .bg-white.rounded-2xl { background: #1a1a1a !important; border-color: #2a2a2a !important; }
        /* Selected state borders */
        .gamer-complementos-dark .border-\\[var\\(--color-primary\\)\\] { border-color: #00ffd5 !important; }
        .gamer-complementos-dark .ring-\\[var\\(--color-primary\\)\\] { --tw-ring-color: #00ffd5 !important; }
        /* Mobile product bar */
        .gamer-complementos-dark .fixed.bottom-0 .bg-white {
          background: #1a1a1a !important;
          border-color: #2a2a2a !important;
        }
        /* Green → cyan */
        .gamer-complementos-dark .bg-green-500,
        .gamer-complementos-dark .bg-green-600 { background: #00ffd5 !important; }
        .gamer-complementos-dark .text-green-500,
        .gamer-complementos-dark .text-green-600 { color: #00ffd5 !important; }
        /* Insurance card price bg */
        .gamer-complementos-dark .bg-\\[rgba\\(var\\(--color-primary-rgb\\)\\,0\\.06\\)\\] {
          background: rgba(0,255,213,0.08) !important;
        }
        /* Insurance card border on hover */
        .gamer-complementos-dark .rounded-2xl.border-2 {
          border-color: #2a2a2a !important;
        }
        .gamer-complementos-dark .rounded-2xl.border-2:hover {
          border-color: rgba(0,255,213,0.3) !important;
        }
        /* Insurance card selected state — strong cyan border + neon glow */
        .gamer-complementos-dark .rounded-2xl.border-2.border-\\[var\\(--color-primary\\)\\],
        .gamer-complementos-dark .rounded-2xl.border-2.border-\\[var\\(--color-secondary\\)\\] {
          border-color: #00ffd5 !important;
          box-shadow:
            0 0 0 1px #00ffd5,
            0 0 24px rgba(0,255,213,0.35),
            0 8px 24px rgba(0,0,0,0.4) !important;
        }
        /* Light mode: selected insurance card — strong teal glow */
        .gamer-complementos-light .rounded-2xl.border-2.border-\\[var\\(--color-primary\\)\\],
        .gamer-complementos-light .rounded-2xl.border-2.border-\\[var\\(--color-secondary\\)\\] {
          border-color: #00897a !important;
          box-shadow:
            0 0 0 1px #00897a,
            0 0 18px rgba(0,137,122,0.25),
            0 8px 24px rgba(0,137,122,0.15) !important;
        }
        /* Insurance add button */
        .gamer-complementos-dark button.bg-\\[var\\(--color-primary\\)\\] {
          background: #00ffd5 !important;
          color: #0a0a0a !important;
        }
        .gamer-complementos-dark button.bg-\\[var\\(--color-primary\\)\\]:hover {
          background: #00e6c0 !important;
        }
        /* Product bar plazo button */
        .gamer-complementos-dark .rounded-lg.border-2.bg-white {
          background: #1e1e1e !important;
          border-color: #2a2a2a !important;
        }
        .gamer-complementos-dark .rounded-lg.border-2.bg-white span {
          color: #f0f0f0 !important;
        }
        /* Term dropdown */
        .gamer-complementos-dark .bg-white.border.border-neutral-200.rounded-lg.shadow-lg {
          background: #1a1a1a !important;
          border-color: #2a2a2a !important;
        }
        .gamer-complementos-dark .text-neutral-700.hover\\:bg-\\[rgba\\(var\\(--color-primary-rgb\\)\\,0\\.1\\)\\] {
          color: #f0f0f0 !important;
        }
        .gamer-complementos-dark .text-neutral-700.hover\\:bg-\\[rgba\\(var\\(--color-primary-rgb\\)\\,0\\.1\\)\\]:hover {
          background: rgba(0,255,213,0.1) !important;
          color: #00ffd5 !important;
        }
        /* Light mode term dropdown */
        .gamer-complementos-light .bg-\\[var\\(--color-primary\\)\\].text-white {
          background: #00897a !important;
        }
        /* Inicial pills */
        .gamer-complementos-dark .bg-neutral-100.text-neutral-600 {
          background: #252525 !important;
          color: #a0a0a0 !important;
        }
        .gamer-complementos-dark .bg-neutral-100.text-neutral-600:hover {
          background: #333 !important;
        }
        /* Section icon bg */
        .gamer-complementos-dark .w-10.h-10.bg-\\[var\\(--color-primary\\)\\] {
          background: #00ffd5 !important;
          color: #0a0a0a !important;
        }
        .gamer-complementos-dark .w-10.h-10.bg-\\[var\\(--color-primary\\)\\] svg {
          color: #0a0a0a !important;
        }
        /* Insurance icon inside card */
        .gamer-complementos-dark .w-10.h-10.bg-\\[var\\(--color-primary\\)\\].rounded-xl {
          background: rgba(0,255,213,0.15) !important;
        }
        .gamer-complementos-dark .w-10.h-10.bg-\\[var\\(--color-primary\\)\\].rounded-xl svg {
          color: #00ffd5 !important;
        }
        /* Terms button */
        .gamer-complementos-dark button.text-neutral-400:hover {
          color: #00ffd5 !important;
        }
        /* === Submit overlay === */
        .gamer-complementos-dark .fixed.inset-0.bg-white\\/95 {
          background: rgba(14,14,14,0.95) !important;
        }
        .gamer-complementos-dark .fixed.inset-0 .bg-white.border.border-neutral-200.rounded-xl {
          background: #1a1a1a !important;
          border: 1px solid #00ffd5 !important;
        }
        .gamer-complementos-dark .fixed.inset-0 .bg-green-500.text-white {
          background: #00ffd5 !important;
          color: #0a0a0a !important;
        }
        .gamer-complementos-dark .fixed.inset-0 .bg-\\[var\\(--color-primary\\)\\].text-white {
          background: #00ffd5 !important;
          color: #0a0a0a !important;
        }
        .gamer-complementos-dark .fixed.inset-0 .bg-neutral-200.text-neutral-400 {
          background: #2a2a2a !important;
          color: #555 !important;
        }
        .gamer-complementos-dark .fixed.inset-0 .bg-green-500:not(.text-white) {
          background: #00ffd5 !important;
        }
        /* Scrollbar */
        .gamer-complementos-dark ::-webkit-scrollbar { width: 6px; }
        .gamer-complementos-dark ::-webkit-scrollbar-track { background: #0e0e0e; }
        .gamer-complementos-dark ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }
      `}</style>
      <div className={isDark ? 'gamer-complementos-dark' : 'gamer-complementos-light'}>
        <GamerNavbar
          theme={theme}
          onToggleTheme={handleToggleTheme}
          catalogUrl={routes.catalogo(landing)}
          hideSecondaryBar
        />
        {children}
        <GamerNewsletter theme={theme} />
        <GamerFooter theme={theme} />
      </div>
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
