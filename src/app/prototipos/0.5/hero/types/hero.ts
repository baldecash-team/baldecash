// Hero Section Types - BaldeCash v0.5 (Simplificado)

import { ReactNode } from 'react';

// ============================================
// Underline Style (para headlines)
// ============================================

export type UnderlineStyle = 1 | 2 | 3 | 4 | 5 | 6;

// ============================================
// Institution Types
// ============================================

export type AgreementType = 'convenio_marco' | 'convenio_especifico' | 'alianza';

export interface Institution {
  id: string;
  code: string;
  name: string;
  shortName: string;
  logo: string;
  hasAgreement: boolean;
  agreementType?: AgreementType;
  specialConditions?: string;
}

// ============================================
// Social Proof Types
// ============================================

export interface MediaLogo {
  name: string;
  logo: string;
  url?: string;
}

export interface SocialProofData {
  studentCount: number;
  institutionCount: number;
  yearsInMarket: number;
  institutions: Institution[];
  mediaLogos: MediaLogo[];
}

// ============================================
// Trust & CTA Types
// ============================================

export interface TrustSignal {
  icon: string;
  text: string;
  tooltip?: string;
}

export type CtaVariant = 'primary' | 'secondary' | 'outline';

export interface CtaConfig {
  text: string;
  href: string;
  icon?: string;
  variant: CtaVariant;
}

// ============================================
// Hero Content Types
// ============================================

export interface HeroContent {
  headline: string;
  subheadline: string;
  primaryCta: CtaConfig;
  secondaryCta?: CtaConfig;
  minQuota: number;
  trustSignals: TrustSignal[];
}

// ============================================
// Component Props Types
// ============================================

export interface NavItem {
  label: string;
  href: string;
  isActive?: boolean;
}

export interface HeroBannerProps {
  headline: string;
  subheadline: string;
  minQuota: number;
  imageSrc?: string;
  primaryCta?: CtaConfig;
  secondaryCta?: CtaConfig;
  trustSignals?: TrustSignal[];
  underlineStyle?: UnderlineStyle;
  isCleanMode?: boolean;
}

export interface SocialProofProps {
  data: SocialProofData;
  underlineStyle?: UnderlineStyle;
}

// ============================================
// Footer Types
// ============================================

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterNavSection {
  title: string;
  links: FooterLink[];
}

export interface FooterSocialLink {
  platform: 'instagram' | 'facebook' | 'tiktok' | 'whatsapp';
  url: string;
  label: string;
}

export interface FooterData {
  logo: { text: string; tagline: string };
  navigation: FooterNavSection[];
  social: FooterSocialLink[];
  contact: { phone?: string; whatsapp?: string; email?: string };
  certifications: { name: string; icon: string; description: string }[];
  legal: { copyright: string; links: FooterLink[] };
}

// ============================================
// Testimonial Types
// ============================================

export interface Testimonial {
  id: string;
  name: string;
  institution: string;
  quote: string;
  avatar?: string;
  rating?: number;
}

// ============================================
// How It Works Types
// ============================================

export interface HowItWorksStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  color?: string;
}

export interface Requirement {
  id: number;
  text: string;
  icon?: string;
}

export interface HowItWorksData {
  steps: HowItWorksStep[];
  requirements: Requirement[];
  availableTerms: number[];
}

export interface HowItWorksProps {
  data?: HowItWorksData;
  underlineStyle?: UnderlineStyle;
}

// ============================================
// FAQ Types
// ============================================

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface FaqData {
  items: FaqItem[];
  categories?: string[];
}

export interface FaqSectionProps {
  data?: FaqData;
  underlineStyle?: UnderlineStyle;
}
