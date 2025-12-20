'use client';

/**
 * HeroSection - Wrapper component for all hero sections
 *
 * Renders the appropriate version of each component based on config
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Chip } from '@nextui-org/react';
import { Sparkles, ArrowRight, CheckCircle2, Clock, Shield } from 'lucide-react';
import { HeroConfig, defaultHeroConfig } from '../../types/hero';
import { mockHeroContent, mockSocialProof, mockHowItWorksData, mockFaqData } from '../../data/mockHeroData';

// Banner imports
import {
  HeroBannerV1, HeroBannerV2, HeroBannerV3, HeroBannerV4, HeroBannerV5, HeroBannerV6,
} from './banner';

// Social Proof imports
import {
  SocialProofV1, SocialProofV2, SocialProofV3, SocialProofV4, SocialProofV5, SocialProofV6,
} from './social-proof';

// Navbar imports
import {
  NavbarV1, NavbarV2, NavbarV3, NavbarV4, NavbarV5, NavbarV6,
} from './navigation';

// CTA imports
import {
  HeroCtaV1, HeroCtaV2, HeroCtaV3, HeroCtaV4, HeroCtaV5, HeroCtaV6,
} from './cta';

// Footer imports
import {
  FooterV1, FooterV2, FooterV3, FooterV4, FooterV5, FooterV6,
} from './footer';

// HowItWorks imports
import {
  HowItWorksV1, HowItWorksV2, HowItWorksV3, HowItWorksV4, HowItWorksV5, HowItWorksV6,
} from './how-it-works';

// FAQ imports
import {
  FaqSectionV1, FaqSectionV2, FaqSectionV3, FaqSectionV4, FaqSectionV5, FaqSectionV6,
} from './faq';

interface HeroSectionProps {
  config?: Partial<HeroConfig>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ config = {} }) => {
  const finalConfig: HeroConfig = { ...defaultHeroConfig, ...config };

  const renderNavbar = () => {
    const navbarComponents = {
      1: NavbarV1, 2: NavbarV2, 3: NavbarV3, 4: NavbarV4, 5: NavbarV5, 6: NavbarV6,
    };
    const NavbarComponent = navbarComponents[finalConfig.navbarVersion];
    return <NavbarComponent />;
  };

  const renderBanner = () => {
    const bannerComponents = {
      1: HeroBannerV1, 2: HeroBannerV2, 3: HeroBannerV3, 4: HeroBannerV4, 5: HeroBannerV5, 6: HeroBannerV6,
    };
    const BannerComponent = bannerComponents[finalConfig.heroBannerVersion];
    return (
      <BannerComponent
        headline={mockHeroContent.headline}
        subheadline={mockHeroContent.subheadline}
        minQuota={mockHeroContent.minQuota}
        primaryCta={mockHeroContent.primaryCta}
        trustSignals={mockHeroContent.trustSignals}
      />
    );
  };

  const renderSocialProof = () => {
    const socialProofComponents = {
      1: SocialProofV1, 2: SocialProofV2, 3: SocialProofV3, 4: SocialProofV4, 5: SocialProofV5, 6: SocialProofV6,
    };
    const SocialProofComponent = socialProofComponents[finalConfig.socialProofVersion];
    return <SocialProofComponent data={mockSocialProof} />;
  };

  const renderCta = () => {
    const ctaComponents = {
      1: HeroCtaV1, 2: HeroCtaV2, 3: HeroCtaV3, 4: HeroCtaV4, 5: HeroCtaV5, 6: HeroCtaV6,
    };
    const CtaComponent = ctaComponents[finalConfig.ctaVersion];
    // CTA components are self-contained with internal content
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <CtaComponent />;
  };

  const renderFooter = () => {
    const footerComponents = {
      1: FooterV1, 2: FooterV2, 3: FooterV3, 4: FooterV4, 5: FooterV5, 6: FooterV6,
    };
    const FooterComponent = footerComponents[finalConfig.footerVersion];
    // Footer components are self-contained with internal content
    return <FooterComponent />;
  };

  const renderHowItWorks = () => {
    const howItWorksComponents = {
      1: HowItWorksV1, 2: HowItWorksV2, 3: HowItWorksV3, 4: HowItWorksV4, 5: HowItWorksV5, 6: HowItWorksV6,
    };
    const HowItWorksComponent = howItWorksComponents[finalConfig.howItWorksVersion];
    return <HowItWorksComponent data={mockHowItWorksData} />;
  };

  const renderFaq = () => {
    const faqComponents = {
      1: FaqSectionV1, 2: FaqSectionV2, 3: FaqSectionV3, 4: FaqSectionV4, 5: FaqSectionV5, 6: FaqSectionV6,
    };
    const FaqComponent = faqComponents[finalConfig.faqVersion];
    return <FaqComponent data={mockFaqData} />;
  };

  // Check if NavbarV3 is used (transparent navbar that needs special handling)
  const needsTransparentNavbarBackground = finalConfig.navbarVersion === 3;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      {renderNavbar()}

      {/* Main Content */}
      <main className={`flex-1 pt-16 ${needsTransparentNavbarBackground ? 'bg-[#4654CD]' : ''}`}>
        {/* Hero Banner */}
        <section>
          {renderBanner()}
        </section>

        {/* Social Proof */}
        <section className="py-12 bg-neutral-50">
          {renderSocialProof()}
        </section>

        {/* How It Works Section */}
        <section id="como-funciona">
          {renderHowItWorks()}
        </section>

        {/* CTA Section - Enhanced UI/UX */}
        <section className="py-20 bg-gradient-to-b from-white to-neutral-50 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-[0.02]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="cta-dots" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="#4654CD" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cta-dots)" />
            </svg>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              {/* Section Badge */}
              <Chip
                startContent={<Sparkles className="w-3.5 h-3.5" />}
                classNames={{
                  base: 'bg-[#4654CD]/10 px-4 py-2 h-auto mb-6',
                  content: 'text-[#4654CD] text-sm font-medium',
                }}
              >
                Comienza hoy
              </Chip>

              {/* Section Title */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4 font-['Baloo_2'] leading-tight">
                ¿Listo para tu{' '}
                <span className="text-[#4654CD] relative">
                  nuevo equipo
                  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                    <path d="M2 6C50 2 150 2 198 6" stroke="#03DBD0" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
                ?
              </h2>

              {/* Subtitle */}
              <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
                Solicita tu laptop en minutos. Sin filas, sin papeleos, todo 100% digital.
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-6 mb-10">
                <div className="flex items-center gap-2 text-neutral-600">
                  <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
                  <span className="text-sm">Sin historial crediticio</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <Clock className="w-5 h-5 text-[#4654CD]" />
                  <span className="text-sm">Respuesta en 24h</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <Shield className="w-5 h-5 text-[#03DBD0]" />
                  <span className="text-sm">Regulados por SBS</span>
                </div>
              </div>

              {/* CTA Component */}
              <div className="flex justify-center">
                {renderCta()}
              </div>

              {/* Microcopy */}
              <p className="text-xs text-neutral-400 mt-6">
                Al continuar, aceptas nuestros{' '}
                <a href="/prototipos/0.4/legal/terminos" className="underline hover:text-neutral-600">terminos y condiciones</a>
                {' '}y{' '}
                <a href="/prototipos/0.4/legal/privacidad" className="underline hover:text-neutral-600">politica de privacidad</a>
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq">
          {renderFaq()}
        </section>
      </main>

      {/* Footer */}
      {renderFooter()}
    </div>
  );
};

export default HeroSection;
