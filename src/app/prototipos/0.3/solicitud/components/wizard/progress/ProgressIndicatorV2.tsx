'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@nextui-org/react';
import type { ProgressIndicatorProps } from '../../../types/wizard';

/**
 * ProgressIndicatorV2 - Barra con porcentaje
 *
 * C.5 V2: Barra con porcentaje "60% completado"
 * C.6 V2: Solo actual + siguiente visible
 * C.7 V2: Cambio de color sutil para completados
 * C.8 V2: Tamaño más grande + color para paso actual
 */
export const ProgressIndicatorV2: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  allowFreeNavigation = false,
}) => {
  const progress = Math.round(((currentStep) / (steps.length - 1)) * 100);
  const currentStepData = steps[currentStep];
  const nextStepData = steps[currentStep + 1];

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Progress percentage */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-[#4654CD]">{progress}%</span>
          <span className="text-sm text-neutral-500">completado</span>
        </div>
        <span className="text-sm text-neutral-400">
          Paso {currentStep + 1} de {steps.length}
        </span>
      </div>

      {/* Progress bar */}
      <Progress
        aria-label="Progreso de la solicitud"
        value={progress}
        className="mb-4"
        classNames={{
          track: 'bg-neutral-200 h-3',
          indicator: 'bg-[#4654CD]',
        }}
      />

      {/* Current and next step info */}
      <div className="flex items-start justify-between">
        {/* Current step */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1"
        >
          <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Ahora</p>
          <p className="font-semibold text-neutral-800">{currentStepData?.name}</p>
          <p className="text-sm text-neutral-500 mt-0.5">{currentStepData?.description}</p>
        </motion.div>

        {/* Divider */}
        {nextStepData && (
          <>
            <div className="w-px h-12 bg-neutral-200 mx-4 self-center" />

            {/* Next step */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 text-right"
            >
              <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Siguiente</p>
              <p className="font-medium text-neutral-600">{nextStepData.shortName}</p>
              <p className="text-sm text-neutral-400 mt-0.5">
                ~{nextStepData.estimatedMinutes} min
              </p>
            </motion.div>
          </>
        )}
      </div>

      {/* Step indicators - clickable dots */}
      <div className="flex items-center justify-center gap-3 mt-6">
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
                w-2.5 h-2.5 rounded-full transition-all
                ${isCurrent ? 'w-8 bg-[#4654CD]' : ''}
                ${isCompleted && !isCurrent ? 'bg-[#22c55e]' : ''}
                ${!isCompleted && !isCurrent ? 'bg-neutral-300' : ''}
                ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
              `}
              aria-label={`Ir al paso ${index + 1}: ${step.name}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicatorV2;
