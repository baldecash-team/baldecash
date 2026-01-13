// types/catalog.ts - BaldeCash Catalog Types v0.4

import { ReactNode } from 'react';

// ============================================
// Enums y tipos base
// ============================================

export type UsageType =
  | 'estudios'
  | 'gaming'
  | 'diseño'
  | 'oficina'
  | 'programacion';

export type SortOption =
  | 'recommended'
  | 'price_asc'
  | 'price_desc'
  | 'quota_asc'
  | 'newest'
  | 'popular';

export type QuotaFrequency = 'weekly' | 'biweekly' | 'monthly';

// Plazos disponibles para financiamiento
export type TermMonths = 12 | 18 | 24 | 36 | 48;

export const termOptions: TermMonths[] = [12, 18, 24, 36, 48];

export const termLabels: Record<TermMonths, string> = {
  12: '12 meses',
  18: '18 meses',
  24: '24 meses',
  36: '36 meses',
  48: '48 meses',
};

// Calcula la cuota mensual segun el plazo seleccionado
// Usa el precio base y aplica una tasa de interes implícita
export function calculateQuotaForTerm(price: number, term: TermMonths): number {
  // Factor de ajuste por plazo (simula interes)
  const interestFactors: Record<TermMonths, number> = {
    12: 1.08,  // 8% total
    18: 1.12,  // 12% total
    24: 1.15,  // 15% total (base)
    36: 1.22,  // 22% total
    48: 1.30,  // 30% total
  };

  const totalWithInterest = price * interestFactors[term];
  return Math.round(totalWithInterest / term);
}

// ============================================
// Modo de Precio y Cuota Inicial
// ============================================

export type PricingMode = 'static' | 'interactive';

export const pricingModeLabels: Record<PricingMode, { name: string; description: string }> = {
  static: { name: 'Estático', description: 'Muestra plazo e inicial fijos, sin interacción' },
  interactive: { name: 'Interactivo', description: 'Usuario puede cambiar plazo e inicial' },
};

export type InitialPaymentPercent = 0 | 10 | 15 | 20;

export const initialOptions: InitialPaymentPercent[] = [0, 10, 15, 20];

export const initialLabels: Record<InitialPaymentPercent, string> = {
  0: 'Sin inicial',
  10: '10%',
  15: '15%',
  20: '20%',
};

// Calcula la cuota mensual considerando el pago inicial
export function calculateQuotaWithInitial(
  price: number,
  term: TermMonths,
  initialPercent: InitialPaymentPercent
): { quota: number; initialAmount: number; financedAmount: number } {
  const initialAmount = Math.round(price * (initialPercent / 100));
  const financedAmount = price - initialAmount;

  // Factor de ajuste por plazo (simula interes)
  const interestFactors: Record<TermMonths, number> = {
    12: 1.08,  // 8% total
    18: 1.12,  // 12% total
    24: 1.15,  // 15% total (base)
    36: 1.22,  // 22% total
    48: 1.30,  // 30% total
  };

  const totalWithInterest = financedAmount * interestFactors[term];
  const quota = Math.round(totalWithInterest / term);

  return { quota, initialAmount, financedAmount };
}

// ============================================
// Product Tags
// ============================================

export type ProductTagType = 'mas_vendido' | 'recomendado' | 'cuota_baja' | 'oferta';

export interface ProductTagConfig {
  type: ProductTagType;
  label: string;
  color: string;
  bgColor: string;
}

export const productTagsConfig: Record<ProductTagType, ProductTagConfig> = {
  mas_vendido: {
    type: 'mas_vendido',
    label: 'Más vendido',
    color: '#ffffff',
    bgColor: '#f59e0b', // Amber
  },
  recomendado: {
    type: 'recomendado',
    label: 'Recomendado',
    color: '#ffffff',
    bgColor: '#8b5cf6', // Violet
  },
  cuota_baja: {
    type: 'cuota_baja',
    label: 'Cuota baja',
    color: '#ffffff',
    bgColor: '#06b6d4', // Cyan
  },
  oferta: {
    type: 'oferta',
    label: 'Oferta',
    color: '#ffffff',
    bgColor: '#ef4444', // Red
  },
};

