'use client';

/**
 * WizardNavigationV1 - Botones fixed bottom
 * Navegacion siempre visible en la parte inferior
 * UI: Clean bar con botones claros y accesibles
 */

import React from 'react';
import { Button, Spinner } from '@nextui-org/react';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';

interface WizardNavigationV1Props {
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  isSubmitting: boolean;
  isLastStep: boolean;
}

export const WizardNavigationV1: React.FC<WizardNavigationV1Props> = ({
  onBack,
  onNext,
  canGoBack,
  canGoForward,
  isSubmitting,
  isLastStep,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-30">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Boton Regresar */}
          <Button
            variant="flat"
            isDisabled={!canGoBack || isSubmitting}
            onPress={onBack}
            startContent={<ArrowLeft className="w-4 h-4" />}
            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium min-w-[120px] h-11 transition-all"
          >
            Regresar
          </Button>

          {/* Boton Continuar / Enviar */}
          <Button
            isDisabled={!canGoForward || isSubmitting}
            onPress={onNext}
            endContent={
              isSubmitting ? (
                <Spinner size="sm" color="white" />
              ) : isLastStep ? (
                <Send className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )
            }
            className={`font-semibold min-w-[160px] h-11 transition-all ${
              isLastStep
                ? 'bg-[#22c55e] hover:bg-[#16a34a] text-white'
                : 'bg-[#4654CD] hover:bg-[#3A47B8] text-white'
            }`}
          >
            {isSubmitting ? 'Enviando...' : isLastStep ? 'Enviar solicitud' : 'Continuar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WizardNavigationV1;
