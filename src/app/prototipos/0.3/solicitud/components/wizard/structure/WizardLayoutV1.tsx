'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, X } from 'lucide-react';
import { Button } from '@nextui-org/react';
import type { WizardLayoutProps } from '../../../types/wizard';

/**
 * WizardLayoutV1 - Fullscreen sin distracciones
 *
 * C.1 V1: Página completa sin header/footer para máximo foco
 * Ideal para usuarios que necesitan concentrarse en el formulario
 */
export const WizardLayoutV1: React.FC<WizardLayoutProps> = ({
  children,
  steps,
  currentStep,
  showTimeEstimate = true,
  estimatedMinutesRemaining = 5,
  progressComponent,
  onStepClick,
}) => {
  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Minimal Header - Solo logo y cerrar */}
      <header className="bg-white border-b border-neutral-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#4654CD] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-semibold text-[#4654CD] hidden sm:block">BaldeCash</span>
          </div>

          {/* Time estimate - Desktop */}
          {showTimeEstimate && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-neutral-500">
              <Clock className="w-4 h-4" />
              <span>
                {estimatedMinutesRemaining > 1
                  ? `Aprox. ${estimatedMinutesRemaining} min restantes`
                  : '¡Menos de 1 minuto!'}
              </span>
            </div>
          )}

          {/* Close button */}
          <Button
            isIconOnly
            variant="light"
            className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
            aria-label="Guardar y salir"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Progress indicator */}
      {progressComponent && (
        <div className="bg-white border-b border-neutral-200 px-4 py-4">
          <div className="max-w-4xl mx-auto">{progressComponent}</div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 px-4 py-6 sm:py-8"
        >
          <div className="max-w-xl mx-auto">
            {/* Step header */}
            <div className="text-center mb-8">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl sm:text-3xl font-bold text-[#4654CD] mb-2"
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
          </div>
        </motion.div>

        {/* Mobile time estimate */}
        {showTimeEstimate && (
          <div className="sm:hidden fixed bottom-20 left-0 right-0 flex justify-center px-4 pb-2">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-neutral-200">
              <Clock className="w-3 h-3" />
              <span>
                {estimatedMinutesRemaining > 1
                  ? `${estimatedMinutesRemaining} min restantes`
                  : '¡Casi listo!'}
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WizardLayoutV1;
