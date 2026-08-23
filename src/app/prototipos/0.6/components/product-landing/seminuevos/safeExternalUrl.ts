/**
 * Valida el esquema de una URL que viene de BD (config.buttons.whatsapp.url,
 * editable desde el admin) antes de usarla en un href.
 *
 * Solo se aceptan `http:` y `https:`. Cualquier otra cosa —`javascript:`,
 * `data:`, `vbscript:`, una ruta relativa sin esquema, o un valor que ni
 * siquiera parsea como URL— cae al valor por defecto para que el link nunca
 * ejecute código ni rompa el render (hallazgo de seguridad [MEDIO]: XSS
 * almacenado vía href sin validar).
 *
 * `HeroCta.tsx` y `ConvenioCta.tsx` consumen el mismo campo con
 * `window.open` pero son compartidos con todo el sitio y no se tocan acá.
 */
const SAFE_PROTOCOLS = new Set(['http:', 'https:']);

export function safeExternalUrl(
  candidate: string | null | undefined,
  fallback: string
): string {
  if (!candidate) return fallback;

  try {
    const url = new URL(candidate);
    return SAFE_PROTOCOLS.has(url.protocol) ? candidate : fallback;
  } catch {
    return fallback;
  }
}
