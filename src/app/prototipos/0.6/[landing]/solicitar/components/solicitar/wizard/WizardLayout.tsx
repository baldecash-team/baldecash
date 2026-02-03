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
import { WizardStepId } from '../../../types/solicitar';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import type { PromoBannerData } from '@/app/prototipos/0.6/types/hero';
import type { WizardMotivational } from '../../../../../services/wizardApi';

interface NavbarProps {
  promoBannerData?: PromoBannerData | null;
  logoUrl?: string;
  customerPortalUrl?: string;
  navbarItems?: { label: string; href: string; section: string | null; has_megamenu?: boolean }[];
  megamenuItems?: { label: string; href: string; icon: string; description: string }[];
  activeSections?: string[];
}

interface WizardLayoutProps {
  currentStep: WizardStepId;
  title: string;
  description: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  onStepClick?: (stepId: WizardStepId) => void;
  isLastStep?: boolean;
  isFirstStep?: boolean;
  isSubmitting?: boolean;
  canProceed?: boolean;
  navbarProps?: NavbarProps;
  /** Contenido motivacional desde API */
  motivational?: WizardMotivational | null;
}

export const WizardLayout: React.FC<WizardLayoutProps> = ({
  currentStep,
  title,
  description,
  children,
  onBack,
  onNext,
  onSubmit,
  onStepClick,
  isLastStep = false,
  isFirstStep = false,
  isSubmitting = false,
  canProceed = true,
  navbarProps,
  motivational,
}) => {
  return (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Navbar del Hero */}
      <Navbar {...navbarProps} />

      {/* Spacer for fixed navbar + promo banner */}
      <div className="h-[104px]" />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-14 pb-24 lg:pb-8">
        {/* Two-column grid on desktop */}
        <div className="lg:grid lg:grid-cols-[1fr_420px] lg:gap-10">
          {/* Left Column - Form */}
          <div className="max-w-2xl mx-auto lg:mx-0 lg:max-w-none">
            {/* Progress Indicator */}
            <WizardProgress currentStep={currentStep} onStepClick={onStepClick} />

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
              <MotivationalCard currentStep={currentStep} motivational={motivational} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardLayout;