export type TagDisplayVersion = 1 | 2 | 3;

export const tagDisplayVersionLabels: Record<TagDisplayVersion, { name: string; description: string }> = {
  1: { name: 'Chips Apilados', description: 'Tags apilados verticalmente en esquina superior izquierda' },
  2: { name: 'Fila Horizontal', description: 'Tags en línea horizontal, tamaño compacto' },
  3: { name: 'Dots Minimal', description: 'Solo círculos de color con tooltip al hover' },
};

export type ProductCondition = 'nuevo' | 'reacondicionado';

export type StockStatus = 'available' | 'limited' | 'on_demand' | 'out_of_stock';

export type GamaTier = 'economica' | 'estudiante' | 'profesional' | 'creativa' | 'gamer';

export type StorageType = 'ssd' | 'hdd' | 'emmc';

export type ProcessorBrand = 'intel' | 'amd' | 'apple';

export type ProcessorModel =
  | 'intel-celeron'
  | 'intel-core-i3'
  | 'intel-core-i5'
  | 'intel-core-i7'
  | 'intel-core-i9'
  | 'amd-ryzen-3'
  | 'amd-ryzen-5'
  | 'amd-ryzen-7'
  | 'amd-ryzen-9';

export type GpuType = 'integrated' | 'dedicated';

export type DisplayType = 'ips' | 'tn' | 'oled' | 'va';

export type Resolution = 'hd' | 'fhd' | 'qhd' | '4k';

// ============================================
// Estado de Filtros
// ============================================

export interface FilterState {
  deviceTypes: CatalogDeviceType[];
  brands: string[];
  quotaRange: [number, number];
  quotaFrequency: QuotaFrequency;
  usage: UsageType[];
  ram: number[];
  ramExpandable: boolean | null;
  storage: number[];
  storageType: StorageType[];
  processorBrand: ProcessorBrand[];
  processorModel: ProcessorModel[];
  gpuType: GpuType[];
  displaySize: number[];
  displayType: DisplayType[];
  resolution: Resolution[];
  touchScreen: boolean | null;
  refreshRate: number[];
  backlitKeyboard: boolean | null;
  numericKeypad: boolean | null;
  fingerprint: boolean | null;
  hasWindows: boolean | null;
  hasThunderbolt: boolean | null;
  hasEthernet: boolean | null;
  hasSDCard: boolean | null;
  hasHDMI: boolean | null;
  minUSBPorts: number | null;
  condition: ProductCondition[];
  stock: StockStatus[];
  gama: GamaTier[];
  tags: ProductTagType[];
}

export const defaultFilterState: FilterState = {
  deviceTypes: [],
  brands: [],
  quotaRange: [25, 400],
  quotaFrequency: 'monthly',
  usage: [],
  ram: [],
  ramExpandable: null,
  storage: [],
  storageType: [],
  processorBrand: [],
  processorModel: [],
  gpuType: [],
  displaySize: [],
  displayType: [],
  resolution: [],
  touchScreen: null,
  refreshRate: [],
  backlitKeyboard: null,
  numericKeypad: null,
  fingerprint: null,
  hasWindows: null,
  hasThunderbolt: null,
  hasEthernet: null,
  hasSDCard: null,
  hasHDMI: null,
  minUSBPorts: null,
  condition: [],
  stock: [],
  gama: [],
  tags: [],
};

// ============================================
// Filtros Aplicados (Chips)
// ============================================

export interface AppliedFilter {
  id: string;
  category: string;
  label: string;
  value: string | number | boolean;
}

// ============================================
// Opciones de Filtro
// ============================================

export interface FilterOption {
  value: string;
  label: string;
  count: number;
  icon?: string;
  logo?: string;
  disabled?: boolean;
}

export interface FilterSectionProps {
  title: string;
  tooltip?: FilterTooltipInfo;
  defaultExpanded?: boolean;
  children: ReactNode;
}

