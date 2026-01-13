'use client';

/**
 * WizardProgress - Step progress indicator
 * Shows current position in the wizard flow
 *
 * Mobile: Compact design with Baldi illustration + progress dots (clickeable)
 * Desktop: Full circles with titles (clickeable)
 */

import React from 'react';
import { Check } from 'lucide-react';
import { WizardStepId } from '../../../types/wizard-solicitud';
import { STEP_ORDER, getStepById } from '../../../data/wizardSteps';

// Ilustraciones de Baldi por paso
const STEP_ILLUSTRATIONS: Record<WizardStepId, string> = {
  'datos-personales': '/images/baldi/BALDI_IDEA.png',
  'datos-academicos': '/images/baldi/BALDI_COMPU.png',
  'datos-economicos': '/images/baldi/BALDI_EJECUTIVO.png',
  'resumen': '/images/baldi/BALDI_ALEGRE.png',
};

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
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const currentStepData = getStepById(currentStep);
  const totalSteps = STEP_ORDER.length;

  const isStepClickable = (stepId: WizardStepId, index: number) => {
    // Can click on completed steps or any previous step
    return onStepClick && (completedSteps.includes(stepId) || index < currentIndex);
  };

  const handleStepClick = (stepId: WizardStepId, index: number) => {
    if (isStepClickable(stepId, index) && onStepClick) {
      onStepClick(stepId);
    }
  };

  return (
    <>
      {/* Mobile Version */}
      <div className="lg:hidden">
        <div className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-neutral-100">
          {/* Baldi Illustration */}
          <img
            src={STEP_ILLUSTRATIONS[currentStep]}
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
              {STEP_ORDER.map((stepId, index) => {
                const isCompleted = completedSteps.includes(stepId) || index < currentIndex;
                const isCurrent = stepId === currentStep;
                const clickable = isStepClickable(stepId, index);

                return (
                  <React.Fragment key={stepId}>
                    <button
                      type="button"
                      onClick={() => handleStepClick(stepId, index)}
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
                      aria-label={`Ir a ${getStepById(stepId)?.title || stepId}`}
                    />
                    {index < STEP_ORDER.length - 1 && (
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
        {STEP_ORDER.map((stepId, index) => {
          const step = getStepById(stepId);
          const isCompleted = completedSteps.includes(stepId) || index < currentIndex;
          const isCurrent = stepId === currentStep;
          const clickable = isStepClickable(stepId, index);

          return (
            <React.Fragment key={stepId}>
              {/* Step Circle - Clickeable */}
              <button
                type="button"
                onClick={() => handleStepClick(stepId, index)}
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
                  {step?.title || stepId}
                </span>
              </button>

              {/* Connector Line */}
              {index < STEP_ORDER.length - 1 && (
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
