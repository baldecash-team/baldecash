'use client';

/**
 * HeroSection - Wrapper component for all hero sections
 *
 * Renders the appropriate version of each component based on config
 */

import React from 'react';
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
        underlineStyle={finalConfig.underlineStyle}
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

        {/* CTA Section */}
        <section className="py-16 bg-neutral-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3 font-['Baloo_2']">
              ¿Listo para tu nuevo equipo?
            </h2>
            <p className="text-neutral-600 mb-8">
              Solicita tu laptop en minutos. 100% digital.
            </p>

            {/* CTA Component */}
            <div className="flex justify-center mb-6">
              {renderCta()}
            </div>

            {/* Microcopy */}
            <p className="text-xs text-neutral-400">
              Al continuar, aceptas nuestros{' '}
              <a href="/prototipos/0.4/legal/terminos" className="underline hover:text-neutral-600">términos</a>
              {' '}y{' '}
              <a href="/prototipos/0.4/legal/privacidad" className="underline hover:text-neutral-600">privacidad</a>
            </p>
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
