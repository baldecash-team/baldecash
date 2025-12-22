'use client';

/**
 * ProgressIndicatorV3 - Steps verticales (mobile)
 */

import React from 'react';
import { Check } from 'lucide-react';
import type { WizardSolicitudStep } from '../../../types/wizard-solicitud';

interface ProgressIndicatorV3Props {
  steps: WizardSolicitudStep[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (stepIndex: number) => void;
  allowFreeNavigation?: boolean;
}

export const ProgressIndicatorV3: React.FC<ProgressIndicatorV3Props> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  allowFreeNavigation = false,
}) => {
  return (
    <div className="w-full">
      {/* Vertical timeline */}
      <div className="space-y-0">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = currentStep === index;
          const isClickable = allowFreeNavigation || isCompleted || index <= currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex">
              {/* Indicator column */}
              <div className="flex flex-col items-center mr-4">
                <button
                  onClick={() => isClickable && onStepClick?.(index)}
                  disabled={!isClickable}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm transition-all
                    ${isCompleted ? 'bg-[#22c55e] text-white' : ''}
                    ${isCurrent ? 'bg-[#4654CD] text-white ring-4 ring-[#4654CD]/20' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-neutral-100 text-neutral-400' : ''}
                    ${isClickable ? 'cursor-pointer hover:brightness-110' : 'cursor-default'}
                  `}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                </button>
                {!isLast && (
                  <div className={`w-0.5 h-8 ${isCompleted ? 'bg-[#22c55e]' : 'bg-neutral-200'}`} />
                )}
              </div>

              {/* Content column */}
              <div className={`pb-4 ${isCurrent ? 'pt-1' : 'pt-1.5'}`}>
                <p className={`text-sm font-medium ${isCurrent ? 'text-[#4654CD]' : 'text-neutral-600'}`}>
                  {step.shortName}
                </p>
                {isCurrent && step.description && (
                  <p className="text-xs text-neutral-500 mt-0.5">{step.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicatorV3;
