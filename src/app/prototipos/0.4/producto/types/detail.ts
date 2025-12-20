// Detail Section Types - BaldeCash v0.4
// Generated from PROMPT_04_DETALLE_PRODUCTO.md
// V1 = preferred version from 0.3 feedback

// ============================================
// Configuration Types
// ============================================

export type DetailVersion = 1 | 2 | 3 | 4 | 5 | 6;

export interface ProductDetailConfig {
  // NEW - Info Header (product info section)
  infoHeaderVersion: DetailVersion;

  // Gallery (V1 = thumbnails inferiores from 0.3 V2)
  galleryVersion: DetailVersion;

  // Tabs/Layout (V1 = scroll continuo from 0.3 V3)
  tabsVersion: DetailVersion;

  // Specs (V1 = acordeon with fixed spacing from 0.3 V3)
  specsVersion: DetailVersion;

  // Pricing (all versions: no price, only quota)
  pricingVersion: DetailVersion;

  // Similar Products (focus on quota variation)
  similarProductsVersion: DetailVersion;

  // Limitations (V1 = collapsible from 0.3 V2)
  limitationsVersion: DetailVersion;

  // Certifications
  certificationsVersion: DetailVersion;
}

export const defaultDetailConfig: ProductDetailConfig = {
  infoHeaderVersion: 1,
  galleryVersion: 1,
  tabsVersion: 1,
  specsVersion: 1,
  pricingVersion: 1,
  similarProductsVersion: 1,
  limitationsVersion: 1,
  certificationsVersion: 1,
};

// ============================================
// Product Types
// ============================================

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  type: 'main' | 'gallery' | 'detail';
}

export interface ProductSpec {
  category: string;
  icon: string;
  specs: SpecItem[];
}

export interface SpecItem {
  label: string;
  value: string;
  tooltip?: string;
  highlight?: boolean;
}

export interface ProductPort {
  name: string;
  icon: string;
  count: number;
  position: 'left' | 'right' | 'back';
}

export interface ProductSoftware {
  name: string;
  icon: string;
  included: boolean;
  description?: string;
}

export interface ProductFeature {
  icon: string;
  title: string;
  description: string;
}

export interface ProductBadge {
  type: 'os' | 'battery' | 'stock' | 'promo' | 'new';
  icon?: string;
  text: string;
  variant?: 'primary' | 'success' | 'warning' | 'info';
}

export interface ProductDetail {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  lowestQuota: number;
  originalQuota?: number; // For showing crossed-out quota
  images: ProductImage[];
  description: string;
  shortDescription: string;
  specs: ProductSpec[];
  ports: ProductPort[];
  software: ProductSoftware[];
  features: ProductFeature[];
  badges: ProductBadge[];
  batteryLife: string;
  fastCharge?: string;
  hasOS: boolean;
  osName?: string;
  warranty: string;
  stock: number;
  rating: number;
  reviewCount: number;
}

// ============================================
// Payment Types (Updated for 0.4)
// ============================================

export type InitialPaymentPercentage = 0 | 10 | 20 | 30;

export interface PaymentPlan {
  term: number;
  monthlyQuota: number;
  originalQuota?: number; // For crossed-out display
  initialPaymentPercent: InitialPaymentPercentage;
  initialPaymentAmount: number;
}

// ============================================
// Similar Products Types (Updated for 0.4)
// ============================================

export interface SimilarProduct {
  id: string;
  name: string;
  thumbnail: string;
  monthlyQuota: number;
  quotaDifference: number; // Positive = more expensive, Negative = cheaper
  matchScore: number;
  differentiators: string[];
  slug: string;
}

// ============================================
// Limitations Types
// ============================================

export interface ProductLimitation {
  category: string;
  description: string;
  severity: 'info' | 'warning';
  alternative?: string;
  icon: string;
}

// ============================================
// Certifications Types
// ============================================

export interface Certification {
  code: string;
  name: string;
  logo: string;
  description: string;
  learnMoreUrl?: string;
}

// ============================================
// Props Types
// ============================================

export interface ProductInfoHeaderProps {
  product: ProductDetail;
}

export interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export interface DetailTabsProps {
  product: ProductDetail;
}

export interface SpecsProps {
  specs: ProductSpec[];
}

export interface PricingCalculatorProps {
  monthlyQuota: number;
  originalQuota?: number;
  defaultTerm?: number;
}

export interface SimilarProductsProps {
  products: SimilarProduct[];
  currentQuota: number;
}

export interface ProductLimitationsProps {
  limitations: ProductLimitation[];
}

export interface CertificationsProps {
  certifications: Certification[];
}

// ============================================
// Version Descriptions (for Settings Modal)
// V1 = PREFERRED from 0.3 feedback
// ============================================

export const versionDescriptions = {
  infoHeader: {
    1: 'Layout actual (badges + info vertical)',
    2: 'Layout compacto (mobile-optimized)',
    3: 'Layout con chips flotantes',
    4: 'Layout hero (nombre prominente)',
    5: 'Layout split (info izq, badges der)',
    6: 'Layout interactivo (badges expandibles)',
  },
  gallery: {
    1: 'Thumbnails inferiores + zoom hover',
    2: 'Thumbnails laterales + zoom modal',
    3: 'Carousel swipeable + pinch-to-zoom',
    4: 'Preview flotante + stats overlay',
    5: 'Hero fullscreen + masonry grid',
    6: 'Visor 360 interactivo + hotspots',
  },
  tabs: {
    1: 'Scroll continuo + nav sticky lateral',
    2: 'Tabs horizontales clasicos',
    3: 'Acordeon colapsable',
    4: 'Tabs con iconos animados',
    5: 'Split layout (info izq, tabs der)',
    6: 'Tabs con preview on hover',
  },
  specs: {
    1: 'Acordeon con spacing corregido',
    2: 'Cards grid por categoria',
    3: 'Tabla 2 columnas clasica',
    4: 'Chips flotantes con valores',
    5: 'Grid filtrable por nivel tecnico',
    6: 'Tabla con toggles expandibles',
  },
  pricing: {
    1: 'Botones de plazo compactos',
    2: 'Slider de plazo visual',
    3: 'Botones de plazo + cuota inicial',
    4: 'Cards por plazo con animacion',
    5: 'Timeline visual de cuotas',
    6: 'Calculadora gamificada con progreso',
  },
  similarProducts: {
    1: 'Grid con variacion de cuota',
    2: 'Carousel horizontal con cuotas',
    3: 'Grid 3 columnas con delta cuota',
    4: 'Cards flotantes con hover preview',
    5: 'Collage visual + modal comparacion',
    6: 'Quiz interactivo',
  },
  limitations: {
    1: 'Collapsible "Ver limitaciones"',
    2: 'Seccion visible "Considera que..."',
    3: 'Tooltips en specs afectados',
    4: 'Badge flotante "Info importante"',
    5: 'Panel lateral con consideraciones',
    6: 'Checklist interactivo',
  },
  certifications: {
    1: 'Logos pequenos inline',
    2: 'Logos + nombre + tooltip',
    3: 'Cards expandibles con detalle',
    4: 'Logos flotantes con hover info',
    5: 'Panel lateral con certificaciones',
    6: 'Certificaciones interactivas expandibles',
  },
} as const;
