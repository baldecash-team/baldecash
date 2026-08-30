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

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { UnderlinedText } from './common/UnderlinedText';

// Types
import type { HeroContent, SocialProofData, HowItWorksData, FaqData, Testimonial, CtaData, PromoBannerData, FooterData, BenefitsData, AgreementData } from '../../types/hero';
import { routes } from '@/app/prototipos/0.6/utils/routes';

// Quiz
import { HelpQuiz } from '../../quiz';
import { useQuiz } from '../../quiz/hooks/useQuiz';
import type { QuizProduct } from '../../quiz/types/quiz';

// Event tracking
import { useEventTrackerOptional } from '../../[landing]/solicitar/context/EventTrackerContext';

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
import { ConvenioHero, ConvenioTestimonials, ConvenioCta, ConvenioFaq } from './convenio';

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
  testimonialsSubtitle?: string;
  activeSections?: string[];
  hasCta?: boolean;
  logoUrl?: string;
  logoClassName?: string;
  customerPortalUrl?: string;
  portalButtonText?: string;
  footerData?: FooterData | null;
  benefitsData?: BenefitsData | null;
  agreementData?: AgreementData | null;
  /**
   * Marca de la institucion de referencia de una landing que NO es de convenio
   * (`lead-flujo-normal` -> SENATI).
   *
   * Deliberadamente separada de `agreementData`: `isConvenio` se deriva de esa
   * otra, y pasarla por ahi le prenderia el hero, el FAQ y el CTA de convenio
   * a una landing que no lo es. Esto solo alimenta el logo.
   */
  institutionBranding?: { institution_logo?: string; institution_name?: string } | null;
  /**
   * Visibilidad del logo institucional en el navbar y el footer de la home.
   * Viene de `layout.show_agreement_logo`. Default: true (BAL-2970).
   *
   * Solo afecta al LOGO: `isConvenio` sigue derivandose de que exista
   * `agreementData`, asi que las secciones de convenio (hero, FAQ, CTA) se
   * renderizan igual con el flag apagado.
   */
  showInstitutionLogo?: boolean;
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
  testimonialsSubtitle,
  activeSections = [],
  hasCta = true,
  logoUrl,
  logoClassName,
  customerPortalUrl,
  portalButtonText,
  footerData,
  benefitsData,
  agreementData,
  institutionBranding,
  showInstitutionLogo = true,
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
        slug: quizProduct.slug,
        name: quizProduct.displayName,
        shortName: quizProduct.name,
        brand: quizProduct.brand,
        image: quizProduct.thumbnail || quizProduct.image,
        price: quizProduct.price,
        months: (quizProduct.termMonths || 24) as TermMonths,
        paymentFrequency: quizProduct.paymentFrequency,
        initialPercent: WIZARD_SELECTED_INITIAL,
        initialAmount: 0,
        monthlyPayment: quizProduct.lowestQuota,
        addedAt: Date.now(),
        variantId: quizProduct.variantId,
        colorName: quizProduct.colorName,
        colorHex: quizProduct.colorHex,
        type: quizProduct.deviceType as CartItem['type'],
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
  //
  // Ojo: `institutionBranding` NO entra en esta cuenta. Una landing sin
  // convenio que muestra el logo de su institucion de referencia sigue sin ser
  // de convenio: si entrara aca, le apareceria el hero, el FAQ y el CTA de
  // convenio, que es el efecto que la separacion evita.
  const isConvenio = !!agreementData;

  // El logo que se pinta en el navbar y en el footer. El convenio manda; el
  // branding suelto es el fallback de las landings que no lo tienen.
  const institutionLogoResuelto =
    agreementData?.institution_logo || institutionBranding?.institution_logo;
  const institutionNameResuelto =
    agreementData?.institution_name || institutionBranding?.institution_name;

  // section_view tracking via IntersectionObserver
  const tracker = useEventTrackerOptional();
  const viewedSectionsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!tracker) return;

    const sectionIds = ['hero', 'beneficios', 'testimonios', 'convenios', 'como-funciona', 'faq', 'cta'];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !viewedSectionsRef.current.has(entry.target.id)) {
            viewedSectionsRef.current.add(entry.target.id);
            tracker.track('section_view', { section_id: entry.target.id }, entry.target.id);
          }
        }
      },
      { threshold: 0.3 }
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [tracker]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar - shared between normal and convenio */}
      <div id="navbar">
        <Navbar activeSections={activeSections} promoBannerData={promoBannerData} logoUrl={logoUrl} logoClassName={logoClassName} customerPortalUrl={customerPortalUrl} portalButtonText={portalButtonText} navbarItems={navbarItems} megamenuItems={megamenuItems} landing={landing} previewBannerOffset={previewBannerOffset} institutionLogo={institutionLogoResuelto} institutionName={institutionNameResuelto} showInstitutionLogo={showInstitutionLogo} primaryColor={primaryColor} />
      </div>

      {/* Main Content - pad for all fixed headers (preview + promo + navbar) */}
      <main className="flex-1" style={{ paddingTop: 'var(--header-total-height, 6.5rem)' }}>
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
                <ConvenioTestimonials testimonials={testimonials} title={testimonialsTitle} subtitle={testimonialsSubtitle} agreementData={agreementData} />
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
                  quotaSuffix={heroContent.quotaSuffix}
                  imageSrc={heroContent.backgroundImage}
                  mobileImageSrc={heroContent.backgroundMobileImage}
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
                  showHeroContent={heroContent.showHeroContent}
                  showMinQuota={heroContent.showMinQuota}
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
              <section id="cta" className="py-12 sm:py-16 md:py-20 bg-neutral-50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <h2
                    className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 mb-2 sm:mb-3 font-['Baloo_2',_sans-serif] leading-tight [&_p]:inline [&_strong]:font-bold [&_em]:italic"
                    dangerouslySetInnerHTML={{ __html: ctaData?.sectionTitle || '' }}
                  />
                  <div
                    className="text-sm sm:text-base text-neutral-600 mb-6 sm:mb-8 [&_p]:inline [&_strong]:font-bold [&_em]:italic"
                    dangerouslySetInnerHTML={{ __html: ctaData?.sectionSubtitle || '' }}
                  />

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

      {/* Footer - Institucional con logo doble si es convenio */}
      <div id="footer">
        <Footer data={footerData} landing={landing} agreementData={agreementData} institutionBranding={institutionBranding} showInstitutionLogo={showInstitutionLogo} />
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
