// types/comparator.ts - BaldeCash Comparator Types v0.4

import { CatalogProduct, TermMonths, InitialPaymentPercent } from '../../catalogo/types/catalog';

// ============================================
// Configuración del Comparador
// ============================================

export interface ComparatorConfig {
  // B.90 - Funcionalidad de comparación (acceso)
  accessVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.91 - Cantidad de productos
  maxProductsVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.92 - Campos de comparación
  fieldsVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.93 - Visualización mejor/peor
  highlightVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.94 - Diferencia de precio
  priceDiffVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.95 - Layout del comparador
  layoutVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.96 - Resaltado de diferencias
  differenceHighlightVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // Card selection style - cómo se ve la card cuando está seleccionada
  cardSelectionVersion: 1 | 2 | 3;

  // Pricing options
  defaultTerm: TermMonths;
  defaultInitial: InitialPaymentPercent;
}

export const defaultComparatorConfig: ComparatorConfig = {
  accessVersion: 1,
  maxProductsVersion: 2,
  fieldsVersion: 1,
  highlightVersion: 1,
  priceDiffVersion: 1,
  layoutVersion: 1,
  differenceHighlightVersion: 1,
  cardSelectionVersion: 1,
  defaultTerm: 24,
  defaultInitial: 10,
};

// ============================================
// Descripciones de Versiones
// ============================================

export const accessVersionLabels: Record<1 | 2 | 3 | 4 | 5 | 6, { name: string; description: string }> = {
  1: { name: 'Checkbox en Cards', description: 'E-commerce clásico - checkbox visible en cada card' },
  2: { name: 'Botón en Detalle', description: 'Acceso intencional desde página de detalle' },
  3: { name: 'Floating Bar Flat', description: 'Ambos accesos + barra flotante minimalista' },
  4: { name: 'Icono Flotante Fintech', description: 'Contador animado estilo Nubank/Revolut' },
  5: { name: 'Panel Lateral Split', description: 'Panel fijo con productos seleccionados' },
  6: { name: 'Modal de Impacto', description: 'Modal centralizado para iniciar comparación' },
};

export const maxProductsVersionLabels: Record<1 | 2 | 3 | 4 | 5 | 6, { name: string; description: string; maxProducts: number }> = {
  1: { name: 'Máximo 2', description: 'Simple, muy mobile-friendly', maxProducts: 2 },
  2: { name: 'Máximo 3', description: 'Balance ideal', maxProducts: 3 },
  3: { name: 'Máximo 4', description: 'Power users, ilustración', maxProducts: 4 },
  4: { name: '2-3 Fluido', description: 'Transiciones fluidas estilo fintech', maxProducts: 3 },
  5: { name: 'Responsive', description: '2 en móvil, 4 en desktop', maxProducts: 4 },
  6: { name: 'Solo 2 Impacto', description: 'Enfoque en decisión final', maxProducts: 2 },
};

export const fieldsVersionLabels: Record<1 | 2 | 3 | 4 | 5 | 6, { name: string; description: string }> = {
  1: { name: 'Specs Principales', description: 'CPU, RAM, SSD, Pantalla, Precio' },
  2: { name: 'Specs + Features', description: 'Specs + key features + cuotas por plazo' },
  3: { name: 'Completo Toggle', description: 'Todos los campos con toggle "Solo diferencias"' },
  4: { name: 'Animado Fintech', description: 'Campos con animaciones de revelado' },
  5: { name: 'Split Layout', description: 'Specs izquierda, features derecha' },
  6: { name: '5 Campos Impacto', description: 'Solo 5 campos clave muy prominentes' },
};

export const highlightVersionLabels: Record<1 | 2 | 3 | 4 | 5 | 6, { name: string; description: string }> = {
  1: { name: 'Semántico Clásico', description: 'Verde = mejor, Rojo = peor' },
  2: { name: 'Iconos', description: 'Corona para el mejor, checkmarks' },
  3: { name: 'Barras Proporcionales', description: 'Más largo = mejor valor' },
  4: { name: 'Gradientes Fintech', description: 'Gradientes sutiles + badges flotantes' },
  5: { name: 'Columna Resaltada', description: 'Producto ganador con columna destacada' },
  6: { name: 'Ganador Centrado', description: 'Producto ganador centrado y destacado' },
};

