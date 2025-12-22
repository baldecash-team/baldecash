'use client';

/**
 * ProgressIndicatorV6 - Timeline horizontal con iconos
 */

import React from 'react';
import { Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { WizardSolicitudStep } from '../../../types/wizard-solicitud';

interface ProgressIndicatorV6Props {
  steps: WizardSolicitudStep[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (stepIndex: number) => void;
  allowFreeNavigation?: boolean;
}

export const ProgressIndicatorV6: React.FC<ProgressIndicatorV6Props> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  allowFreeNavigation = false,
}) => {
  const getStepIcon = (iconName: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  return (
    <div className="w-full">
      {/* Timeline horizontal */}
      <div className="relative flex items-start justify-between">
        {/* Background line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-neutral-200" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-[#4654CD] transition-all duration-500"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = currentStep === index;
          const isClickable = allowFreeNavigation || isCompleted || index <= currentStep;

          return (
            <div key={step.id} className="relative flex flex-col items-center flex-1">
              {/* Node */}
              <button
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                className={`
                  relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${isCompleted ? 'bg-[#22c55e] text-white' : ''}
                  ${isCurrent ? 'bg-[#4654CD] text-white ring-4 ring-[#4654CD]/20' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-white border-2 border-neutral-200 text-neutral-400' : ''}
                  ${isClickable ? 'cursor-pointer hover:brightness-110' : 'cursor-default'}
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : step.icon ? (
                  getStepIcon(step.icon)
                ) : (
                  <span className="font-medium">{index + 1}</span>
                )}
              </button>

              {/* Label */}
              <span className={`
                mt-2 text-xs text-center font-medium max-w-[80px]
                ${isCurrent ? 'text-[#4654CD]' : 'text-neutral-500'}
              `}>
                {step.shortName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicatorV6;
