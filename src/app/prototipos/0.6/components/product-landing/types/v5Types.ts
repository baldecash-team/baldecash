export type MacbookNeoColor = 'silver' | 'blush' | 'citrus' | 'indigo';

export type V5SectionId =
  | 'hero'
  | 'benefits'
  | 'highlights'
  | 'design'
  | 'financing'
  | 'performance'
  | 'display'
  | 'product-viewer'
  | 'social-proof'
  | 'lead-form'
  | 'footer';

// Hero
export interface V5HeroData {
  eyebrow: string;
  headline: string;
  ctaPrimary: { label: string; scrollTo: string };
  ctaSecondary: { label: string; scrollTo: string };
  poster: string;
  frameCount: number;
}

// Highlight cards (MediaCardGallery)
export interface V5HighlightCard {
  id: string;
  label: string;
  caption: string;
  image: string;
  theme?: 'light' | 'dark';
  isBaldeCash?: boolean;
}

// Design section (TextOverMedia)
export interface V5DesignData {
  headline: string;
  description: string;
  ctaLabel: string;
  ctaScrollTo: string;
  image: string;
}

// Financing plan color option
export interface V5PlanColorOption {
  id: string;
  label: string;
  hex: string;
  productUrl: string;
}

// Financing plans
export interface V5FinancingPlan {
  id: string;
  nombre: string;
  subtitulo: string;
  descripcion: string;
  cuotaMensual: number;
  plazoMeses: number;
  cuotaInicial: number;
  icono: 'Zap' | 'Star' | 'Crown';
  imagen: string;
  items: string[];
  ahorroText: string;
  colorAccent: string;
  destacado?: boolean;
  colorOptions?: V5PlanColorOption[];
}

// Performance chapters
export interface V5PerformanceChapter {
  id: string;
  title: string;
  description: string;
  image: string;
  reversed?: boolean;
}

export interface V5PerformanceData {
  eyebrow: string;
  headline: string;
  description: string;
  chapters: V5PerformanceChapter[];
  batteryLabel: string;
  batteryValue: string;
}

// Display, Camera, Audio
export interface V5DCAChapter {
  id: string;
  title: string;
  description: string;
  image: string;
  stats?: { value: string; label: string }[];
}

// Product Viewer
export interface V5ProductViewerItem {
  id: string;
  label: string;
  title: string;
  description: string;
  type: 'color-selector' | 'image' | 'video';
  mediaId: string;
}

export interface V5ProductViewerData {
  headline: string;
  items: V5ProductViewerItem[];
  colors: { id: MacbookNeoColor; label: string }[];
}

// Social proof testimonials
export interface V5Testimonial {
  id: string;
  nombre: string;
  universidad: string;
  quote: string;
}

// Nav
export interface V5NavLink {
  label: string;
  sectionId: V5SectionId;
}

// Benefits bar
export interface V5Benefit {
  id: string;
  icon: string;
  texto: string;
}

// Lead form
export interface V5LeadFormData {
  nombre: string;
  correo: string;
  whatsapp: string;
  dni: string;
  institucionId: string;
  aceptaTerminos: boolean;
  aceptaPromociones: boolean;
}

// Institution
export interface V5Institucion {
  id: string;
  nombre: string;
}
