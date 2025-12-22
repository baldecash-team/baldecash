'use client';

/**
 * WizardNavigationV5 - Minimal arrows only
 */

import React from 'react';
import { Spinner } from '@nextui-org/react';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';

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
    <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
      <div className="max-w-lg mx-auto px-4 py-6 flex items-center justify-between">
        {/* Arrow back */}
        {canGoBack && (
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="pointer-events-auto w-12 h-12 rounded-full bg-white shadow-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-[#4654CD] hover:border-[#4654CD] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {!canGoBack && <div />}

        {/* Arrow next / Submit */}
        <button
          onClick={onNext}
          disabled={!canGoForward || isSubmitting}
          className="pointer-events-auto w-14 h-14 rounded-full bg-[#4654CD] shadow-lg flex items-center justify-center text-white hover:bg-[#3A47B8] transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <Spinner size="sm" color="white" />
          ) : isLastStep ? (
            <Send className="w-5 h-5" />
          ) : (
            <ArrowRight className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  );
};

export default WizardNavigationV5;
