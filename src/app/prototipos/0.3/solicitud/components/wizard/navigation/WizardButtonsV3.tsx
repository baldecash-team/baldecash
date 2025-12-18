'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, Send, Save, MoreVertical, Clock } from 'lucide-react';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react';
import type { WizardButtonsProps } from '../../../types/wizard';

/**
 * WizardButtonsV3 - Adaptive: Fixed en móvil, inline en desktop
 *
 * C.14 V3: Fixed bottom en móvil, inline en desktop
 * C.15: Regresar como botón ghost consistente
 * C.16 V2: Guardar en dropdown/menú
 * C.17: Continuar deshabilitado hasta completar campos
 */
export const WizardButtonsV3: React.FC<WizardButtonsProps> = ({
  onBack,
  onNext,
  onSave,
  canGoBack,
  canGoForward,
  isSubmitting,
  isLastStep,
  showSaveButton = true,
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Shared button content
  const BackButton = () => (
    canGoBack ? (
      <Button
        variant="light"
        onPress={onBack}
        isDisabled={isSubmitting}
        startContent={<ArrowLeft className="w-4 h-4" />}
        className="text-neutral-600 hover:text-[#4654CD] cursor-pointer"
      >
        <span className="hidden sm:inline">Paso anterior</span>
        <span className="sm:hidden">Atrás</span>
      </Button>
    ) : (
      <div /> // Spacer
    )
  );

  const NextButton = ({ fullWidth = false }: { fullWidth?: boolean }) => (
    <Button
      onPress={onNext}
      isDisabled={!canGoForward || isSubmitting}
      className={`
        font-semibold cursor-pointer
        ${fullWidth ? 'flex-1' : 'min-w-[140px]'}
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
        ? 'Enviar'
        : 'Continuar'}
    </Button>
  );

  return (
    <>
      {/* Desktop: Inline buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="hidden sm:block mt-8 pt-6 border-t border-neutral-200"
      >
        <div className="flex items-center justify-between">
          <BackButton />

          <div className="flex items-center gap-3">
            {/* Save dropdown */}
            {showSaveButton && onSave && (
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="bordered"
                    isIconOnly
                    isDisabled={isSubmitting}
                    className="border-neutral-300 cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4 text-neutral-500" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Opciones adicionales"
                  onAction={(key) => {
                    if (key === 'save') onSave?.();
                  }}
                >
                  <DropdownItem
                    key="save"
                    startContent={<Save className="w-4 h-4" />}
                    className="cursor-pointer"
                  >
                    Guardar y continuar después
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            )}

            <NextButton />
          </div>
        </div>

        {/* Auto-save indicator */}
        <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-neutral-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Progreso guardado automáticamente</span>
        </div>
      </motion.div>

      {/* Mobile: Fixed bottom bar */}
      <div className="sm:hidden">
        {/* Spacer */}
        <div className="h-20" />

        {/* Fixed bar */}
        <motion.div
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-3 z-20"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="flex items-center gap-3">
            {/* Back or Menu button */}
            {canGoBack ? (
              <Button
                variant="light"
                isIconOnly
                onPress={onBack}
                isDisabled={isSubmitting}
                className="cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 text-neutral-600" />
              </Button>
            ) : showSaveButton && onSave ? (
              <Button
                variant="light"
                isIconOnly
                onPress={onSave}
                isDisabled={isSubmitting}
                className="cursor-pointer"
              >
                <Save className="w-5 h-5 text-neutral-400" />
              </Button>
            ) : (
              <div className="w-10" /> // Spacer
            )}

            {/* Next button - full width */}
            <NextButton fullWidth />

            {/* Menu button when can go back */}
            {canGoBack && showSaveButton && onSave && (
              <Button
                variant="light"
                isIconOnly
                onPress={onSave}
                isDisabled={isSubmitting}
                className="cursor-pointer"
              >
                <Save className="w-5 h-5 text-neutral-400" />
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default WizardButtonsV3;
