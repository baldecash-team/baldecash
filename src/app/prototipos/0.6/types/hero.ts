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
  title?: string;
  subtitle?: string;
  chipText?: string;
  titleTemplate?: string;
  highlightWord?: string;
  testimonialsSubtitle?: string;
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
  backgroundImage?: string;
  badgeText?: string;
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
  badgeText?: string;
  underlineStyle?: UnderlineStyle;
  /** Landing slug for dynamic URL building */
  landing?: string;
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
  platform: 'instagram' | 'facebook' | 'tiktok' | 'whatsapp' | 'twitter' | 'linkedin' | 'youtube';
  url: string;
  label?: string;
}

export interface FooterNewsletter {
  title: string;
  description: string;
  placeholder: string;
  button_text: string;
}

// Footer component data from API (content_config)
export interface FooterComponentData {
  tagline?: string;
  columns?: FooterNavSection[];
  newsletter?: FooterNewsletter;
  sbs_text?: string;
  copyright_text?: string;
  social_links?: { platform: string; url: string }[];
}

// ============================================
// Company Info Types (from company_info table)
// ============================================

export interface CompanySocialLinks {
  facebook?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
}

export interface CompanyData {
  name?: string | null;
  legal_name?: string | null;
  logo_url?: string | null;
  main_phone?: string | null;
  main_email?: string | null;
  website_url?: string | null;
  customer_portal_url?: string | null;
  support_phone?: string | null;
  support_email?: string | null;
  support_whatsapp?: string | null;
  support_hours?: string | null;
  sbs_registration?: string | null;
  social_links?: CompanySocialLinks | null;
}

// Combined Footer data for rendering
export interface FooterData {
  // From component
  tagline?: string;
  columns?: FooterNavSection[];
  newsletter?: FooterNewsletter;
  sbs_text?: string;
  copyright_text?: string;
  social_links?: { platform: string; url: string }[];
  // From company_info
  company?: CompanyData;
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
  title?: string;
  subtitle?: string;
  stepLabel?: string;
  stepsTitle?: string;
  requirementsTitle?: string;
  steps: HowItWorksStep[];
  requirements: Requirement[];
  availableTerms: number[];
}

export interface HowItWorksProps {
  data: HowItWorksData;
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
  title?: string;
  subtitle?: string;
  items: FaqItem[];
  categories?: string[];
  categoryIcons?: Record<string, string>;
  categoryColors?: Record<string, string>;
}

export interface FaqSectionProps {
  data: FaqData;
  underlineStyle?: UnderlineStyle;
}

// ============================================
// CTA Section Types
// ============================================

export interface CtaButton {
  text: string;
  text_line2?: string;
  url?: string;
}

export interface LegalLink {
  text: string;
  url: string;
}

export interface LegalLinks {
  terms: LegalLink;
  privacy: LegalLink;
}

export interface CtaData {
  buttons: {
    catalog: CtaButton;
    quiz: CtaButton;
    whatsapp: CtaButton;
  };
  responseTime: string;
  microcopy?: string;
  highlightWord?: string;
  legalLinks?: LegalLinks;
}

export interface HeroCtaProps {
  data?: CtaData;
  onCtaClick?: () => void;
  onQuizOpen?: () => void;
  /** Landing slug for dynamic URL building */
  landing?: string;
}

// ============================================
// Promo Banner Types
// ============================================

export interface PromoBannerData {
  text: string;
  highlight?: string;
  ctaText?: string;
  ctaUrl?: string;
  icon?: string;
  dismissible?: boolean;
}

// ============================================
// Catalog Secondary Navbar Types
// ============================================

export interface CatalogSecondaryNavbarSearchConfig {
  placeholder: string;
}

export interface CatalogSecondaryNavbarWishlistConfig {
  title: string;
  empty_title: string;
  empty_description: string;
  empty_cta: string;
  clear_button: string;
  clear_all_button: string;
  remove_button: string;
  compare_button: string;
  in_compare_button: string;
}

export interface CatalogSecondaryNavbarCartConfig {
  title: string;
  empty_title: string;
  empty_description: string;
  clear_button: string;
  close_button: string;
  continue_button: string;
  multiple_items_alert: string;
}

export interface CatalogSecondaryNavbarData {
  search: CatalogSecondaryNavbarSearchConfig;
  wishlist: CatalogSecondaryNavbarWishlistConfig;
  cart: CatalogSecondaryNavbarCartConfig;
}

// ============================================
// Navbar Types
// ============================================

export interface NavbarItemData {
  label: string;
  href: string;
  section: string | null;
  has_megamenu?: boolean;
}

export interface MegaMenuItemData {
  label: string;
  href: string;
  icon: string;
  description: string;
}
