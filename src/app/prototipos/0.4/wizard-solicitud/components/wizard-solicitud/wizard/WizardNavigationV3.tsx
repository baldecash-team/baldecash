'use client';

/**
 * WizardNavigationV3 - Floating buttons en esquinas
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
            variant="bordered"
            isDisabled={isSubmitting}
            onPress={onBack}
            className="bg-white border-neutral-300 shadow-lg rounded-full w-14 h-14"
          >
            <ArrowLeft className="w-6 h-6 text-neutral-600" />
          </Button>
        </div>
      )}

      {/* Floating next button - right */}
      <div className="fixed bottom-6 right-6 z-30">
        <Button
          size="lg"
          isDisabled={!canGoForward || isSubmitting}
          onPress={onNext}
          className="bg-[#4654CD] hover:bg-[#3A47B8] text-white font-medium shadow-lg rounded-full h-14 px-6"
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
