/**
 * Preferencias de movimiento y tamaño de pantalla para Diseño 2 (BAL-4964).
 * Única fuente de `prefers-reduced-motion` del kit (menor 9 de la revisión
 * final, BAL-4969): la guía de campos y `SeccionPlegable` leen
 * `prefiereMenosMovimiento()` al momento; los componentes que pintan distinto
 * según la preferencia usan `useMenosMovimiento()`.
 */

import { useSyncExternalStore } from 'react';

const CONSULTA_MENOS_MOVIMIENTO = '(prefers-reduced-motion: reduce)';

/** La persona pidió menos movimiento (`prefers-reduced-motion`). */
export function prefiereMenosMovimiento(): boolean {
  try {
    return window.matchMedia(CONSULTA_MENOS_MOVIMIENTO).matches;
  } catch {
    return false;
  }
}

/** Pantalla de celular: por debajo del corte `sm` de Tailwind (640 px). */
export function esPantallaDeCelular(): boolean {
  try {
    return window.matchMedia('(max-width: 639px)').matches;
  } catch {
    return false;
  }
}

function suscribirMenosMovimiento(avisar: () => void): () => void {
  let consulta: MediaQueryList;
  try {
    consulta = window.matchMedia(CONSULTA_MENOS_MOVIMIENTO);
  } catch {
    return () => {};
  }
  consulta.addEventListener?.('change', avisar);
  return () => consulta.removeEventListener?.('change', avisar);
}

/**
 * Hook de `prefers-reduced-motion`: `false` en el servidor y sigue los
 * cambios de la preferencia en el navegador.
 */
export function useMenosMovimiento(): boolean {
  return useSyncExternalStore(suscribirMenosMovimiento, prefiereMenosMovimiento, () => false);
}
