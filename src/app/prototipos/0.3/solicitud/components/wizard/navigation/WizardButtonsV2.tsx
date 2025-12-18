'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, Send, Save, Clock } from 'lucide-react';
import { Button, Tooltip } from '@nextui-org/react';
import type { WizardButtonsProps } from '../../../types/wizard';

/**
 * WizardButtonsV2 - Inline al final del formulario
 *
 * C.14 V2: Al final del formulario - menos intrusivo
 * C.15: Regresar como botón ghost
 * C.16 V2: Guardar en tooltip/menú
 * C.17: Continuar deshabilitado con tooltip explicativo
 */
export const WizardButtonsV2: React.FC<WizardButtonsProps> = ({
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-8 pt-6 border-t border-neutral-200"
    >
      {/* Main buttons */}
      <div className="flex items-center justify-between">
        {/* Back button */}
        {canGoBack ? (
          <Button
            variant="ghost"
            onPress={onBack}
            isDisabled={isSubmitting}
            startContent={<ArrowLeft className="w-4 h-4" />}
            className="text-neutral-600 hover:text-[#4654CD] cursor-pointer"
          >
            Paso anterior
          </Button>
        ) : (
          <div /> // Spacer
        )}

        {/* Next/Submit button with tooltip */}
        <Tooltip
          content={
            !canGoForward
              ? 'Completa todos los campos requeridos para continuar'
              : isLastStep
              ? 'Revisa tu información antes de enviar'
              : ''
          }
          isDisabled={canGoForward && !isLastStep}
          classNames={{
            content: 'bg-neutral-800 text-white text-xs px-3 py-2 max-w-[200px]',
          }}
        >
          <Button
            onPress={onNext}
            isDisabled={!canGoForward || isSubmitting}
            className={`
              min-w-[160px] font-semibold cursor-pointer
              ${isLastStep ? 'bg-[#22c55e] text-white' : 'bg-[#4654CD] text-white'}
              ${!canGoForward ? 'opacity-50' : ''}
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
        </Tooltip>
      </div>

      {/* Secondary actions */}
      <div className="flex items-center justify-center gap-6 mt-4">
        {showSaveButton && onSave && (
          <button
            onClick={onSave}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar progreso</span>
          </button>
        )}

        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Tus datos se guardan automáticamente</span>
        </div>
      </div>
    </motion.div>
  );
};

export default WizardButtonsV2;
