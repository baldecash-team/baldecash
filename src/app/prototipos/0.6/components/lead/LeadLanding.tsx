'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useEventTrackerOptional } from '../../[landing]/solicitar/context/EventTrackerContext';
import type {
  HeroContent, SocialProofData, HowItWorksData, FaqData,
  CtaData, FooterData, BenefitsData, Testimonial,
  BannerImage, LeadFormConfig, LeadProductsConfig,
} from '../../types/hero';

import { Navbar } from '../hero/Navbar';
import { HowItWorks } from '../hero/HowItWorks';
import { FaqSection } from '../hero/FaqSection';
import { Footer } from '../hero/Footer';
import { LeadHeroBanner } from './LeadHeroBanner';
import { LeadLeadForm } from './LeadLeadForm';
import { LeadProductsSection } from './LeadProductsSection';
import { markLeadLanding, getLeadId } from '../../hooks/useLeadGuard';
import { routes } from '@/app/prototipos/0.6/utils/routes';

const UNDERLINE_STYLE = 4 as const;

interface LeadLandingProps {
  landingId: number;
  heroContent: HeroContent | null;
  socialProof: SocialProofData | null;
  howItWorksData: HowItWorksData | null;
  faqData: FaqData | null;
  ctaData: CtaData | null;
  footerData: FooterData | null;
  benefitsData: BenefitsData | null;
  testimonials: Testimonial[];
  navbarItems: { label: string; href: string; section: string | null; has_megamenu?: boolean }[];
  megamenuItems: { label: string; href: string; icon: string; description: string }[];
  activeSections: string[];
  hasCta: boolean;
  logoUrl?: string;
  customerPortalUrl?: string;
  portalButtonText?: string;
  bannerImages: BannerImage[];
  leadFormConfig: LeadFormConfig | null;
  leadProductsConfig?: LeadProductsConfig | null;
  landing: string;
  previewBannerOffset?: number;
  primaryColor?: string;
  secondaryColor?: string;
  promoBannerData?: import('../../types/hero').PromoBannerData | null;
}

