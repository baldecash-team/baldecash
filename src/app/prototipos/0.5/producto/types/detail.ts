// Detail Section Types - BaldeCash v0.5
// Simplified version with fixed configuration

// ============================================
// Device Type Configuration (Iterable)
// ============================================

export type DeviceType = 'laptop' | 'tablet' | 'celular';

// Cronograma Versions
export type CronogramaVersion = 1 | 2 | 3;

export interface DetalleConfig {
  deviceType: DeviceType;
  cronogramaVersion: CronogramaVersion;
}

export const defaultDetalleConfig: DetalleConfig = {
  deviceType: 'laptop',
  cronogramaVersion: 2,
};

export const cronogramaVersionLabels: Record<CronogramaVersion, { name: string; description: string }> = {
  1: {
    name: 'Simple',
    description: 'Tabla básica con cuota, fecha y monto',
  },
  2: {
    name: 'Detallado',
    description: 'Incluye capital, interés y saldo restante',
  },
  3: {
    name: 'Cards',
    description: 'Vista en tarjetas compactas',
  },
};

export const deviceTypeLabels: Record<DeviceType, { name: string; description: string }> = {
  laptop: {
    name: 'Laptop',
    description: 'Computadora portátil con teclado integrado',
  },
  tablet: {
    name: 'Tablet',
    description: 'Dispositivo táctil con pantalla grande',
  },
  celular: {
    name: 'Celular',
    description: 'Smartphone con conectividad móvil',
  },
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

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
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
  originalQuota?: number;
  images: ProductImage[];
  colors: ProductColor[];
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
// Payment Types
// ============================================

export type InitialPaymentPercentage = 0 | 10 | 20 | 30;

export interface PaymentPlan {
  term: number;
  monthlyQuota: number;
  originalQuota?: number;
  initialPaymentPercent: InitialPaymentPercentage;
  initialPaymentAmount: number;
}

// ============================================
// Similar Products Types
// ============================================

export interface SimilarProductColor {
  id: string;
  name: string;
  hex: string;
}

export interface SimilarProduct {
  id: string;
  name: string;
  brand: string;
  thumbnail: string;
  images?: string[]; // Para galería con miniaturas
  colors?: SimilarProductColor[]; // Para selector de colores
  monthlyQuota: number;
  quotaDifference: number;
  matchScore: number;
  differentiators: string[];
  slug: string;
  // Specs para mostrar en card estilo catálogo
  specs?: {
    processor: string;
    ram: string;
    storage: string;
    display: string;
  };
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
  selectedColorId: string;
  onColorSelect: (colorId: string) => void;
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
  paymentPlans: PaymentPlan[];
  defaultTerm?: number;
  productPrice?: number;
}

export interface SimilarProductsProps {
  products: SimilarProduct[];
  currentQuota: number;
  isCleanMode?: boolean;
}

export interface ProductLimitationsProps {
  limitations: ProductLimitation[];
}

export interface CertificationsProps {
  certifications: Certification[];
}

export interface CronogramaProps {
  paymentPlans: PaymentPlan[];
  term?: number;
  startDate?: Date;
  version?: CronogramaVersion;
}

export interface PortsDisplayProps {
  ports: ProductPort[];
}
