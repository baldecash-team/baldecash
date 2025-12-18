// Detail Section Types - BaldeCash v0.3
// Generated from PROMPT_04_DETALLE_PRODUCTO.md

// ============================================
// Configuration Types
// ============================================

export interface DetailConfig {
  galleryVersion: 1 | 2 | 3;
  tabsVersion: 1 | 2 | 3;
  specsDisplayVersion: 1 | 2 | 3;
  specsOrganizationVersion: 1 | 2 | 3;
  tooltipsVersion: 1 | 2 | 3;
  limitationsVersion: 1 | 2 | 3;
  similarProductsVersion: 1 | 2 | 3;
  certificationsVersion: 1 | 2 | 3;
}

export const defaultDetailConfig: DetailConfig = {
  galleryVersion: 1,
  tabsVersion: 1,
  specsDisplayVersion: 1,
  specsOrganizationVersion: 1,
  tooltipsVersion: 1,
  limitationsVersion: 1,
  similarProductsVersion: 1,
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
  images: ProductImage[];
  description: string;
  shortDescription: string;
  specs: ProductSpec[];
  ports: ProductPort[];
  software: ProductSoftware[];
  features: ProductFeature[];
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
// Payment Types
// ============================================

export interface PaymentPlan {
  term: number;
  monthlyQuota: number;
  totalAmount: number;
  interestRate: number;
  interestAmount: number;
}

export interface PaymentScheduleRow {
  cuotaNumber: number;
  dueDate: string;
  amount: number;
  principal: number;
  interest: number;
  balance: number;
}

// ============================================
// Similar Products Types
// ============================================

export interface SimilarProduct {
  id: string;
  name: string;
  thumbnail: string;
  price: number;
  lowestQuota: number;
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

export interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export interface DetailTabsProps {
  product: ProductDetail;
  specsVersion: 1 | 2 | 3;
  tooltipsVersion: 1 | 2 | 3;
}

export interface SpecsProps {
  specs: ProductSpec[];
  tooltipsVersion: 1 | 2 | 3;
}

export interface PricingCalculatorProps {
  basePrice: number;
  discount?: number;
  monthlyRate?: number;
}

export interface PaymentScheduleProps {
  amount: number;
  term: number;
  monthlyRate: number;
}

export interface SimilarProductsProps {
  products: SimilarProduct[];
  currentProductId: string;
}

export interface ProductLimitationsProps {
  limitations: ProductLimitation[];
}

export interface CertificationsProps {
  certifications: Certification[];
}

// ============================================
// Version Descriptions (for Settings Modal)
// ============================================

export const versionDescriptions = {
  gallery: {
    1: 'Thumbnails laterales + zoom modal',
    2: 'Thumbnails inferiores + zoom hover',
    3: 'Carousel swipeable + pinch-to-zoom',
  },
  tabs: {
    1: 'Tabs horizontales tradicionales',
    2: 'Acordeon colapsable',
    3: 'Scroll continuo con nav sticky',
  },
  specsDisplay: {
    1: 'Tabla 2 columnas (Spec | Valor)',
    2: 'Cards grid con icono + label',
    3: 'Lista con iconos inline',
  },
  specsOrganization: {
    1: 'Top 15 + "Ver todas las specs"',
    2: 'Agrupados por relevancia',
    3: 'Todas las specs organizadas',
  },
  tooltips: {
    1: 'Icono (?) con tooltip hover',
    2: 'Link "Que significa?" modal',
    3: 'Texto explicativo siempre visible',
  },
  limitations: {
    1: 'Seccion "Considera que..." lista',
    2: 'Collapsible "Ver limitaciones"',
    3: 'Tooltips en specs afectados',
  },
  similarProducts: {
    1: 'Carousel horizontal (4 productos)',
    2: 'Grid 3 columnas',
    3: 'Panel lateral "Compara con..."',
  },
  certifications: {
    1: 'Solo logos pequenos',
    2: 'Logos + nombre + tooltip',
    3: 'Cards expandibles con detalle',
  },
} as const;
