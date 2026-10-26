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

const KEYNUA_HOST = 'keynua.com';

/**
 * Valida un `link_firma` de Keynua antes de pintarlo como botón (p. ej. en
 * `/continuar/si/[token]`). Más estricto que `safeExternalUrl`: ahí basta
 * cualquier `http:`/`https:`, pero un link de firma que viaja por WhatsApp y
 * se abre en otra pestaña necesita `https:` sí o sí, y el host tiene que ser
 * `keynua.com` o un subdominio suyo —si no, es que el backend mandó cualquier
 * cosa (o algo hostil) y no hay que llevar al cliente ahí.
 *
 * Devuelve `null` si no pasa la validación; el call site no renderiza el botón.
 */
export function safeKeynuaFirmaUrl(candidate: string | null | undefined): string | null {
  const safe = safeExternalUrl(candidate);
  if (!safe) return null;

  try {
    const url = new URL(safe);
    if (url.protocol !== 'https:') return null;
    const host = url.hostname.toLowerCase();
    return host === KEYNUA_HOST || host.endsWith(`.${KEYNUA_HOST}`) ? safe : null;
  } catch {
    return null;
  }
}
