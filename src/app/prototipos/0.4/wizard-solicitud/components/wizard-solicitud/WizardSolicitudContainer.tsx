'use client';

/**
 * WizardSolicitudContainer - Container principal del flujo completo
 * PROMPT_18: Integra Intro + Wizard en un solo componente
 */

import React, { useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type {
  WizardSolicitudConfig,
  WizardState,
  SelectedProduct,
} from '../../types/wizard-solicitud';
import { defaultWizardSolicitudConfig } from '../../types/wizard-solicitud';
import { WIZARD_STEPS, getRemainingMinutes, MOCK_PRODUCT } from '../../data/wizardSolicitudSteps';

// Intro components
import { getIntroComponent } from './intro';

// Wizard components con mapeo de versiones
import { getWizardLayout, getProgressIndicator, getWizardNavigation } from './wizard';

// Celebration components
import { getStepSuccessMessage } from '../celebration';

// Step components
import { StepContent } from './steps/StepContent';

interface WizardSolicitudContainerProps {
  config?: Partial<WizardSolicitudConfig>;
  selectedProduct?: SelectedProduct;
  onComplete?: (data: Record<string, unknown>) => void;
  onSave?: (data: Record<string, unknown>) => void;
}

export const WizardSolicitudContainer: React.FC<WizardSolicitudContainerProps> = ({
  config: customConfig,
  selectedProduct = MOCK_PRODUCT,
  onComplete,
  onSave,
}) => {
  // Merge config con defaults
  const config = useMemo(
    () => ({ ...defaultWizardSolicitudConfig, ...customConfig }),
    [customConfig]
  );

  // Estado del wizard
  const [state, setState] = useState<WizardState>({
    phase: 'intro',
    currentStep: 0,
    completedSteps: [],
    formData: {},
    isSubmitting: false,
    isSaving: false,
    errors: {},
    startedAt: undefined,
  });

  // Estado para celebracion
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationStep, setCelebrationStep] = useState(0);

  // Handlers de navegacion
  const handleStartWizard = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: 'wizard',
      startedAt: new Date(),
    }));
  }, []);

  // Callback para cuando termina la celebracion
  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
    setState((prev) => ({
      ...prev,
      currentStep: prev.currentStep + 1,
    }));
  }, []);

  const handleNext = useCallback(() => {
    const { currentStep } = state;
    const isLastStep = currentStep === WIZARD_STEPS.length - 1;

    if (isLastStep) {
      // Enviar solicitud
      setState((prev) => ({ ...prev, isSubmitting: true }));
      setTimeout(() => {
        onComplete?.(state.formData);
        setState((prev) => ({ ...prev, isSubmitting: false }));
      }, 2000);
      return;
    }

    // Marcar paso actual como completado
    const newCompletedSteps = [...state.completedSteps];
    if (!newCompletedSteps.includes(currentStep)) {
      newCompletedSteps.push(currentStep);
    }

    setState((prev) => ({
      ...prev,
      completedSteps: newCompletedSteps,
    }));

    // Mostrar celebracion antes de avanzar
    setCelebrationStep(currentStep + 1);
    setShowCelebration(true);
  }, [state, onComplete]);

  const handleBack = useCallback(() => {
    if (state.currentStep > 0) {
      setState((prev) => ({
        ...prev,
        currentStep: prev.currentStep - 1,
      }));
    }
  }, [state.currentStep]);

  const handleStepClick = useCallback(
    (stepIndex: number) => {
      if (
        config.allowFreeNavigation ||
        state.completedSteps.includes(stepIndex) ||
        stepIndex <= state.currentStep
      ) {
        setState((prev) => ({
          ...prev,
          currentStep: stepIndex,
        }));
      }
    },
    [config.allowFreeNavigation, state.completedSteps, state.currentStep]
  );

  const handleSave = useCallback(() => {
    setState((prev) => ({ ...prev, isSaving: true }));
    onSave?.(state.formData);
    setTimeout(() => {
      setState((prev) => ({ ...prev, isSaving: false, lastSavedAt: new Date() }));
    }, 1000);
  }, [state.formData, onSave]);

  const handleFieldChange = useCallback((name: string, value: unknown) => {
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [name]: value },
      errors: { ...prev.errors, [name]: '' },
    }));
  }, []);

  // Renderizar fase Intro
  if (state.phase === 'intro') {
    const IntroComponent = getIntroComponent();
    return (
      <IntroComponent
        config={config}
        selectedProduct={selectedProduct}
        onStart={handleStartWizard}
      />
    );
  }

  // Datos del paso actual
  const currentStepData = WIZARD_STEPS[state.currentStep];
  const isLastStep = state.currentStep === WIZARD_STEPS.length - 1;
  const remainingMinutes = getRemainingMinutes(state.currentStep);

  // Obtener componentes segun configuracion
  const WizardLayout = getWizardLayout(config.wizardLayoutVersion);
  const ProgressIndicator = getProgressIndicator(config.progressVersion);
  const WizardNavigation = getWizardNavigation(config.navigationVersion);
  const CelebrationComponent = getStepSuccessMessage(config.celebrationVersion);

  // Renderizar fase Wizard
  return (
    <>
      {/* Celebracion entre pasos */}
      <AnimatePresence>
        {showCelebration && (
          <CelebrationComponent
            stepName={WIZARD_STEPS[celebrationStep - 1]?.name || 'Paso'}
            stepNumber={celebrationStep}
            onComplete={handleCelebrationComplete}
          />
        )}
      </AnimatePresence>

      <WizardLayout
        steps={WIZARD_STEPS}
        currentStep={state.currentStep}
        selectedProduct={selectedProduct}
        showTimeEstimate={config.showTimeEstimate}
        estimatedMinutesRemaining={remainingMinutes}
      >
        {/* Indicador de progreso */}
        <ProgressIndicator
          steps={WIZARD_STEPS}
          currentStep={state.currentStep}
          completedSteps={state.completedSteps}
          onStepClick={handleStepClick}
          allowFreeNavigation={config.allowFreeNavigation}
        />

        {/* Contenido del paso */}
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <StepContent
              step={currentStepData}
              config={config}
              formData={state.formData}
              errors={state.errors}
              onFieldChange={handleFieldChange}
              selectedProduct={selectedProduct}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navegacion */}
        <WizardNavigation
          onBack={handleBack}
          onNext={handleNext}
          onSave={handleSave}
          canGoBack={state.currentStep > 0}
          canGoForward={true}
          isSubmitting={state.isSubmitting}
          isSaving={state.isSaving}
          isLastStep={isLastStep}
          showSaveButton={config.autoSave}
        />
      </WizardLayout>
    </>
  );
};

export default WizardSolicitudContainer;
