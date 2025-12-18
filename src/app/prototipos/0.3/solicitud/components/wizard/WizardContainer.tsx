'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { WizardConfig, WizardStep, WizardState } from '../../types/wizard';
import { WIZARD_STEPS, getRemainingMinutes } from '../../data/wizardSteps';

// Layouts
import { WizardLayoutV1 } from './structure/WizardLayoutV1';
import { WizardLayoutV2 } from './structure/WizardLayoutV2';
import { WizardLayoutV3 } from './structure/WizardLayoutV3';

// Progress
import { ProgressIndicatorV1 } from './progress/ProgressIndicatorV1';
import { ProgressIndicatorV2 } from './progress/ProgressIndicatorV2';
import { ProgressIndicatorV3 } from './progress/ProgressIndicatorV3';

// Navigation
import { WizardButtonsV1 } from './navigation/WizardButtonsV1';
import { WizardButtonsV2 } from './navigation/WizardButtonsV2';
import { WizardButtonsV3 } from './navigation/WizardButtonsV3';

// Motivation
import { MotivationalMessageV1 } from './motivation/MotivationalMessageV1';
import { MotivationalMessageV2 } from './motivation/MotivationalMessageV2';
import { MotivationalMessageV3 } from './motivation/MotivationalMessageV3';

// Step Layout
import { StepLayoutV1 } from './step/StepLayoutV1';
import { StepLayoutV2 } from './step/StepLayoutV2';
import { StepLayoutV3 } from './step/StepLayoutV3';

// Celebration
import { StepCelebrationV1 } from './celebration/StepCelebrationV1';
import { StepCelebrationV2 } from './celebration/StepCelebrationV2';
import { StepCelebrationV3 } from './celebration/StepCelebrationV3';
import { MilestoneAnimation } from './celebration/MilestoneAnimation';

interface WizardContainerProps {
  config: WizardConfig;
  steps?: WizardStep[];
  onComplete?: (data: Record<string, unknown>) => void;
  onSave?: (data: Record<string, unknown>) => void;
  renderStepContent?: (step: WizardStep, stepIndex: number) => React.ReactNode;
}

const defaultConfig: WizardConfig = {
  layoutVersion: 1,
  progressVersion: 1,
  navigationVersion: 1,
  stepLayoutVersion: 1,
  motivationVersion: 1,
  celebrationVersion: 1,
  allowFreeNavigation: false,
  autoSave: true,
  showTimeEstimate: true,
};

