'use client';

/**
 * Datos Académicos - Step 2
 * Academic information form - Dynamic version using API config
 */

import React, { Suspense, useState, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { WizardLayout } from '../components/solicitar/wizard';
import { DynamicWizardStep } from '../components/solicitar/wizard/DynamicWizardStep';
import { WizardStepId } from '../types/solicitar';
import { StepSuccessMessage } from '../components/solicitar/celebration/StepSuccessMessage';
import { useWizard } from '../context/WizardContext';
import { useWizardConfig } from '../context/WizardConfigContext';
import { SLUG_TO_STEP_CODE, STEP_CODE_TO_SLUG, validateStep as validateStepFields } from '../../../services/wizardApi';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';

const STEP_SLUG = 'datos-academicos';
const STEP_CODE = SLUG_TO_STEP_CODE[STEP_SLUG]; // 'academic_data'

function DatosAcademicosContent() {
  const router = useRouter();
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  // Scroll to top on page load
  useScrollToTop();

  const [showCelebration, setShowCelebration] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Get layout data from context (fetched once at [landing] level)
  const { navbarProps, footerData, isLoading: isLayoutLoading } = useLayout();

  // Get wizard config from API
  const { getStep, getNavigation, isLoading: isConfigLoading, error: configError } = useWizardConfig();

  const {
    formData,
    setFieldError,
    markStepCompleted,
  } = useWizard();

  // Get step config from API
  const step = getStep(STEP_CODE);
  const navigation = getNavigation(STEP_CODE);

  // Build form values for validation
  const formValues = useMemo(() => {
    const values: Record<string, string | string[]> = {};
    for (const [key, state] of Object.entries(formData)) {
      if (state?.value !== undefined) {
        values[key] = state.value as string | string[];
      }
    }
    return values;
  }, [formData]);

  // Validate all fields in the step using centralized function
  const validateStep = useCallback((): string | null => {
    if (!step) return null;
    return validateStepFields(step, formValues, setFieldError);
  }, [step, formValues, setFieldError]);

  const handleNext = () => {
    setSubmitted(true);
    const firstErrorField = validateStep();
    if (firstErrorField) {
      // Scroll to first field with error
      document.getElementById(firstErrorField)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    markStepCompleted('datos-academicos');
    setShowCelebration(true);
  };

  const handleCelebrationComplete = () => {
    const nextSlug = navigation.nextStep ? STEP_CODE_TO_SLUG[navigation.nextStep.code] : 'datos-economicos';
    router.push(`/prototipos/0.6/${landing}/solicitar/${nextSlug}`);
  };

  const handleBack = () => {
    const prevSlug = navigation.prevStep ? STEP_CODE_TO_SLUG[navigation.prevStep.code] : 'datos-personales';
    router.push(`/prototipos/0.6/${landing}/solicitar/${prevSlug}`);
  };

  const handleStepClick = (stepId: WizardStepId) => {
    router.push(`/prototipos/0.6/${landing}/solicitar/${stepId}`);
  };

  // Loading state
  if (isLayoutLoading || isConfigLoading) {
    return <LoadingFallback />;
  }

  // Error state
  if (configError || !step) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error al cargar el formulario</p>
          <button
            onClick={() => window.location.reload()}
            className="text-[#4654CD] underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const pageContent = (
    <>
      <AnimatePresence>
        {showCelebration && (
          <StepSuccessMessage
            stepName={step.title}
            stepNumber={step.order}
            onComplete={handleCelebrationComplete}
          />
        )}
      </AnimatePresence>

      <WizardLayout
        currentStep="datos-academicos"
        title={step.title}
        description={step.description}
        onBack={handleBack}
        onNext={handleNext}
        onStepClick={handleStepClick}
        isFirstStep={navigation.isFirst}
        canProceed={true}
        navbarProps={navbarProps || undefined}
        motivational={step.motivational}
      >
        <DynamicWizardStep
          step={step}
          showErrors={submitted}
        />
      </WizardLayout>
    </>
  );

  return (
    <>
      {pageContent}
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

export default function DatosAcademicosPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DatosAcademicosContent />
    </Suspense>
  );
}
