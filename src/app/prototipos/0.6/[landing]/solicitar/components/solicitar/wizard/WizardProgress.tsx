'use client';

/**
 * WizardProgress - Step progress indicator (Dynamic from API)
 * Shows current position in the wizard flow
 *
 * Steps come from the API + "Resumen" is always added at the end
 * Completed steps are calculated DYNAMICALLY based on form data (100% from BD)
 *
 * Mobile: Compact design with Baldi illustration + progress dots (clickeable)
 * Desktop: Full circles with titles (clickeable)
 */

import React, { useMemo } from 'react';
import { Check } from 'lucide-react';
import { WizardStepId } from '../../../types/solicitar';
import { useWizardConfig } from '../../../context/WizardConfigContext';
import { useWizard } from '../../../context/WizardContext';
import { getStepSlug, WizardStep, evaluateFieldVisibility } from '../../../../../services/wizardApi';

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
  onStepClick?: (stepId: WizardStepId) => void;
}

/**
 * Dynamically check if a step is completed based on form data
 * A step is completed if all required visible fields have values
 * This is 100% dynamic - changes in admin (add/remove fields) are reflected automatically
 */
const isStepDynamicallyCompleted = (
  step: WizardStep,
  formValues: Record<string, string | string[]>
): boolean => {
  for (const field of step.fields) {
    // Skip non-required fields
    if (!field.required) continue;
    // Skip fields not visible (evaluateFieldVisibility handles hidden + dependencies)
    if (!evaluateFieldVisibility(field, formValues)) continue;

    const value = formValues[field.code];
    // Check if field has a value
    if (value === undefined || value === null) return false;
    if (typeof value === 'string' && !value.trim()) return false;
    if (Array.isArray(value) && value.length === 0) return false;
  }
  return true;
};

export const WizardProgress: React.FC<WizardProgressProps> = ({
  currentStep,
  onStepClick,
}) => {
  const { steps: apiSteps, isLoading } = useWizardConfig();
  const { formData } = useWizard();

  // Build form values object for completion check
  const formValues = useMemo(() => {
    const values: Record<string, string | string[]> = {};
    for (const [key, state] of Object.entries(formData)) {
      if (state?.value !== undefined) {
        values[key] = state.value as string | string[];
      }
    }
    return values;
  }, [formData]);

  // Calculate completed steps dynamically based on form data
  const completedSteps = useMemo(() => {
    const completed: WizardStepId[] = [];
    for (const step of apiSteps) {
      if (step.is_summary_step) continue; // Skip summary steps
      const slug = getStepSlug(step) as WizardStepId;
      if (isStepDynamicallyCompleted(step, formValues)) {
        completed.push(slug);
      }
    }
    return completed;
  }, [apiSteps, formValues]);

  // Build step list from API + Resumen at the end
  // Excludes steps with is_summary_step=true (they appear in resumen page, not progress bar)
  // Uses dynamic url_slug from API (100% from BD)
  const progressSteps: ProgressStep[] = useMemo(() => {
    const regularSteps: ProgressStep[] = apiSteps
      .filter(step => !step.is_summary_step)
      .map(step => ({
        slug: getStepSlug(step) as WizardStepId,
        title: step.title,
        code: step.code,
      }));

    // Get first summary step from API (is_summary_step=true) for the "Resumen" progress item
    // This makes the slug 100% dynamic from BD (matches actual URL)
    const summaryStep = apiSteps.find(step => step.is_summary_step);
    const resumenStep: ProgressStep = {
      slug: summaryStep ? (getStepSlug(summaryStep) as WizardStepId) : 'resumen',
      title: 'Resumen', // UI convention: last step is always called "Resumen"
      code: summaryStep?.code || 'resumen',
    };

    return [...regularSteps, resumenStep];
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
                const isCompleted = completedSteps.includes(step.slug);
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
                          ? 'bg-[var(--color-primary)]'
                          : isCurrent
                          ? 'bg-[var(--color-primary)] ring-2 ring-[rgba(var(--color-primary-rgb),0.3)]'
                          : 'bg-neutral-200'}
                        ${clickable
                          ? 'cursor-pointer hover:scale-125 hover:ring-2 hover:ring-[rgba(var(--color-primary-rgb),0.5)]'
                          : 'cursor-default'}
                      `}
                      aria-label={`Ir a ${step.title}`}
                    />
                    {index < progressSteps.length - 1 && (
                      <div
                        className={`
                          flex-1 h-0.5 rounded-full transition-all duration-200
                          ${index < currentIndex ? 'bg-[var(--color-primary)]' : 'bg-neutral-200'}
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
          const isCompleted = completedSteps.includes(step.slug);
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
                      ? 'bg-[var(--color-primary)] text-white'
                      : isCurrent
                      ? 'bg-[var(--color-primary)] text-white ring-4 ring-[rgba(var(--color-primary-rgb),0.2)]'
                      : 'bg-neutral-200 text-neutral-500'}
                    ${clickable
                      ? 'group-hover:scale-110 group-hover:ring-4 group-hover:ring-[rgba(var(--color-primary-rgb),0.3)]'
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
                    ${isCurrent ? 'text-[var(--color-primary)]' : isCompleted ? 'text-neutral-700' : 'text-neutral-400'}
                    ${clickable ? 'group-hover:text-[var(--color-primary)]' : ''}
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
                    ${index < currentIndex ? 'bg-[var(--color-primary)]' : 'bg-neutral-200'}
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
