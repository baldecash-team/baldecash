// Catalog Section Types - BaldeCash v0.3
// Generated from PROMPT_02_CATALOGO_LAYOUT_FILTROS.md

import { ReactNode } from 'react';

// ============================================
// Configuration Types
// ============================================

export interface CatalogConfig {
  layoutVersion: 1 | 2 | 3;
  brandFilterVersion: 1 | 2 | 3;
  cardVersion: 1 | 2 | 3;
}

export const defaultCatalogConfig: CatalogConfig = {
  layoutVersion: 1,
  brandFilterVersion: 1,
  cardVersion: 1,
};

// ============================================
// Enum Types
// ============================================

export type UsageType =
  | 'estudios'
  | 'gaming'
  | 'diseno'
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

export type ProductCondition = 'nuevo' | 'reacondicionado' | 'open_box';

export type StockStatus = 'available' | 'limited' | 'on_demand' | 'out_of_stock';

export type GamaTier = 'entry' | 'media' | 'alta' | 'premium';

export type StorageType = 'ssd' | 'hdd' | 'emmc';

export type ProcessorBrand = 'intel' | 'amd' | 'apple';

export type GpuType = 'integrated' | 'dedicated';

export type DisplayType = 'ips' | 'tn' | 'oled' | 'va';

export type Resolution = 'hd' | 'fhd' | 'qhd' | '4k';

// ============================================
// Filter State Types
// ============================================

export interface FilterState {
  brands: string[];
  priceRange: [number, number];
  quotaRange: [number, number];
  quotaFrequency: QuotaFrequency[];
  usage: UsageType[];
  ram: number[];
  ramExpandable: boolean | null;
  storage: number[];
  storageType: StorageType[];
  processorBrand: ProcessorBrand[];
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
  minUsbPorts: number;
  condition: ProductCondition[];
  stock: StockStatus[];
  gama: GamaTier[];
  availableNow: boolean;
}

export const defaultFilterState: FilterState = {
  brands: [],
  priceRange: [1000, 5000],
  quotaRange: [40, 400],
  quotaFrequency: [],
  usage: [],
  ram: [],
  ramExpandable: null,
  storage: [],
  storageType: [],
  processorBrand: [],
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
  minUsbPorts: 0,
  condition: [],
  stock: [],
  gama: [],
  availableNow: false,
};

// ============================================
// Applied Filter Types
// ============================================

export interface AppliedFilter {
  id: string;
  category: string;
  label: string;
  value: string | number | boolean;
}

// ============================================
// Filter Option Types
// ============================================

export interface FilterOption {
  value: string;
  label: string;
  count: number;
  icon?: string;
  disabled?: boolean;
  logo?: string;
}

export interface FilterSectionProps {
  title: string;
  tooltip?: FilterTooltipContent;
  defaultExpanded?: boolean;
  children: ReactNode;
}

// ============================================
// Tooltip Content Types
// ============================================

export interface FilterTooltipContent {
  title: string;
  description: string;
  recommendation?: string;
}

export type FilterTooltips = {
  [key: string]: FilterTooltipContent;
};

// ============================================
// Product Types (for display)
// ============================================

export interface CatalogProduct {
  id: string;
  name: string;
  displayName: string;
  brand: string;
  brandLogo: string;
  thumbnail: string;
  images: string[];
  price: number;
  lowestQuota: number;
  discount?: number;
  specs: ProductSpecs;
  usage: UsageType[];
  condition: ProductCondition;
  stock: StockStatus;
  gama: GamaTier;
  isFeatured: boolean;
  isNew: boolean;
  availableNow: boolean;
}

export interface ProductSpecs {
  ram: number;
  ramMax?: number;
  ramExpandable: boolean;
  storage: number;
  storageType: StorageType;
  processor: string;
  processorBrand: ProcessorBrand;
  gpu: string;
  gpuType: GpuType;
  displaySize: number;
  displayType: DisplayType;
  resolution: Resolution;
  refreshRate: number;
  touchScreen: boolean;
  backlitKeyboard: boolean;
  numericKeypad: boolean;
  fingerprint: boolean;
  hasWindows: boolean;
  hasThunderbolt: boolean;
  hasEthernet: boolean;
  hasSDCard: boolean;
  hasHDMI: boolean;
  usbPorts: number;
}

// ============================================
// Layout Config Types
// ============================================

export interface LayoutConfig {
  productsPerRow: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  sidebarWidth?: number;
  showFiltersOnMobile: 'drawer' | 'inline';
}

// ============================================
// Component Props Types
// ============================================

export interface CatalogLayoutProps {
  config: CatalogConfig;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  products: CatalogProduct[];
  children?: ReactNode;
}

export interface FilterSectionComponentProps {
  title: string;
  tooltip?: FilterTooltipContent;
  defaultExpanded?: boolean;
  children: ReactNode;
}

export interface FilterChipsProps {
  appliedFilters: AppliedFilter[];
  onRemoveFilter: (filterId: string) => void;
  onClearAll: () => void;
}

export interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  appliedCount: number;
  onClearAll: () => void;
}

export interface BrandFilterProps {
  options: FilterOption[];
  selected: string[];
  onChange: (brands: string[]) => void;
}

export interface PriceRangeFilterProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (range: [number, number]) => void;
}

export interface QuotaRangeFilterProps {
  min: number;
  max: number;
  value: [number, number];
  frequency: QuotaFrequency[];
  onChange: (range: [number, number]) => void;
  onFrequencyChange: (frequency: QuotaFrequency[]) => void;
}

export interface UsageFilterProps {
  options: FilterOption[];
  selected: UsageType[];
  onChange: (usage: UsageType[]) => void;
}

export interface SortDropdownProps {
  value: SortOption;
  onChange: (sort: SortOption) => void;
  productCount: number;
}

export interface CatalogSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CatalogConfig;
  onConfigChange: (config: CatalogConfig) => void;
}

// ============================================
// Version Descriptions (for Settings Modal)
// ============================================

export const versionDescriptions = {
  layout: {
    1: 'Sidebar 280px izquierdo (desktop), drawer en movil',
    2: 'Filtros horizontales colapsables arriba del grid',
    3: 'Boton flotante que abre drawer (desktop y movil)',
  },
  brandFilter: {
    1: 'Solo texto con checkbox',
    2: 'Logo pequeno + texto con checkbox',
    3: 'Grid de logos clickeables (estilo e-commerce)',
  },
  card: {
    1: 'Enfoque Tecnico: CPU, RAM, SSD, Pantalla con iconos',
    2: 'Enfoque Beneficios: Ideal para estudios, Bateria todo el dia',
    3: 'Enfoque Hibrido: 2 specs principales + 2 beneficios clave',
  },
} as const;

// ============================================
// Sort Options Configuration
// ============================================

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'recommended', label: 'Recomendados' },
  { value: 'price_asc', label: 'Precio: Menor a mayor' },
  { value: 'price_desc', label: 'Precio: Mayor a menor' },
  { value: 'quota_asc', label: 'Cuota: Menor a mayor' },
  { value: 'newest', label: 'Mas nuevos' },
  { value: 'popular', label: 'Mas populares' },
];
