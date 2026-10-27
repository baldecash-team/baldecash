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

/** Host del link de firma de Keynua (`https://sign.keynua.com/index.html?token=...`). */
const KEYNUA_FIRMA_HOST = 'sign.keynua.com';
/** Hosts del KYC propio (`{FRONTEND_URL}/kyc/<token>` en ws2). */
const KYC_HOSTS = new Set(['baldecash.com', 'www.baldecash.com']);
/** `/kyc/<token>`, con o sin el prefijo `/prototipos/<versión>` de FRONTEND_URL. */
const KYC_PATH = /^(\/prototipos\/[0-9.]+)?\/kyc\/[A-Za-z0-9_-]{16,128}$/;

/**
 * Valida un `link_firma` antes de mandar al cliente ahí (p. ej. el «Sí» de
 * `/continuar/si/[token]`, que redirige directo a firmar). Más estricto que
 * `safeExternalUrl`: `https:` sí o sí, sin usuario/clave/puerto, y SOLO dos
 * formas — las mismas que valida ws2:
 *
 * - Keynua: `https://sign.keynua.com/index.html?token=...`
 * - KYC propio: `https://baldecash.com[/prototipos/<v>]/kyc/<token>`
 *
 * Cualquier otra cosa es que el backend mandó algo que no corresponde (o algo
 * hostil). Devuelve `null` si no pasa; el call site no redirige.
 */
export function safeFirmaUrl(candidate: string | null | undefined): string | null {
  const safe = safeExternalUrl(candidate);
  if (!safe) return null;

  try {
    const url = new URL(safe);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
    const host = url.hostname.toLowerCase();
    if (host === KEYNUA_FIRMA_HOST) {
      return url.pathname === '/index.html' && url.searchParams.get('token') ? safe : null;
    }
    if (KYC_HOSTS.has(host)) {
      return KYC_PATH.test(url.pathname) && !url.search && !url.hash ? safe : null;
    }
    return null;
  } catch {
    return null;
  }
}
