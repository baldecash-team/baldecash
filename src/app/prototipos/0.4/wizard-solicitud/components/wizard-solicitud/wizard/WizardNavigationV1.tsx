'use client';

/**
 * WizardNavigationV1 - Botones fixed bottom
 * Navegacion siempre visible en la parte inferior
 */

import React from 'react';
import { Button, Spinner } from '@nextui-org/react';
import { ArrowLeft, ArrowRight, Save, Send } from 'lucide-react';

interface WizardNavigationV1Props {
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

export const WizardNavigationV1: React.FC<WizardNavigationV1Props> = ({
  onBack,
  onNext,
  onSave,
  canGoBack,
  canGoForward,
  isSubmitting,
  isSaving = false,
  isLastStep,
  showSaveButton = true,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 z-30">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
        {/* Boton Regresar */}
        <Button
          variant="light"
          isDisabled={!canGoBack || isSubmitting}
          onPress={onBack}
          startContent={<ArrowLeft className="w-4 h-4" />}
          className="text-neutral-600"
        >
          Regresar
        </Button>

        {/* Botones derecha */}
        <div className="flex items-center gap-2">
          {/* Guardar */}
          {showSaveButton && onSave && !isLastStep && (
            <Button
              variant="bordered"
              isDisabled={isSubmitting || isSaving}
              onPress={onSave}
              startContent={isSaving ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
              className="border-neutral-300 text-neutral-600"
            >
              <span className="hidden sm:inline">Guardar</span>
            </Button>
          )}

          {/* Continuar / Enviar */}
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
            className="bg-[#4654CD] hover:bg-[#3A47B8] text-white font-medium px-6"
          >
            {isSubmitting ? 'Enviando...' : isLastStep ? 'Enviar solicitud' : 'Continuar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WizardNavigationV1;
