'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, Send, Save } from 'lucide-react';
import { Button } from '@nextui-org/react';
import type { WizardButtonsProps } from '../../../types/wizard';

/**
 * WizardButtonsV1 - Fixed bottom
 *
 * C.14 V1: Fixed bottom - siempre accesibles
 * C.15: Regresar como texto link (menos prominente)
 * C.16 V1: Botón de guardar visible siempre
 * C.17: Continuar deshabilitado hasta completar campos
 */
export const WizardButtonsV1: React.FC<WizardButtonsProps> = ({
  onBack,
  onNext,
  onSave,
  canGoBack,
  canGoForward,
  isSubmitting,
  isLastStep,
  showSaveButton = true,
}) => {
  return (
    <>
      {/* Spacer for fixed bottom bar */}
      <div className="h-24" />

      {/* Fixed bottom bar */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-4 z-20"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Back button */}
            <div className="flex items-center gap-2">
              {canGoBack ? (
                <button
                  onClick={onBack}
                  disabled={isSubmitting}
                  className="flex items-center gap-1 text-neutral-500 hover:text-[#4654CD] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Regresar</span>
                </button>
              ) : (
                <div /> // Spacer
              )}

              {/* Save button */}
              {showSaveButton && onSave && (
                <button
                  onClick={onSave}
                  disabled={isSubmitting}
                  className="hidden sm:flex items-center gap-1.5 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer ml-4"
                >
                  <Save className="w-4 h-4" />
                  <span className="text-xs">Guardar</span>
                </button>
              )}
            </div>

            {/* Next/Submit button */}
            <Button
              onPress={onNext}
              isDisabled={!canGoForward || isSubmitting}
              className={`
                min-w-[140px] font-semibold cursor-pointer
                ${isLastStep ? 'bg-[#22c55e] text-white' : 'bg-[#4654CD] text-white'}
              `}
              endContent={
                isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isLastStep ? (
                  <Send className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )
              }
            >
              {isSubmitting
                ? 'Procesando...'
                : isLastStep
                ? 'Enviar solicitud'
                : 'Continuar'}
            </Button>
          </div>

          {/* Mobile save button */}
          {showSaveButton && onSave && (
            <button
              onClick={onSave}
              disabled={isSubmitting}
              className="sm:hidden w-full flex items-center justify-center gap-1.5 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer mt-3 text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar y continuar después</span>
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default WizardButtonsV1;