// ============================================
// Tooltips Explicativos
// ============================================

export interface FilterTooltipInfo {
  title: string;
  description: string;
  recommendation?: string;
}

export interface FilterTooltipContent {
  [key: string]: FilterTooltipInfo;
}

// ============================================
// Configuración del Catálogo
// ============================================

export type SkeletonVersion = 1 | 2 | 3;

export type LoadMoreVersion = 1 | 2 | 3;

export const loadMoreVersionLabels: Record<LoadMoreVersion, { name: string; description: string }> = {
  1: { name: 'Minimal Line', description: 'Línea sutil con texto centrado' },
  2: { name: 'Progress Bar', description: 'Barra de progreso visual' },
  3: { name: 'Gradient CTA', description: 'Botón prominente con gradiente' },
};

export type LoadingDuration = 'default' | '30s' | '60s';

export type ImageGalleryVersion = 1 | 2 | 3;

export const imageGalleryVersionLabels: Record<ImageGalleryVersion, { name: string; description: string }> = {
  1: { name: 'Dots Carousel', description: 'Indicadores de puntos, click para cambiar imagen' },
  2: { name: 'Thumbnails', description: 'Miniaturas debajo de la imagen principal' },
  3: { name: 'Arrow Navigation', description: 'Flechas izquierda/derecha al hacer hover + contador' },
};

export type GallerySizeVersion = 1 | 2 | 3;

export const gallerySizeVersionLabels: Record<GallerySizeVersion, { name: string; description: string; height: string }> = {
  1: { name: 'Compact', description: 'Galería compacta, más cards visibles', height: 'h-32' },
  2: { name: 'Standard', description: 'Tamaño balanceado entre imagen e info', height: 'h-40' },
  3: { name: 'Expanded', description: 'Galería grande, enfoque en imágenes', height: 'h-52' },
};

export type TechnicalFiltersVersion = 1 | 2 | 3;

export const technicalFiltersVersionLabels: Record<TechnicalFiltersVersion, { name: string; description: string }> = {
  1: { name: 'Checkboxes Clásicos', description: 'Lista vertical con checkboxes tradicionales' },
  2: { name: 'Chips Compactos', description: 'Pills seleccionables en grid compacto' },
  3: { name: 'Cards con Iconos', description: 'Tarjetas visuales con iconos descriptivos' },
};

export const loadingDurationMs: Record<LoadingDuration, number> = {
  default: 800,
  '30s': 30000,
  '60s': 60000,
};

export const loadingDurationLabels: Record<LoadingDuration, { name: string; description: string }> = {
  default: { name: 'Default', description: '800ms - Carga rápida estándar' },
  '30s': { name: '30 segundos', description: 'Para probar animaciones extendidas' },
  '60s': { name: '60 segundos', description: 'Para pruebas de larga duración' },
};

export interface CatalogLayoutConfig {
  layoutVersion: 1 | 2 | 3 | 4 | 5 | 6;
  brandFilterVersion: 1 | 2 | 3 | 4 | 5 | 6;
  cardVersion: 1 | 2 | 3 | 4 | 5 | 6;
  technicalFiltersVersion: TechnicalFiltersVersion;
  skeletonVersion: SkeletonVersion;
  loadMoreVersion: LoadMoreVersion;
  loadingDuration: LoadingDuration;
  imageGalleryVersion: ImageGalleryVersion;
  gallerySizeVersion: GallerySizeVersion;
  tagDisplayVersion: TagDisplayVersion;
  pricingMode: PricingMode;
  defaultTerm: TermMonths;
  defaultInitial: InitialPaymentPercent;
  productsPerRow: {
    mobile: 1 | 2;
    tablet: 2 | 3;
    desktop: 3 | 4 | 5;
  };
  showFilterCounts: boolean;
  showTooltips: boolean;
  showPricingOptions: boolean;
}

// v0.5 CatalogConfig - Extends CatalogLayoutConfig with ColorSelector
export interface CatalogConfig extends CatalogLayoutConfig {
  colorSelectorVersion: ColorSelectorVersion;
}

