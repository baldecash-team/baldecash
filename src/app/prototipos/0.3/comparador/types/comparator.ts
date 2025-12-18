// Comparator Section Types - BaldeCash v0.3
// Generated from PROMPT_05_COMPARADOR.md

import { ReactNode } from 'react';

// ============================================
// Configuration Types
// ============================================

export interface ComparatorConfig {
  layoutVersion: 1 | 2 | 3;
  tableVersion: 1 | 2 | 3;
  highlightVersion: 1 | 2 | 3;
  maxProducts: 2 | 3 | 4;
  priceDiffVersion: 1 | 2 | 3;
  differenceMode: 1 | 2 | 3;
}

export const defaultComparatorConfig: ComparatorConfig = {
  layoutVersion: 1,
  tableVersion: 1,
  highlightVersion: 1,
  maxProducts: 3,
  priceDiffVersion: 1,
  differenceMode: 1,
};

// ============================================
// Product Types
// ============================================

export interface ComparisonProduct {
  id: string;
  name: string;
  displayName: string;
  thumbnail: string;
  brand: string;
  brandLogo?: string;
  price: number;
  lowestQuota: number;
  discount?: number;
  gama: 'entry' | 'media' | 'alta' | 'premium';
  specs: ProductSpecs;
}

export interface ProductSpecs {
  processor: string;
  processorBrand: 'intel' | 'amd' | 'apple';
  ram: number;
  ramMax?: number;
  ramExpandable: boolean;
  storage: number;
  storageType: 'ssd' | 'hdd' | 'emmc';
  gpu: string;
  gpuType: 'integrated' | 'dedicated';
  displaySize: number;
  displayType: 'ips' | 'tn' | 'oled' | 'va';
  resolution: 'hd' | 'fhd' | 'qhd' | '4k';
  refreshRate: number;
  touchScreen: boolean;
  backlitKeyboard: boolean;
  numericKeypad: boolean;
  fingerprint: boolean;
  hasWindows: boolean;
  batteryHours?: number;
  weight?: number;
  hasThunderbolt: boolean;
  hasEthernet: boolean;
  hasSDCard: boolean;
  hasHDMI: boolean;
  usbPorts: number;
}

// ============================================
// Comparison Types
// ============================================

export interface ComparableSpec {
  key: string;
  label: string;
  category: SpecCategory;
  getValue: (product: ComparisonProduct) => string | number | boolean;
  getRawValue: (product: ComparisonProduct) => number;
  unit?: string;
  higherIsBetter: boolean;
  format?: (value: string | number | boolean) => string;
}

export type SpecCategory =
  | 'performance'
  | 'memory'
  | 'display'
  | 'features'
  | 'connectivity'
  | 'price';

export interface SpecComparison {
  spec: ComparableSpec;
  values: (string | number | boolean)[];
  formattedValues: string[];
  rawValues: number[];
  winnerIndex: number | null;
  loserIndex: number | null;
  isDifferent: boolean;
  diffPercentage?: number;
}

export interface ComparisonState {
  products: ComparisonProduct[];
  showOnlyDifferences: boolean;
  highlightWinners: boolean;
  selectedCategories: SpecCategory[];
}

export const defaultComparisonState: ComparisonState = {
  products: [],
  showOnlyDifferences: false,
  highlightWinners: true,
  selectedCategories: ['performance', 'memory', 'display', 'features', 'price'],
};

// ============================================
// Layout Props Types
// ============================================

export interface ComparatorLayoutProps {
  config: ComparatorConfig;
  products: ComparisonProduct[];
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  children: ReactNode;
}

export interface ComparisonTableProps {
  products: ComparisonProduct[];
  config: ComparatorConfig;
  showOnlyDifferences: boolean;
  highlightWinners: boolean;
}

export interface DifferenceHighlightProps {
  comparison: SpecComparison;
  productIndex: number;
  totalProducts: number;
}

// ============================================
// Floating Bar Types
// ============================================

export interface FloatingCompareBarProps {
  products: ComparisonProduct[];
  maxProducts: number;
  onRemoveProduct: (productId: string) => void;
  onCompare: () => void;
  onClearAll: () => void;
}

// ============================================
// Settings Modal Types
// ============================================

export interface ComparatorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ComparatorConfig;
  onConfigChange: (config: ComparatorConfig) => void;
}

// ============================================
// Version Descriptions
// ============================================

