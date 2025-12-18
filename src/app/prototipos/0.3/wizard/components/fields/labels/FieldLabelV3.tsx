'use client';

/**
 * FieldLabelV3 - Solo placeholder (minimalista)
 *
 * Sin label visible, solo placeholder dentro del campo.
 * Diseño minimalista pero menos accesible.
 * El label se muestra como aria-label para screen readers.
 */

import React from 'react';

export interface PlaceholderLabelProps {
  label: string;
  required?: boolean;
  placeholder?: string;
}

/**
 * Genera el placeholder con formato correcto.
 * Si se proporciona placeholder explícito, lo usa.
 * Si no, genera uno basado en el label.
 */
export const getPlaceholderText = ({
  label,
  required = false,
  placeholder,
}: PlaceholderLabelProps): string => {
  if (placeholder) {
    return required ? placeholder : `${placeholder} (Opcional)`;
  }
  return required ? label : `${label} (Opcional)`;
};

/**
 * FieldLabelV3 no renderiza nada visible.
 * Se usa solo para generar atributos de accesibilidad.
 */
export const FieldLabelV3: React.FC<{
  label: string;
  required?: boolean;
}> = () => {
  // Este componente no renderiza nada visible
  // El label se pasa como aria-label al input
  return null;
};

/**
 * Hook para obtener props de accesibilidad para inputs sin label visible
 */
export const useAccessiblePlaceholder = (label: string, required: boolean = false) => {
  return {
    'aria-label': label,
    'aria-required': required,
    placeholder: required ? label : `${label} (Opcional)`,
  };
};

export default FieldLabelV3;
