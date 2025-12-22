'use client';

/**
 * WizardNavigationV4 - Full width bar con info
 */

import React from 'react';
import { Button, Spinner } from '@nextui-org/react';
import { ArrowLeft, ArrowRight, Send, Shield } from 'lucide-react';

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
}

export const WizardNavigationV4: React.FC<WizardNavigationV4Props> = ({
  onBack,
  onNext,
  canGoBack,
  canGoForward,
  isSubmitting,
  isLastStep,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-30 shadow-lg">
      {/* Trust badge */}
      <div className="bg-neutral-50 border-b border-neutral-100 py-2 px-4">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-2 text-xs text-neutral-500">
          <Shield className="w-3 h-3" />
          <span>Tus datos estan protegidos</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
          {canGoBack ? (
            <Button
              variant="light"
              isDisabled={isSubmitting}
              onPress={onBack}
              startContent={<ArrowLeft className="w-4 h-4" />}
              className="text-neutral-600"
            >
              Atras
            </Button>
          ) : (
            <div />
          )}

          <Button
            size="lg"
            isDisabled={!canGoForward || isSubmitting}
            onPress={onNext}
            className="bg-[#4654CD] hover:bg-[#3A47B8] text-white font-bold flex-1 max-w-xs"
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
            {isSubmitting ? 'Enviando...' : isLastStep ? 'ENVIAR SOLICITUD' : 'CONTINUAR'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WizardNavigationV4;
