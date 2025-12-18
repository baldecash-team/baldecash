'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, User, GraduationCap, Wallet, CheckCircle } from 'lucide-react';
import type { ProgressIndicatorProps } from '../../../types/wizard';

/**
 * ProgressIndicatorV3 - Dots con labels collapsible
 *
 * C.5 V3: Dots/círculos con checkmarks
 * C.6 V3: Collapsible - click para ver todos los pasos
 * C.7 V3: Número tachado + icono para completados
 * C.8 V3: Animación pulse sutil para paso actual
 */

const iconMap: Record<string, React.ElementType> = {
  User,
  GraduationCap,
  Wallet,
  CheckCircle,
};

export const ProgressIndicatorV3: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  allowFreeNavigation = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentStepData = steps[currentStep];
  const CurrentIcon = iconMap[currentStepData?.icon || 'CheckCircle'] || CheckCircle;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Collapsed view - Current step with expand button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-neutral-200 hover:border-[#4654CD]/30 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {/* Current step dot with pulse */}
          <motion.div
            className="relative w-10 h-10 rounded-full bg-[#4654CD] flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <CurrentIcon className="w-5 h-5 text-white" />
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[#4654CD]"
              animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>

          <div className="text-left">
            <p className="text-sm font-semibold text-neutral-800">
              {currentStepData?.name}
            </p>
            <p className="text-xs text-neutral-500">
              Paso {currentStep + 1} de {steps.length}
            </p>
          </div>
        </div>

        {/* Expand/collapse icon */}
        <div className="flex items-center gap-2">
          {/* Mini dots */}
          <div className="hidden sm:flex items-center gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index < currentStep
                    ? 'bg-[#22c55e]'
                    : index === currentStep
                    ? 'bg-[#4654CD]'
                    : 'bg-neutral-300'
                }`}
              />
            ))}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-neutral-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-neutral-400" />
          )}
        </div>
      </button>

      {/* Expanded view - All steps */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
              {steps.map((step, index) => {
                const isCompleted = completedSteps.includes(index);
                const isCurrent = currentStep === index;
                const isClickable = allowFreeNavigation || isCompleted || index <= currentStep;
                const Icon = iconMap[step.icon] || CheckCircle;

                return (
                  <motion.button
                    key={step.id}
                    onClick={() => {
                      if (isClickable) {
                        onStepClick?.(index);
                        setIsExpanded(false);
                      }
                    }}
                    disabled={!isClickable}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      w-full flex items-center gap-3 p-3 text-left transition-colors
                      ${isClickable ? 'cursor-pointer hover:bg-neutral-50' : 'cursor-default opacity-50'}
                    `}
                  >
                    {/* Step indicator */}
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                        ${isCompleted ? 'bg-[#22c55e] text-white' : ''}
                        ${isCurrent ? 'bg-[#4654CD] text-white' : ''}
                        ${!isCompleted && !isCurrent ? 'bg-neutral-200 text-neutral-500' : ''}
                      `}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" strokeWidth={3} />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>

                    {/* Step info */}
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          isCompleted
                            ? 'text-[#22c55e] line-through'
                            : isCurrent
                            ? 'text-[#4654CD]'
                            : 'text-neutral-600'
                        }`}
                      >
                        {step.name}
                      </p>
                      <p className="text-xs text-neutral-400">
                        ~{step.estimatedMinutes} min
                      </p>
                    </div>

                    {/* Status badge */}
                    {isCompleted && (
                      <span className="text-xs text-[#22c55e] font-medium">Completado</span>
                    )}
                    {isCurrent && (
                      <span className="text-xs text-[#4654CD] font-medium">En progreso</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProgressIndicatorV3;
