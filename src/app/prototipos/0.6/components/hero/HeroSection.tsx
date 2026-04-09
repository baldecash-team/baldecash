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

import React, { useState, useCallback } from 'react';
import { UnderlinedText } from './common/UnderlinedText';

// Types
import type { HeroContent, SocialProofData, HowItWorksData, FaqData, Testimonial, CtaData, PromoBannerData, FooterData, BenefitsData, AgreementData } from '../../types/hero';
import { routes } from '@/app/prototipos/0.6/utils/routes';

// Quiz
import { HelpQuiz } from '../../quiz';
import { useQuiz } from '../../quiz/hooks/useQuiz';
import type { QuizProduct } from '../../quiz/types/quiz';

// Shared state for cart (same localStorage as catalog)
import { useCatalogSharedState } from '../../[landing]/catalogo/hooks/useCatalogSharedState';
import type { CartItem, TermMonths } from '../../[landing]/catalogo/types/catalog';

// Toast for feedback
import { Toast, useToast } from '@/app/prototipos/_shared';

// Components
import { Navbar } from './Navbar';
import { HeroBanner } from './HeroBanner';
import { SocialProof } from './SocialProof';
import { HowItWorks } from './HowItWorks';
import { HeroCta } from './HeroCta';
import { FaqSection } from './FaqSection';
import { Benefits } from './Benefits';
import { Footer } from './Footer';

