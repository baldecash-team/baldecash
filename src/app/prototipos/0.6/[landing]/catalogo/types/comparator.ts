// types/comparator.ts - BaldeCash Comparator Types v0.6
// Refactored: declarative spec definitions for scalable comparison

import { CatalogProduct, TermMonths, InitialPaymentPercent } from '../../catalogo/types/catalog';

/**
 * Cuota mensual para mostrar en el comparador.
 * Usa quotaMonthly del backend (plazo más alto del producto, inicial 0%).
 */
export const getDisplayQuota = (product: CatalogProduct): number => {
  return product.quotaMonthly;
};

// ============================================
// Configuración del Comparador v0.5
// ============================================

export interface ComparatorConfig {
  // Layout del comparador (V1-V2)
  layoutVersion: 1 | 2;

  // Estilo de diseño interno (V1-V3) - EXCEPCIÓN documentada
  designStyle: 1 | 2 | 3;

  // Visualización mejor/peor (V1-V2)
  highlightVersion: 1 | 2;

  // Campos de comparación (V1-V2)
  fieldsVersion: 1 | 2;

  // Diferencia de precio (V1-V2)
  priceDiffVersion: 1 | 2;

  // Pricing options
  defaultTerm: TermMonths;
  defaultInitial: InitialPaymentPercent;
}

export const defaultComparatorConfig: ComparatorConfig = {
  layoutVersion: 1,
  designStyle: 1,
  highlightVersion: 1,
  fieldsVersion: 1,
  priceDiffVersion: 1,
  defaultTerm: 24,
  defaultInitial: 0,
};

// ============================================
// Descripciones de Versiones
// ============================================

export const layoutVersionLabels: Record<1 | 2, { name: string; description: string }> = {
  1: { name: 'Modal Fullscreen', description: 'Modal inmersivo con overlay oscuro' },
  2: { name: 'Panel Inline', description: 'Panel expandible sin perder contexto' },
};

// EXCEPCIÓN: 3 versiones para designStyle (documentado en CONVENTIONS.md)
export const designStyleLabels: Record<1 | 2 | 3, { name: string; description: string }> = {
  1: { name: 'Columnas Fijas', description: 'Productos como headers sticky, tabla vertical de specs' },
  2: { name: 'Cards Lado a Lado', description: 'Cada producto en su propia card con specs internos' },
  3: { name: 'Hero del Ganador', description: 'Mejor opción destacada arriba, tabla resumida abajo' },
};

export const highlightVersionLabels: Record<1 | 2, { name: string; description: string }> = {
  1: { name: 'Semántico Clásico', description: 'Verde = mejor, Rojo = peor con iconos' },
  2: { name: 'Barras Proporcionales', description: 'Barras visuales indicando valores' },
};

export const fieldsVersionLabels: Record<1 | 2, { name: string; description: string }> = {
  1: { name: 'Specs Principales', description: 'CPU, RAM, SSD, Pantalla, Cuota' },
  2: { name: 'Completo', description: 'Todos los campos con toggle diferencias' },
};

export const priceDiffVersionLabels: Record<1 | 2, { name: string; description: string }> = {
  1: { name: 'Diferencia Relativa', description: '+S/XX relativo al más económico' },
  2: { name: 'Ahorro Anual', description: 'Cálculo de ahorro total anual' },
};

// ============================================
// Producto para Comparación
// ============================================

export interface ComparisonProduct extends CatalogProduct {
  // Inherits all from CatalogProduct
}

// ============================================
// Spec Comparable
// ============================================

export interface ComparableSpec {
  key: string;
  label: string;
  category: 'performance' | 'display' | 'storage' | 'connectivity' | 'features' | 'price';
  values: (string | number)[];
  rawValues: number[];
  unit?: string;
  higherIsBetter: boolean;
  winner?: number; // Index of winning product, undefined if tie
  isDifferent: boolean;
}

// ============================================
// Estado de Comparación
// ============================================

export interface ComparisonState {
  products: ComparisonProduct[];
  showOnlyDifferences: boolean;
  highlightWinners: boolean;
  activeCategory: string | null;
}

export const defaultComparisonState: ComparisonState = {
  products: [],
  showOnlyDifferences: false,
  highlightWinners: true,
  activeCategory: null,
};

// ============================================
// Props de Componentes
// ============================================

export interface ComparatorLayoutProps {
  products: ComparisonProduct[];
  config: ComparatorConfig;
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
  comparisonState: ComparisonState;
  onStateChange: (state: ComparisonState) => void;
}

export interface ComparisonTableProps {
  products: ComparisonProduct[];
  specs: ComparableSpec[];
  showOnlyDifferences: boolean;
  config: ComparatorConfig;
  showProductHeaders?: boolean;
}

