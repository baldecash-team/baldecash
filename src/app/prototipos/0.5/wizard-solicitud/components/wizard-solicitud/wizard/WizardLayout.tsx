'use client';

/**
 * WizardLayout - Main layout wrapper for wizard steps
 * Provides consistent structure across all wizard pages
 *
 * Desktop (lg:): Two-column layout with motivational card on right
 * Mobile: Single column, motivational card hidden
 */

import React from 'react';
import { WizardProgress } from './WizardProgress';
import { WizardNavigation } from './WizardNavigation';
import { MotivationalCard } from './MotivationalCard';
import { SelectedProductBar, SelectedProductSpacer } from '../product';
import { WizardStepId } from '../../../types/wizard-solicitud';

// Logo URL de BaldeCash
const BALDECASH_LOGO = 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png';

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
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Header con fondo primario - fixed con sombra */}
      <div className="bg-[#4654CD] py-5 fixed top-0 left-0 right-0 z-50 shadow-lg shadow-[#4654CD]/20">
        <div className="flex justify-center">
          <img
            src={BALDECASH_LOGO}
            alt="BaldeCash"
            className="h-12 object-contain brightness-0 invert"
          />
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-[68px]" />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-14 pb-24 lg:pb-8">
        {/* Two-column grid on desktop */}
        <div className="lg:grid lg:grid-cols-[1fr_420px] lg:gap-10">
          {/* Left Column - Form */}
          <div className="max-w-2xl mx-auto lg:mx-0 lg:max-w-none">
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

          {/* Right Column - Motivational Card (Desktop only) */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <MotivationalCard currentStep={currentStep} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardLayout;
