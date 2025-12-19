'use client';

/**
 * HeroSection - Wrapper component for all hero sections
 *
 * Renders the appropriate version of each component based on config
 */

import React from 'react';
import { HeroConfig, defaultHeroConfig } from '../../types/hero';
import { mockHeroContent, mockSocialProof } from '../../data/mockHeroData';

// Banner imports
import {
  HeroBannerV1, HeroBannerV2, HeroBannerV3, HeroBannerV4, HeroBannerV5,
  HeroBannerV6, HeroBannerV7, HeroBannerV8, HeroBannerV9, HeroBannerV10,
} from './banner';

// Social Proof imports
import {
  SocialProofV1, SocialProofV2, SocialProofV3, SocialProofV4, SocialProofV5,
  SocialProofV6, SocialProofV7, SocialProofV8, SocialProofV9, SocialProofV10,
} from './social-proof';

// Navbar imports
import {
  NavbarV1, NavbarV2, NavbarV3, NavbarV4, NavbarV5,
  NavbarV6, NavbarV7, NavbarV8, NavbarV9, NavbarV10,
} from './navigation';

// CTA imports
import {
  HeroCtaV1, HeroCtaV2, HeroCtaV3, HeroCtaV4, HeroCtaV5,
  HeroCtaV6, HeroCtaV7, HeroCtaV8, HeroCtaV9, HeroCtaV10,
} from './cta';

// Footer imports
import {
  FooterV1, FooterV2, FooterV3, FooterV4, FooterV5,
  FooterV6, FooterV7, FooterV8, FooterV9, FooterV10,
} from './footer';

interface HeroSectionProps {
  config?: Partial<HeroConfig>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ config = {} }) => {
  const finalConfig: HeroConfig = { ...defaultHeroConfig, ...config };

  const renderNavbar = () => {
    const navbarComponents = {
      1: NavbarV1, 2: NavbarV2, 3: NavbarV3, 4: NavbarV4, 5: NavbarV5,
      6: NavbarV6, 7: NavbarV7, 8: NavbarV8, 9: NavbarV9, 10: NavbarV10,
    };
    const NavbarComponent = navbarComponents[finalConfig.navbarVersion];
    return <NavbarComponent />;
  };

  const renderBanner = () => {
    const bannerComponents = {
      1: HeroBannerV1, 2: HeroBannerV2, 3: HeroBannerV3, 4: HeroBannerV4, 5: HeroBannerV5,
      6: HeroBannerV6, 7: HeroBannerV7, 8: HeroBannerV8, 9: HeroBannerV9, 10: HeroBannerV10,
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
      1: SocialProofV1, 2: SocialProofV2, 3: SocialProofV3, 4: SocialProofV4, 5: SocialProofV5,
      6: SocialProofV6, 7: SocialProofV7, 8: SocialProofV8, 9: SocialProofV9, 10: SocialProofV10,
    };
    const SocialProofComponent = socialProofComponents[finalConfig.socialProofVersion];
    return <SocialProofComponent data={mockSocialProof} />;
  };

  const renderCta = () => {
    const ctaComponents = {
      1: HeroCtaV1, 2: HeroCtaV2, 3: HeroCtaV3, 4: HeroCtaV4, 5: HeroCtaV5,
      6: HeroCtaV6, 7: HeroCtaV7, 8: HeroCtaV8, 9: HeroCtaV9, 10: HeroCtaV10,
    };
    const CtaComponent = ctaComponents[finalConfig.ctaVersion];
    // CTA components are self-contained with internal content
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <CtaComponent />;
  };

  const renderFooter = () => {
    const footerComponents = {
      1: FooterV1, 2: FooterV2, 3: FooterV3, 4: FooterV4, 5: FooterV5,
      6: FooterV6, 7: FooterV7, 8: FooterV8, 9: FooterV9, 10: FooterV10,
    };
    const FooterComponent = footerComponents[finalConfig.footerVersion];
    // Footer components are self-contained with internal content
    return <FooterComponent />;
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

        {/* CTA Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4 font-['Baloo_2']">
                ¿Listo para empezar?
              </h2>
              <p className="text-neutral-600">
                Solicita tu laptop en minutos, sin complicaciones
              </p>
            </div>
            {renderCta()}
          </div>
        </section>
      </main>

      {/* Footer */}
      {renderFooter()}
    </div>
  );
};

export default HeroSection;