// Default config for v0.5 (fixed values from v0.4 presentation + colorSelector)
export const defaultCatalogConfig: CatalogConfig = {
  layoutVersion: 4,
  brandFilterVersion: 3,
  cardVersion: 6,
  technicalFiltersVersion: 3,
  skeletonVersion: 2,
  loadMoreVersion: 3,
  loadingDuration: 'default',
  imageGalleryVersion: 2,
  gallerySizeVersion: 3,
  tagDisplayVersion: 1,
  pricingMode: 'static',
  defaultTerm: 24,
  defaultInitial: 10,
  showPricingOptions: false,
  showFilterCounts: true,
  showTooltips: true,
  productsPerRow: { mobile: 1, tablet: 2, desktop: 4 },
  colorSelectorVersion: 1,
};

// ============================================
// Producto (para mock data)
// ============================================

// ============================================
// COLOR SELECTOR - ÚNICO COMPONENTE ITERABLE v0.5
// ============================================

export type ColorSelectorVersion = 1 | 2;

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  imageUrl?: string;
}

export const colorSelectorVersionLabels: Record<ColorSelectorVersion, { name: string; description: string }> = {
  1: { name: 'Swatches', description: 'Muestras grandes con nombre visible' },
  2: { name: 'Dots', description: 'Círculos compactos con tooltip' },
};

// ============================================
// Producto (para mock data)
// ============================================

// Device type for linking to detail page
export type CatalogDeviceType = 'laptop' | 'tablet' | 'celular';

export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  brand: string;
  brandLogo?: string;
  thumbnail: string;
  images: string[];
  colors?: ProductColor[]; // NUEVO v0.5: colores disponibles
  deviceType?: CatalogDeviceType; // NUEVO v0.5: tipo de dispositivo para link al detalle
  price: number;
  originalPrice?: number;
  discount?: number;
  quotaMonthly: number;
  quotaBiweekly: number;
  quotaWeekly: number;
  maxTermMonths: number;
  gama: GamaTier;
  condition: ProductCondition;
  stock: StockStatus;
  stockQuantity: number;
  usage: UsageType[];
  isFeatured: boolean;
  isNew: boolean;
  tags: ProductTagType[]; // New: 1-4 tags per product
  specs: ProductSpecs;
  createdAt: string;
}

export interface ProductSpecs {
  processor: {
    brand: ProcessorBrand;
    model: string;
    cores: number;
    speed: string;
  };
  ram: {
    size: number;
    type: string;
    maxSize: number;
    expandable: boolean;
  };
  storage: {
    size: number;
    type: StorageType;
    hasSecondSlot: boolean;
  };
  display: {
    size: number;
    resolution: Resolution;
    resolutionPixels: string;
    type: DisplayType;
    refreshRate: number;
    touchScreen: boolean;
  };
  gpu: {
    type: GpuType;
    brand: string;
    model: string;
    vram?: number;
  };
  connectivity: {
    wifi: string;
    bluetooth: string;
    hasEthernet: boolean;
  };
  ports: {
    usb: number;
    usbC: number;
    hdmi: boolean;
    thunderbolt: boolean;
    sdCard: boolean;
    headphone: boolean;
  };
  keyboard: {
    backlit: boolean;
    numericPad: boolean;
    language: string;
  };
  security: {
    fingerprint: boolean;
    facialRecognition: boolean;
    tpmChip: boolean;
  };
  os: {
    hasWindows: boolean;
    windowsVersion?: string;
  };
  battery: {
    capacity: string;
    life: string;
  };
  dimensions: {
    weight: number;
    thickness: number;
  };
}

// ============================================
// Descripciones de Versiones
// ============================================

export const layoutVersionDescriptions = {
  1: 'Sidebar Clásico - Panel izquierdo 280px con filtros expandidos',
  2: 'Panel Flotante - Botón flotante draggable con panel de filtros expandible',
  3: 'Mobile-First Drawer - FAB flotante que abre drawer de filtros',
  4: 'Quick Cards + Sidebar - Header con tarjetas de uso y sidebar flotante',
  5: 'Split 50/50 Preview - Filtros + preview hover a la izquierda',
  6: 'Centrado Sticky - Barra de filtros fija superior, grid centrado',
} as const;

