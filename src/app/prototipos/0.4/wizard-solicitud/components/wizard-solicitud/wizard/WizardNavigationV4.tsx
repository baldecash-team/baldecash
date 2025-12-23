'use client';

/**
 * WizardNavigationV4 - Progress bar integrado
 * UI: Barra de progreso + botones con step counter
 */

import React from 'react';
import { Button, Spinner } from '@nextui-org/react';
import { ArrowLeft, ArrowRight, Send, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface WizardNavigationV4Props {
  onBack: () => void;
  onNext: () => void;
  onSave?: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  isSubmitting: boolean;
  isSaving?: boolean;
  isLastStep: boolean;
  showSaveButton?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export const WizardNavigationV4: React.FC<WizardNavigationV4Props> = ({
  onBack,
  onNext,
  canGoBack,
  canGoForward,
  isSubmitting,
  isLastStep,
  currentStep = 1,
  totalSteps = 4,
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30">
      {/* Progress bar animado */}
      <div className="h-1 bg-neutral-200">
        <motion.div
          className="h-full bg-[#4654CD]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Navigation */}
      <div className="bg-white/95 backdrop-blur-md border-t border-neutral-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {/* Trust badge inline */}
        <div className="max-w-lg mx-auto px-4 pt-2">
          <div className="flex items-center justify-center gap-4 text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" /> Datos seguros
            </span>
            <span className="w-1 h-1 rounded-full bg-neutral-300" />
            <span>Paso {currentStep} de {totalSteps}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            {canGoBack ? (
              <Button
                variant="flat"
                isDisabled={isSubmitting}
                onPress={onBack}
                startContent={<ArrowLeft className="w-4 h-4" />}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium h-11 transition-all"
              >
                Atras
              </Button>
            ) : (
              <div className="w-20" />
            )}

            <Button
              size="lg"
              isDisabled={!canGoForward || isSubmitting}
              onPress={onNext}
              className={`flex-1 font-bold h-12 text-white transition-all ${
                isLastStep
                  ? 'bg-[#22c55e] hover:bg-[#16a34a]'
                  : 'bg-[#4654CD] hover:bg-[#3A47B8]'
              }`}
              endContent={
                isSubmitting ? (
                  <Spinner size="sm" color="white" />
                ) : isLastStep ? (
                  <Send className="w-5 h-5" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )
              }
            >
              {isSubmitting ? 'Enviando...' : isLastStep ? 'Enviar solicitud' : 'Continuar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardNavigationV4;
