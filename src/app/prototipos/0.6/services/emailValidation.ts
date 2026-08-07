/**
 * Normalización y validación de correos escritos por una persona.
 *
 * Espejo de `normalize_email` / `is_valid_email` del backend
 * (ws2: app/services/email_service.py). Si cambia una regla aquí, cambiala allá:
 * el backend es el que finalmente entrega el correo y rechaza lo que no puede enviar.
 */

/** Prefijo que deja pegar un hipervínculo (`mailto:alguien@dominio.pe`). */
const MAILTO_PREFIX = /^\s*mailto:\s*/i;

/**
 * Zero-width space/joiners, marcas bidi, BOM y non-breaking space: llegan con el
 * copy/paste desde Word, PDFs o correos y son invisibles en el input.
 */
const INVISIBLE_CHARS = /[​-‏⁠﻿ ]/g;

/**
 * Forma de un address entregable. Más estricta que `[^\s@]+@[^\s@]+\.[^\s@]+`:
 * esa aceptaba `mailto:...` porque `:` cae dentro de `[^\s@]`, y aceptaba
 * dominios con puntos vacíos (`uni..edu.pe`).
 */
const EMAIL_RE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

/**
 * Limpieza suave para aplicar en cada tecla: quita `mailto:`, los invisibles y los
 * espacios de los bordes. No toca mayúsculas, puntuación final ni espacios internos,
 * para no pelear con el correo a medio escribir ni fusionar en silencio dos palabras
 * (`juan perez@uni.pe` es ambiguo: se marca como inválido, no se adivina).
 */
export function sanitizeEmailInput(value: string): string {
  if (!value) return '';
  return value.replace(INVISIBLE_CHARS, '').replace(MAILTO_PREFIX, '').trim();
}

/** Limpieza completa, para comparar/enviar. Devuelve '' si no queda nada. */
export function normalizeEmail(value: string | null | undefined): string {
  if (!value) return '';
  return sanitizeEmailInput(value)
    .replace(/^<+|>+$/g, '')
    .replace(/^[.,;:]+|[.,;:]+$/g, '')
    .toLowerCase();
}

/** True si, ya normalizado, el correo es entregable. */
export function isValidEmail(value: string | null | undefined): boolean {
  const normalized = normalizeEmail(value);
  return normalized.length > 0 && normalized.length <= 254 && EMAIL_RE.test(normalized);
}
