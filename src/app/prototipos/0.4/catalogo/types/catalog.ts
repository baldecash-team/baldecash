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
  brands: string[];
  priceRange: [number, number];
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
}

export const defaultFilterState: FilterState = {
  brands: [],
  priceRange: [1000, 8000],
  quotaRange: [40, 400],
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
  technicalFiltersVersion: TechnicalFiltersVersion;
  skeletonVersion: SkeletonVersion;
  loadMoreVersion: LoadMoreVersion;
  loadingDuration: LoadingDuration;
  imageGalleryVersion: ImageGalleryVersion;
  gallerySizeVersion: GallerySizeVersion;
  productsPerRow: {
    mobile: 1 | 2;
    tablet: 2 | 3;
    desktop: 3 | 4 | 5;
  };
  showFilterCounts: boolean;
  showTooltips: boolean;
}

export const defaultCatalogConfig: CatalogLayoutConfig = {
  layoutVersion: 1,
  brandFilterVersion: 1,
  technicalFiltersVersion: 1,
  skeletonVersion: 1,
  loadMoreVersion: 1,
  loadingDuration: 'default',
  imageGalleryVersion: 1,
  gallerySizeVersion: 2,
  productsPerRow: {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  },
  showFilterCounts: true,
  showTooltips: true,
};

// ============================================
// Producto (para mock data)
// ============================================

export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  brand: string;
  brandLogo?: string;
  thumbnail: string;
  images: string[];
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

export interface CatalogLayoutProps {
  products: CatalogProduct[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  config: CatalogLayoutConfig;
  children?: ReactNode;
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
