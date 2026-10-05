/**
 * Mensajes de error amigables para el flujo de admisión (mejora #3).
 * Traduce los `code`/`reason` crudos del backend a copy cálido en español.
 */

export interface ApiErrorLike {
  code?: string;
  reason?: string;
  message?: string;
}

/** Mapas de copy por `reason` (prioritario) y por `code`. */
const REASON_MESSAGES: Record<string, string> = {
  cooldown: 'Acabamos de enviarte un código. Espera unos segundos antes de pedir uno nuevo.',
  invalid_code: 'Ese código no coincide. Revísalo e inténtalo de nuevo.',
  expired: 'El enlace venció. Solicita uno nuevo para continuar.',
  revoked: 'Este enlace fue reemplazado. Usa el más reciente que te enviamos.',
  purpose_mismatch: 'Este enlace no sirve para esta acción. Revisa que sea el correcto.',
  inactive: 'Este enlace no está disponible. Revisa que sea el correcto.',
  invalid: 'El enlace no es válido. Si crees que es un error, contáctanos.',
};

const CODE_MESSAGES: Record<string, string> = {
  network: 'No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.',
  timeout: 'La conexión tardó demasiado. Inténtalo de nuevo en un momento.',
};

const GENERIC = 'Algo no salió bien. Inténtalo de nuevo en un momento.';

/**
 * Devuelve un mensaje amigable. Prioriza `reason`, luego `code`; si no hay
 * mapeo, usa el `message` del backend tal cual; en último caso, un genérico.
 */
export function friendlyError(e: ApiErrorLike | null | undefined): string {
  if (!e) return GENERIC;
  if (e.reason && REASON_MESSAGES[e.reason]) return REASON_MESSAGES[e.reason];
  if (e.code && CODE_MESSAGES[e.code]) return CODE_MESSAGES[e.code];
  if (e.message && e.message.trim()) return e.message;
  return GENERIC;
}

/** Intentos máximos estándar (mejora #4). */
export const MAX_ATTEMPTS = 3;

/**
 * Copy de intentos restantes sobre el estándar de 3 (mejora #4).
 * `used` = intentos ya consumidos; nunca muestra negativos.
 */
export function attemptsCopy(used = 0): string {
  const remaining = Math.max(0, MAX_ATTEMPTS - used);
  return `Te quedan ${remaining} de ${MAX_ATTEMPTS} intentos.`;
}
