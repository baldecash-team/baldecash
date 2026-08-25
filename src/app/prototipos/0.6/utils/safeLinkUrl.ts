/**
 * Valida un enlace que viene de BD y que puede ser INTERNO.
 *
 * `safeExternalUrl` no sirve para este caso: solo acepta `http:`/`https:`, así
 * que rechaza `/reacondicionados#que-es` --`new URL()` lanza sin base-- que es
 * justo la forma del enlace de un banner que apunta a otra sección del sitio
 * (BAL-3320).
 *
 * Se aceptan dos formas:
 *
 *   1. Absoluta con esquema seguro: `https://...` o `http://...`
 *   2. Interna: empieza por `/`, `#` o `?`
 *
 * Todo lo demás devuelve el fallback: `javascript:`, `data:`, `vbscript:`,
 * `mailto:`, un esquema desconocido, o basura que no parsea.
 *
 * Ojo con `//evil.com`: es una URL protocol-relative que el navegador resuelve
 * como EXTERNA aunque empiece por `/`. Se rechaza explícitamente, porque el
 * chequeo ingenuo de "empieza por slash" la dejaría pasar.
 *
 * El fallback por defecto es `''`, que los call sites tratan como «no hay
 * link»: el banner se pinta sin envolver en <a>.
 */
const SAFE_PROTOCOLS = new Set(['http:', 'https:']);

export function safeLinkUrl(
  candidate: string | null | undefined,
  fallback: string = ''
): string {
  if (!candidate) return fallback;

  const url = candidate.trim();
  if (!url) return fallback;

  // Protocol-relative (`//host`): el navegador la trata como externa.
  if (url.startsWith('//')) return fallback;

  // Interna: ruta, ancla o query.
  if (url.startsWith('/') || url.startsWith('#') || url.startsWith('?')) {
    return url;
  }

  try {
    return SAFE_PROTOCOLS.has(new URL(url).protocol) ? url : fallback;
  } catch {
    return fallback;
  }
}
