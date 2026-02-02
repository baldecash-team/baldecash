// types/empty.ts - BaldeCash Empty State Types v0.4

import { CatalogProduct } from './catalog';

// ============================================
// Configuración del Estado Vacío
// ============================================

export interface EmptyStateConfig {
  // B.103 - Visualización del estado vacío
  illustrationVersion: 1 | 2 | 3 | 4 | 5 | 6;

  // B.104 - Sugerencias de acción
  actionsVersion: 1 | 2 | 3 | 4 | 5 | 6;
}

export const defaultEmptyStateConfig: EmptyStateConfig = {
  illustrationVersion: 1,
  actionsVersion: 1,
};

// ============================================
// Labels de Versiones
// ============================================

export const illustrationVersionLabels: Record<1 | 2 | 3 | 4 | 5 | 6, { name: string; description: string }> = {
  1: { name: 'Icono SearchX', description: 'Icono SearchX grande + mensaje simple centrado' },
  2: { name: 'Ilustración Lifestyle', description: 'Estudiante buscando + mensaje empático' },
  3: { name: 'Personaje con Lupa', description: 'Personaje flat animado buscando con lupa' },
  4: { name: 'Shapes Abstractos', description: 'Formas geométricas flotantes + animación sutil' },
  5: { name: 'Split Layout', description: 'Ilustración izquierda + mensaje y acciones derecha' },
  6: { name: 'Mensaje Gigante', description: '0 resultados centrado con impacto visual' },
};

export const actionsVersionLabels: Record<1 | 2 | 3 | 4 | 5 | 6, { name: string; description: string }> = {
  1: { name: 'Botones Simples', description: 'Limpiar filtros, Ampliar precio' },
  2: { name: 'Cards Preview', description: 'Cards con preview de qué cambia al expandir' },
  3: { name: 'Chips Ilustrados', description: 'Chips de sugerencias con iconos flat' },
  4: { name: 'Floating Pills', description: 'Pills flotantes con animación de hover' },
  5: { name: 'Panel Split', description: 'Filtros actuales vs. sugeridos lado a lado' },
  6: { name: 'CTA Grande', description: 'Un solo botón "Ver todos los productos" centrado' },
};

// ============================================
// Filtros Aplicados
// ============================================

export interface AppliedFilter {
  key: string;
  label: string;
  value: string | number | [number, number];
}

// ============================================
// Props de Componentes
// ============================================

export interface EmptyStateProps {
  appliedFilters: AppliedFilter[];
  onClearFilters: () => void;
  onRemoveFilter: (key: string) => void;
  suggestedProducts?: CatalogProduct[];
  totalProductsIfExpanded?: number;
  config: EmptyStateConfig;
}

export interface EmptyIllustrationProps {
  className?: string;
}

export interface EmptyActionsProps {
  appliedFilters: AppliedFilter[];
  onClearFilters: () => void;
  onRemoveFilter: (key: string) => void;
  totalProductsIfExpanded?: number;
}
