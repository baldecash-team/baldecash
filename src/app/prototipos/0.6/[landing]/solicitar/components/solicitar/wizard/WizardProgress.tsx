'use client';

/**
 * WizardProgress - Step progress indicator (Dynamic from API)
 * Shows current position in the wizard flow
 *
 * Steps come from the API + "Resumen" is always added at the end
 *
 * Mobile: Compact design with Baldi illustration + progress dots (clickeable)
 * Desktop: Full circles with titles (clickeable)
 */

import React, { useMemo } from 'react';
import { Check } from 'lucide-react';
import { WizardStepId } from '../../../types/solicitar';
import { useWizardConfig } from '../../../context/WizardConfigContext';
import { STEP_CODE_TO_SLUG } from '../../../../../services/wizardApi';

// Ilustraciones de Baldi por step slug
const STEP_ILLUSTRATIONS: Record<string, string> = {
  'datos-personales': '/images/baldi/BALDI_IDEA.png',
  'datos-academicos': '/images/baldi/BALDI_COMPU.png',
  'datos-economicos': '/images/baldi/BALDI_EJECUTIVO.png',
  'resumen': '/images/baldi/BALDI_ALEGRE.png',
};

// Default illustration for unknown steps
const DEFAULT_ILLUSTRATION = '/images/baldi/BALDI_IDEA.png';

interface ProgressStep {
  slug: WizardStepId;
  title: string;
  code: string;
}

interface WizardProgressProps {
  currentStep: WizardStepId;
  completedSteps?: WizardStepId[];
  onStepClick?: (stepId: WizardStepId) => void;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  currentStep,
  completedSteps = [],
  onStepClick,
}) => {
  const { steps: apiSteps, isLoading } = useWizardConfig();

  // Build step list from API + Resumen at the end
  // Excludes steps with is_summary_step=true (they appear in resumen page, not progress bar)
  const progressSteps: ProgressStep[] = useMemo(() => {
    const stepsFromApi: ProgressStep[] = apiSteps
      .filter(step => !step.is_summary_step) // Exclude summary steps from progress bar
      .map(step => ({
        slug: (STEP_CODE_TO_SLUG[step.code] || step.code) as WizardStepId,
        title: step.title,
        code: step.code,
      }));

    // Always add "Resumen" at the end
    const resumenStep: ProgressStep = {
      slug: 'resumen',
      title: 'Resumen',
      code: 'resumen',
    };

    return [...stepsFromApi, resumenStep];
  }, [apiSteps]);

  const currentIndex = progressSteps.findIndex(s => s.slug === currentStep);
  const currentStepData = progressSteps[currentIndex];
  const totalSteps = progressSteps.length;

  const isStepClickable = (stepSlug: WizardStepId, index: number) => {
    // Can click on completed steps or any previous step
    return onStepClick && (completedSteps.includes(stepSlug) || index < currentIndex);
  };

  const handleStepClick = (stepSlug: WizardStepId, index: number) => {
    if (isStepClickable(stepSlug, index) && onStepClick) {
      onStepClick(stepSlug);
    }
  };

  const getIllustration = (slug: string): string => {
    return STEP_ILLUSTRATIONS[slug] || DEFAULT_ILLUSTRATION;
  };

  // Loading state - show skeleton
  if (isLoading || progressSteps.length === 0) {
    return (
      <>
        {/* Mobile Skeleton */}
        <div className="lg:hidden">
          <div className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 animate-pulse">
            <div className="w-14 h-14 bg-neutral-200 rounded-full" />
            <div className="flex-1">
              <div className="h-3 bg-neutral-200 rounded w-20 mb-2" />
              <div className="h-5 bg-neutral-200 rounded w-32 mb-2" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-2.5 h-2.5 bg-neutral-200 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Desktop Skeleton */}
        <div className="hidden lg:flex items-center justify-between animate-pulse">
          {[1, 2, 3, 4].map((_, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-neutral-200 rounded-full" />
                <div className="h-3 bg-neutral-200 rounded w-16 mt-2" />
              </div>
              {i < 3 && <div className="flex-1 h-1 mx-2 bg-neutral-200 rounded-full" />}
            </React.Fragment>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobile Version */}
      <div className="lg:hidden">
        <div className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-neutral-100">
          {/* Baldi Illustration */}
          <img
            src={getIllustration(currentStep)}
            alt="Baldi"
            className="w-14 h-14 object-contain flex-shrink-0"
          />

          {/* Step Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-neutral-500 font-medium">
              Paso {currentIndex + 1} de {totalSteps}
            </p>
            <p className="text-base font-bold text-neutral-800 truncate">
              {currentStepData?.title || currentStep}
            </p>

            {/* Progress Dots - Clickeable */}
            <div className="flex items-center gap-2 mt-2">
              {progressSteps.map((step, index) => {
                const isCompleted = completedSteps.includes(step.slug) || index < currentIndex;
                const isCurrent = step.slug === currentStep;
                const clickable = isStepClickable(step.slug, index);

                return (
                  <React.Fragment key={step.slug}>
                    <button
                      type="button"
                      onClick={() => handleStepClick(step.slug, index)}
                      disabled={!clickable}
                      className={`
                        w-2.5 h-2.5 rounded-full transition-all duration-200
                        ${isCompleted
                          ? 'bg-[#4654CD]'
                          : isCurrent
                          ? 'bg-[#4654CD] ring-2 ring-[#4654CD]/30'
                          : 'bg-neutral-200'}
                        ${clickable
                          ? 'cursor-pointer hover:scale-125 hover:ring-2 hover:ring-[#4654CD]/50'
                          : 'cursor-default'}
                      `}
                      aria-label={`Ir a ${step.title}`}
                    />
                    {index < progressSteps.length - 1 && (
                      <div
                        className={`
                          flex-1 h-0.5 rounded-full transition-all duration-200
                          ${index < currentIndex ? 'bg-[#4654CD]' : 'bg-neutral-200'}
                        `}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Version */}
      <div className="hidden lg:flex items-center justify-between">
        {progressSteps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.slug) || index < currentIndex;
          const isCurrent = step.slug === currentStep;
          const clickable = isStepClickable(step.slug, index);

          return (
            <React.Fragment key={step.slug}>
              {/* Step Circle - Clickeable */}
              <button
                type="button"
                onClick={() => handleStepClick(step.slug, index)}
                disabled={!clickable}
                className={`
                  flex flex-col items-center group
                  ${clickable ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    transition-all duration-200
                    ${isCompleted
                      ? 'bg-[#4654CD] text-white'
                      : isCurrent
                      ? 'bg-[#4654CD] text-white ring-4 ring-[#4654CD]/20'
                      : 'bg-neutral-200 text-neutral-500'}
                    ${clickable
                      ? 'group-hover:scale-110 group-hover:ring-4 group-hover:ring-[#4654CD]/30'
                      : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-xs font-medium text-center max-w-[80px]
                    transition-colors duration-200
                    ${isCurrent ? 'text-[#4654CD]' : isCompleted ? 'text-neutral-700' : 'text-neutral-400'}
                    ${clickable ? 'group-hover:text-[#4654CD]' : ''}
                  `}
                >
                  {step.title}
                </span>
              </button>

              {/* Connector Line */}
              {index < progressSteps.length - 1 && (
                <div
                  className={`
                    flex-1 h-1 mx-2 rounded-full transition-all duration-200
                    ${index < currentIndex ? 'bg-[#4654CD]' : 'bg-neutral-200'}
                  `}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
};

export default WizardProgress;