export const versionDescriptions = {
  layout: {
    1: 'Modal fullscreen con overlay oscuro',
    2: 'Pagina dedicada /comparador',
    3: 'Panel lateral sticky (mantiene contexto)',
  },
  table: {
    1: 'Tabla tradicional con filas y columnas',
    2: 'Cards lado a lado con specs verticales',
    3: 'Scroll horizontal optimizado para movil',
  },
  highlight: {
    1: 'Colores verde/rojo para mejor/peor',
    2: 'Iconos corona/X para ganador/perdedor',
    3: 'Barras proporcionales comparativas',
  },
  maxProducts: {
    2: 'Maximo 2 productos (simple, mobile-friendly)',
    3: 'Maximo 3 productos (balance ideal)',
    4: 'Maximo 4 productos (power users)',
  },
  priceDiff: {
    1: 'Diferencia en precio total (+S/200)',
    2: 'Diferencia en cuota mensual (+S/15/mes)',
    3: 'Ambos con calculo de ahorro total',
  },
  differenceMode: {
    1: 'Highlight amarillo en celdas diferentes',
    2: 'Toggle "Solo mostrar diferencias"',
    3: 'Animacion al detectar diferencia',
  },
} as const;

// ============================================
// Spec Definitions
// ============================================

export const comparableSpecs: ComparableSpec[] = [
  // Performance
  {
    key: 'processor',
    label: 'Procesador',
    category: 'performance',
    getValue: (p) => p.specs.processor,
    getRawValue: (p) => {
      // Score basado en tipo de procesador
      const proc = p.specs.processor.toLowerCase();
      if (proc.includes('i7') || proc.includes('ryzen 7')) return 7;
      if (proc.includes('i5') || proc.includes('ryzen 5')) return 5;
      if (proc.includes('i3') || proc.includes('ryzen 3')) return 3;
      return 1;
    },
    higherIsBetter: true,
  },
  {
    key: 'gpu',
    label: 'Tarjeta Grafica',
    category: 'performance',
    getValue: (p) => p.specs.gpu,
    getRawValue: (p) => (p.specs.gpuType === 'dedicated' ? 2 : 1),
    higherIsBetter: true,
  },
  // Memory
  {
    key: 'ram',
    label: 'RAM',
    category: 'memory',
    getValue: (p) => p.specs.ram,
    getRawValue: (p) => p.specs.ram,
    unit: 'GB',
    higherIsBetter: true,
    format: (v) => `${v}GB`,
  },
  {
    key: 'ramExpandable',
    label: 'RAM Expandible',
    category: 'memory',
    getValue: (p) => p.specs.ramExpandable,
    getRawValue: (p) => (p.specs.ramExpandable ? 1 : 0),
    higherIsBetter: true,
    format: (v) => (v ? 'Si' : 'No'),
  },
  {
    key: 'storage',
    label: 'Almacenamiento',
    category: 'memory',
    getValue: (p) => p.specs.storage,
    getRawValue: (p) => p.specs.storage,
    unit: 'GB',
    higherIsBetter: true,
    format: (v) => (Number(v) >= 1000 ? `${Number(v) / 1000}TB` : `${v}GB`),
  },
  {
    key: 'storageType',
    label: 'Tipo Almacenamiento',
    category: 'memory',
    getValue: (p) => p.specs.storageType.toUpperCase(),
    getRawValue: (p) => {
      if (p.specs.storageType === 'ssd') return 3;
      if (p.specs.storageType === 'emmc') return 2;
      return 1;
    },
    higherIsBetter: true,
  },
  // Display
  {
    key: 'displaySize',
    label: 'Pantalla',
    category: 'display',
    getValue: (p) => p.specs.displaySize,
    getRawValue: (p) => p.specs.displaySize,
    unit: '"',
    higherIsBetter: true,
    format: (v) => `${v}"`,
  },
  {
    key: 'resolution',
    label: 'Resolucion',
    category: 'display',
    getValue: (p) => p.specs.resolution.toUpperCase(),
    getRawValue: (p) => {
      const res = p.specs.resolution;
      if (res === '4k') return 4;
      if (res === 'qhd') return 3;
      if (res === 'fhd') return 2;
      return 1;
    },
    higherIsBetter: true,
  },
  {
    key: 'refreshRate',
    label: 'Tasa Refresco',
    category: 'display',
    getValue: (p) => p.specs.refreshRate,
    getRawValue: (p) => p.specs.refreshRate,
    unit: 'Hz',
    higherIsBetter: true,
    format: (v) => `${v}Hz`,
  },
  {
    key: 'touchScreen',
    label: 'Pantalla Tactil',
    category: 'display',
    getValue: (p) => p.specs.touchScreen,
    getRawValue: (p) => (p.specs.touchScreen ? 1 : 0),
    higherIsBetter: true,
    format: (v) => (v ? 'Si' : 'No'),
  },
  // Features
  {
    key: 'backlitKeyboard',
    label: 'Teclado Iluminado',
    category: 'features',
    getValue: (p) => p.specs.backlitKeyboard,
    getRawValue: (p) => (p.specs.backlitKeyboard ? 1 : 0),
    higherIsBetter: true,
    format: (v) => (v ? 'Si' : 'No'),
  },
  {
    key: 'numericKeypad',
    label: 'Teclado Numerico',
    category: 'features',
    getValue: (p) => p.specs.numericKeypad,
    getRawValue: (p) => (p.specs.numericKeypad ? 1 : 0),
    higherIsBetter: true,
    format: (v) => (v ? 'Si' : 'No'),
  },
  {
    key: 'fingerprint',
    label: 'Lector Huella',
    category: 'features',
    getValue: (p) => p.specs.fingerprint,
    getRawValue: (p) => (p.specs.fingerprint ? 1 : 0),
    higherIsBetter: true,
    format: (v) => (v ? 'Si' : 'No'),
  },
  {
    key: 'hasWindows',
    label: 'Windows Incluido',
    category: 'features',
    getValue: (p) => p.specs.hasWindows,
    getRawValue: (p) => (p.specs.hasWindows ? 1 : 0),
    higherIsBetter: true,
    format: (v) => (v ? 'Si' : 'No'),
  },
  // Connectivity
  {
    key: 'usbPorts',
    label: 'Puertos USB',
    category: 'connectivity',
    getValue: (p) => p.specs.usbPorts,
    getRawValue: (p) => p.specs.usbPorts,
    higherIsBetter: true,
  },
  {
    key: 'hasThunderbolt',
    label: 'Thunderbolt',
    category: 'connectivity',
    getValue: (p) => p.specs.hasThunderbolt,
    getRawValue: (p) => (p.specs.hasThunderbolt ? 1 : 0),
    higherIsBetter: true,
    format: (v) => (v ? 'Si' : 'No'),
  },
  {
    key: 'hasHDMI',
    label: 'HDMI',
    category: 'connectivity',
    getValue: (p) => p.specs.hasHDMI,
    getRawValue: (p) => (p.specs.hasHDMI ? 1 : 0),
    higherIsBetter: true,
    format: (v) => (v ? 'Si' : 'No'),
  },
  // Price
  {
    key: 'price',
    label: 'Precio Total',
    category: 'price',
    getValue: (p) => p.price,
    getRawValue: (p) => p.price,
    higherIsBetter: false, // Lower is better for price
    format: (v) => `S/${Number(v).toLocaleString('es-PE')}`,
  },
  {
    key: 'lowestQuota',
    label: 'Cuota Mensual',
    category: 'price',
    getValue: (p) => p.lowestQuota,
    getRawValue: (p) => p.lowestQuota,
    higherIsBetter: false,
    format: (v) => `S/${v}/mes`,
  },
];

