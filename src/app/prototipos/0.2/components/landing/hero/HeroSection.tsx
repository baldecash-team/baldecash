"use client";

import { Navigation } from "./Navigation";
import { BrandIdentity } from "./BrandIdentity";
import { ProfileIdentificationV1 } from "./ProfileIdentificationV1";
import { ProfileIdentificationV2 } from "./ProfileIdentificationV2";
import { ProfileIdentificationV3 } from "./ProfileIdentificationV3";
import { InstitutionalBannerV1 } from "./InstitutionalBannerV1";
import { InstitutionalBannerV2 } from "./InstitutionalBannerV2";
import { InstitutionalBannerV3 } from "./InstitutionalBannerV3";
import { SocialProofV1 } from "./SocialProofV1";
import { SocialProofV2 } from "./SocialProofV2";
import { SocialProofV3 } from "./SocialProofV3";
import { HeroCTAV1 } from "./HeroCTAV1";
import { HeroCTAV2 } from "./HeroCTAV2";
import { HeroCTAV3 } from "./HeroCTAV3";

/**
 * HeroSection - Componente principal integrador
 *
 * Integra todos los sub-componentes del Hero Section
 * Permite configurar qué versión de cada componente mostrar
 */

interface HeroSectionProps {
  // Version selectors (1, 2, or 3)
  profileIdentificationVersion?: 1 | 2 | 3;
  institutionalBannerVersion?: 1 | 2 | 3;
  socialProofVersion?: 1 | 2 | 3;
  ctaVersion?: 1 | 2 | 3;

  // Optional institutional data
  institution?: {
    name: string;
    logo?: string;
    hasSpecialConditions: boolean;
    customMessage?: string;
  };

  // Social proof data
  socialProof?: {
    studentCount: number;
    institutions: Array<{
      name: string;
      logo: string;
      featured?: boolean;
    }>;
  };

  // Callbacks
  onProfileResponse?: (isStudent: boolean) => void;
}

export const HeroSection = ({
  profileIdentificationVersion = 1,
  institutionalBannerVersion = 1,
  socialProofVersion = 1,
  ctaVersion = 1,
  institution,
  socialProof,
  onProfileResponse,
}: HeroSectionProps) => {
  // Profile Identification component selector
  const ProfileIdentificationComponent =
    profileIdentificationVersion === 1
      ? ProfileIdentificationV1
      : profileIdentificationVersion === 2
      ? ProfileIdentificationV2
      : ProfileIdentificationV3;

  // Institutional Banner component selector
  const InstitutionalBannerComponent =
    institutionalBannerVersion === 1
      ? InstitutionalBannerV1
      : institutionalBannerVersion === 2
      ? InstitutionalBannerV2
      : InstitutionalBannerV3;

  // Social Proof component selector
  const SocialProofComponent =
    socialProofVersion === 1
      ? SocialProofV1
      : socialProofVersion === 2
      ? SocialProofV2
      : SocialProofV3;

  // CTA component selector
  const CTAComponent =
    ctaVersion === 1 ? HeroCTAV1 : ctaVersion === 2 ? HeroCTAV2 : HeroCTAV3;

  // Default social proof data
  const defaultSocialProof = {
    studentCount: 5000,
    institutions: [
      { name: "UPN", logo: "/logos/upn.png", featured: true },
      { name: "UPC", logo: "/logos/upc.png", featured: true },
      { name: "USIL", logo: "/logos/usil.png", featured: true },
      { name: "UCAL", logo: "/logos/ucal.png", featured: true },
      { name: "UAP", logo: "/logos/uap.png", featured: false },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />

      {/* Institutional Banner (if institution data provided) */}
      {institution && (
        <InstitutionalBannerComponent
          institutionName={institution.name}
          institutionLogo={institution.logo}
          hasSpecialConditions={institution.hasSpecialConditions}
          customMessage={institution.customMessage}
        />
      )}

      {/* Hero Content Container */}
      <div className="relative">
        {/* Profile Identification */}
        <ProfileIdentificationComponent onResponse={onProfileResponse} />

        {/* Brand Identity */}
        <BrandIdentity />

        {/* CTA */}
        <CTAComponent />

        {/* Social Proof */}
        <SocialProofComponent
          studentCount={socialProof?.studentCount || defaultSocialProof.studentCount}
          institutions={socialProof?.institutions || defaultSocialProof.institutions}
        />
      </div>
    </div>
  );
};
