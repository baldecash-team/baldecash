'use client';

/**
 * WizardProgress - Step progress indicator
 * Shows current position in the wizard flow
 */

import React from 'react';
import { Check } from 'lucide-react';
import { WizardStepId } from '../../../types/wizard-solicitud';
import { STEP_ORDER, getStepById } from '../../../data/wizardSteps';

interface WizardProgressProps {
  currentStep: WizardStepId;
  completedSteps?: WizardStepId[];
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  currentStep,
  completedSteps = [],
}) => {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="flex items-center justify-between">
      {STEP_ORDER.map((stepId, index) => {
        const step = getStepById(stepId);
        const isCompleted = completedSteps.includes(stepId) || index < currentIndex;
        const isCurrent = stepId === currentStep;
        const isUpcoming = index > currentIndex;

        return (
          <React.Fragment key={stepId}>
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  transition-all duration-200
                  ${isCompleted
                    ? 'bg-[#4654CD] text-white'
                    : isCurrent
                    ? 'bg-[#4654CD] text-white ring-4 ring-[#4654CD]/20'
                    : 'bg-neutral-200 text-neutral-500'}
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
                  ${isCurrent ? 'text-[#4654CD]' : isCompleted ? 'text-neutral-700' : 'text-neutral-400'}
                `}
              >
                {step?.title || stepId}
              </span>
            </div>

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
  );
};

export default WizardProgress;
