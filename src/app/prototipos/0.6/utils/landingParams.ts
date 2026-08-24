/**
 * Landing campaign params (categoria, coupon) capturados desde la URL
 * de entrada y persistidos en localStorage para aplicarlos en pasos
 * posteriores del funnel (catálogo, solicitar).
 *
 * Ejemplo de URL de entrada (ad Meta):
 *   https://www.baldecash.com/?utm_source=meta&coupon=UNIV2026&categoria=laptops
 *
 *   → categoria=laptops se aplica como filtro `device=laptop` al
 *     primer ingreso al catálogo de esta landing.
 *   → coupon=UNIV2026 se auto-valida en el wizard /solicitar cuando
 *     ya hay producto seleccionado.
 */

import type { CatalogDeviceType } from '../[landing]/catalogo/types/catalog';

const categoriaKey = (landing: string) => `baldecash-${landing}-pending-categoria`;
const couponKey = (landing: string) => `baldecash-${landing}-pending-coupon`;
const leadLinkKey = (landing: string) => `baldecash-${landing}-pending-alk`;
const promotorRefKey = (landing: string) => `baldecash-${landing}-promotor-ref`;

/**
 * Forma del código de referido que emite el hub de activaciones: 6 caracteres
 * de un alfabeto sin 0/O/1/l/i (ver `promotores.baldecash.com`, lib/referido_publico).
 *
 * Se valida antes de guardar porque `ref` llega de la calle —de un QR mal leído,
 * de un link recortado, de la URL entera pegada en el parámetro— y lo que se
 * guarda acá después viaja al backend como atribución. Guardar basura es peor
 * que no guardar nada: ensucia el dato con el que se le paga a alguien.
 */
const REF_RE = /^[23456789abcdefghjkmnpqrstuvwxyz]{6}$/;

/**
 * `ref` de la URL, normalizado, o null si no tiene forma de código.
 *
 * Acepta mayúsculas: ese código sí existe, y un `ref` que pasó por un cliente de
 * correo llega en mayúsculas. Rechazarlo por la caja sería perder la atribución.
 */
export function readPromotorRef(search: string): string | null {
  const raw = new URLSearchParams(search).get('ref')?.trim().toLowerCase();
  return raw && REF_RE.test(raw) ? raw : null;
}

/**
 * Drops the params parked for a landing (campaign coupon, preselected
 * category). Exported as a plain function so a session reset can clear them
 * without re-deriving the keys.
 */
export function clearPendingParams(landing: string): void {
  if (typeof window === 'undefined') return;
  for (const key of [categoriaKey(landing), couponKey(landing)]) {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {
      // Storage unavailable (private mode / quota). Keep clearing the rest.
    }
  }
}

const CATEGORIA_MAP: Record<string, CatalogDeviceType> = {
  laptop: 'laptop',
  laptops: 'laptop',
  tablet: 'tablet',
  tablets: 'tablet',
  celular: 'celular',
  celulares: 'celular',
  smartphone: 'celular',
  smartphones: 'celular',
  accesorio: 'accesorio',
  accesorios: 'accesorio',
};

export function normalizeCategoria(value: string | null | undefined): CatalogDeviceType | null {
  if (!value) return null;
  return CATEGORIA_MAP[value.toLowerCase()] ?? null;
}

/**
 * Cupón de la URL, en cualquiera de sus dos escrituras.
 *
 * `?coupon=` lo usan los anuncios; `?cupon=` lo emite el backend en todos los
 * links de activación (difusiones y socios). Vive acá y no inline en cada
 * lugar porque tener el alias en un solo sitio y no en el otro es exactamente
 * el bug que hacía que el catálogo descartara el cupón recién capturado.
 */
export function readCouponParam(search: string): string | null {
  const params = new URLSearchParams(search);
  const raw = params.get('coupon') ?? params.get('cupon');
  const value = raw?.trim();
  return value ? value.toUpperCase() : null;
}

/**
 * Lee `categoria` y `coupon` de la URL actual y los guarda en localStorage
 * (por landing). No-op en SSR.
 */
export function captureLandingParams(landingSlug: string): void {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);

  const categoria = normalizeCategoria(params.get('categoria'));
  if (categoria) {
    try { localStorage.setItem(categoriaKey(landingSlug), categoria); } catch {}
  }

  const coupon = readCouponParam(window.location.search);
  if (coupon) {
    try { localStorage.setItem(couponKey(landingSlug), coupon); } catch {}
  }

  // `ref` = código del link corto del hub de activaciones (`/r/{codigo}`). Es el
  // ÚNICO identificador de la promotora que viaja siempre en un flyer —`promotor`
  // sólo aparece cuando esa persona tiene correspondencia en ws2—, así que sin
  // guardarlo la atribución se pierde en cuanto la URL suelta el querystring, que
  // es lo que pasa al pasar de la landing al catálogo (`routes.catalogo()` arma
  // una URL limpia). No se limpia al consumirlo, por el mismo motivo que `alk`.
  const ref = readPromotorRef(window.location.search);
  if (ref) {
    try { localStorage.setItem(promotorRefKey(landingSlug), ref); } catch {}
  }

  // `alk` = código del link de activación. Cuando viene de un socio (A365) el
  // API ya tiene los datos de esa persona, así que el wizard puede prellenarse
  // sin pedírselos de nuevo. Se guarda el CÓDIGO, no los datos: los datos se
  // piden contra él más adelante y nunca viajan por la URL.
  const alk = params.get('alk');
  if (alk && alk.trim()) {
    try { localStorage.setItem(leadLinkKey(landingSlug), alk.trim()); } catch {}
  }
}

/**
 * Devuelve la categoría pendiente y la limpia (one-shot).
 * Se invoca una vez al cargar el catálogo para inicializar el filtro `device`.
 */
export function consumePendingCategoria(landingSlug: string): CatalogDeviceType | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = localStorage.getItem(categoriaKey(landingSlug));
    if (value) {
      localStorage.removeItem(categoriaKey(landingSlug));
      return normalizeCategoria(value);
    }
  } catch {}
  return null;
}

/**
 * Devuelve el cupón pendiente SIN limpiarlo. Limpiarlo solo cuando se
 * aplique con éxito (o falle definitivamente) vía `clearPendingCoupon`.
 */
export function getPendingCoupon(landingSlug: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(couponKey(landingSlug));
  } catch {
    return null;
  }
}

export function clearPendingCoupon(landingSlug: string): void {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(couponKey(landingSlug)); } catch {}
}

/**
 * Código del link de activación (`alk`) con el que entró el visitante.
 * No se limpia al consumirlo: el wizard puede montarse varias veces (recarga,
 * volver atrás) y el prellenado tiene que sobrevivir a eso.
 */
export function getLeadLinkCode(landingSlug: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(leadLinkKey(landingSlug));
  } catch {
    return null;
  }
}

/**
 * Código de la promotora (`ref`) con el que entró el visitante.
 *
 * No se limpia: la atribución vale para toda la visita, no para un paso. Quien
 * llegó por el flyer de alguien sigue siendo su referido aunque recargue, vuelva
 * atrás o reinicie el wizard.
 */
export function getPromotorRef(landingSlug: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(promotorRefKey(landingSlug));
  } catch {
    return null;
  }
}
