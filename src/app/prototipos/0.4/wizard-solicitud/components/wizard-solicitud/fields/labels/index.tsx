/**
 * Label Components - BaldeCash Web 4.0
 * 6 versiones de labels según C1.1
 * Soporta campos requeridos y opcionales
 */

import React from 'react';
import type { FieldConfig } from '../../../../types/wizard-solicitud';

export interface LabelProps {
  field: FieldConfig;
  isFocused?: boolean;
  hasValue?: boolean;
  hasError?: boolean;
}

// V1: Label arriba (siempre visible) - Clásico y accesible
export const LabelV1: React.FC<LabelProps> = ({ field, hasError }) => (
  <label className={`
    inline-flex items-center gap-1.5 text-sm font-medium flex-wrap leading-none
    ${hasError ? 'text-red-600' : 'text-neutral-700'}
  `}>
    <span>{field.label}</span>
    {field.required ? (
      <span className="text-red-500 text-xs">*</span>
    ) : (
      <span className="text-neutral-400 text-xs font-normal">(opcional)</span>
    )}
  </label>
);

// V2: Label flotante (Material Design) - Animado
export const LabelV2: React.FC<LabelProps> = ({ field, isFocused, hasValue, hasError }) => {
  const isFloating = isFocused || hasValue;
  return (
    <label className={`
      absolute left-3 transition-all duration-200 pointer-events-none z-10
      ${isFloating
        ? 'top-1 text-xs font-medium'
        : 'top-1/2 -translate-y-1/2 text-sm font-normal'
      }
      ${hasError ? 'text-red-500' : isFocused ? 'text-[#4654CD]' : 'text-neutral-400'}
    `}>
      <span className="inline-flex items-center gap-1">
        {field.label}
        {field.required && <span className="text-red-400">*</span>}
        {!field.required && isFloating && <span className="text-neutral-300 text-[10px]">(opcional)</span>}
      </span>
    </label>
  );
};

// V3: Minimalista - Solo asterisco para requerido, nada para opcional
export const LabelV3: React.FC<LabelProps> = ({ field, hasError }) => {
  // Para campos sin placeholder (como DatePicker), mostrar el label
  if (field.type === 'date') {
    return (
      <label className={`
        inline-flex items-center gap-1.5 text-xs font-medium leading-none uppercase tracking-wide
        ${hasError ? 'text-red-600' : 'text-neutral-500'}
      `}>
        <span>{field.label}</span>
        {field.required && <span className="text-red-500">*</span>}
      </label>
    );
  }
  // Para inputs con placeholder, solo mostrar asterisco si es requerido
  return field.required ? (
    <span className="text-red-500 text-xs font-medium">*</span>
  ) : null;
};

// V4: Label con badge inline - Moderno
export const LabelV4: React.FC<LabelProps> = ({ field, hasError }) => (
  <label className={`
    inline-flex items-center gap-2 text-sm font-medium leading-none
    ${hasError ? 'text-red-600' : 'text-neutral-600'}
  `}>
    <span>{field.label}</span>
    {field.required ? (
      <span className="text-[10px] px-1.5 py-0.5 bg-[#4654CD]/10 text-[#4654CD] rounded font-medium leading-none">
        Requerido
      </span>
    ) : (
      <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-400 rounded font-medium leading-none">
        Opcional
      </span>
    )}
  </label>
);

// V5: Label izquierda (inline) - Formularios compactos
export const LabelV5: React.FC<LabelProps> = ({ field, hasError }) => (
  <label className={`
    inline-flex items-center gap-1.5 text-sm font-medium min-w-[120px] shrink-0 leading-none
    ${hasError ? 'text-red-600' : 'text-neutral-600'}
  `}>
    <span>{field.label}</span>
    {field.required ? (
      <span className="text-red-500 text-xs">*</span>
    ) : (
      <span className="text-neutral-400 text-xs font-normal">(opc.)</span>
    )}
  </label>
);

// V6: Label grande (hero) - Impactante
export const LabelV6: React.FC<LabelProps> = ({ field, isFocused, hasError }) => (
  <label className={`
    inline-flex items-center gap-2 text-base font-semibold transition-colors leading-none
    ${hasError ? 'text-red-600' : isFocused ? 'text-[#4654CD]' : 'text-neutral-800'}
  `}>
    <span>{field.label}</span>
    {field.required ? (
      <span className="text-red-500 text-sm">*</span>
    ) : (
      <span className="text-neutral-400 text-xs font-normal bg-neutral-100 px-2 py-0.5 rounded-full">
        Opcional
      </span>
    )}
  </label>
);

// Mapeo de versiones
export const LabelVersions = {
  1: LabelV1,
  2: LabelV2,
  3: LabelV3,
  4: LabelV4,
  5: LabelV5,
  6: LabelV6,
};

export const getLabel = (version: 1 | 2 | 3 | 4 | 5 | 6) => LabelVersions[version];
