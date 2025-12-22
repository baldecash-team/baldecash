'use client';

/**
 * WizardNavigationV2 - Inline bajo formulario (no fixed)
 */

import React from 'react';
import { Button, Spinner } from '@nextui-org/react';
import { ArrowLeft, ArrowRight, Save, Send } from 'lucide-react';

interface WizardNavigationV2Props {
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

export const WizardNavigationV2: React.FC<WizardNavigationV2Props> = ({
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

        {/* Botones derecha */}
        <div className="flex items-center gap-2">
          {showSaveButton && onSave && !isLastStep && (
            <Button
              variant="light"
              isDisabled={isSubmitting || isSaving}
              onPress={onSave}
              startContent={isSaving ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
              className="text-neutral-500"
            >
              Guardar
            </Button>
          )}

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
    </div>
  );
};

export default WizardNavigationV2;
