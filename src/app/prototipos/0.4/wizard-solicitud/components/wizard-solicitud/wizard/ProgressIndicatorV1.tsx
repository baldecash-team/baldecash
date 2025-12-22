'use client';

/**
 * ProgressIndicatorV1 - Steps numerados clasico
 * Indicador de progreso con circulos y linea
 */

import React from 'react';
import { Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { WizardSolicitudStep } from '../../../types/wizard-solicitud';

interface ProgressIndicatorV1Props {
  steps: WizardSolicitudStep[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (stepIndex: number) => void;
  allowFreeNavigation?: boolean;
}

export const ProgressIndicatorV1: React.FC<ProgressIndicatorV1Props> = ({
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
      {/* Desktop: Horizontal */}
      <div className="hidden sm:flex items-center justify-between max-w-md mx-auto">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = currentStep === index;
          const isClickable = allowFreeNavigation || isCompleted || index <= currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step circle */}
              <button
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                className={`
                  relative flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all
                  ${isCompleted ? 'bg-[#22c55e] text-white' : ''}
                  ${isCurrent ? 'bg-[#4654CD] text-white ring-4 ring-[#4654CD]/20' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-neutral-200 text-neutral-500' : ''}
                  ${isClickable ? 'cursor-pointer hover:ring-2 hover:ring-[#4654CD]/40' : 'cursor-default'}
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </button>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2">
                  <div
                    className={`h-full rounded transition-all ${
                      completedSteps.includes(index) ? 'bg-[#22c55e]' : 'bg-neutral-200'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile: Compacto */}
      <div className="sm:hidden">
        {/* Barra de progreso */}
        <div className="h-1 bg-neutral-200 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-[#4654CD] transition-all duration-500"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Paso actual */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">
            Paso {currentStep + 1} de {steps.length}
          </span>
          <span className="font-medium text-[#4654CD]">
            {steps[currentStep]?.shortName}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicatorV1;
