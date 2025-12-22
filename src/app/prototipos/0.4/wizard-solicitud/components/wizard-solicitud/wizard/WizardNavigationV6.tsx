'use client';

/**
 * WizardNavigationV6 - Full branded bar con CTA prominente
 * Estilo premium fintech con botones grandes
 */

import React from 'react';
import { Button, Spinner } from '@nextui-org/react';
import { ArrowLeft, ArrowRight, Send, Sparkles, CheckCircle } from 'lucide-react';
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
    <div className="fixed bottom-0 left-0 right-0 z-30 overflow-hidden">
      {/* Background con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#4654CD] via-[#5B68E3] to-[#4654CD]" />

      {/* Decoracion de ondas */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-[#4654CD]/50" />
        <motion.div
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#03DBD0] to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
        />
      </div>

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
              className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20"
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
            className={`w-full h-14 font-black text-lg relative overflow-hidden ${
              isLastStep
                ? 'bg-[#03DBD0] text-[#151744]'
                : 'bg-white text-[#4654CD]'
            }`}
            endContent={
              isSubmitting ? (
                <Spinner size="sm" color={isLastStep ? 'default' : 'primary'} />
              ) : isLastStep ? (
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
              ) : (
                <ArrowRight className="w-5 h-5" />
              )
            }
          >
            {isSubmitting
              ? 'Procesando...'
              : isLastStep
              ? 'ENVIAR SOLICITUD'
              : 'SIGUIENTE PASO'}
          </Button>
        </motion.div>
      </div>

      {/* Trust text */}
      <div className="relative text-center pb-3">
        <p className="text-white/50 text-xs">
          Tus datos estan protegidos y encriptados
        </p>
      </div>
    </div>
  );
};

export default WizardNavigationV6;
