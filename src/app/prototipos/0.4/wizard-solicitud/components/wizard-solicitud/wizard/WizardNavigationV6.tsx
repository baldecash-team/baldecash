'use client';

/**
 * WizardNavigationV6 - Sticky bottom branded
 */

import React from 'react';
import { Button, Spinner } from '@nextui-org/react';
import { ArrowLeft, ArrowRight, Send, CheckCircle } from 'lucide-react';

interface WizardNavigationV6Props {
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

export const WizardNavigationV6: React.FC<WizardNavigationV6Props> = ({
  onBack,
  onNext,
  canGoBack,
  canGoForward,
  isSubmitting,
  isLastStep,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#4654CD] z-30">
      <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
        {/* Back */}
        {canGoBack && (
          <Button
            isIconOnly
            variant="light"
            isDisabled={isSubmitting}
            onPress={onBack}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}

        {/* Main CTA */}
        <Button
          size="lg"
          isDisabled={!canGoForward || isSubmitting}
          onPress={onNext}
          className="flex-1 bg-white text-[#4654CD] font-bold hover:bg-neutral-100"
          endContent={
            isSubmitting ? (
              <Spinner size="sm" color="primary" />
            ) : isLastStep ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )
          }
        >
          {isSubmitting ? 'Procesando...' : isLastStep ? 'Finalizar y enviar' : 'Siguiente paso'}
        </Button>
      </div>
    </div>
  );
};

export default WizardNavigationV6;
