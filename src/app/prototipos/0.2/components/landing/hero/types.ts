/**
 * Shared TypeScript interfaces for Hero Section components
 * BaldeCash - Hero Section 2.0
 */

export interface InstitutionalBannerProps {
  institutionName: string; // Ej: "UPN", "UPC", "USIL"
  institutionLogo?: string; // URL del logo
  hasSpecialConditions: boolean;
  customMessage?: string;
}

export interface MenuItem {
  label: string;
  href: string;
}

export interface CTAButton {
  label: string;
  href: string;
  isButton?: boolean;
}

export interface Institution {
  name: string;
  logo: string;
  featured?: boolean;
}

export interface SocialProofProps {
  studentCount: number;
  institutions: Institution[];
  awards?: string[];
  reviews?: Review[];
}

export interface Review {
  name: string;
  institution: string;
  rating: number;
  comment: string;
  avatar?: string;
}

export interface ProfileIdentificationProps {
  onResponse?: (isStudent: boolean) => void;
}
