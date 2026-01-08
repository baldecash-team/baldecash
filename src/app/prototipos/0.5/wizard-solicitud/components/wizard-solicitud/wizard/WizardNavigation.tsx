'use client';

/**
 * WizardNavigation - Back/Next/Submit buttons
 * Handles navigation between wizard steps
 */

import React from 'react';
import { ArrowLeft, ArrowRight, Send, Loader2 } from 'lucide-react';

interface WizardNavigationProps {
  onBack?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  isSubmitting?: boolean;
  canProceed?: boolean;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  onBack,
  onNext,
  onSubmit,
  isFirstStep = false,
  isLastStep = false,
  isSubmitting = false,
  canProceed = true,
}) => {
  return (
    <div className="flex items-center justify-between mt-8">
      {/* Back Button */}
      {!isFirstStep && onBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:text-neutral-800
                     transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Atrás</span>
        </button>
      ) : (
        <div />
      )}

      {/* Next / Submit Button */}
      {isLastStep ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !canProceed}
          className="flex items-center gap-2 px-6 py-3 bg-[#4654CD] text-white rounded-xl
                     font-semibold hover:bg-[#3a47b3] transition-colors shadow-lg shadow-[#4654CD]/25
                     cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Enviar Solicitud</span>
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting || !canProceed}
          className="flex items-center gap-2 px-6 py-3 bg-[#4654CD] text-white rounded-xl
                     font-semibold hover:bg-[#3a47b3] transition-colors shadow-lg shadow-[#4654CD]/25
                     cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Continuar</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default WizardNavigation;
