// types/comparator.ts - BaldeCash Comparator Types v0.5
// V1-V2 según convenciones v0.5, con excepción de designStyle (V1-V3)

import { CatalogProduct, TermMonths, InitialPaymentPercent } from '../../catalogo/types/catalog';

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
  defaultInitial: 10,
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
  winner?: number; // Index of winning product
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

// ============================================
// Helpers
// ============================================

export function compareSpecs(products: ComparisonProduct[]): ComparableSpec[] {
  if (products.length < 2) return [];

  const specs: ComparableSpec[] = [];

  // Processor
  const processorValues = products.map(p => p.specs.processor.model);
  const processorRaw: number[] = products.map(p => {
    const model = p.specs.processor.model.toLowerCase();
    if (model.includes('i9') || model.includes('ryzen 9')) return 9;
    if (model.includes('i7') || model.includes('ryzen 7')) return 7;
    if (model.includes('i5') || model.includes('ryzen 5')) return 5;
    if (model.includes('i3') || model.includes('ryzen 3')) return 3;
    return 1;
  });
  specs.push({
    key: 'processor',
    label: 'Procesador',
    category: 'performance',
    values: processorValues,
    rawValues: processorRaw,
    higherIsBetter: true,
    winner: processorRaw.indexOf(Math.max(...processorRaw)),
    isDifferent: !processorValues.every(v => v === processorValues[0]),
  });

  // RAM
  const ramValues = products.map(p => `${p.specs.ram.size}GB`);
  const ramRaw = products.map(p => p.specs.ram.size);
  specs.push({
    key: 'ram',
    label: 'Memoria RAM',
    category: 'performance',
    values: ramValues,
    rawValues: ramRaw,
    unit: 'GB',
    higherIsBetter: true,
    winner: ramRaw.indexOf(Math.max(...ramRaw)),
    isDifferent: !ramRaw.every(v => v === ramRaw[0]),
  });

  // Storage
  const storageValues = products.map(p => `${p.specs.storage.size}GB ${p.specs.storage.type.toUpperCase()}`);
  const storageRaw = products.map(p => p.specs.storage.size);
  specs.push({
    key: 'storage',
    label: 'Almacenamiento',
    category: 'storage',
    values: storageValues,
    rawValues: storageRaw,
    unit: 'GB',
    higherIsBetter: true,
    winner: storageRaw.indexOf(Math.max(...storageRaw)),
    isDifferent: !storageValues.every(v => v === storageValues[0]),
  });

  // Display Size
  const displayValues = products.map(p => `${p.specs.display.size}"`);
  const displayRaw = products.map(p => p.specs.display.size);
  specs.push({
    key: 'displaySize',
    label: 'Tamaño de Pantalla',
    category: 'display',
    values: displayValues,
    rawValues: displayRaw,
    unit: '"',
    higherIsBetter: true,
    winner: displayRaw.indexOf(Math.max(...displayRaw)),
    isDifferent: !displayRaw.every(v => v === displayRaw[0]),
  });

  // Resolution
  const resValues = products.map(p => p.specs.display.resolutionPixels);
  const resRaw: number[] = products.map(p => {
    const res = p.specs.display.resolution;
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
    winner: resRaw.indexOf(Math.max(...resRaw)),
    isDifferent: !resValues.every(v => v === resValues[0]),
  });

  // GPU
  const gpuValues = products.map(p => `${p.specs.gpu.brand} ${p.specs.gpu.model}`);
  const gpuRaw: number[] = products.map(p => p.specs.gpu.type === 'dedicated' ? 2 : 1);
  specs.push({
    key: 'gpu',
    label: 'Gráficos',
    category: 'performance',
    values: gpuValues,
    rawValues: gpuRaw,
    higherIsBetter: true,
    winner: gpuRaw.indexOf(Math.max(...gpuRaw)),
    isDifferent: !gpuValues.every(v => v === gpuValues[0]),
  });

  // Weight
  const weightValues = products.map(p => `${p.specs.dimensions.weight}kg`);
  const weightRaw = products.map(p => p.specs.dimensions.weight);
  specs.push({
    key: 'weight',
    label: 'Peso',
    category: 'features',
    values: weightValues,
    rawValues: weightRaw,
    unit: 'kg',
    higherIsBetter: false,
    winner: weightRaw.indexOf(Math.min(...weightRaw)),
    isDifferent: !weightRaw.every(v => v === weightRaw[0]),
  });

  // Battery
  const batteryValues = products.map(p => p.specs.battery.life);
  const batteryRaw = products.map(p => parseInt(p.specs.battery.life) || 0);
  specs.push({
    key: 'battery',
    label: 'Batería',
    category: 'features',
    values: batteryValues,
    rawValues: batteryRaw,
    higherIsBetter: true,
    winner: batteryRaw.indexOf(Math.max(...batteryRaw)),
    isDifferent: !batteryValues.every(v => v === batteryValues[0]),
  });

  // Price
  const priceValues = products.map(p => `S/${p.price.toLocaleString()}`);
  const priceRaw = products.map(p => p.price);
  specs.push({
    key: 'price',
    label: 'Precio',
    category: 'price',
    values: priceValues,
    rawValues: priceRaw,
    higherIsBetter: false,
    winner: priceRaw.indexOf(Math.min(...priceRaw)),
    isDifferent: !priceRaw.every(v => v === priceRaw[0]),
  });

  // Quota
  const quotaValues = products.map(p => `S/${p.quotaMonthly}/mes`);
  const quotaRaw = products.map(p => p.quotaMonthly);
  specs.push({
    key: 'quota',
    label: 'Cuota Mensual',
    category: 'price',
    values: quotaValues,
    rawValues: quotaRaw,
    higherIsBetter: false,
    winner: quotaRaw.indexOf(Math.min(...quotaRaw)),
    isDifferent: !quotaRaw.every(v => v === quotaRaw[0]),
  });

  return specs;
}

export function calculatePriceDifference(products: ComparisonProduct[]): { absolute: number[]; quota: number[]; annualSaving: number } {
  if (products.length < 2) return { absolute: [], quota: [], annualSaving: 0 };

  const minPrice = Math.min(...products.map(p => p.price));
  const minQuota = Math.min(...products.map(p => p.quotaMonthly));

  const absolute = products.map(p => p.price - minPrice);
  const quota = products.map(p => p.quotaMonthly - minQuota);

  const maxQuota = Math.max(...products.map(p => p.quotaMonthly));
  const annualSaving = (maxQuota - minQuota) * 12;

  return { absolute, quota, annualSaving };
}