// Convenio-specific components
import { ConvenioHero, ConvenioTestimonials, ConvenioCta, ConvenioFooter, ConvenioFaq } from './convenio';

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
  portalButtonText?: string;
  footerData?: FooterData | null;
  benefitsData?: BenefitsData | null;
  agreementData?: AgreementData | null;
  /** Landing slug for dynamic URL building */
  landing?: string;
  /** Offset from top when preview banner is shown (in pixels) */
  previewBannerOffset?: number;
  /** Preview key for API authentication (sessionStorage preview) */
  previewKey?: string | null;
  /** Primary brand color hex for contrast calculations */
  primaryColor?: string;
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
  portalButtonText,
  footerData,
  benefitsData,
  agreementData,
  landing = 'home',
  previewBannerOffset = 0,
  previewKey,
  primaryColor,
}) => {
  const heroUrl = routes.landingHome(landing || 'home');

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

  // Quiz data from API - check if landing has a quiz
  const { hasQuiz, questions } = useQuiz({ landingSlug: landing });
  const questionCount = questions.length;

  // Cart state - shares localStorage with catalog
  // v0.6.1: Use isInCart and addToCart with CartItem
  const { isInCart, addToCart, cartIds } = useCatalogSharedState(landing, previewKey);

  // Toast for cart feedback
  const { toast, showToast, hideToast, isVisible: isToastVisible } = useToast(4000);

  // Default pricing config
  const WIZARD_SELECTED_INITIAL = 0;

  // Add to cart with toast feedback
  // v0.6.2: Accept QuizProduct and build CartItem
  const handleAddToCart = useCallback((quizProduct: QuizProduct) => {
    if (!isInCart(quizProduct.id)) {
      const cartItem: CartItem = {
        productId: quizProduct.id,
        name: quizProduct.displayName,
        shortName: quizProduct.name,
        brand: quizProduct.brand,
        image: quizProduct.thumbnail || quizProduct.image,
        price: quizProduct.price,
        months: (quizProduct.termMonths || 24) as TermMonths,
        initialPercent: WIZARD_SELECTED_INITIAL,
        initialAmount: 0,
        monthlyPayment: quizProduct.lowestQuota,
        addedAt: Date.now(),
        specs: {
          processor: quizProduct.specs?.processor || '',
          ram: quizProduct.specs?.ram ? `${quizProduct.specs.ram}GB` : '',
          storage: quizProduct.specs?.storage ? `${quizProduct.specs.storage}GB` : '',
        },
      };
      addToCart(cartItem);
      showToast('Producto añadido al carrito', 'success');
    }
  }, [isInCart, addToCart, showToast]);

  // Quiz handlers
  const handleQuizOpen = () => {
    setIsQuizOpen(true);
  };

  const handleQuizClose = () => {
    setIsQuizOpen(false);
  };

  // Determine if this is a convenio landing
  const isConvenio = !!agreementData;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar - shared between normal and convenio */}
      <div id="navbar">
        <Navbar activeSections={activeSections} promoBannerData={promoBannerData} logoUrl={logoUrl} customerPortalUrl={customerPortalUrl} portalButtonText={portalButtonText} navbarItems={navbarItems} megamenuItems={megamenuItems} landing={landing} previewBannerOffset={previewBannerOffset} institutionLogo={agreementData?.institution_logo} institutionName={agreementData?.institution_name} />
      </div>

      {/* Main Content - pad for all fixed headers (preview + promo + navbar) */}
      <main className="flex-1" style={{ paddingTop: 'var(--header-total-height, 4rem)' }}>
        {/* ======= CONVENIO LAYOUT ======= */}
        {isConvenio ? (
          <>
            {/* Convenio Hero - Campus image, badge, checklist, price */}
            {heroContent && (
              <section id="hero">
                <ConvenioHero heroContent={heroContent} agreementData={agreementData} landing={landing} primaryColor={primaryColor} />
              </section>
            )}

            {/* Benefits Section */}
            {benefitsData && activeSections.includes('beneficios') && (
              <section id="beneficios" className="scroll-mt-24">
                <Benefits data={benefitsData} />
              </section>
            )}

            {/* Convenio Testimonials - 3-col card grid */}
            {testimonials.length > 0 && (
              <section id="testimonios" className="scroll-mt-24">
                <ConvenioTestimonials testimonials={testimonials} title={testimonialsTitle} agreementData={agreementData} />
              </section>
            )}

            {/* How It Works Section */}
            {howItWorksData && activeSections.includes('como-funciona') && (
              <section id="como-funciona" className="scroll-mt-24">
                <HowItWorks data={howItWorksData} underlineStyle={UNDERLINE_STYLE} />
              </section>
            )}

            {/* Convenio FAQ - Accordion with category icons */}
            {faqData && activeSections.includes('faq') && (
              <section id="faq" className="scroll-mt-24">
                <ConvenioFaq data={faqData} agreementData={agreementData} />
              </section>
            )}

            {/* Convenio CTA - 2-col WhatsApp + Quick Links */}
            {hasCta && (
              <section id="cta">
                <ConvenioCta ctaData={ctaData} agreementData={agreementData} heroContent={heroContent} landing={landing} />
              </section>
            )}
          </>
        ) : (
          <>
            {/* ======= NORMAL LAYOUT ======= */}
            {/* Hero Banner - Solo mostrar si existe */}
            {heroContent && (
              <section id="hero">
                <HeroBanner
                  headline={heroContent.headline}
                  subheadline={heroContent.subheadline}
                  minQuota={heroContent.minQuota}
                  imageSrc={heroContent.backgroundImage}
                  imagePositionX={heroContent.backgroundPositionX}
                  imagePositionY={heroContent.backgroundPositionY}
                  imageZoom={heroContent.backgroundZoom}
                  mobilePositionX={heroContent.mobilePositionX}
                  mobilePositionY={heroContent.mobilePositionY}
                  mobileZoom={heroContent.mobileZoom}
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

            {/* Benefits Section - Solo mostrar si existe y está activa en navbar */}
            {benefitsData && activeSections.includes('beneficios') && (
              <section id="beneficios" className="scroll-mt-24">
                <Benefits data={benefitsData} />
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
                    <HeroCta data={ctaData || undefined} onQuizOpen={handleQuizOpen} landing={landing} hasQuiz={hasQuiz} />
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
          </>
        )}
      </main>

      {/* Footer - Convenio uses minimalist co-branded footer */}
      <div id="footer">
        {isConvenio ? (
          <ConvenioFooter data={footerData} agreementData={agreementData} landing={landing} />
        ) : (
          <Footer data={footerData} landing={landing} />
        )}
      </div>

      {/* Quiz Modal - Solo renderizar si hay quiz asociado */}
      {hasQuiz && (
        <HelpQuiz
          isOpen={isQuizOpen}
          onClose={handleQuizClose}
          context="hero"
          landing={landing}
          onAddToCart={handleAddToCart}
          cartItems={cartIds}
        />
      )}

      {/* Toast para feedback de carrito */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={isToastVisible}
          onClose={hideToast}
          duration={4000}
          position="bottom"
        />
      )}
    </div>
  );
};

export default HeroSection;
