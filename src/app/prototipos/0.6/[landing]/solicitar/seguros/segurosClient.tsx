'use client';

/**
 * Seguros - Paso de selección de seguros (opcional)
 * Muestra producto + accesorios seleccionados y opciones de seguro
 */

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';
import { useProduct } from '../context/ProductContext';
import { SelectedProductBar, SelectedProductSpacer } from '../components/solicitar/product/SelectedProductBar';
import { formatMoney } from '../utils/formatMoney';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { useWizardConfig } from '../context/WizardConfigContext';
import { getStepSlug } from '../../../services/wizardApi';
import { getLandingInsurances } from '../../../services/landingApi';
import { InsuranceIntro, PlanComparison } from '../components/upsell';
import type { InsurancePlan } from '../types/upsell';


function SegurosContent() {
  const router = useRouter();
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  // Scroll to top on page load
  useScrollToTop();

  const [selectedInsurance, setSelectedInsurance] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  const { getDiscountedMonthlyPayment } = useProduct();

  // Fetch insurance plans from API
  useEffect(() => {
    async function fetchInsurancePlans() {
      try {
        const plans = await getLandingInsurances(landing);
        // Map API response to InsurancePlan type
        const mappedPlans: InsurancePlan[] = plans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
          tier: plan.tier,
          isRecommended: plan.isRecommended,
          coverage: plan.coverage,
          exclusions: plan.exclusions,
        }));
        setInsurancePlans(mappedPlans);
      } catch (error) {
        console.error('Error fetching insurance plans:', error);
      } finally {
        setIsLoadingPlans(false);
      }
    }
    fetchInsurancePlans();
  }, [landing]);

  // Get layout data from context (fetched once at [landing] level)
  const { navbarProps, footerData, isLoading: isLayoutLoading, hasError: hasLayoutError } = useLayout();

  // Get wizard config for dynamic last step
  const { steps } = useWizardConfig();

  // Get the last step (summary or regular) for dynamic navigation
  const lastStep = steps.length > 0 ? steps[steps.length - 1] : null;

  const handleBack = () => {
    // Use dynamic last step slug from API (100% from BD)
    const lastStepSlug = lastStep ? getStepSlug(lastStep) : 'resumen';
    router.push(`/prototipos/0.6/${landing}/solicitar/${lastStepSlug}`);
  };

  const handleContinue = async () => {
    // TODO: Implement API endpoint
  };

  // Calculate total with insurance
  const insuranceMonthly = selectedInsurance
    ? insurancePlans.find((p) => p.id === selectedInsurance)?.monthlyPrice || 0
    : 0;
  const totalMonthly = getDiscountedMonthlyPayment() + insuranceMonthly;

  const pageContent = (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Navbar del Hero */}
      <Navbar {...navbarProps} />

      {/* Spacer for fixed navbar + promo banner */}
      <div className="h-[104px]" />

      <div className="max-w-3xl mx-auto px-4 pt-14 pb-32 lg:pb-6">
        {/* Alert Banner */}
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
                Accidentes pasan. Protege tu equipo desde S/15/mes
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                Selecciona un seguro para mayor tranquilidad (opcional)
              </p>
            </div>
          </div>
        </motion.div>

        {/* Products + Accessories - Desktop inline, Mobile uses sticky bar */}
        <SelectedProductBar />

        {/* Insurance Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-neutral-200"
        >
          <InsuranceIntro />
          {isLoadingPlans ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
            </div>
          ) : insurancePlans.length > 0 ? (
            <PlanComparison
              plans={insurancePlans}
              selectedPlan={selectedInsurance}
              onSelect={(planId: string) =>
                setSelectedInsurance(planId === selectedInsurance ? null : planId)
              }
            />
          ) : (
            <p className="text-center text-neutral-500 py-4">
              No hay planes de seguro disponibles
            </p>
          )}
        </motion.div>

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
                <p className="text-xs text-[var(--color-secondary)] flex items-center gap-1 mt-0.5">
                  <Shield className="w-3 h-3" />
                  Incluye seguro
                </p>
              )}
            </div>
            <p className="text-2xl font-bold text-[var(--color-primary)]">
              S/{formatMoney(totalMonthly)}/mes
            </p>
          </div>
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
          >
            Atrás
          </Button>
          <Button
            size="lg"
            className="w-full lg:flex-1 bg-[var(--color-primary)] text-white font-semibold cursor-pointer hover:brightness-90"
            onPress={handleContinue}
            isLoading={isSubmitting}
            spinner={<Loader2 className="w-5 h-5 animate-spin" />}
          >
            Enviar Solicitud
          </Button>
        </motion.div>

        {/* Optional Note */}
        <p className="text-xs text-neutral-400 text-center mt-4">
          La selección de seguro es opcional. Puedes continuar sin seleccionar ninguno.
        </p>
      </div>
    </div>
  );

  // Show loading while layout data is loading
  if (isLayoutLoading) {
    return <LoadingFallback />;
  }

  // Show 404 if landing not found (paused, archived, or doesn't exist)
  if (hasLayoutError || !navbarProps) {
    return <NotFoundContent homeUrl="/prototipos/0.6/home" />;
  }

  return (
    <>
      {pageContent}
      <SelectedProductSpacer />
      <Footer data={footerData} />
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

export default function SegurosPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SegurosContent />
    </Suspense>
  );
}
