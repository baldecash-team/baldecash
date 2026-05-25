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

  const coupon = params.get('coupon');
  if (coupon && coupon.trim()) {
    try { localStorage.setItem(couponKey(landingSlug), coupon.trim().toUpperCase()); } catch {}
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
