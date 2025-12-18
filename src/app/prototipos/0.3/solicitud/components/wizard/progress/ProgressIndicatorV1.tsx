'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, User, GraduationCap, Wallet, CheckCircle } from 'lucide-react';
import type { ProgressIndicatorProps } from '../../../types/wizard';

/**
 * ProgressIndicatorV1 - Steps numerados con iconos
 *
 * C.5 V1: "Paso 2 de 5" - Claro y directo
 * C.6 V1: Todos los pasos visibles en barra horizontal
 * C.7 V1: Checkmark verde para pasos completados
 * C.8 V1: Color primario sólido para paso actual
 */

const iconMap: Record<string, React.ElementType> = {
  User,
  GraduationCap,
  Wallet,
  CheckCircle,
};

export const ProgressIndicatorV1: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  allowFreeNavigation = false,
}) => {
  return (
    <div className="w-full">
      {/* Desktop view */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-2xl mx-auto">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = currentStep === index;
          const isClickable = allowFreeNavigation || isCompleted || index <= currentStep;
          const Icon = iconMap[step.icon] || CheckCircle;

          return (
            <React.Fragment key={step.id}>
              {/* Step */}
              <div className="flex flex-col items-center gap-2">
                <motion.button
                  onClick={() => isClickable && onStepClick?.(index)}
                  disabled={!isClickable}
                  className={`
                    relative flex items-center justify-center w-12 h-12 rounded-full font-semibold transition-all
                    ${isCompleted ? 'bg-[#22c55e] text-white' : ''}
                    ${isCurrent ? 'bg-[#4654CD] text-white ring-4 ring-[#4654CD]/20' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-neutral-200 text-neutral-500' : ''}
                    ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                  `}
                  whileHover={isClickable ? { scale: 1.05 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" strokeWidth={3} />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </motion.button>

                {/* Step name */}
                <span
                  className={`text-xs font-medium text-center max-w-[80px] ${
                    isCurrent ? 'text-[#4654CD]' : isCompleted ? 'text-[#22c55e]' : 'text-neutral-500'
                  }`}
                >
                  {step.shortName}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-3 relative">
                  <div className="absolute inset-0 bg-neutral-200 rounded-full" />
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-[#22c55e] rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile view - Compact */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-700">
            Paso {currentStep + 1} de {steps.length}
          </span>
          <span className="text-sm text-neutral-500">{steps[currentStep]?.shortName}</span>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isCurrent = currentStep === index;

            return (
              <motion.div
                key={step.id}
                className={`
                  h-2 rounded-full transition-all
                  ${isCurrent ? 'bg-[#4654CD] flex-[2]' : 'flex-1'}
                  ${isCompleted ? 'bg-[#22c55e]' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-neutral-200' : ''}
                `}
                initial={false}
                animate={{ flex: isCurrent ? 2 : 1 }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicatorV1;
