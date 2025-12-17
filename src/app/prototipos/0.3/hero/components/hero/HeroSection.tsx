'use client';

/**
 * HeroSection - Componente wrapper principal
 *
 * Combina todos los subcomponentes segun la configuracion
 * Permite cambiar versiones de cada componente dinamicamente
 */

import React from 'react';
import { HeroConfig, defaultHeroConfig } from '../../types/hero';
import { mockHeroContentV1, mockHeroContentV2, mockHeroContentV3, mockSocialProof } from '../../data/mockHeroData';

// Navigation
import { NavbarV1, NavbarV2, NavbarV3 } from './navigation';

// Brand Identity
import { BrandIdentityV1, BrandIdentityV2, BrandIdentityV3 } from './brand';

// Social Proof
import { SocialProofV1, SocialProofV2, SocialProofV3 } from './social-proof';

// CTA
import { HeroCtaV1, HeroCtaV2, HeroCtaV3 } from './cta';

// Profile Identification
import { ProfileIdentificationV1, ProfileIdentificationV2, ProfileIdentificationV3, ProfileIdentificationV4 } from './profile';

// Institutional Banner
import { InstitutionalBannerV1, InstitutionalBannerV2, InstitutionalBannerV3, InstitutionalBannerV4 } from './institutional';

interface HeroSectionProps {
  config?: HeroConfig;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  config = defaultHeroConfig,
}) => {
  const [showProfileModal, setShowProfileModal] = React.useState(false);

  // Get content based on CTA version
  const heroContent = config.ctaVersion === 1
    ? mockHeroContentV1
    : config.ctaVersion === 2
    ? mockHeroContentV2
    : mockHeroContentV3;

  // Render Navbar based on version
  const renderNavbar = () => {
    switch (config.navbarVersion) {
      case 1:
        return <NavbarV1 />;
      case 2:
        return <NavbarV2 />;
      case 3:
        return <NavbarV3 />;
      default:
        return <NavbarV1 />;
    }
  };

  // Render Brand Identity based on version
  const renderBrandIdentity = () => {
    const props = {
      headline: heroContent.headline,
      subheadline: heroContent.subheadline,
      minQuota: heroContent.minQuota,
    };

    switch (config.brandIdentityVersion) {
      case 1:
        return <BrandIdentityV1 {...props} />;
      case 2:
        return <BrandIdentityV2 {...props} />;
      case 3:
        return <BrandIdentityV3 {...props} />;
      default:
        return <BrandIdentityV1 {...props} />;
    }
  };

  // Render Social Proof based on version
  const renderSocialProof = () => {
    switch (config.socialProofVersion) {
      case 1:
        return <SocialProofV1 data={mockSocialProof} />;
      case 2:
        return <SocialProofV2 data={mockSocialProof} />;
      case 3:
        return <SocialProofV3 data={mockSocialProof} />;
      default:
        return <SocialProofV1 data={mockSocialProof} />;
    }
  };

  // Render CTA based on version
  const renderCta = () => {
    const props = {
      primaryCta: heroContent.primaryCta,
      secondaryCta: heroContent.secondaryCta,
      minQuota: heroContent.minQuota,
      showSecurityBadge: true,
    };

    switch (config.ctaVersion) {
      case 1:
        return <HeroCtaV1 {...props} />;
      case 2:
        return <HeroCtaV2 {...props} />;
      case 3:
        return <HeroCtaV3 {...props} />;
      default:
        return <HeroCtaV1 {...props} />;
    }
  };

  // Render Profile Identification based on version
  const renderProfileIdentification = () => {
    switch (config.profileIdentificationVersion) {
      case 1:
        return (
          <ProfileIdentificationV1
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
          />
        );
      case 2:
        return <ProfileIdentificationV2 />;
      case 3:
        return <ProfileIdentificationV3 />;
      case 4:
        return <ProfileIdentificationV4 />;
      default:
        return null;
    }
  };

  // Render Institutional Banner based on version
  const renderInstitutionalBanner = () => {
    switch (config.institutionalBannerVersion) {
      case 1:
        return <InstitutionalBannerV1 />;
      case 2:
        return <InstitutionalBannerV2 />;
      case 3:
        return <InstitutionalBannerV3 />;
      case 4:
        return <InstitutionalBannerV4 />;
      default:
        return <InstitutionalBannerV1 />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Profile Identification (V3 is sticky banner) */}
      {config.profileIdentificationVersion === 3 && renderProfileIdentification()}

      {/* Navbar */}
      {renderNavbar()}

      {/* Profile Modal (V1 only) */}
      {config.profileIdentificationVersion === 1 && renderProfileIdentification()}

      {/* Main Hero Content */}
      <main className="pt-16">
        {/* Brand Identity / Hero Visual */}
        {renderBrandIdentity()}

        {/* CTA Section (if not integrated in brand identity) */}
        {config.brandIdentityVersion === 1 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderCta()}
          </div>
        )}

        {/* Profile Identification (V2 is inline cards) */}
        {config.profileIdentificationVersion === 2 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {renderProfileIdentification()}
          </div>
        )}

        {/* Institutional Banner */}
        {renderInstitutionalBanner()}

        {/* Social Proof */}
        {renderSocialProof()}
      </main>
    </div>
  );
};

export default HeroSection;
