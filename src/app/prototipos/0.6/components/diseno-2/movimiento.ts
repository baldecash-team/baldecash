/**
 * Preferencias de movimiento y tamaño de pantalla para Diseño 2 (BAL-4964).
 * Compartido por la guía de campos y `SeccionPlegable`.
 */

/** La persona pidió menos movimiento (`prefers-reduced-motion`). */
export function prefiereMenosMovimiento(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
