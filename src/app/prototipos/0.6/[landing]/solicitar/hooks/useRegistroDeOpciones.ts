'use client';

/**
 * Registro de opciones elegidas y ayudas abiertas del formulario (BAL-5254),
 * Diseño 1 y Diseño 2.
 *
 * - `option_selected`: la persona elige una opción de lista, radio o botones.
 *   Lleva `field_name`, `option_value` (el código de la opción, nunca un texto
 *   escrito) e `is_change` (ya había otra elegida).
 * - `help_open`: abre la ayuda ("Más información") de un campo. Lleva
 *   `field_name`. El globo de ayuda (`FieldTooltip`) no sabe de qué campo es:
 *   lo lee de `CampoDelRegistroContext`, que pone `DynamicField`. Fuera del
 *   formulario (p. ej. filtros del catálogo) no hay campo y no se registra.
 */

import { createContext, useCallback } from 'react';
import { useEventTrackerOptional } from '../context/EventTrackerContext';

/** Código del campo que se está pintando; `null` fuera del formulario. */
export const CampoDelRegistroContext = createContext<string | null>(null);

export function useRegistroDeOpciones() {
  const tracker = useEventTrackerOptional();

  const onOptionSelected = useCallback(
    (fieldName: string, nuevo: string | null | undefined, anterior: string | null | undefined) => {
      if (!tracker) return;
      const nuevoStr = nuevo === null || nuevo === undefined ? '' : String(nuevo);
      const anteriorStr = anterior === null || anterior === undefined ? '' : String(anterior);
      // Limpiar el campo o volver a tocar la misma opción no es elegir.
      if (!nuevoStr || nuevoStr === anteriorStr) return;
      tracker.track(
        'option_selected',
        { field_name: fieldName, option_value: nuevoStr, is_change: anteriorStr !== '' },
        fieldName,
      );
    },
    [tracker],
  );

  const onHelpOpen = useCallback(
    (fieldName: string) => {
      if (!tracker) return;
      tracker.track('help_open', { field_name: fieldName }, fieldName);
    },
    [tracker],
  );

  return { onOptionSelected, onHelpOpen };
}
