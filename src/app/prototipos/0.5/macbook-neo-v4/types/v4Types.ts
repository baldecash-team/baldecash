export type MacbookNeoColor = 'silver' | 'blush' | 'citrus' | 'indigo';
export type Breakpoint = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';

// Section IDs matching Apple's page
export type SectionId =
  | 'welcome'
  | 'highlights'
  | 'design'
  | 'product-viewer'
  | 'performance'
  | 'display'
  | 'apple-intelligence'
  | 'macos'
  | 'continuity'
  | 'new-to-mac'
  | 'security'
  | 'incentive'
  | 'help-me-choose'
  | 'contrast'
  | 'environment'
  | 'values'
  | 'index';

// Hero / Welcome
export interface HeroData {
  headline: string;
  tagline: string;
  price: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  poster: string;
  frameCount: number;
  framePathPattern: string;
}

// Highlights - MediaCardGallery with 7 cards
export interface HighlightCard {
  id: string;
  label: string;
  caption: string;
  image: string;
  theme?: 'light' | 'dark';
  ctaLabel?: string;
  ctaHref?: string;
}

// Design - TextOverMedia
export interface DesignData {
  headline: string;
  videoEndframe: string;
}

// Product Viewer - 8-item tour
export interface ProductViewerItem {
  id: string;
  label: string;
  title: string;
  description: string;
  type: 'color-selector' | 'image' | 'video';
  mediaId: string;
}

export interface ProductViewerData {
  headline: string;
  items: ProductViewerItem[];
  colors: { id: MacbookNeoColor; label: string }[];
}

// Performance - 4 chapters with video scrub
export interface PerformanceChapter {
  id: string;
  title: string;
  description: string;
  image: string;
  reversed?: boolean;
}

export interface PerformanceData {
  eyebrow: string;
  headline: string;
  description: string;
  chapters: PerformanceChapter[];
  batteryLabel: string;
  batteryValue: string;
}

// Display, Camera, Audio
export interface DCAChapter {
  id: string;
  title: string;
  description: string;
  image: string;
  stats?: { value: string; label: string }[];
}

// Apple Intelligence
export interface AIFeature {
  id: string;
  title: string;
  description: string;
  image: string;
  wide?: boolean;
}

// macOS
export interface MacOSFeature {
  id: string;
  title: string;
  description: string;
  image: string;
  wide?: boolean;
  hasVideo?: boolean;
}

// Continuity - FadeGallery with 6 tabs
export interface ContinuityTab {
  id: string;
  label: string;
  image: string;
}

// New to Mac
export interface NewToMacFeature {
  id: string;
  title: string;
  description: string;
  image: string;
  wide?: boolean;
}

// Security
export interface SecurityFeature {
  id: string;
  title: string;
  description: string;
  image: string;
  wide?: boolean;
}

// Incentive
export interface IncentiveCard {
  id: string;
  headline: string;
  description: string;
  image: string;
  ctaLabel?: string;
  ctaHref?: string;
}

// Environment & Values
export interface ValueCard {
  id: string;
  icon: string;
  headline: string;
  description: string;
  link?: { label: string; href: string };
}

// Nav
export interface NavLink {
  label: string;
  sectionId: SectionId;
}

// Financing (BaldeCash specific)
export interface FinancingPlan {
  id: string;
  nombre: string;
  cuotaMensual: number;
  plazoMeses: number;
  cuotaInicial: number;
  precioTotal: number;
  destacado?: boolean;
}
