'use client';

/**
 * ProgressIndicatorV4 - Pills/tabs clickeables
 */

import React from 'react';
import { Check } from 'lucide-react';
import type { WizardSolicitudStep } from '../../../types/wizard-solicitud';

interface ProgressIndicatorV4Props {
  steps: WizardSolicitudStep[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (stepIndex: number) => void;
  allowFreeNavigation?: boolean;
}

export const ProgressIndicatorV4: React.FC<ProgressIndicatorV4Props> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  allowFreeNavigation = false,
}) => {
  return (
    <div className="w-full overflow-x-auto pb-2">
      {/* Desktop: Pills horizontales */}
      <div className="flex gap-2 min-w-max">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = currentStep === index;
          const isClickable = allowFreeNavigation || isCompleted || index <= currentStep;

          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick?.(index)}
              disabled={!isClickable}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                ${isCompleted ? 'bg-[#22c55e]/10 text-[#22c55e]' : ''}
                ${isCurrent ? 'bg-[#4654CD] text-white shadow-lg shadow-[#4654CD]/30' : ''}
                ${!isCompleted && !isCurrent ? 'bg-neutral-100 text-neutral-400' : ''}
                ${isClickable ? 'cursor-pointer hover:brightness-110' : 'cursor-default'}
              `}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  isCurrent ? 'bg-white/20' : 'bg-neutral-200'
                }`}>
                  {index + 1}
                </span>
              )}
              <span>{step.shortName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicatorV4;
