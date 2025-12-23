'use client';

/**
 * WizardNavigationV2 - Inline bajo formulario (no fixed)
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
    <div className="mt-8 pt-6 border-t border-neutral-200">
      <div className="flex items-center justify-between gap-4">
        {/* Boton Regresar */}
        {canGoBack ? (
          <Button
            variant="bordered"
            isDisabled={isSubmitting}
            onPress={onBack}
            startContent={<ArrowLeft className="w-4 h-4" />}
            className="border-neutral-300 text-neutral-600"
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
          className="bg-[#4654CD] hover:bg-[#3A47B8] text-white font-medium px-8"
        >
          {isSubmitting ? 'Enviando...' : isLastStep ? 'Enviar solicitud' : 'Continuar'}
        </Button>
      </div>
    </div>
  );
};

export default WizardNavigationV2;
