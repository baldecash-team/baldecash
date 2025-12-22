'use client';

/**
 * WizardNavigationV5 - Pills flotantes con animacion
 * Estilo minimalista con botones pill en esquinas
 */

import React from 'react';
import { Spinner } from '@nextui-org/react';
import { ArrowLeft, ArrowRight, Send, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WizardNavigationV5Props {
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

export const WizardNavigationV5: React.FC<WizardNavigationV5Props> = ({
  onBack,
  onNext,
  canGoBack,
  canGoForward,
  isSubmitting,
  isLastStep,
}) => {
  return (
    <div className="fixed bottom-6 left-0 right-0 z-30 pointer-events-none px-4">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        {/* Back pill */}
        <AnimatePresence>
          {canGoBack && (
            <motion.button
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              onClick={onBack}
              disabled={isSubmitting}
              className="pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-full bg-white shadow-xl border border-neutral-200 text-neutral-600 hover:text-[#4654CD] hover:border-[#4654CD]/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Atras</span>
            </motion.button>
          )}
        </AnimatePresence>

        {!canGoBack && <div />}

        {/* Next/Submit pill */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          disabled={!canGoForward || isSubmitting}
          className={`pointer-events-auto flex items-center gap-3 px-6 py-3.5 rounded-full shadow-xl transition-all disabled:opacity-50 cursor-pointer ${
            isLastStep
              ? 'bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white'
              : 'bg-[#4654CD] text-white hover:bg-[#3A47B8]'
          }`}
        >
          <span className="font-semibold">
            {isSubmitting ? 'Procesando' : isLastStep ? 'Enviar' : 'Continuar'}
          </span>
          {isSubmitting ? (
            <Spinner size="sm" color="white" />
          ) : isLastStep ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"
            >
              <Check className="w-4 h-4" />
            </motion.div>
          ) : (
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default WizardNavigationV5;
