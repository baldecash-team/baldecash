// Catalog Section Types - BaldeCash v0.4
// Generated from PROMPT_02_CATALOGO_LAYOUT_FILTROS.md
// 10 Layout Versions + 10 Brand Filter Versions

import { ReactNode } from 'react';

// ============================================
// Configuration Types (10 versions each)
// ============================================

export interface CatalogConfig {
  layoutVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  brandFilterVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
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
  availableNow: true,
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
  productCount: number;
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
// 10 Layout Versions + 10 Brand Filter Versions
// ============================================

export const versionDescriptions = {
  layout: {
    1: 'V1 Sidebar Clasico: Sidebar 280px izquierdo con filtros expandidos',
    2: 'V2 Filtros Horizontales: Dropdowns colapsables arriba del grid',
    3: 'V3 Mobile-First Drawer: FAB flotante que abre drawer desde derecha',
    4: 'V4 Split View Abstracto: Panel flotante con shapes geometricos',
    5: 'V5 Split 50/50 Preview: Mitad filtros/preview, mitad resultados',
    6: 'V6 Centrado Sticky: Barra sticky superior, grid centrado',
    7: 'V7 Asimetrico Flotante: Grid masonry con panel flotante movible',
    8: 'V8 Data-Driven Stats: Header con estadisticas, filtros con contadores',
    9: 'V9 Storytelling: Categorias por narrativa (Para estudiar, Para crear)',
    10: 'V10 Comparador Inline: Grid con checkbox de comparacion integrado',
  },
  brandFilter: {
    1: 'V1 Solo Texto: Grid de botones con nombre + conteo',
    2: 'V2 Logo + Texto: Logo pequeno 24px + nombre + checkbox',
    3: 'V3 Grid de Logos: Grid 3x2 de logos clickeables sin texto',
    4: 'V4 Carousel: Scroll horizontal de logos, seleccion multiple',
    5: 'V5 Dropdown: Select con logos en opciones',
    6: 'V6 Chips: Chips seleccionables con logo + nombre toggle',
    7: 'V7 Accordion: Expandir marca muestra productos de esa marca',
    8: 'V8 Stats: Logo + barra de cantidad visual (barras horizontales)',
    9: 'V9 Favoritos: Logos ordenados por popularidad con estrella',
    10: 'V10 Search: Input de busqueda + grid filtrable de logos',
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