export interface ProductSelectorProps {
  products: ComparisonProduct[];
  selectedIds: string[];
  onSelect: (productId: string) => void;
  onDeselect: (productId: string) => void;
  maxProducts: number;
}

export interface CompareActionsProps {
  products: ComparisonProduct[];
  onCompare: () => void;
  onClear: () => void;
  maxProducts: number;
  disabled?: boolean;
}

export interface ComparatorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ComparatorConfig;
  onConfigChange: (config: ComparatorConfig) => void;
}

// ============================================
// Categorías de Specs
// ============================================

export const specCategories = {
  performance: {
    label: 'Rendimiento',
    icon: 'Cpu',
    specs: ['processor', 'ram', 'gpu'],
  },
  display: {
    label: 'Pantalla',
    icon: 'Monitor',
    specs: ['displaySize', 'resolution', 'displayType', 'refreshRate'],
  },
  storage: {
    label: 'Almacenamiento',
    icon: 'HardDrive',
    specs: ['storage', 'storageType'],
  },
  connectivity: {
    label: 'Conectividad',
    icon: 'Wifi',
    specs: ['wifi', 'bluetooth', 'ports'],
  },
  features: {
    label: 'Características',
    icon: 'Sparkles',
    specs: ['keyboard', 'security', 'battery', 'weight'],
  },
  price: {
    label: 'Precio',
    icon: 'DollarSign',
    specs: ['price', 'quota', 'discount'],
  },
} as const;

// ============================================
// Constants
// ============================================

export const MAX_COMPARE_PRODUCTS = 3;

export function getMaxProducts(version: 1 | 2): number {
  return MAX_COMPARE_PRODUCTS;
}

// ============================================
// Spec Definition System (declarativo)
// ============================================

type SpecCategory = ComparableSpec['category'];

interface SpecDefinition {
  key: string;
  label: string;
  category: SpecCategory;
  unit?: string;
  higherIsBetter: boolean;
  extract: (p: ComparisonProduct) => number;
  format: (p: ComparisonProduct) => string;
}

// Ranking maps para specs con valores ordinales
const PROCESSOR_TIERS: Record<string, number> = {
  'm4': 11, 'm3 pro': 10, 'm3': 9,
  'i9': 9, 'ryzen 9': 9,
  'i7': 7, 'ryzen 7': 7,
  'i5': 5, 'ryzen 5': 5,
  'i3': 3, 'ryzen 3': 3,
  'm2': 8, 'm1': 6,
};

const RESOLUTION_TIERS: Record<string, number> = {
  '4k': 4, 'qhd': 3, 'fhd': 2, 'hd': 1,
};

function getProcessorScore(model: string): number {
  const lower = model.toLowerCase();
  for (const [key, score] of Object.entries(PROCESSOR_TIERS)) {
    if (lower.includes(key)) return score;
  }
  return 1;
}

/**
 * Definiciones declarativas de todos los specs comparables.
 * Para agregar un nuevo spec: agregar un objeto a este array.
 */