export const LeadLanding: React.FC<LeadLandingProps> = ({
  landingId,
  heroContent,
  socialProof,
  howItWorksData,
  faqData,
  ctaData,
  footerData,
  bannerImages,
  leadFormConfig,
  leadProductsConfig,
  landing,
  navbarItems,
  megamenuItems,
  activeSections,
  hasCta,
  logoUrl,
  customerPortalUrl,
  portalButtonText,
  previewBannerOffset = 0,
  primaryColor = '#4654CD',
  secondaryColor = '#03DBD0',
  promoBannerData,
}) => {
  const studyCenters = socialProof?.studyCenters || [];
  const tracker = useEventTrackerOptional();
  const viewedSectionsRef = useRef<Set<string>>(new Set());
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  useEffect(() => {
    setIsRegistered(getLeadId(landing) !== null);
  }, [landing]);

  const formConfig = leadFormConfig || { title_count: 0, title: '', description: '', cta_text: '' };

  // Marcar esta landing como tipo 'lead' en localStorage al montar
  useEffect(() => {
    markLeadLanding(landing);
  }, [landing]);

  // Si llega con #lead-form en la URL (redirect desde guard), hacer scroll al formulario
  useEffect(() => {
    if (window.location.hash === '#lead-form') {
      setTimeout(() => {
        const el = document.getElementById('lead-form');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, []);

  const handleProductCta = () => {
    if (getLeadId(landing) !== null) {
      window.location.href = routes.catalogo(landing);
      return;
    }
    const isMobile = window.innerWidth < 1024;
    const allForms = Array.from(document.querySelectorAll<HTMLElement>('#lead-form'));
    const formEl = allForms.find(el => el.offsetParent !== null) ?? allForms[0];
    if (!formEl) return;
    if (isMobile) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const rect = formEl.getBoundingClientRect();
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
      const doShake = () => {
        formEl.classList.remove('lead-form-shake');
        void formEl.offsetWidth;
        formEl.classList.add('lead-form-shake');
        formEl.addEventListener('animationend', () => formEl.classList.remove('lead-form-shake'), { once: true });
        const firstInput = formEl.querySelector<HTMLInputElement>('input, select, textarea');
        if (firstInput) setTimeout(() => firstInput.focus(), 100);
      };
      if (!isVisible) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(doShake, 500);
      } else {
        doShake();
      }
    }
  };

  useEffect(() => {
    const handleCatalogLinks = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      const href = target.getAttribute('href') || '';
      if (!href.includes('/catalogo') && !href.includes('catalogo')) return;
      e.preventDefault();
      handleProductCta();
    };
    document.addEventListener('click', handleCatalogLinks);
    return () => document.removeEventListener('click', handleCatalogLinks);
  }, []);

  useEffect(() => {
    if (!tracker) return;
    const sectionIds = ['hero', 'productos', 'como-funciona', 'faq'];
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

  if (isRegistered === null) return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        activeSections={activeSections}
        promoBannerData={promoBannerData ?? null}
        logoUrl={logoUrl}
        customerPortalUrl={customerPortalUrl}
        portalButtonText={portalButtonText}
        navbarItems={navbarItems}
        megamenuItems={megamenuItems}
        landing={landing}
        previewBannerOffset={previewBannerOffset}
        primaryColor={primaryColor}
        onCatalogClick={handleProductCta}
        fullWidth
      />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        activeSections={activeSections}
        promoBannerData={promoBannerData ?? null}
        logoUrl={logoUrl}
        customerPortalUrl={customerPortalUrl}
        portalButtonText={portalButtonText}
        navbarItems={navbarItems}
        megamenuItems={megamenuItems}
        landing={landing}
        previewBannerOffset={previewBannerOffset}
        primaryColor={primaryColor}
        onCatalogClick={handleProductCta}
        fullWidth={!isRegistered}
      />

      <main className="flex-1" style={{ paddingTop: 'var(--header-total-height, 6.5rem)' }}>

        {/* ── DESKTOP ── */}
        {isRegistered ? (
          /* Ya registrado: columna única 100% con márgenes del home */
          <div className="hidden lg:flex flex-col">
            <section id="hero" className="relative w-full" style={{ height: 'calc(100svh - var(--header-total-height, 6.5rem))' }}>
              <LeadHeroBanner
                heroContent={heroContent}
                bannerImages={bannerImages}
                landing={landing}
                primaryColor={primaryColor}
                onCtaClick={handleProductCta}
                contained
              />
            </section>
            <LeadProductsSection
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              config={leadProductsConfig}
              landing={landing}
              onCtaClick={handleProductCta}
              contained
            />
            {howItWorksData && (
              <section id="como-funciona" data-section="como-funciona" className="scroll-mt-24">
                <HowItWorks data={howItWorksData} underlineStyle={UNDERLINE_STYLE} />
              </section>
            )}
            {faqData && (
              <section id="faq" data-section="faq" className="scroll-mt-24">
                <FaqSection data={faqData} underlineStyle={UNDERLINE_STYLE} />
              </section>
            )}
          </div>
        ) : (
          /* Sin registrar: layout 70/30 con formulario sticky */
          <div className="hidden lg:flex flex-row">
            {/* Columna izquierda 70% */}
            <div className="w-[70%] min-w-0 flex flex-col">
              <section id="hero" className="relative w-full" style={{ height: 'calc(100svh - var(--header-total-height, 6.5rem))' }}>
                <div className="absolute inset-0" style={{ width: '100vw' }}>
                  <LeadHeroBanner
                    heroContent={heroContent}
                    bannerImages={bannerImages}
                    landing={landing}
                    primaryColor={primaryColor}
                    onCtaClick={handleProductCta}
                  />
                </div>
              </section>
              <div className="relative" style={{ height: '100svh' }}>
                <div className="absolute inset-0" style={{ width: '100vw', backgroundColor: primaryColor || '#4247d2' }} />
                <div className="relative z-10 h-full">
                  <LeadProductsSection
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                    config={leadProductsConfig}
                    landing={landing}
                    onCtaClick={handleProductCta}
                  />
                </div>
              </div>
              {howItWorksData && (
                <section id="como-funciona" data-section="como-funciona" className="scroll-mt-24">
                  <HowItWorks data={howItWorksData} underlineStyle={UNDERLINE_STYLE} />
                </section>
              )}
              {faqData && (
                <section id="faq" data-section="faq" className="scroll-mt-24">
                  <FaqSection data={faqData} underlineStyle={UNDERLINE_STYLE} />
                </section>
              )}
            </div>
            {/* Columna derecha 30% — formulario sticky */}
            <div className="w-[30%] flex-shrink-0 relative z-10">
              <div
                className="sticky flex flex-col justify-center px-8 xl:px-12 py-12"
                style={{ top: `calc(var(--header-total-height, 6.5rem) + ${previewBannerOffset}px)` }}
              >
                <div
                  id="lead-form"
                  className="bg-white rounded-[24px] p-8 border border-white/80"
                  style={{ boxShadow: '0 24px 48px rgba(66, 71, 210, 0.15)' }}
                >
                  <h2 className="font-['Baloo_2',_sans-serif] text-[28px] font-bold text-[#131b2e] leading-tight mb-8">
                    {(formConfig.title || 'Explora más de 20 modelos').replace(/<[^>]+>/g, '')}
                  </h2>
                  <LeadLeadForm
                    config={formConfig}
                    landingId={landingId}
                    landing={landing}
                    studyCenters={studyCenters}
                    primaryColor={primaryColor}
                  />
                  <div className="mt-6 flex items-center justify-center gap-2 text-[#767686] text-xs font-['Asap',_sans-serif]">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <span>Tus datos están protegidos</span>
                  </div>
                </div>
                <div className="absolute top-[10%] right-10 w-32 h-32 bg-[#4247d2]/5 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-[20%] right-20 w-48 h-48 bg-[#22c55e]/5 rounded-full blur-3xl pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* ── MOBILE: columna única ── */}
        <div className="lg:hidden flex flex-col">
          <section
            id="hero"
            className="relative w-full"
            style={{ height: 'calc(100svh - var(--header-total-height, 6.5rem))' }}
          >
            <LeadHeroBanner
              heroContent={heroContent}
              bannerImages={bannerImages}
              landing={landing}
              primaryColor={primaryColor}
              onCtaClick={handleProductCta}
            />
          </section>

          {/* Formulario — solo si no está registrado */}
          {!isRegistered && (
            <div id="lead-form" className="bg-[#faf8ff] px-4 relative z-20 py-8 flex flex-col justify-center" style={{ minHeight: '100svh' }}>
              <div className="bg-white rounded-3xl shadow-[0_24px_48px_rgba(66,71,210,0.15)] p-6 border border-[#dae2fd]/50">
                <h2 className="font-['Baloo_2',_sans-serif] text-[22px] font-bold text-[#131b2e] leading-tight mb-6">
                  {(formConfig.title || 'Explora más de 20 modelos').replace(/<[^>]+>/g, '')}
                </h2>
                <LeadLeadForm
                  config={formConfig}
                  landingId={landingId}
                  landing={landing}
                  studyCenters={studyCenters}
                  primaryColor={primaryColor}
                />
              </div>
            </div>
          )}

          <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
            <LeadProductsSection
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              config={leadProductsConfig}
              landing={landing}
              sectionId="productos-mobile"
              onCtaClick={handleProductCta}
            />
          </div>

          {howItWorksData && (
            <section id="como-funciona-mobile" data-section="como-funciona" className="scroll-mt-24">
              <HowItWorks data={howItWorksData} underlineStyle={UNDERLINE_STYLE} />
            </section>
          )}

          {faqData && (
            <section id="faq-mobile" data-section="faq" className="scroll-mt-24">
              <FaqSection data={faqData} underlineStyle={UNDERLINE_STYLE} />
            </section>
          )}
        </div>

        <Footer data={footerData} landing={landing} onCatalogClick={handleProductCta} />
      </main>
    </div>
  );
};
