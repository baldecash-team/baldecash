/**
 * Hero Section Types - BaldeCash Web 3.0
 * Tipos TypeScript para el módulo Hero con sistema de versionado
 */

import type { ReactNode } from 'react';
import type { ComponentVersion } from '../../../_shared/types/config.types';

// ============================================
// CONFIGURACIÓN DE HERO
// ============================================

export interface HeroConfig {
  brandIdentityVersion: ComponentVersion;
  profileIdentificationVersion: ComponentVersion;
  institutionalBannerVersion: ComponentVersion;
  socialProofVersion: ComponentVersion;
  navbarVersion: ComponentVersion;
  ctaVersion: ComponentVersion;
}

export const DEFAULT_HERO_CONFIG: HeroConfig = {
  brandIdentityVersion: 1,
  profileIdentificationVersion: 1,
  institutionalBannerVersion: 1,
  socialProofVersion: 1,
  navbarVersion: 1,
  ctaVersion: 1,
};

// ============================================
// INSTITUCIONES
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
  featured?: boolean;
}

// ============================================
// SOCIAL PROOF
// ============================================

export interface MediaLogo {
  name: string;
  logo: string;
  url?: string;
}

export interface Review {
  name: string;
  institution: string;
  rating: number;
  comment: string;
  avatar?: string;
}

export interface SocialProofData {
  studentCount: number;
  institutionCount: number;
  yearsInMarket: number;
  institutions: Institution[];
  mediaLogos: MediaLogo[];
  reviews?: Review[];
  awards?: string[];
}

export interface SocialProofProps {
  studentCount: number;
  institutions: Institution[];
  awards?: string[];
  reviews?: Review[];
}

// ============================================
// TRUST SIGNALS
// ============================================

export interface TrustSignal {
  icon: ReactNode;
  text: string;
  tooltip?: string;
}

// ============================================
// CTA
// ============================================

export type CtaVariant = 'primary' | 'secondary' | 'outline';

export interface CtaConfig {
  text: string;
  href: string;
  icon?: ReactNode;
  variant: CtaVariant;
}

export interface HeroCtaProps {
  primaryCta: CtaConfig;
  secondaryCta?: CtaConfig;
  minQuota: number;
  trustSignals?: TrustSignal[];
}

// ============================================
// CONTENT
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
// CALCULADORA
// ============================================

export interface QuotaCalculatorConfig {
  minAmount: number;
  maxAmount: number;
  defaultAmount: number;
  terms: number[];
  monthlyRate: number;
}

// ============================================
// NAVIGATION
// ============================================

export interface MenuItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface CTAButton {
  label: string;
  href: string;
  isButton?: boolean;
}

export interface NavigationProps {
  menuItems?: MenuItem[];
  loginCta?: CTAButton;
  variant?: 'sticky' | 'hide-show' | 'transparent';
}

// ============================================
// PROFILE IDENTIFICATION
// ============================================

export interface ProfileIdentificationProps {
  onResponse?: (isStudent: boolean) => void;
  onDismiss?: () => void;
}

// ============================================
// INSTITUTIONAL BANNER
// ============================================

export interface InstitutionalBannerProps {
  institutionName: string;
  institutionLogo?: string;
  hasSpecialConditions: boolean;
  customMessage?: string;
}

// ============================================
// BRAND IDENTITY
// ============================================

export interface BrandIdentityProps {
  headline?: string;
  subheadline?: string;
  showCalculator?: boolean;
  calculatorConfig?: QuotaCalculatorConfig;
}