// ============================================
// Helper Functions
// ============================================

export const getCategoryLabel = (category: SpecCategory): string => {
  const labels: Record<SpecCategory, string> = {
    performance: 'Rendimiento',
    memory: 'Memoria',
    display: 'Pantalla',
    features: 'Caracteristicas',
    connectivity: 'Conectividad',
    price: 'Precio',
  };
  return labels[category];
};

export const getGamaLabel = (gama: string): string => {
  const labels: Record<string, string> = {
    entry: 'Entrada',
    media: 'Gama Media',
    alta: 'Gama Alta',
    premium: 'Premium',
  };
  return labels[gama] || gama;
};

export const getGamaColor = (gama: string): string => {
  const colors: Record<string, string> = {
    entry: 'bg-neutral-100 text-neutral-700',
    media: 'bg-blue-100 text-blue-700',
    alta: 'bg-purple-100 text-purple-700',
    premium: 'bg-amber-100 text-amber-700',
  };
  return colors[gama] || 'bg-neutral-100 text-neutral-700';
};

export const compareProducts = (
  products: ComparisonProduct[],
  specs: ComparableSpec[]
): SpecComparison[] => {
  return specs.map((spec) => {
    const values = products.map((p) => spec.getValue(p));
    const rawValues = products.map((p) => spec.getRawValue(p));
    const formattedValues = values.map((v) =>
      spec.format ? spec.format(v) : String(v)
    );

    // Determine winner and loser
    let winnerIndex: number | null = null;
    let loserIndex: number | null = null;

    if (rawValues.length >= 2) {
      const sorted = [...rawValues].sort((a, b) =>
        spec.higherIsBetter ? b - a : a - b
      );
      const bestValue = sorted[0];
      const worstValue = sorted[sorted.length - 1];

      if (bestValue !== worstValue) {
        winnerIndex = rawValues.indexOf(bestValue);
        loserIndex = rawValues.indexOf(worstValue);
      }
    }

    // Check if values are different
    const isDifferent = new Set(rawValues).size > 1;

    // Calculate difference percentage
    const diffPercentage =
      rawValues.length >= 2 && isDifferent
        ? Math.abs(
            ((Math.max(...rawValues) - Math.min(...rawValues)) /
              Math.min(...rawValues)) *
              100
          )
        : undefined;

    return {
      spec,
      values,
      formattedValues,
      rawValues,
      winnerIndex,
      loserIndex,
      isDifferent,
      diffPercentage,
    };
  });
};
