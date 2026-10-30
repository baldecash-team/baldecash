/**
 * Pantalla de espera al enviar la solicitud en Diseño 2 (BAL-5361, prototipo
 * de Brenda v58 del 30-oct, «Enviando tu solicitud»). Reglas puras, sin JSX.
 *
 * Tres pasos que avanzan con el envío REAL (`SubmitStage` de
 * `useSubmitApplication`), no con un reloj:
 *
 * - `validating`                      → «Revisando tus datos» en curso.
 * - `uploading` / `processing` / `slow` → «Revisando tus datos» hecho y
 *   «Registrando tu solicitud» en curso (el POST a ws2 está en vuelo).
 * - `success`                         → los tres hechos; la página pasa a
 *   «Recibimos tu solicitud».
 *
 * Ya no existe «Subiendo archivos»: en la solicitud no se sube ningún archivo
 * (si algún día viajara uno, `uploading` cae en «Registrando tu solicitud»).
 */
import type { SubmitStage } from '@/app/prototipos/0.6/[landing]/solicitar/hooks/useSubmitApplication';

export type EstadoPasoEspera = 'hecho' | 'actual' | 'pendiente';

export interface PasoEspera {
  titulo: string;
  detalle: string;
  estado: EstadoPasoEspera;
}

export const PASOS_ESPERA: ReadonlyArray<{ titulo: string; detalle: string }> = [
  { titulo: 'Revisando tus datos', detalle: 'Que todo esté completo' },
  { titulo: 'Registrando tu solicitud', detalle: 'Guardamos tus datos' },
  { titulo: 'Solicitud enviada', detalle: 'Ya la recibimos' },
];

/** Índice (0-based) del paso en curso; 3 = todos hechos. */
function indiceEnCurso(stage: SubmitStage): number {
  switch (stage) {
    case 'success':
      return PASOS_ESPERA.length;
    case 'uploading':
    case 'processing':
    case 'slow':
      return 1;
    default:
      return 0;
  }
}

export function pasosDeLaEspera(stage: SubmitStage): PasoEspera[] {
  const enCurso = indiceEnCurso(stage);
  return PASOS_ESPERA.map((p, i) => ({
    ...p,
    estado: i < enCurso ? 'hecho' : i === enCurso ? 'actual' : 'pendiente',
  }));
}

/**
 * Debajo del título. Con `slow` (el envío pasó los 15 s) va la sugerencia del
 * prototipo en vez de «Tarda unos segundos.».
 */
export function subtituloDeLaEspera(stage: SubmitStage): string {
  return stage === 'slow'
    ? 'Está tardando un poco más de lo normal. Sigue en esta página.'
    : 'Tarda unos segundos.';
}
