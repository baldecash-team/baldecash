'use client';

/**
 * ConditionBadge v0.6 — Badge de condición para cards del catálogo.
 *
 * Spec FE Reacondicionados:
 * - Se pinta cuando `conditionCode !== "nueva"` (cualquier condición no-nueva:
 *   reacondicionada, open_box, etc.).
 * - El estilo (label, icono, color) NO se hardcodea: proviene del catálogo de
 *   condiciones del facet `conditions[]` (GET /{slug}/products/filters).
 *
 * Si el facet aún no resolvió la condición del producto, se usa un fallback
 * mínimo para no ocultar la señal de "reacondicionado".
 */

import React from 'react';
import type { ConditionFilter } from '../../../../types/filters';
import { conditionFacetIconMap, defaultConditionFacetIcon, normalizeConditionIconKey } from './iconRegistry';

// Códigos tratados como "nuevo" → no se pinta badge.
const NEW_CONDITION_CODES = new Set(['nueva', 'nuevo', 'new']);

// Color de respaldo cuando el facet no trae la condición (amber, alineado con
// el ejemplo de la spec #F59E0B).
const FALLBACK_COLOR = '#F59E0B';

/** ¿La condición amerita badge? (true para todo lo no-nuevo). */
export function shouldShowConditionBadge(conditionCode?: string | null): boolean {
  const code = conditionCode?.toLowerCase().trim();
  return !!code && !NEW_CONDITION_CODES.has(code);
}

interface ConditionBadgeProps {
  /** Código de condición crudo del API ('nueva' | 'reacondicionada' | 'open_box'). */
  conditionCode?: string | null;
  /** Catálogo de condiciones del facet — fuente de label/icon/color. */
  conditions?: ConditionFilter[] | null;
}

export const ConditionBadge: React.FC<ConditionBadgeProps> = ({ conditionCode, conditions }) => {
  const code = conditionCode?.toLowerCase().trim();
  if (!shouldShowConditionBadge(code)) return null;

  const facet = conditions?.find((c) => c.value?.toLowerCase() === code);

  const label = facet?.label || `${code!.charAt(0).toUpperCase()}${code!.slice(1).replace(/_/g, ' ')}`;
  const color = facet?.color || FALLBACK_COLOR;
  // Acceso por índice (no llamada) para no disparar react-hooks/static-components.
  const Icon = conditionFacetIconMap[normalizeConditionIconKey(facet?.icon)] || defaultConditionFacetIcon;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md shadow-sm"
      style={{ backgroundColor: color, color: '#ffffff' }}
    >
      <Icon className="w-3 h-3 shrink-0" strokeWidth={2.5} />
      <span className="text-[10px] font-bold leading-none">{label}</span>
    </span>
  );
};

export default ConditionBadge;
