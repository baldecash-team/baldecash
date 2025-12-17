// Hero Section Types - BaldeCash v0.3
// Generated from PROMPT_01_HERO_LANDING.md

import { ReactNode } from 'react';

// ============================================
// Configuration Types
// ============================================

export interface HeroConfig {
  brandIdentityVersion: 1 | 2 | 3;
  profileIdentificationVersion: 1 | 2 | 3 | 4;
  institutionalBannerVersion: 1 | 2 | 3 | 4;
  socialProofVersion: 1 | 2 | 3;
  navbarVersion: 1 | 2 | 3;
  ctaVersion: 1 | 2 | 3;
}

export const defaultHeroConfig: HeroConfig = {
  brandIdentityVersion: 1,
  profileIdentificationVersion: 2,
  institutionalBannerVersion: 1,
  socialProofVersion: 1,
  navbarVersion: 1,
  ctaVersion: 1,
};

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
// Calculator Types
// ============================================

export interface QuotaCalculatorConfig {
  minAmount: number;
  maxAmount: number;
  defaultAmount: number;
  terms: number[];
  monthlyRate: number;
}

// ============================================
// Component Props Types
// ============================================

export interface NavbarProps {
  logoSrc?: string;
  items?: NavItem[];
  onLogin?: () => void;
}

export interface NavItem {
  label: string;
  href: string;
  isActive?: boolean;
}

export interface BrandIdentityProps {
  headline: string;
  subheadline: string;
  minQuota: number;
  imageSrc?: string;
}

export interface SocialProofProps {
  data: SocialProofData;
}

export interface HeroCtaProps {
  primaryCta: CtaConfig;
  secondaryCta?: CtaConfig;
  minQuota: number;
  showSecurityBadge?: boolean;
}

export interface ProfileIdentificationProps {
  onSelectProfile?: (profile: 'student' | 'other') => void;
  onDismiss?: () => void;
}

export interface InstitutionalBannerProps {
  institution?: Institution;
  onSearch?: () => void;
}

export interface QuotaCalculatorProps {
  config: QuotaCalculatorConfig;
  onCalculate?: (amount: number, term: number, quota: number) => void;
}

export interface HeroSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: HeroConfig;
  onConfigChange: (config: HeroConfig) => void;
}

// ============================================
// Version Descriptions (for Settings Modal)
// ============================================

export const versionDescriptions = {
  brandIdentity: {
    1: 'Imagen de estudiante con laptop (aspiracional)',
    2: 'Producto destacado con specs resumidas (e-commerce)',
    3: 'Ilustración abstracta + mensaje potente (moderno)',
  },
  profileIdentification: {
    1: 'Modal centrado al entrar',
    2: 'Cards integradas en hero',
    3: 'Banner sticky superior',
    4: 'Sin sección (sin fricción)',
  },
  institutionalBanner: {
    1: 'Banner horizontal debajo del hero',
    2: 'Chip flotante junto al logo',
    3: 'Sección dedicada con beneficios',
    4: 'Sin sección',
  },
  socialProof: {
    1: 'Logos en movimiento (marquee)',
    2: 'Grid estático con todos los logos',
    3: 'Contador grande + logos destacados',
  },
  navbar: {
    1: 'Sticky siempre visible (sólido)',
    2: 'Oculta al bajar, aparece al subir',
    3: 'Transparente que se vuelve sólido',
  },
  cta: {
    1: 'Ver laptops disponibles (acción directa)',
    2: 'Desde S/49/mes - Solicitar ahora (precio)',
    3: 'Descubre tu monto disponible (pre-calificación)',
  },
} as const;
