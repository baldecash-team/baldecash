/**
 * Persistencia local del avance del recorrido de video, por token.
 *
 * Semántica "una sola sesión" = ventana de reanudación de 10 minutos:
 * si el usuario reabre el link dentro de la ventana, retoma en la pregunta
 * donde quedó; si expiró (o no hay avance), arranca desde 0. El avance se
 * limpia al completar exitosamente el flujo.
 *
 * Todo acceso a localStorage está protegido para SSR (typeof window) y para
 * modo incógnito / storage deshabilitado (try/catch).
 */

export const RESUME_WINDOW_MS = 10 * 60 * 1000; // 10 minutos

const PREFIX = 'admision:video:progress:';

interface StoredProgress {
  index: number;
  updatedAt: number;
}

function keyFor(token: string): string {
  return `${PREFIX}${token}`;
}

/**
 * Lee el avance guardado para el token.
 * Devuelve null si no existe, está malformado o la ventana expiró
 * (en ese caso además limpia la clave obsoleta).
 */
export function loadProgress(token: string): { index: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(keyFor(token));
    if (!raw) return null;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as StoredProgress).index !== 'number' ||
      typeof (parsed as StoredProgress).updatedAt !== 'number'
    ) {
      return null;
    }

    const { index, updatedAt } = parsed as StoredProgress;

    if (Date.now() - updatedAt >= RESUME_WINDOW_MS) {
      clearProgress(token);
      return null;
    }

    return { index };
  } catch {
    return null;
  }
}

/** Guarda el avance (índice de pregunta) con marca de tiempo. */
export function saveProgress(token: string, index: number): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: StoredProgress = { index, updatedAt: Date.now() };
    window.localStorage.setItem(keyFor(token), JSON.stringify(payload));
  } catch {
    // storage lleno / deshabilitado → ignorar
  }
}

/** Elimina el avance guardado para el token. */
export function clearProgress(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(keyFor(token));
  } catch {
    // ignorar
  }
}