export const priceDiffVersionLabels: Record<1 | 2 | 3 | 4 | 5 | 6, { name: string; description: string }> = {
  1: { name: 'Diferencia Relativa', description: '+S/200 o -S/50 relativo al más barato' },
  2: { name: 'Cuota Prominente', description: 'Diferencia en cuota +S/15/mes prominente' },
  3: { name: 'Ahorro Anual', description: 'Ambos con cálculo de ahorro total anual' },
  4: { name: 'Badge Animado', description: 'Badge flotante con diferencia animada' },
  5: { name: 'Panel Lateral', description: 'Panel de precios lado a lado' },
  6: { name: 'Diferencia Gigante', description: 'Diferencia centrada muy prominente' },
};

export const layoutVersionLabels: Record<1 | 2 | 3 | 4 | 5 | 6, { name: string; description: string }> = {
  1: { name: 'Modal Fullscreen', description: 'Modal con overlay oscuro' },
  2: { name: 'Página Dedicada', description: 'Página separada /comparador' },
  3: { name: 'Panel Sticky', description: 'Panel lateral sin perder contexto' },
  4: { name: 'Modal Fluido', description: 'Modal con animaciones estilo fintech' },
  5: { name: 'Split 50/50', description: 'Catálogo izq + comparador der' },
  6: { name: 'Fullscreen Inmersivo', description: 'Página fullscreen de impacto' },
};

export const differenceHighlightVersionLabels: Record<1 | 2 | 3 | 4 | 5 | 6, { name: string; description: string }> = {
  1: { name: 'Punto Amarillo', description: 'Punto amarillo junto al label de la spec' },
  2: { name: 'Etiqueta "Diferente"', description: 'Chip pequeño con texto "Diferente"' },
  3: { name: 'Badge "≠"', description: 'Badge con símbolo de diferencia junto al label' },
  4: { name: 'Fondo Gradiente', description: 'Gradiente sutil amarillo a transparente' },
  5: { name: 'Subrayado Animado', description: 'Línea inferior que pulsa suavemente' },
  6: { name: 'Icono Comparación', description: 'Icono de flechas indicando valores distintos' },
};

export const cardSelectionVersionLabels: Record<1 | 2 | 3, { name: string; description: string }> = {
  1: { name: 'Borde + Fondo', description: 'Borde brand con fondo sutil - estilo e-commerce' },
  2: { name: 'Badge + Borde', description: 'Badge con número de orden + borde prominente' },
  3: { name: 'Glow + Ribbon', description: 'Efecto glow con cinta diagonal - estilo fintech' },
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
  highlightVersion: 1 | 2 | 3 | 4 | 5 | 6;
  config: ComparatorConfig;
  showProductHeaders?: boolean;
}

export interface DifferenceHighlightProps {
  isDifferent: boolean;
  isWinner: boolean;
  version: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
}

export interface ProductSelectorProps {
  products: ComparisonProduct[];
  selectedIds: string[];
  onSelect: (productId: string) => void;
  onDeselect: (productId: string) => void;
  maxProducts: number;
  cardSelectionVersion?: 1 | 2 | 3;
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
// Helpers
// ============================================

export function getMaxProducts(version: 1 | 2 | 3 | 4 | 5 | 6): number {
  return maxProductsVersionLabels[version].maxProducts;
}

export function compareSpecs(products: ComparisonProduct[]): ComparableSpec[] {
  if (products.length < 2) return [];

  const specs: ComparableSpec[] = [];

  // Processor
  const processorValues = products.map(p => p.specs.processor.model);
  const processorRaw: number[] = products.map(p => {
    // Score based on processor tier
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
    higherIsBetter: false, // Lower is better for weight
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
    higherIsBetter: false, // Lower is better for price
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
    higherIsBetter: false, // Lower is better for quota
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

  // Calculate annual saving between highest and lowest quota
  const maxQuota = Math.max(...products.map(p => p.quotaMonthly));
  const annualSaving = (maxQuota - minQuota) * 12;

  return { absolute, quota, annualSaving };
}
