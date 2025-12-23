'use client';

/**
 * WizardNavigationV6 - Full branded bar con CTA prominente
 * UI: Barra destacada con CTA grande y trust badge
 */

import React from 'react';
import { Button, Spinner } from '@nextui-org/react';
import { ArrowLeft, ArrowRight, Send, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="fixed bottom-0 left-0 right-0 z-30">
      {/* Background solido */}
      <div className="absolute inset-0 bg-[#4654CD]" />

      {/* Content */}
      <div className="relative max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
        {/* Back button */}
        {canGoBack && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              isIconOnly
              size="lg"
              isDisabled={isSubmitting}
              onPress={onBack}
              className="bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </motion.div>
        )}

        {/* Main CTA - Super prominente */}
        <motion.div
          className="flex-1"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Button
            size="lg"
            isDisabled={!canGoForward || isSubmitting}
            onPress={onNext}
            className={`w-full h-14 font-bold text-base transition-all ${
              isLastStep
                ? 'bg-[#22c55e] hover:bg-[#16a34a] text-white'
                : 'bg-white hover:bg-neutral-50 text-[#4654CD]'
            }`}
            endContent={
              isSubmitting ? (
                <Spinner size="sm" color={isLastStep ? 'white' : 'primary'} />
              ) : isLastStep ? (
                <Send className="w-5 h-5" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )
            }
          >
            {isSubmitting
              ? 'Procesando...'
              : isLastStep
              ? 'Enviar solicitud'
              : 'Siguiente paso'}
          </Button>
        </motion.div>
      </div>

      {/* Trust text */}
      <div className="relative text-center pb-3">
        <p className="text-white/60 text-xs flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" />
          Tus datos estan protegidos
        </p>
      </div>
    </div>
  );
};

export default WizardNavigationV6;
