'use client';

/**
 * WizardNavigationV2 - Inline bajo formulario (no fixed)
 * UI: Botones integrados en el flujo del formulario
 */

import React from 'react';
import { Button, Spinner } from '@nextui-org/react';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';

interface WizardNavigationV2Props {
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  isSubmitting: boolean;
  isLastStep: boolean;
}

export const WizardNavigationV2: React.FC<WizardNavigationV2Props> = ({
  onBack,
  onNext,
  canGoBack,
  canGoForward,
  isSubmitting,
  isLastStep,
}) => {
  return (
    <div className="mt-8 pt-6 border-t border-neutral-100">
      <div className="flex items-center justify-between gap-4">
        {/* Boton Regresar */}
        {canGoBack ? (
          <Button
            variant="flat"
            isDisabled={isSubmitting}
            onPress={onBack}
            startContent={<ArrowLeft className="w-4 h-4" />}
            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium h-11 px-5 transition-all"
          >
            Regresar
          </Button>
        ) : (
          <div />
        )}

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
          className={`font-semibold h-11 px-8 transition-all ${
            isLastStep
              ? 'bg-[#22c55e] hover:bg-[#16a34a] text-white'
              : 'bg-[#4654CD] hover:bg-[#3A47B8] text-white'
          }`}
        >
          {isSubmitting ? 'Enviando...' : isLastStep ? 'Enviar solicitud' : 'Continuar'}
        </Button>
      </div>
    </div>
  );
};

export default WizardNavigationV2;
