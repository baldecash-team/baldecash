'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronLeft } from 'lucide-react';
import { Button } from '@nextui-org/react';
import type { WizardLayoutProps } from '../../../types/wizard';

/**
 * WizardLayoutV2 - Header minimalista con branding
 *
 * C.1 V2: Mantiene header minimalista para branding presente
 * Balance entre foco y contexto de marca
 */
export const WizardLayoutV2: React.FC<WizardLayoutProps> = ({
  children,
  steps,
  currentStep,
  showTimeEstimate = true,
  estimatedMinutesRemaining = 5,
  progressComponent,
  onStepClick,
}) => {
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header con branding */}
      <header className="bg-[#4654CD] text-white px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            {/* Back button + Logo */}
            <div className="flex items-center gap-3">
              {currentStep > 0 && (
                <Button
                  isIconOnly
                  variant="light"
                  className="text-white/80 hover:text-white cursor-pointer"
                  onPress={() => onStepClick?.(currentStep - 1)}
                  aria-label="Volver al paso anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              )}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-[#4654CD] font-bold text-sm">B</span>
                </div>
                <span className="font-semibold hidden sm:block">Solicitud de Financiamiento</span>
              </div>
            </div>

            {/* Time estimate */}
            {showTimeEstimate && (
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {estimatedMinutesRemaining > 1
                    ? `${estimatedMinutesRemaining} min restantes`
                    : '¡Casi listo!'}
                </span>
                <span className="sm:hidden">{estimatedMinutesRemaining} min</span>
              </div>
            )}
          </div>

          {/* Progress bar simple */}
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </header>

      {/* Progress steps - opcional */}
      {progressComponent && (
        <div className="bg-neutral-50 border-b border-neutral-200 px-4 py-4">
          <div className="max-w-4xl mx-auto">{progressComponent}</div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 px-4 py-6 sm:py-10">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="max-w-xl mx-auto"
        >
          {/* Step header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
              <span>Paso {currentStep + 1} de {steps.length}</span>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-2"
            >
              {currentStepData?.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-neutral-600"
            >
              {currentStepData?.description}
            </motion.p>
          </div>

          {/* Form content */}
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default WizardLayoutV2;
