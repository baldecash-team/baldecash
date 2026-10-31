/**
 * Confeti de la cabecera de `ConfirmacionV2` (F8, BAL-4967).
 *
 * BAL-5361 (prototipo de Brenda v56 del 30-oct): «confeti mínimo», 4
 * papelitos que caen UNA sola vez (antes 26 que caían 3 veces). Las 4 piezas
 * son las mismas del prototipo (7 % / 44 % / 81 % / 18 %, 2,80–4,15 s,
 * 0–0,9 s de demora), caída con balanceo lateral (`--sway`) y giro.
 * BAL-5401 (Emilio, 30-oct): «un poco más de confeti», 12 papelitos con la
 * misma fórmula (las 4 primeras son las del prototipo) y una sola caída.
 * BAL-5408 (Emilio, 30-oct): «agrega más confeti», 24 papelitos con la misma
 * fórmula, y «2 veces no 3»: cada pieza cae dos veces. Con
 * `prefers-reduced-motion` no hay piezas: ni una sola,
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
export const TOTAL_PIEZAS_CONFETI = 24;
/** Cuántas veces cae cada pieza (`animation-iteration-count`). */
export const CAIDAS_CONFETI = 2;

/** Las 24 piezas, o ninguna con `reducido` (prefers-reduced-motion). */
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
