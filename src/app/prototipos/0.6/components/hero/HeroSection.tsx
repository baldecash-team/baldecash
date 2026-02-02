'use client';

/**
 * HeroSection - Wrapper component para v0.6
 * Conectado a API - Recibe data por props
 *
 * Configuracion visual basada en 0.5:
 * - Navbar: V6 (Banner Promocional)
 * - HeroBanner: V2 (Lifestyle Aspiracional)
 * - SocialProof: V1 (Marquee + Testimonios)
 * - HowItWorks: V5 (Con Requisitos)
 * - CTA: V4 (WhatsApp Directo)
 * - FAQ: V2 (Acordeon con Iconos)
 * - Footer: V2 (Newsletter + Columnas)
 */

import React from 'react';
import { UnderlinedText } from './common/UnderlinedText';

// Types
import type { HeroContent, SocialProofData, HowItWorksData, FaqData, Testimonial, CtaData, PromoBannerData, FooterData } from '../../types/hero';

// Components
import { Navbar } from './Navbar';
import { HeroBanner } from './HeroBanner';
import { SocialProof } from './SocialProof';
import { HowItWorks } from './HowItWorks';
import { HeroCta } from './HeroCta';
import { FaqSection } from './FaqSection';
import { Footer } from './Footer';

// Fixed underline style for v0.6 (4 = sin subrayado)
const UNDERLINE_STYLE = 4;

interface HeroSectionProps {
  // Data desde API (requerida)
  heroContent: HeroContent | null;
  socialProof: SocialProofData | null;
  howItWorksData: HowItWorksData | null;
  faqData: FaqData | null;
  ctaData: CtaData | null;
  promoBannerData: PromoBannerData | null;
  navbarItems?: { label: string; href: string; section: string | null; has_megamenu?: boolean }[];
  megamenuItems?: { label: string; href: string; icon: string; description: string }[];
  testimonials?: Testimonial[];
  testimonialsTitle?: string;
  activeSections?: string[];
  hasCta?: boolean;
  logoUrl?: string;
  customerPortalUrl?: string;
  footerData?: FooterData | null;
  /** Landing slug for dynamic URL building */
  landing?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  heroContent,
  socialProof,
  howItWorksData,
  faqData,
  ctaData,
  promoBannerData,
  navbarItems = [],
  megamenuItems = [],
  testimonials = [],
  testimonialsTitle,
  activeSections = [],
  hasCta = true,
  logoUrl,
  customerPortalUrl,
  footerData,
  landing = 'home',
}) => {
  // Quiz handlers (placeholder para futuro)
  const handleQuizOpen = () => {
    // TODO: Implementar quiz para 0.6
    console.log('Quiz not implemented yet in 0.6');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar activeSections={activeSections} promoBannerData={promoBannerData} logoUrl={logoUrl} customerPortalUrl={customerPortalUrl} navbarItems={navbarItems} megamenuItems={megamenuItems} landing={landing} />

      {/* Main Content */}
      <main className="flex-1 pt-16">
        {/* Hero Banner - Solo mostrar si existe */}
        {heroContent && (
          <section>
            <HeroBanner
              headline={heroContent.headline}
              subheadline={heroContent.subheadline}
              minQuota={heroContent.minQuota}
              imageSrc={heroContent.backgroundImage}
              primaryCta={heroContent.primaryCta}
              trustSignals={heroContent.trustSignals}
              badgeText={heroContent.badgeText}
              underlineStyle={UNDERLINE_STYLE}
              landing={landing}
            />
          </section>
        )}

        {/* Social Proof - Solo mostrar si existe */}
        {socialProof && (
          <section className="pt-12 bg-neutral-50">
            <SocialProof data={socialProof} testimonials={testimonials} testimonialsTitle={testimonialsTitle} underlineStyle={UNDERLINE_STYLE} />
          </section>
        )}

        {/* How It Works Section - Solo mostrar si existe */}
        {howItWorksData && (
          <section id="como-funciona" className="scroll-mt-24">
            <HowItWorks data={howItWorksData} underlineStyle={UNDERLINE_STYLE} />
          </section>
        )}

        {/* CTA Section - Solo mostrar si existe */}
        {hasCta && (
          <section className="py-16 bg-neutral-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3 font-['Baloo_2']">
                ¿Listo para tu nuevo{' '}
                <UnderlinedText style={UNDERLINE_STYLE} color="primary">
                  {ctaData?.highlightWord || ''}
                </UnderlinedText>
                ?
              </h2>
              <p className="text-neutral-600 mb-8">
                Solicita tu laptop en minutos. 100% digital.
              </p>

              {/* CTA Component */}
              <div className="flex justify-center mb-6">
                <HeroCta data={ctaData || undefined} onQuizOpen={handleQuizOpen} landing={landing} />
              </div>

              {/* Microcopy con links dinámicos */}
              <p className="text-xs text-neutral-400">
                {ctaData?.legalLinks ? (
                  <>
                    Al continuar, aceptas nuestros{' '}
                    <a href={ctaData.legalLinks.terms.url} className="underline hover:text-neutral-600">
                      {ctaData.legalLinks.terms.text}
                    </a>
                    {' '}y{' '}
                    <a href={ctaData.legalLinks.privacy.url} className="underline hover:text-neutral-600">
                      {ctaData.legalLinks.privacy.text}
                    </a>
                  </>
                ) : (
                  ctaData?.microcopy || ''
                )}
              </p>
            </div>
          </section>
        )}

        {/* FAQ Section - Solo mostrar si existe */}
        {faqData && (
          <section id="faq" className="scroll-mt-24">
            <FaqSection data={faqData} underlineStyle={UNDERLINE_STYLE} />
          </section>
        )}
      </main>

      {/* Footer */}
      <Footer data={footerData} />
    </div>
  );
};

export default HeroSection;
