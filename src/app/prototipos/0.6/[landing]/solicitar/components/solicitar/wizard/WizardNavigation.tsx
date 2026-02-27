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
    <div className="flex flex-col-reverse gap-3 lg:flex-row lg:items-center lg:justify-between mt-8">
      {/* Back Button */}
      {!isFirstStep && onBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-3 lg:py-2
                     text-neutral-600 hover:text-neutral-800 border border-neutral-300 rounded-xl lg:border-0
                     transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Atrás</span>
        </button>
      ) : (
        <div className="hidden lg:block" />
      )}

      {/* Next / Submit Button */}
      {isLastStep ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !canProceed}
          className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl
                     font-semibold hover:brightness-90 transition-colors shadow-lg shadow-[rgba(var(--color-primary-rgb),0.25)]
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
          className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl
                     font-semibold hover:brightness-90 transition-colors shadow-lg shadow-[rgba(var(--color-primary-rgb),0.25)]
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
