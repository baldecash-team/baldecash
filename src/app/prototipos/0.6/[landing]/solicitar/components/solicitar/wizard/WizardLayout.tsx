'use client';

/**
 * WizardLayout - Main layout wrapper for wizard steps
 * Provides consistent structure across all wizard pages
 *
 * Desktop (lg:): Two-column layout with motivational card on right
 * Mobile: Single column, motivational card hidden
 */

import React from 'react';
import { useParams } from 'next/navigation';
import { WizardProgress } from './WizardProgress';
import { WizardNavigation } from './WizardNavigation';
import { MobileStickyCtaSpacer } from './MobileStickyCta';
import { useTecladoVirtualAbierto } from '../../../hooks/useTecladoVirtualAbierto';
import { MotivationalCard } from './MotivationalCard';
import { SelectedProductBar, SelectedProductSpacer } from '../product';
import { WizardStepId } from '../../../types/solicitar';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { NvidiaNavbar } from '@/app/prototipos/0.6/components/product-landing/nvidia/NvidiaNavbar';
import { isNvidiaLanding } from '@/app/prototipos/0.6/utils/theme';
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
  /** Mensaje dinámico de progreso durante el envío */
  submitMessage?: string;
  navbarProps?: NavbarProps;
  /** Hide navbar entirely (used when parent wrapper provides its own navbar) */
  hideNavbar?: boolean;
  /** Contenido motivacional desde API */
  motivational?: WizardMotivational | null;
  /** Nombre del usuario para personalización VIP */
  firstName?: string;
  /**
   * La acción principal va fija abajo (`MobileStickyCta`), así que la navegación
   * en flujo se oculta en móvil para no duplicarla, y se reserva el alto del
   * CTA. En desktop no cambia nada.
   *
   * Se usa en todo el flujo de solicitar: los pasos del formulario, el resumen
   * y complementos.
   */
  ctaFijoEnMovil?: boolean;
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
  submitMessage,
  navbarProps,
  hideNavbar = false,
  motivational,
  firstName,
  ctaFijoEnMovil = false,
}) => {
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  // El CTA fijo se esconde solo mientras el teclado esta abierto. En ese rato
  // hay que devolver la navegacion en flujo, o el paso se queda sin ninguna
  // accion visible en movil.
  const tecladoAbierto = useTecladoVirtualAbierto();
  const ocultarNavEnMovil = ctaFijoEnMovil && !tecladoAbierto;

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Navbar del Hero */}
      {!hideNavbar && (isNvidiaLanding(landing)
        ? <NvidiaNavbar landing={landing} />
        : <Navbar {...navbarProps} landing={landing} />)}

      {/* Spacer — dynamic height driven by --header-total-height CSS variable
          exposed by the Navbar component (preview + promo + navbar). */}
      {!hideNavbar && <div style={{ height: 'var(--header-total-height, 6.5rem)' }} />}

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 pt-8 sm:pt-14 pb-24 lg:pb-8">
        {/* Two-column grid on desktop */}
        <div className="lg:grid lg:grid-cols-[1fr_420px] lg:gap-10">
          {/* Left Column - Form */}
          <div className="max-w-2xl mx-auto lg:mx-0 lg:max-w-none">
            {/* Progress Indicator */}
            <WizardProgress currentStep={currentStep} onStepClick={onStepClick} motivationalIllustration={motivational?.illustration} />

            {/* Selected Product Bar (Desktop: top position) */}
            <div className="mt-6">
              <SelectedProductBar />
            </div>

            {/* Header */}
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 leading-tight">
                {title}
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 mt-1">{description}</p>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6">
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
              submitMessage={submitMessage}
              hideOnMobile={ocultarNavEnMovil}
            />

            {/* Bottom Spacer for Mobile fixed product bar */}
            <SelectedProductSpacer />
            {/* Reserva el alto del CTA fijo, que se apila sobre esa barra */}
            {ctaFijoEnMovil && <MobileStickyCtaSpacer />}
          </div>

          {/* Right Column - Motivational Card (Desktop only).
              sticky top offset follows --header-total-height with a small extra gap,
              plus --referral-banner-offset while the referral banner is on screen. */}
          <div className="hidden lg:block">
            <div
              className="sticky"
              style={{ top: 'calc(var(--header-total-height, 6.5rem) + var(--referral-banner-offset, 0px) + 1rem)' }}
            >
              <MotivationalCard currentStep={currentStep} motivational={motivational} firstName={firstName} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardLayout;