const specDefinitions: SpecDefinition[] = [
  // --- Performance ---
  {
    key: 'processor',
    label: 'Procesador',
    category: 'performance',
    higherIsBetter: true,
    extract: (p) => getProcessorScore(p.specs.processor?.model ?? ''),
    format: (p) => p.specs.processor?.model ?? 'N/A',
  },
  {
    key: 'ram',
    label: 'Memoria RAM',
    category: 'performance',
    unit: 'GB',
    higherIsBetter: true,
    extract: (p) => p.specs.ram?.size ?? 0,
    format: (p) => `${p.specs.ram?.size ?? 0}GB`,
  },
  {
    key: 'gpu',
    label: 'Gráficos',
    category: 'performance',
    higherIsBetter: true,
    extract: (p) => {
      const gpu = p.specs.gpu;
      if (!gpu) return 0;
      // dedicated con VRAM > dedicated sin VRAM > integrated
      if (gpu.type === 'dedicated') return 2 + (gpu.vram ?? 0) / 100;
      return 1;
    },
    format: (p) => {
      const gpu = p.specs.gpu;
      if (!gpu) return 'N/A';
      const vram = gpu.vram ? ` ${gpu.vram}GB` : '';
      return `${gpu.brand ?? 'N/A'} ${gpu.model ?? ''}${vram}`.trim();
    },
  },
  // --- Storage ---
  {
    key: 'storage',
    label: 'Almacenamiento',
    category: 'storage',
    unit: 'GB',
    higherIsBetter: true,
    extract: (p) => p.specs.storage?.size ?? 0,
    format: (p) => `${p.specs.storage?.size ?? 0}GB ${(p.specs.storage?.type ?? 'N/A').toUpperCase()}`,
  },
  // --- Display ---
  {
    key: 'displaySize',
    label: 'Tamaño de Pantalla',
    category: 'display',
    unit: '"',
    higherIsBetter: true,
    extract: (p) => p.specs.display?.size ?? 0,
    format: (p) => `${p.specs.display?.size ?? 0}"`,
  },
  {
    key: 'resolution',
    label: 'Resolución',
    category: 'display',
    higherIsBetter: true,
    extract: (p) => RESOLUTION_TIERS[p.specs.display?.resolution ?? ''] ?? 1,
    format: (p) => p.specs.display?.resolutionPixels ?? 'N/A',
  },
  // --- Features ---
  {
    key: 'weight',
    label: 'Peso',
    category: 'features',
    unit: 'kg',
    higherIsBetter: false,
    extract: (p) => p.specs.dimensions?.weight ?? 0,
    format: (p) => `${p.specs.dimensions?.weight ?? 0}kg`,
  },
  {
    key: 'battery',
    label: 'Batería',
    category: 'features',
    higherIsBetter: true,
    extract: (p) => parseInt(p.specs.battery?.life ?? '0') || 0,
    format: (p) => {
      const life = p.specs.battery?.life;
      return life ? `${life} hrs` : 'N/A';
    },
  },
  // --- Price (no cuentan para scoring técnico) ---
  {
    key: 'price',
    label: 'Precio',
    category: 'price',
    higherIsBetter: false,
    extract: (p) => p.price,
    format: (p) => `S/${p.price.toLocaleString('en-US')}`,
  },
  {
    key: 'quota',
    label: 'Cuota Mensual',
    category: 'price',
    higherIsBetter: false,
    extract: (p) => getDisplayQuota(p),
    format: (p) => `S/${getDisplayQuota(p)}/mes`,
  },
];

// ============================================
// Helpers
// ============================================

function findWinner(rawValues: number[], higherIsBetter: boolean): number | undefined {
  if (rawValues.length === 0) return undefined;

  const bestValue = higherIsBetter
    ? Math.max(...rawValues)
    : Math.min(...rawValues);

  const winnersCount = rawValues.filter(v => v === bestValue).length;
  if (winnersCount > 1) return undefined;

  return rawValues.indexOf(bestValue);
}

function normalizeForComparison(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '');
}

/**
 * Construye un ComparableSpec a partir de una definición declarativa.
 */
function buildSpec(products: ComparisonProduct[], def: SpecDefinition): ComparableSpec {
  const rawValues = products.map(def.extract);
  const values = products.map(def.format);
  const normalized = values.map(v => normalizeForComparison(String(v)));

  return {
    key: def.key,
    label: def.label,
    category: def.category,
    values,
    rawValues,
    unit: def.unit,
    higherIsBetter: def.higherIsBetter,
    winner: findWinner(rawValues, def.higherIsBetter),
    isDifferent: !normalized.every(v => v === normalized[0]),
  };
}

/** Check if a formatted spec value is empty/meaningless */
function isEmptyValue(value: string | number): boolean {
  const s = String(value).trim().toLowerCase();
  return s === '' || s === 'n/a' || s === '0' || s === '0gb' || s === '0"' || s === '0kg' || s === '0gb n/a';
}

export function compareSpecs(products: ComparisonProduct[]): ComparableSpec[] {
  if (products.length < 2) return [];
  return specDefinitions
    .map(def => buildSpec(products, def))
    .filter(spec => !spec.values.every(v => isEmptyValue(v)));
}

/**
 * Cuenta las victorias TÉCNICAS de un producto (excluye precio y cuota).
 * Solo cuenta specs donde hay diferencia (isDifferent) y hay un ganador claro.
 * "Mejor opción" = mejor equipo técnicamente. Precio solo entra como desempate.
 */
export function countProductWins(specs: ComparableSpec[], productIndex: number): number {
  return specs.filter(spec =>
    spec.isDifferent &&
    spec.winner === productIndex &&
    spec.category !== 'price'
  ).length;
}

export function calculatePriceDifference(products: ComparisonProduct[]): { absolute: number[]; quota: number[]; annualSaving: number } {
  if (products.length < 2) return { absolute: [], quota: [], annualSaving: 0 };

  const minPrice = Math.min(...products.map(p => p.price));
  const quotas = products.map(p => getDisplayQuota(p));
  const minQuota = Math.min(...quotas);

  const absolute = products.map(p => p.price - minPrice);
  const quota = quotas.map(q => q - minQuota);

  const maxQuota = Math.max(...quotas);
  const annualSaving = (maxQuota - minQuota) * 12;

  return { absolute, quota, annualSaving };
}
