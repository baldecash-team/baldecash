// Hero Section Types - BaldeCash v0.4
// Generated from PROMPT_01_HERO_LANDING.md
// 6 versiones por componente para A/B testing

import { ReactNode } from 'react';

// ============================================
// Configuration Types (6 versions each)
// ============================================

export type HeroVersion = 1 | 2 | 3 | 4 | 5 | 6;

// Estilos de subrayado para headlines
export type UnderlineStyle = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeroConfig {
  heroBannerVersion: HeroVersion;
  underlineStyle: UnderlineStyle;
  socialProofVersion: HeroVersion;
  navbarVersion: HeroVersion;
  ctaVersion: HeroVersion;
  footerVersion: HeroVersion;
  howItWorksVersion: HeroVersion;
  faqVersion: HeroVersion;
}

export const defaultHeroConfig: HeroConfig = {
  heroBannerVersion: 1,
  underlineStyle: 1,
  socialProofVersion: 1,
  navbarVersion: 1,
  ctaVersion: 1,
  footerVersion: 1,
  howItWorksVersion: 1,
  faqVersion: 1,
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

export interface HeroBannerProps {
  headline: string;
  subheadline: string;
  minQuota: number;
  imageSrc?: string;
  primaryCta?: CtaConfig;
  secondaryCta?: CtaConfig;
  trustSignals?: TrustSignal[];
  underlineStyle?: UnderlineStyle;
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

export interface FooterProps {
  data: FooterData;
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
// Timeline Step Types
// ============================================

export interface TimelineStep {
  id: number;
  title: string;
  description?: string;
  icon?: string;
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
}

// ============================================
// Version Descriptions (for Settings Modal)
// ============================================

export const versionDescriptions = {
  heroBanner: {
    1: 'Foto Producto (E-commerce Clásico)',
    2: 'Foto Lifestyle (Aspiracional)',
    3: 'Ilustración Flat (Corporativo Moderno)',
    4: 'Fintech/Data (Abstracto Flotante)',
    5: 'Centrado Hero (Impacto Máximo)',
    6: 'Storytelling (Narrativa Emocional)',
  },
  underline: {
    1: 'Onda SVG (curva elegante)',
    2: 'Línea Punteada (dashed)',
    3: 'Línea Sólida (simple)',
    4: 'Sin Subrayado (limpio)',
    5: 'Marcador Resaltador (highlight)',
    6: 'Doble Línea (énfasis)',
  },
  socialProof: {
    1: 'Marquee Continuo (logos en movimiento)',
    2: 'Grid Estático (todos los logos)',
    3: 'Contador + Logos (número grande)',
    4: 'Carrusel Manual (flechas)',
    5: 'Testimonios con Logo (rotación)',
    6: 'Video Testimonial Thumbnail',
  },
  navbar: {
    1: 'Sticky Sólido (siempre visible)',
    2: 'Hide on Scroll Down (aparece al subir)',
    3: 'Transparente a Sólido (scroll effect)',
    4: 'Hamburger Siempre (fullscreen menu)',
    5: 'Search Prominente (e-commerce style)',
    6: 'Mega Menu + Badge Notificación',
  },
  cta: {
    1: 'Botón Simple (Ver equipos)',
    2: 'Precio en Botón (Desde S/49/mes)',
    3: 'Dual CTA (primario + secundario)',
    4: 'Con Urgencia (countdown timer)',
    5: 'Pre-calificación (Descubre tu monto)',
    6: 'WhatsApp Directo (botón verde)',
  },
  footer: {
    1: 'Minimalista Oscuro (neutral-900)',
    2: 'Columnas Claro (neutral-100)',
    3: 'Con CTA WhatsApp (fondo primario)',
    4: 'Mega Footer (muchos links)',
    5: 'Compacto (una línea)',
    6: 'Con Trust Badges (certificaciones)',
  },
  howItWorks: {
    1: 'Timeline Horizontal (iconos + pasos)',
    2: 'Cards Grid (3 columnas)',
    3: 'Vertical con Línea (scroll reveal)',
    4: 'Minimal (solo iconos)',
    5: 'Con Requisitos (expandido)',
    6: 'Interactivo (hover reveal)',
  },
  faq: {
    1: 'Acordeón Simple (básico)',
    2: 'Acordeón con Iconos (categorizado)',
    3: 'Grid de Cards (preview visible)',
    4: 'Tabs por Categoría',
    5: 'Búsqueda + Acordeón',
    6: 'Chatbot Style (conversacional)',
  },
} as const;
