/**
 * UTMs: preservación entre rutas y bandera de bypass del KYC.
 *
 * Las rutas internas (`/solicitar/kyc?code=…`, `/solicitar/confirmacion/…`) se
 * arman solo con lo que necesitan, así que cualquier `router.push` deja atrás
 * los UTMs con los que entró la sesión. Por eso se **persisten** al entrar y se
 * leen de ahí después: en la ruta de KYC ya no están en la URL.
 */

/**
 * `promotor` viaja con los UTMs y no aparte: es la llave REAL del promotor en
 * ws2 —`DiffusionAttributionService._apply_promoter` lo lee de este parámetro y
 * nunca del `promo_` del `utm_term`, que es sólo un verificador del banner—. Si
 * se persistieran los cinco UTMs y no éste, la sesión llegaría con la campaña
 * pero sin a quién acreditarle la venta, que es justo lo que se está arreglando.
 */
const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'promotor',
] as const;

const STORAGE_KEY = 'baldecash-utm';

/**
 * Valor del parámetro de promotor (`utm_term`) que habilita continuar el KYC
 * sin haber podido verificar el rostro.
 *
 * Va en `utm_term` —el que el resto del sistema usa para el promotor— y no en
 * `utm_content` ni `utm_campaign`: esos dos identifican la campaña y la
 * variante creativa, y pisarlos rompería la atribución justo de estas
 * sesiones, que son las que más interesa medir. Además ata la salida a QUIÉN
 * la ofrece, no a un anuncio.
 */
export const KYC_BYPASS_UTM_TERM = 'activacion';

function leerStorage(): Record<string, string> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

/**
 * Guarda los UTMs de la URL actual. Idempotente y no destructivo: si la sesión
 * ya tenía UTMs y la URL nueva no trae ninguno, se conservan los anteriores —
 * navegar a una ruta interna no debe borrar la atribución de la entrada.
 */
export function persistUtmParams(search?: string): void {
  const enUrl = leerDeUrl(search);
  if (Object.keys(enUrl).length === 0) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...leerStorage(), ...enUrl }));
  } catch {
    /* sessionStorage no disponible: se degrada a solo-URL */
  }
}

function leerDeUrl(search?: string): Record<string, string> {
  const raw = search ?? (typeof window !== 'undefined' ? window.location.search : '');
  if (!raw) return {};
  const params = new URLSearchParams(raw);
  const out: Record<string, string> = {};
  UTM_KEYS.forEach((k) => {
    const v = params.get(k);
    if (v) out[k] = v;
  });
  return out;
}

/** UTMs de la URL actual, con lo persistido como respaldo. */
export function readUtmParams(search?: string): Record<string, string> {
  const enUrl = leerDeUrl(search);
  return Object.keys(enUrl).length > 0 ? enUrl : leerStorage();
}

/**
 * Agrega los UTMs a una URL, respetando el querystring que ya traiga.
 * Si no hay UTMs devuelve la URL intacta — nada de `?` colgando.
 */
export function withUtmParams(url: string, search?: string): string {
  const utms = readUtmParams(search);
  if (Object.keys(utms).length === 0) return url;

  const [base, hash = ''] = url.split('#');
  const separator = base.includes('?') ? '&' : '?';
  const qs = new URLSearchParams(utms).toString();

  return `${base}${separator}${qs}${hash ? `#${hash}` : ''}`;
}

/**
 * True si esta sesión puede saltarse la verificación de rostro.
 *
 * Es deliberadamente una puerta angosta: no se le ofrece a todo el mundo, solo
 * al tráfico que llega con el `utm_content` acordado. Así la salida se puede
 * pilotear por campaña y se mide cuántos la usan sin abrirla al público.
 */
export function kycBypassHabilitado(search?: string): boolean {
  return readUtmParams(search).utm_term === KYC_BYPASS_UTM_TERM;
}

/**
 * Suelta los UTMs persistidos. `persistUtmParams` mezcla lo nuevo sobre lo
 * viejo (`{ ...anterior, ...url }`), así que un link nuevo que no traiga
 * `promotor` heredaría el de la visita anterior: antes de capturar otro link
 * hay que vaciar el store, no sólo pisarlo.
 */
export function clearUtmParams(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* sessionStorage no disponible: no había nada que borrar */
  }
}
