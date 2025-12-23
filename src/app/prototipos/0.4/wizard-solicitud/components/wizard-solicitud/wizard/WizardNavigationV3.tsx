'use client';

/**
 * WizardNavigationV3 - Floating buttons en esquinas
 * UI: Botones flotantes con sombras elegantes
 */

import React from 'react';
import { Button, Spinner } from '@nextui-org/react';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';

interface WizardNavigationV3Props {
  onBack: () => void;
  onNext: () => void;
  onSave?: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  isSubmitting: boolean;
  isSaving?: boolean;
  isLastStep: boolean;
  showSaveButton?: boolean;
}

export const WizardNavigationV3: React.FC<WizardNavigationV3Props> = ({
  onBack,
  onNext,
  canGoBack,
  canGoForward,
  isSubmitting,
  isLastStep,
}) => {
  return (
    <>
      {/* Floating back button - left */}
      {canGoBack && (
        <div className="fixed bottom-6 left-6 z-30">
          <Button
            isIconOnly
            size="lg"
            variant="flat"
            isDisabled={isSubmitting}
            onPress={onBack}
            className="bg-white hover:bg-neutral-50 border border-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.12)] rounded-full w-14 h-14 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </Button>
        </div>
      )}

      {/* Floating next button - right */}
      <div className="fixed bottom-6 right-6 z-30">
        <Button
          size="lg"
          isDisabled={!canGoForward || isSubmitting}
          onPress={onNext}
          className={`font-semibold shadow-[0_4px_20px_rgba(70,84,205,0.35)] rounded-full h-14 px-7 transition-all ${
            isLastStep
              ? 'bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-[0_4px_20px_rgba(34,197,94,0.35)]'
              : 'bg-[#4654CD] hover:bg-[#3A47B8] text-white'
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
          {isSubmitting ? 'Enviando...' : isLastStep ? 'Enviar' : 'Continuar'}
        </Button>
      </div>
    </>
  );
};

export default WizardNavigationV3;