export const brandFilterVersionDescriptions = {
  1: 'Solo Texto - Checkboxes con nombre de marca + conteo',
  2: 'Logo + Texto - Logo pequeño 24px + nombre + checkbox',
  3: 'Grid de Logos - Grid 3x2 de logos clickeables sin texto',
  4: 'Carousel de Logos - Scroll horizontal de logos',
  5: 'Dropdown con Logos - Select con logos en opciones',
  6: 'Chips Seleccionables - Chips con logo + nombre toggle',
} as const;

// ============================================
// Props de Componentes
// ============================================

export interface FilterCounts {
  deviceType: Record<string, number>;
  brands: Record<string, number>;
  usage: Record<string, number>;
  ram: Record<number, number>;
  storage: Record<number, number>;
  storageType: Record<string, number>;
  processorBrand: Record<string, number>;
  displaySize: Record<number, number>;
  displayType: Record<string, number>;
  resolution: Record<string, number>;
  refreshRate: Record<number, number>;
  gpuType: Record<string, number>;
  gama: Record<string, number>;
  condition: Record<string, number>;
  stock: Record<string, number>;
  tags: Record<string, number>;
}

// View mode for catalog (all products vs favorites)
export type CatalogViewMode = 'all' | 'favorites';

export interface CatalogLayoutProps {
  products: CatalogProduct[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  config: CatalogLayoutConfig;
  filterCounts?: FilterCounts;
  children?: ReactNode;
  // Filter drawer state callback (for mobile)
  onFilterDrawerChange?: (isOpen: boolean) => void;
  // Search query for chip display
  searchQuery?: string;
  onSearchClear?: () => void;
}

export interface BrandFilterProps {
  options: FilterOption[];
  selected: string[];
  onChange: (brands: string[]) => void;
  showCounts?: boolean;
}

export interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearAll: () => void;
  appliedCount: number;
}

export interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  totalProducts: number;
}

export interface FilterChipsProps {
  filters: AppliedFilter[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

// ============================================
// Product Card Versions (PROMPT_03)
// ============================================

export type ProductCardVersion = 1 | 2 | 3 | 4 | 5 | 6;

export const productCardVersionLabels: Record<ProductCardVersion, { name: string; description: string }> = {
  1: { name: 'Enfoque Técnico', description: 'Specs con iconos: CPU, RAM, SSD, Pantalla - Estilo Amazon/Best Buy' },
  2: { name: 'Enfoque Beneficios', description: 'Uso recomendado prominente - Estilo Apple/Samsung' },
  3: { name: 'Híbrido Flat', description: '2 specs + 2 beneficios con fondo sutil - Estilo Notion/Stripe' },
  4: { name: 'Abstracto Flotante', description: 'Elementos flotantes, micro-animaciones - Estilo Nubank/Revolut' },
  5: { name: 'Split 50/50', description: 'Layout horizontal: imagen izq, info der - Estilo Webflow/Framer' },
  6: { name: 'Centrado Impacto', description: 'Todo centrado, cuota gigante, CTA full-width - Estilo Spotify/Apple' },
};

export interface ProductCardProps {
  product: CatalogProduct;
  cardVersion?: ProductCardVersion;
  imageGalleryVersion?: ImageGalleryVersion;
  gallerySizeVersion?: GallerySizeVersion;
  onAddToCart?: () => void;
  onFavorite?: () => void;
  onViewDetail?: () => void;
  onMouseEnter?: () => void;
  isFavorite?: boolean;
  showPricingOptions?: boolean;
}

// ============================================
// Color Selector Props (v0.5)
// ============================================

export interface ColorSelectorProps {
  colors: ProductColor[];
  selectedColorId: string;
  onColorSelect: (colorId: string) => void;
  version?: ColorSelectorVersion;
}
