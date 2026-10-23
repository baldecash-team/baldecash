/**
 * Preferencias de movimiento y tamaño de pantalla para Diseño 2 (BAL-4964).
 * Única fuente de `prefers-reduced-motion` del kit (menor 9 de la revisión
 * final, BAL-4969): la guía de campos y `SeccionPlegable` leen
 * `prefiereMenosMovimiento()` al momento; los componentes que pintan distinto
 * según la preferencia usan `useMenosMovimiento()`.
 */

import { useEffect, useState } from 'react';

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

/**
 * Hook de `prefers-reduced-motion`: arranca en `false` (igual en el servidor
 * y en el primer render del cliente) y sigue los cambios de la preferencia.
 */
export function useMenosMovimiento(): boolean {
  const [reducido, setReducido] = useState(false);
  useEffect(() => {
    let consulta: MediaQueryList;
    try {
      consulta = window.matchMedia(CONSULTA_MENOS_MOVIMIENTO);
    } catch {
      return;
    }
    setReducido(consulta.matches);
    const alCambiar = (e: MediaQueryListEvent) => setReducido(e.matches);
    consulta.addEventListener?.('change', alCambiar);
    return () => consulta.removeEventListener?.('change', alCambiar);
  }, []);
  return reducido;
}
