/** Límites de duración de los clips de validación por video. */

/** Mínimo para poder enviar un clip (segundos). */
export const MIN_RECORDING_SECONDS = 10;

/** Máximo de grabación: 5 minutos (segundos). Se auto-detiene al alcanzarlo. */
export const MAX_RECORDING_SECONDS = 300;

/** Aviso fijo para el UI con ambos límites. */
export const RECORDING_LIMITS_HINT =
  'Graba entre 10 segundos y 5 minutos. La grabación se detiene sola a los 5:00.';

/** true si el clip es demasiado corto para enviarse (< 10 s). */
export function isTooShort(seconds: number): boolean {
  return seconds < MIN_RECORDING_SECONDS;
}

/** true si alcanzó/superó el máximo (para auto-detener a los 5:00). */
export function reachedMax(seconds: number): boolean {
  return seconds >= MAX_RECORDING_SECONDS;
}

/** Mensaje de error si el clip no cumple la duración mínima; null si está OK. */
export function tooShortMessage(seconds: number): string | null {
  if (isTooShort(seconds)) {
    return `El video debe durar al menos ${MIN_RECORDING_SECONDS} segundos. Vuelve a grabar.`;
  }
  return null;
}

/** Segundos restantes hasta el tope de 5 min (para el countdown). Nunca negativo. */
export function remainingSeconds(elapsed: number): number {
  return Math.max(0, MAX_RECORDING_SECONDS - elapsed);
}

/** Formatea segundos como mm:ss (para el countdown del UI). */
export function formatMMSS(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}