export const WizardContainer: React.FC<WizardContainerProps> = ({
  config: userConfig,
  steps = WIZARD_STEPS,
  onComplete,
  onSave,
  renderStepContent,
}) => {
  const config = { ...defaultConfig, ...userConfig };

  // Wizard state
  const [state, setState] = useState<WizardState>({
    currentStep: 0,
    completedSteps: [],
    formData: {},
    isSubmitting: false,
    isSaving: false,
    errors: {},
  });

  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [showMilestone, setShowMilestone] = useState<25 | 50 | 75 | 100 | null>(null);

  // Navigation handlers
  const handleNext = useCallback(() => {
    const nextStep = state.currentStep + 1;
    const isLastStep = state.currentStep === steps.length - 1;

    if (isLastStep) {
      setState((prev) => ({ ...prev, isSubmitting: true }));
      // Simulate submission
      setTimeout(() => {
        onComplete?.(state.formData);
        setState((prev) => ({ ...prev, isSubmitting: false }));
      }, 2000);
      return;
    }

    // Show celebration before moving
    if (config.celebrationVersion > 0) {
      setShowCelebration(true);
    } else {
      moveToNextStep(nextStep);
    }
  }, [state.currentStep, state.formData, steps.length, config.celebrationVersion, onComplete]);

  const moveToNextStep = useCallback((nextStep: number) => {
    const newCompletedSteps = [...state.completedSteps];
    if (!newCompletedSteps.includes(state.currentStep)) {
      newCompletedSteps.push(state.currentStep);
    }

    // Check for milestone
    const progress = Math.round((nextStep / (steps.length - 1)) * 100);
    const milestones: (25 | 50 | 75 | 100)[] = [25, 50, 75, 100];
    const hitMilestone = milestones.find(
      (m) => progress >= m && !milestones.slice(0, milestones.indexOf(m)).some((prev) => progress < prev)
    );

    if (hitMilestone && progress === hitMilestone) {
      setShowMilestone(hitMilestone);
    }

    setState((prev) => ({
      ...prev,
      currentStep: nextStep,
      completedSteps: newCompletedSteps,
    }));
  }, [state.currentStep, state.completedSteps, steps.length]);

  const handleBack = useCallback(() => {
    if (state.currentStep > 0) {
      setState((prev) => ({
        ...prev,
        currentStep: prev.currentStep - 1,
      }));
    }
  }, [state.currentStep]);

  const handleStepClick = useCallback((stepIndex: number) => {
    if (config.allowFreeNavigation || state.completedSteps.includes(stepIndex) || stepIndex <= state.currentStep) {
      setState((prev) => ({
        ...prev,
        currentStep: stepIndex,
      }));
    }
  }, [config.allowFreeNavigation, state.completedSteps, state.currentStep]);

  const handleSave = useCallback(() => {
    setState((prev) => ({ ...prev, isSaving: true }));
    onSave?.(state.formData);
    setTimeout(() => {
      setState((prev) => ({ ...prev, isSaving: false }));
    }, 1000);
  }, [state.formData, onSave]);

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
    moveToNextStep(state.currentStep + 1);
  }, [moveToNextStep, state.currentStep]);

  const handleMilestoneComplete = useCallback(() => {
    setShowMilestone(null);
  }, []);

  // Component selection based on config
  const Layout = useMemo(() => {
    switch (config.layoutVersion) {
      case 2: return WizardLayoutV2;
      case 3: return WizardLayoutV3;
      default: return WizardLayoutV1;
    }
  }, [config.layoutVersion]);

  const Progress = useMemo(() => {
    switch (config.progressVersion) {
      case 2: return ProgressIndicatorV2;
      case 3: return ProgressIndicatorV3;
      default: return ProgressIndicatorV1;
    }
  }, [config.progressVersion]);

  const Navigation = useMemo(() => {
    switch (config.navigationVersion) {
      case 2: return WizardButtonsV2;
      case 3: return WizardButtonsV3;
      default: return WizardButtonsV1;
    }
  }, [config.navigationVersion]);

  const Motivation = useMemo(() => {
    switch (config.motivationVersion) {
      case 2: return MotivationalMessageV2;
      case 3: return MotivationalMessageV3;
      default: return MotivationalMessageV1;
    }
  }, [config.motivationVersion]);

  const StepLayout = useMemo(() => {
    switch (config.stepLayoutVersion) {
      case 2: return StepLayoutV2;
      case 3: return StepLayoutV3;
      default: return StepLayoutV1;
    }
  }, [config.stepLayoutVersion]);

  const Celebration = useMemo(() => {
    switch (config.celebrationVersion) {
      case 2: return StepCelebrationV2;
      case 3: return StepCelebrationV3;
      default: return StepCelebrationV1;
    }
  }, [config.celebrationVersion]);

  // Current step data
  const currentStepData = steps[state.currentStep];
  const isLastStep = state.currentStep === steps.length - 1;
  const remainingMinutes = getRemainingMinutes(state.currentStep);

  // Default step content (placeholder)
  const defaultStepContent = (
    <div className="text-center py-8 text-neutral-400">
      <p className="text-sm">Contenido del paso: {currentStepData?.name}</p>
      <p className="text-xs mt-2">Los campos del formulario se agregarán aquí</p>
    </div>
  );

  // Build progress component
  const progressComponent = (
    <Progress
      steps={steps}
      currentStep={state.currentStep}
      completedSteps={state.completedSteps}
      onStepClick={handleStepClick}
      allowFreeNavigation={config.allowFreeNavigation}
    />
  );

  return (
    <>
      <Layout
        steps={steps}
        currentStep={state.currentStep}
        showTimeEstimate={config.showTimeEstimate}
        estimatedMinutesRemaining={remainingMinutes}
        progressComponent={progressComponent}
        onStepClick={handleStepClick}
        onClose={() => console.log('Close wizard')}
      >
        {/* Motivational Message */}
        {config.showTimeEstimate && (
          <div className="mt-4">
            <Motivation
              currentStep={state.currentStep}
              stepCode={currentStepData?.code || 'personal'}
              remainingMinutes={remainingMinutes}
              completedSteps={state.completedSteps.length}
              totalSteps={steps.length}
            />
          </div>
        )}

        {/* Step Content */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            <StepLayout
              key={state.currentStep}
              step={currentStepData}
              showDescription={true}
            >
              {renderStepContent
                ? renderStepContent(currentStepData, state.currentStep)
                : defaultStepContent}
            </StepLayout>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <Navigation
          onBack={handleBack}
          onNext={handleNext}
          onSave={handleSave}
          canGoBack={state.currentStep > 0}
          canGoForward={true} // In real app, validate form
          isSubmitting={state.isSubmitting}
          isLastStep={isLastStep}
          showSaveButton={config.autoSave}
        />
      </Layout>

      {/* Step Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <Celebration
            stepName={currentStepData?.name || ''}
            stepNumber={state.currentStep + 1}
            onComplete={handleCelebrationComplete}
          />
        )}
      </AnimatePresence>

      {/* Milestone Animation */}
      <AnimatePresence>
        {showMilestone && (
          <MilestoneAnimation
            milestone={showMilestone}
            onComplete={handleMilestoneComplete}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default WizardContainer;
