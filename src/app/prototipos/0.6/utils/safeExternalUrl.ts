/**
 * Valida el esquema de una URL que viene de BD antes de usarla para navegar.
 *
 * El caso concreto es `config.buttons.whatsapp.url` del componente `cta`, un
 * campo de texto libre que se edita desde el admin y que después viaja directo
 * a un `href` o a `window.open`. Sin validar, un valor guardado como
 * `javascript:...` se ejecuta en el navegador del visitante al hacer clic
 * (XSS almacenado, BAL-3292).
 *
 * Solo se aceptan `http:` y `https:`. Cualquier otra cosa —`javascript:`,
 * `data:`, `vbscript:`, una ruta relativa sin esquema, o un valor que ni
 * siquiera parsea como URL— devuelve el fallback.
 *
 * El fallback por defecto es `''` (cadena vacía), que es lo que los call sites
 * ya tratan como "no hay link": no abren nada. Quien tenga una URL por defecto
 * sensata puede pasarla como segundo argumento.
 */
const SAFE_PROTOCOLS = new Set(['http:', 'https:']);

export function safeExternalUrl(
  candidate: string | null | undefined,
  fallback: string = ''
): string {
  if (!candidate) return fallback;

  try {
    const url = new URL(candidate);
    return SAFE_PROTOCOLS.has(url.protocol) ? candidate : fallback;
  } catch {
    return fallback;
  }
}
