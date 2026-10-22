/**
 * Confeti de la cabecera de `ConfirmacionV2` (F8, BAL-4967).
 *
 * Valores tomados del prototipo de Brenda (2026-10-20, pantalla "7.
 * Confirmación"): 26 piezas, 5 colores de marca, caída con balanceo lateral
 * (`--sway`) y giro. Con `prefers-reduced-motion` no hay piezas: ni una sola,
 * no solo "sin animación" — así no queda nada que el navegador tenga que
 * ignorar ni un `opacity: 0` que se quede pegado en pantalla.
 */

export interface PiezaConfeti {
  left: string;
  width: number;
  height: number;
  borderRadius: string;
  background: string;
  /** Desplazamiento lateral de la caída (variable CSS `--sway`). */
  sway: string;
  duracion: string;
  demora: string;
}

export const COLORES_CONFETI = ['#FFD666', '#5FD3BE', '#FFFFFF', '#9AA5F0', '#19C3A6'] as const;
export const TOTAL_PIEZAS_CONFETI = 26;

/** Las 26 piezas, o ninguna con `reducido` (prefers-reduced-motion). */
export function piezasDeConfeti(reducido: boolean): PiezaConfeti[] {
  if (reducido) return [];
  return Array.from({ length: TOTAL_PIEZAS_CONFETI }, (_, i) => {
    const w = 6 + (i % 3) * 3;
    return {
      left: `${(i * 37 + 7) % 100}%`,
      width: w,
      height: i % 3 === 0 ? w : w + 6,
      borderRadius: i % 3 === 0 ? '999px' : '2px',
      background: COLORES_CONFETI[i % COLORES_CONFETI.length],
      sway: `${((i * 23) % 70) - 35}px`,
      duracion: `${(2.8 + (i % 5) * 0.45).toFixed(2)}s`,
      demora: `${((i % 8) * 0.3).toFixed(2)}s`,
    };
  });
}
