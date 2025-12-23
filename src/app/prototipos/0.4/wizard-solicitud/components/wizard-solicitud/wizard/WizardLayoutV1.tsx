'use client';

/**
 * WizardLayoutV1 - Fullscreen sin distracciones
 * C.1 V1: Pagina completa sin header/footer para maximo foco
 * Ideal para usuarios que necesitan concentrarse en el formulario
 */

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@nextui-org/react';
import type { WizardSolicitudStep, SelectedProduct } from '../../../types/wizard-solicitud';

interface WizardLayoutV1Props {
  steps: WizardSolicitudStep[];
  currentStep: number;
  selectedProduct?: SelectedProduct;
  children: React.ReactNode;
  onClose?: () => void;
  showTimeEstimate?: boolean;
  estimatedMinutesRemaining?: number;
  progressComponent?: React.ReactNode;
}

export const WizardLayoutV1: React.FC<WizardLayoutV1Props> = ({
  steps,
  currentStep,
  selectedProduct,
  children,
  onClose,
  progressComponent,
}) => {
  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Minimal Header - Solo logo y cerrar */}
      <header className="bg-white border-b border-neutral-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <img
            src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
            alt="BaldeCash"
            className="h-8 object-contain"
          />

          {/* Close button */}
          <Button
            isIconOnly
            variant="light"
            className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
            aria-label="Guardar y salir"
            onPress={onClose}
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
      <main className="flex-1 flex flex-col overflow-hidden">
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

      </main>
    </div>
  );
};

export default WizardLayoutV1;
