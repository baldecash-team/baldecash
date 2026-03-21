// types/comparator.ts - BaldeCash Comparator Types v0.5
// V1-V2 según convenciones v0.5, con excepción de designStyle (V1-V3)

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
// Helpers
// ============================================

/**
 * Helper: Encuentra el índice del ganador, o undefined si hay empate.
 * @param rawValues - Valores numéricos a comparar
 * @param higherIsBetter - true si mayor es mejor, false si menor es mejor
 * @returns índice del ganador o undefined si hay empate
 */
function findWinner(rawValues: number[], higherIsBetter: boolean): number | undefined {
  if (rawValues.length === 0) return undefined;

  const bestValue = higherIsBetter
    ? Math.max(...rawValues)
    : Math.min(...rawValues);

  // Contar cuántos productos tienen el mejor valor
  const winnersCount = rawValues.filter(v => v === bestValue).length;

  // Si hay empate (más de uno con el mejor valor), no hay ganador
  if (winnersCount > 1) return undefined;

  return rawValues.indexOf(bestValue);
}

/**
 * Helper: Normaliza un string para comparación (quita espacios, lowercase)
 */
function normalizeForComparison(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '');
}

export function compareSpecs(products: ComparisonProduct[]): ComparableSpec[] {
  if (products.length < 2) return [];

  const specs: ComparableSpec[] = [];

  // Processor
  const processorValues = products.map(p => p.specs.processor?.model ?? 'N/A');
  const processorRaw: number[] = products.map(p => {
    const model = (p.specs.processor?.model ?? '').toLowerCase();
    if (model.includes('i9') || model.includes('ryzen 9')) return 9;
    if (model.includes('i7') || model.includes('ryzen 7')) return 7;
    if (model.includes('i5') || model.includes('ryzen 5')) return 5;
    if (model.includes('i3') || model.includes('ryzen 3')) return 3;
    return 1;
  });
  const processorNormalized = processorValues.map(normalizeForComparison);
  specs.push({
    key: 'processor',
    label: 'Procesador',
    category: 'performance',
    values: processorValues,
    rawValues: processorRaw,
    higherIsBetter: true,
    winner: findWinner(processorRaw, true),
    isDifferent: !processorNormalized.every(v => v === processorNormalized[0]),
  });

  // RAM
  const ramValues = products.map(p => `${p.specs.ram?.size ?? 0}GB`);
  const ramRaw = products.map(p => p.specs.ram?.size ?? 0);
  specs.push({
    key: 'ram',
    label: 'Memoria RAM',
    category: 'performance',
    values: ramValues,
    rawValues: ramRaw,
    unit: 'GB',
    higherIsBetter: true,
    winner: findWinner(ramRaw, true),
    isDifferent: !ramRaw.every(v => v === ramRaw[0]),
  });

  // Storage
  const storageValues = products.map(p => `${p.specs.storage?.size ?? 0}GB ${(p.specs.storage?.type ?? 'N/A').toUpperCase()}`);
  const storageRaw = products.map(p => p.specs.storage?.size ?? 0);
  specs.push({
    key: 'storage',
    label: 'Almacenamiento',
    category: 'storage',
    values: storageValues,
    rawValues: storageRaw,
    unit: 'GB',
    higherIsBetter: true,
    winner: findWinner(storageRaw, true),
    isDifferent: !storageRaw.every(v => v === storageRaw[0]),
  });

  // Display Size
  const displayValues = products.map(p => `${p.specs.display?.size ?? 0}"`);
  const displayRaw = products.map(p => p.specs.display?.size ?? 0);
  specs.push({
    key: 'displaySize',
    label: 'Tamaño de Pantalla',
    category: 'display',
    values: displayValues,
    rawValues: displayRaw,
    unit: '"',
    higherIsBetter: true,
    winner: findWinner(displayRaw, true),
    isDifferent: !displayRaw.every(v => v === displayRaw[0]),
  });

  // Resolution
  const resValues = products.map(p => p.specs.display?.resolutionPixels ?? 'N/A');
  const resNormalized = resValues.map(normalizeForComparison);
  const resRaw: number[] = products.map(p => {
    const res = p.specs.display?.resolution;
    if (res === '4k') return 4;
    if (res === 'qhd') return 3;
    if (res === 'fhd') return 2;
    return 1;
  });
  specs.push({
    key: 'resolution',
    label: 'Resolución',
    category: 'display',
    values: resValues,
    rawValues: resRaw,
    higherIsBetter: true,
    winner: findWinner(resRaw, true),
    isDifferent: !resNormalized.every(v => v === resNormalized[0]),
  });

  // GPU
  const gpuValues = products.map(p => `${p.specs.gpu?.brand ?? 'N/A'} ${p.specs.gpu?.model ?? ''}`);
  const gpuNormalized = gpuValues.map(normalizeForComparison);
  const gpuRaw: number[] = products.map(p => p.specs.gpu?.type === 'dedicated' ? 2 : 1);
  specs.push({
    key: 'gpu',
    label: 'Gráficos',
    category: 'performance',
    values: gpuValues,
    rawValues: gpuRaw,
    higherIsBetter: true,
    winner: findWinner(gpuRaw, true),
    isDifferent: !gpuNormalized.every(v => v === gpuNormalized[0]),
  });

  // Weight
  const weightValues = products.map(p => `${p.specs.dimensions?.weight ?? 0}kg`);
  const weightRaw = products.map(p => p.specs.dimensions?.weight ?? 0);
  specs.push({
    key: 'weight',
    label: 'Peso',
    category: 'features',
    values: weightValues,
    rawValues: weightRaw,
    unit: 'kg',
    higherIsBetter: false,
    winner: findWinner(weightRaw, false),
    isDifferent: !weightRaw.every(v => v === weightRaw[0]),
  });

  // Battery
  const batteryValues = products.map(p => p.specs.battery?.life ?? 'N/A');
  const batteryNormalized = batteryValues.map(normalizeForComparison);
  const batteryRaw = products.map(p => parseInt(p.specs.battery?.life ?? '0') || 0);
  specs.push({
    key: 'battery',
    label: 'Batería',
    category: 'features',
    values: batteryValues,
    rawValues: batteryRaw,
    higherIsBetter: true,
    winner: findWinner(batteryRaw, true),
    isDifferent: !batteryNormalized.every(v => v === batteryNormalized[0]),
  });

  // Price
  const priceValues = products.map(p => `S/${p.price.toLocaleString('en-US')}`);
  const priceRaw = products.map(p => p.price);
  specs.push({
    key: 'price',
    label: 'Precio',
    category: 'price',
    values: priceValues,
    rawValues: priceRaw,
    higherIsBetter: false,
    winner: findWinner(priceRaw, false),
    isDifferent: !priceRaw.every(v => v === priceRaw[0]),
  });

  // Quota (calculada con la misma fórmula que ProductCard)
  const quotaRaw = products.map(p => getDisplayQuota(p));
  const quotaValues = quotaRaw.map(q => `S/${q}/mes`);
  specs.push({
    key: 'quota',
    label: 'Cuota Mensual',
    category: 'price',
    values: quotaValues,
    rawValues: quotaRaw,
    higherIsBetter: false,
    winner: findWinner(quotaRaw, false),
    isDifferent: !quotaRaw.every(v => v === quotaRaw[0]),
  });

  return specs;
}

/**
 * Cuenta las victorias de un producto en todas las specs comparables.
 * Solo cuenta specs donde hay diferencia (isDifferent) y hay un ganador claro.
 */
export function countProductWins(specs: ComparableSpec[], productIndex: number): number {
  return specs.filter(spec => spec.isDifferent && spec.winner === productIndex).length;
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
