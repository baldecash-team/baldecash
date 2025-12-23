'use client';

/**
 * ProgressIndicatorV2 - Barra lineal con porcentaje
 */

import React from 'react';
import type { WizardSolicitudStep } from '../../../types/wizard-solicitud';

interface ProgressIndicatorV2Props {
  steps: WizardSolicitudStep[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (stepIndex: number) => void;
  allowFreeNavigation?: boolean;
}

export const ProgressIndicatorV2: React.FC<ProgressIndicatorV2Props> = ({
  steps,
  currentStep,
}) => {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="w-full">
      {/* Desktop y Mobile: Barra con porcentaje */}
      <div className="flex items-center gap-4 mb-2">
        <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4654CD] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-medium text-[#4654CD] min-w-[3rem] text-right">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>{steps[currentStep]?.shortName}</span>
        <span>{currentStep + 1} de {steps.length}</span>
      </div>
    </div>
  );
};

export default ProgressIndicatorV2;
