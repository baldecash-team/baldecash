'use client';

/**
 * WizardLayout - Main layout wrapper for wizard steps
 * Provides consistent structure across all wizard pages
 */

import React from 'react';
import { WizardProgress } from './WizardProgress';
import { WizardNavigation } from './WizardNavigation';
import { SelectedProductBar, SelectedProductSpacer } from '../product';
import { WizardStepId } from '../../../types/wizard-solicitud';

interface WizardLayoutProps {
  currentStep: WizardStepId;
  title: string;
  description: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  isLastStep?: boolean;
  isFirstStep?: boolean;
  isSubmitting?: boolean;
  canProceed?: boolean;
}

export const WizardLayout: React.FC<WizardLayoutProps> = ({
  currentStep,
  title,
  description,
  children,
  onBack,
  onNext,
  onSubmit,
  isLastStep = false,
  isFirstStep = false,
  isSubmitting = false,
  canProceed = true,
}) => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24 lg:pb-8">
        {/* Progress Indicator */}
        <WizardProgress currentStep={currentStep} />

        {/* Selected Product Bar (Desktop: top position) */}
        <div className="mt-6">
          <SelectedProductBar />
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-800">{title}</h1>
          <p className="text-neutral-600 mt-1">{description}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          {children}
        </div>

        {/* Navigation */}
        <WizardNavigation
          onBack={onBack}
          onNext={onNext}
          onSubmit={onSubmit}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isSubmitting={isSubmitting}
          canProceed={canProceed}
        />

        {/* Bottom Spacer for Mobile fixed product bar */}
        <SelectedProductSpacer />
      </div>
    </div>
  );
};

export default WizardLayout;
