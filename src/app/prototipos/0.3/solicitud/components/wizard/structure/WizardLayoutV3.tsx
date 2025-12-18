'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, X, Shield } from 'lucide-react';
import { Button, Card, CardBody } from '@nextui-org/react';
import type { WizardLayoutProps } from '../../../types/wizard';

/**
 * WizardLayoutV3 - Header + Progress bar sticky
 *
 * C.1 V3: Header con progress bar sticky para contexto constante
 * El formulario aparece como card flotante sobre fondo con patrón
 */
export const WizardLayoutV3: React.FC<WizardLayoutProps> = ({
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
    <div className="min-h-screen bg-neutral-100">
      {/* Sticky header with progress */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="px-4 py-3 border-b border-neutral-200">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#4654CD] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-semibold text-[#4654CD]">BaldeCash</span>
                <span className="text-neutral-400 mx-2">|</span>
                <span className="text-sm text-neutral-600">Tu solicitud</span>
              </div>
            </div>

            {/* Time + Close */}
            <div className="flex items-center gap-4">
              {showTimeEstimate && (
                <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {estimatedMinutesRemaining > 1
                      ? `${estimatedMinutesRemaining} min restantes`
                      : '¡Casi listo!'}
                  </span>
                  <span className="sm:hidden">{estimatedMinutesRemaining}m</span>
                </div>
              )}
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
                aria-label="Guardar y salir"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Progress bar sticky */}
        <div className="h-1 bg-neutral-200">
          <motion.div
            className="h-full bg-[#4654CD]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Steps navigation - opcional */}
        {progressComponent && (
          <div className="bg-white px-4 py-3 border-b border-neutral-200">
            <div className="max-w-4xl mx-auto">{progressComponent}</div>
          </div>
        )}
      </header>

      {/* Main content with floating card */}
      <main className="px-4 py-6 sm:py-10">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="max-w-xl mx-auto"
        >
          <Card className="shadow-lg border border-neutral-200">
            <CardBody className="p-6 sm:p-8">
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-medium text-[#4654CD] bg-[#4654CD]/10 px-2.5 py-1 rounded-md">
                  Paso {currentStep + 1} de {steps.length}
                </span>
                <div className="flex items-center gap-1 text-xs text-neutral-500">
                  <Shield className="w-3 h-3" />
                  <span>Conexión segura</span>
                </div>
              </div>

              {/* Step header */}
              <div className="mb-6">
                <motion.h1
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl sm:text-2xl font-bold text-neutral-800 mb-2"
                >
                  {currentStepData?.name}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-neutral-600 text-sm"
                >
                  {currentStepData?.description}
                </motion.p>
              </div>

              {/* Form content */}
              {children}
            </CardBody>
          </Card>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-6 text-xs text-neutral-500">
            <div className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Datos protegidos</span>
            </div>
            <span className="text-neutral-300">|</span>
            <span>No compartimos tu info</span>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default WizardLayoutV3;
