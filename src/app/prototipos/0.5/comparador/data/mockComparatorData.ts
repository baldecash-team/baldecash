// data/mockComparatorData.ts - BaldeCash Comparator Mock Data v0.5

import { mockProducts } from '../../catalogo/data/mockCatalogData';
import { ComparisonProduct, ComparableSpec, compareSpecs, calculatePriceDifference } from '../types/comparator';

// ============================================
// Productos para Comparación
// ============================================

export const availableProducts: ComparisonProduct[] = mockProducts;

export function getFeaturedProducts(count: number = 3): ComparisonProduct[] {
  return mockProducts
    .filter(p => p.isFeatured || p.tags.includes('recomendado'))
    .slice(0, count);
}

export function getProductsByIds(ids: string[]): ComparisonProduct[] {
  return mockProducts.filter(p => ids.includes(p.id));
}

export function getSimilarProducts(product: ComparisonProduct, limit: number = 5): ComparisonProduct[] {
  return mockProducts
    .filter(p =>
      p.id !== product.id &&
      (p.gama === product.gama || p.usage.some(u => product.usage.includes(u)))
    )
    .slice(0, limit);
}

// ============================================
// Preconfigured Comparison Sets (for demo)
// ============================================

export const demoComparisonSets = {
  budget: {
    name: 'Comparación Económica',
    description: 'Equipos económicos para estudiantes',
    productIds: ['prod-1', 'prod-7', 'prod-13'],
  },
  midRange: {
    name: 'Comparación Gama Media',
    description: 'Equipos con mejor relación precio-rendimiento',
    productIds: ['prod-3', 'prod-9', 'prod-15'],
  },
  gaming: {
    name: 'Comparación Gaming',
    description: 'Equipos para gaming y contenido',
    productIds: ['prod-5', 'prod-11', 'prod-17'],
  },
};

// ============================================
// Comparison Helpers
// ============================================

export function getComparisonData(productIds: string[]) {
  const products = getProductsByIds(productIds);
  const specs = compareSpecs(products);
  const priceDiff = calculatePriceDifference(products);

  return {
    products,
    specs,
    priceDifference: priceDiff,
    hasDifferences: specs.some(s => s.isDifferent),
    differenceCount: specs.filter(s => s.isDifferent).length,
  };
}

export function getSpecsByCategory(specs: ComparableSpec[]) {
  const categories = {
    performance: [] as ComparableSpec[],
    display: [] as ComparableSpec[],
    storage: [] as ComparableSpec[],
    connectivity: [] as ComparableSpec[],
    features: [] as ComparableSpec[],
    price: [] as ComparableSpec[],
  };

  specs.forEach(spec => {
    if (categories[spec.category]) {
      categories[spec.category].push(spec);
    }
  });

  return categories;
}

export function getOverallWinner(products: ComparisonProduct[], specs: ComparableSpec[]): number | null {
  if (products.length < 2) return null;

  const winCounts: number[] = products.map(() => 0);

  specs.forEach(spec => {
    if (spec.winner !== undefined) {
      winCounts[spec.winner]++;
    }
  });

  const maxWins = Math.max(...winCounts);
  const winnerIndex = winCounts.indexOf(maxWins);

  if (maxWins > specs.length / 2) {
    return winnerIndex;
  }

  return null;
}

// ============================================
// Default Products for Demo
// ============================================

export const defaultComparisonProducts = getProductsByIds(['prod-1', 'prod-2', 'prod-3']);

// ============================================
// Spec Labels (Spanish)
// ============================================

export const specLabels: Record<string, string> = {
  processor: 'Procesador',
  ram: 'Memoria RAM',
  storage: 'Almacenamiento',
  displaySize: 'Tamaño de Pantalla',
  resolution: 'Resolución',
  displayType: 'Tipo de Panel',
  refreshRate: 'Tasa de Refresco',
  gpu: 'Gráficos',
  weight: 'Peso',
  battery: 'Batería',
  price: 'Precio',
  quota: 'Cuota Mensual',
  keyboard: 'Teclado',
  ports: 'Puertos',
  wifi: 'WiFi',
  bluetooth: 'Bluetooth',
};

export const categoryLabels: Record<string, string> = {
  performance: 'Rendimiento',
  display: 'Pantalla',
  storage: 'Almacenamiento',
  connectivity: 'Conectividad',
  features: 'Características',
  price: 'Precio',
};
