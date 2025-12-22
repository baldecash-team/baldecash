'use client';

/**
 * ProgressIndicatorV5 - Stepper compacto minimalista
 */

import React from 'react';
import type { WizardSolicitudStep } from '../../../types/wizard-solicitud';

interface ProgressIndicatorV5Props {
  steps: WizardSolicitudStep[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (stepIndex: number) => void;
  allowFreeNavigation?: boolean;
}

export const ProgressIndicatorV5: React.FC<ProgressIndicatorV5Props> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  allowFreeNavigation = false,
}) => {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Dots minimalistas */}
      <div className="flex items-center gap-3 mb-2">
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
                transition-all
                ${isCurrent ? 'w-8 h-2 rounded-full bg-[#4654CD]' : 'w-2 h-2 rounded-full'}
                ${isCompleted && !isCurrent ? 'bg-[#22c55e]' : ''}
                ${!isCompleted && !isCurrent ? 'bg-neutral-300' : ''}
                ${isClickable ? 'cursor-pointer hover:brightness-110' : 'cursor-default'}
              `}
              aria-label={`Paso ${index + 1}: ${step.shortName}`}
            />
          );
        })}
      </div>

      {/* Nombre del paso actual */}
      <p className="text-sm font-medium text-neutral-600">
        {steps[currentStep]?.shortName}
      </p>
    </div>
  );
};

export default ProgressIndicatorV5;
