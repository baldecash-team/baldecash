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

import React, { useState } from 'react';
import { UnderlinedText } from './common/UnderlinedText';

// Types
import type { HeroContent, SocialProofData, HowItWorksData, FaqData, Testimonial, CtaData, PromoBannerData, FooterData } from '../../types/hero';

// Quiz
import { HelpQuiz } from '../../quiz';

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
  /** Offset from top when preview banner is shown (in pixels) */
  previewBannerOffset?: number;
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
  previewBannerOffset = 0,
}) => {
  const heroUrl = `/prototipos/0.6/${landing}`;

  // Transform links: handle relative paths and build full URLs
  const transformLink = (href: string): string => {
    if (!href) return '#';

    // Skip external links, anchors, and special protocols
    if (href.startsWith('http') || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) {
      return href;
    }

    // If it's an absolute path starting with /prototipos, return as-is
    if (href.startsWith('/prototipos/')) {
      return href;
    }

    // Relative path: build full URL with landing base
    return `${heroUrl}/${href}`;
  };

  // Check if a link is external
  const isExternalLink = (href: string): boolean => {
    return href.startsWith('http://') || href.startsWith('https://');
  };

  // Get link props for external vs internal links
  const getLinkProps = (href: string) => {
    if (isExternalLink(href)) {
      return {
        target: '_blank',
        rel: 'noopener noreferrer',
      };
    }
    return {};
  };

  // Quiz state
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Quiz handlers
  const handleQuizOpen = () => {
    setIsQuizOpen(true);
  };

  const handleQuizClose = () => {
    setIsQuizOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <div id="navbar">
        <Navbar activeSections={activeSections} promoBannerData={promoBannerData} logoUrl={logoUrl} customerPortalUrl={customerPortalUrl} navbarItems={navbarItems} megamenuItems={megamenuItems} landing={landing} previewBannerOffset={previewBannerOffset} />
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-16">
        {/* Hero Banner - Solo mostrar si existe */}
        {heroContent && (
          <section id="hero">
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

        {/* Social Proof - Solo mostrar si existe y está activa en navbar */}
        {socialProof && activeSections.includes('convenios') && (
          <section id="convenios" className="pt-12 bg-neutral-50 scroll-mt-24">
            <SocialProof data={socialProof} testimonials={testimonials} testimonialsTitle={testimonialsTitle} underlineStyle={UNDERLINE_STYLE} />
          </section>
        )}

        {/* How It Works Section - Solo mostrar si existe y está activa en navbar */}
        {howItWorksData && activeSections.includes('como-funciona') && (
          <section id="como-funciona" className="scroll-mt-24">
            <HowItWorks data={howItWorksData} underlineStyle={UNDERLINE_STYLE} />
          </section>
        )}

        {/* CTA Section - Solo mostrar si existe */}
        {hasCta && (
          <section id="cta" className="py-16 bg-neutral-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3 font-['Baloo_2']">
                {ctaData?.sectionTitle?.split('{highlightWord}')[0]}
                <UnderlinedText style={UNDERLINE_STYLE} color="primary">
                  {ctaData?.highlightWord}
                </UnderlinedText>
                {ctaData?.sectionTitle?.split('{highlightWord}')[1]}
              </h2>
              <p className="text-neutral-600 mb-8">
                {ctaData?.sectionSubtitle}
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
                    <a
                      href={transformLink(ctaData.legalLinks.terms.url)}
                      className="underline hover:text-neutral-600"
                      {...getLinkProps(ctaData.legalLinks.terms.url)}
                    >
                      {ctaData.legalLinks.terms.text}
                    </a>
                    {' '}y{' '}
                    <a
                      href={transformLink(ctaData.legalLinks.privacy.url)}
                      className="underline hover:text-neutral-600"
                      {...getLinkProps(ctaData.legalLinks.privacy.url)}
                    >
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

        {/* FAQ Section - Solo mostrar si existe y está activa en navbar */}
        {faqData && activeSections.includes('faq') && (
          <section id="faq" className="scroll-mt-24">
            <FaqSection data={faqData} underlineStyle={UNDERLINE_STYLE} />
          </section>
        )}
      </main>

      {/* Footer */}
      <div id="footer">
        <Footer data={footerData} landing={landing} />
      </div>

      {/* Quiz Modal */}
      <HelpQuiz
        isOpen={isQuizOpen}
        onClose={handleQuizClose}
        context="hero"
        landing={landing}
      />
    </div>
  );
};

export default HeroSection;
