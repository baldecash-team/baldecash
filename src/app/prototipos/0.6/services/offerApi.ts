/**
 * Offer API Service - BaldeCash v0.6 (Caso 4 · BAL-1785)
 *
 * Cliente de los endpoints públicos de la oferta condicionada a capacidad de
 * pago. El estudiante abre /oferta/{token} y esta capa consume:
 *   GET  /public/offer/{token}          → "Tu oferta" (recomendado + alternativas)
 *   GET  /public/offer/{token}/catalog  → catálogo filtrado EN VIVO por su cuota
 *   POST /public/offer/{token}/select   → registra el equipo elegido
 *
 * Reutiliza mapApiProductToCatalogProduct del catálogo: los productos llegan en
 * el mismo shape que el catálogo normal.
 */

import type { CatalogProduct } from '../[landing]/catalogo/types/catalog';
import {
  mapApiProductToCatalogProduct,
  type ApiCatalogProduct,
} from './catalogApi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

/** Razones de error que devuelve el backend (SecureLinkError.reason). */
export type OfferErrorReason =
  | 'invalid'
  | 'expired'
  | 'consumed'
  | 'revoked'
  | 'purpose_mismatch'
  | 'offer_not_found'
  | 'unknown';

export class OfferApiError extends Error {
  reason: OfferErrorReason;
  status: number;
  constructor(reason: OfferErrorReason, message: string, status: number) {
    super(message);
    this.reason = reason;
    this.status = status;
  }
}

/** Equipo que el estudiante pidió originalmente (se muestra tachado). */
export interface RequestedProduct {
  id: number;
  variant_id: number | null;
  name: string | null;
  slug: string | null;
  image_url: string | null;
  /** Cuota del equipo pedido a 24m/0%; null si no aplica. Sirve para comparar
   *  contra la cuota aprobada ("supera tu cuota" o "sí entra"). */
  monthly_price: number | null;
}

export interface SelectedEquipment {
  variantId: number;
  name: string;
  slug: string | null;
  imageUrl: string | null;
  brand: string | null;
  monthlyPayment: number | null;
  termMonths: number | null;
}

export interface OfferView {
  offerCode: string;
  maxMonthlyQuota: number;
  expiresAt: string | null;
  landingSlug: string | null;
  requestedProduct: RequestedProduct | null;
  recommended: CatalogProduct | null;
  alternativesCount: number;
  /** Si el link ya fue consumido: el equipo que el estudiante eligió. */
  alreadySelected?: boolean;
  selectedEquipment?: SelectedEquipment | null;
  /** Código de la solicitud y nombre del estudiante (de la BD). */
  applicationCode?: string | null;
  clientName?: string | null;
}

export interface OfferCatalog {
  maxMonthlyQuota: number;
  items: CatalogProduct[];
  count: number;
}

export interface OfferCatalogFilters {
  q?: string;
  brandIds?: number[];
  types?: string[];
  gamas?: string[];
  usages?: string[];
  labels?: string[];
  conditions?: string[];
  minQuota?: number;
  maxQuota?: number;
  minPrice?: number;
  maxPrice?: number;
  /** Specs técnicos: {"ram":[8,16],"touch_screen":[true],...} → se envía como JSON. */
  specs?: Record<string, (string | number | boolean)[]>;
  sortBy?: string;
}

async function parseError(res: Response): Promise<OfferApiError> {
  let reason: OfferErrorReason = 'unknown';
  let message = 'Ocurrió un error al cargar la oferta.';
  try {
    const body = await res.json();
    const detail = body?.detail ?? body;
    if (detail?.reason) reason = detail.reason as OfferErrorReason;
    if (detail?.message) message = detail.message;
  } catch {
    /* respuesta sin JSON */
  }
  return new OfferApiError(reason, message, res.status);
}

/** GET /public/offer/{token} — datos de "Tu oferta". */
export async function getOffer(token: string): Promise<OfferView> {
  const res = await fetch(`${API_BASE_URL}/public/offer/${encodeURIComponent(token)}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw await parseError(res);
  const data = await res.json();

  // Link ya consumido con selección → el backend devuelve already_selected.
  if (data.already_selected) {
    const eq = data.selected_equipment ?? null;
    return {
      offerCode: data.offer_code,
      maxMonthlyQuota: data.max_monthly_quota ?? 0,
      expiresAt: null,
      landingSlug: data.landing_slug ?? null,
      requestedProduct: data.requested_product ?? null,
      recommended: null,
      alternativesCount: 0,
      alreadySelected: true,
      applicationCode: data.application_code ?? null,
      clientName: data.client_name ?? null,
      selectedEquipment: eq
        ? {
            variantId: eq.variant_id,
            name: eq.name,
            slug: eq.slug ?? null,
            imageUrl: eq.image_url ?? null,
            brand: eq.brand ?? null,
            monthlyPayment: eq.monthly_payment ?? null,
            termMonths: eq.term_months ?? null,
          }
        : null,
    };
  }

  return {
    offerCode: data.offer_code,
    applicationCode: data.application_code ?? null,
    clientName: data.client_name ?? null,
    maxMonthlyQuota: data.max_monthly_quota,
    expiresAt: data.expires_at ?? null,
    landingSlug: data.landing_slug ?? null,
    requestedProduct: data.requested_product ?? null,
    recommended: data.recommended
      ? mapApiProductToCatalogProduct(data.recommended as ApiCatalogProduct)
      : null,
    alternativesCount: data.alternatives_count ?? 0,
  };
}

/** GET /public/offer/{token}/catalog — catálogo filtrado por la cuota (en vivo). */
export async function getCatalog(
  token: string,
  filters: OfferCatalogFilters = {},
): Promise<OfferCatalog> {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.brandIds?.length) params.set('brand_ids', filters.brandIds.join(','));
  if (filters.types?.length) params.set('types', filters.types.join(','));
  if (filters.gamas?.length) params.set('gamas', filters.gamas.join(','));
  if (filters.usages?.length) params.set('usages', filters.usages.join(','));
  if (filters.labels?.length) params.set('labels', filters.labels.join(','));
  if (filters.conditions?.length) params.set('conditions', filters.conditions.join(','));
  if (filters.minQuota != null) params.set('min_quota', String(filters.minQuota));
  if (filters.maxQuota != null) params.set('max_quota', String(filters.maxQuota));
  if (filters.minPrice != null) params.set('min_price', String(filters.minPrice));
  if (filters.maxPrice != null) params.set('max_price', String(filters.maxPrice));
  if (filters.specs && Object.keys(filters.specs).length > 0) {
    params.set('specs', JSON.stringify(filters.specs));
  }
  if (filters.sortBy) params.set('sort_by', filters.sortBy);

  const qs = params.toString();
  const url = `${API_BASE_URL}/public/offer/${encodeURIComponent(token)}/catalog${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw await parseError(res);
  const data = await res.json();
  return {
    maxMonthlyQuota: data.max_monthly_quota,
    items: (data.items ?? []).map((it: ApiCatalogProduct) => mapApiProductToCatalogProduct(it)),
    count: data.count ?? 0,
  };
}

/** Contadores de filtros calculados sobre el catálogo de la oferta (no la
 *  landing completa). Uso y specs vienen de la BD real. */
export interface OfferFilterCounts {
  typeCounts: Record<string, number>;
  brandCounts: Record<string, number>; // por NOMBRE de marca
  conditionCounts: Record<string, number>;
  labelCounts: Record<string, number>;
  usageCounts: Record<string, number>;
  specCounts: Record<string, Record<string, number>>;
  total: number;
}

/** GET /public/offer/{token}/filters — contadores coherentes con el catálogo. */
export async function getOfferFilterCounts(token: string): Promise<OfferFilterCounts> {
  const res = await fetch(`${API_BASE_URL}/public/offer/${encodeURIComponent(token)}/filters`, {
    cache: 'no-store',
  });
  if (!res.ok) throw await parseError(res);
  const d = await res.json();
  return {
    typeCounts: d.type_counts ?? {},
    brandCounts: d.brand_counts ?? {},
    conditionCounts: d.condition_counts ?? {},
    labelCounts: d.label_counts ?? {},
    usageCounts: d.usage_counts ?? {},
    specCounts: d.spec_counts ?? {},
    total: d.total ?? 0,
  };
}

/** POST /public/offer/{token}/select — registra el equipo elegido. */
export async function selectEquipment(
  token: string,
  variantId: number,
): Promise<{ offerId: number; selectedVariantId: number; status: string }> {
  const res = await fetch(`${API_BASE_URL}/public/offer/${encodeURIComponent(token)}/select`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ variant_id: variantId }),
  });
  if (!res.ok) throw await parseError(res);
  const data = await res.json();
  return {
    offerId: data.offer_id,
    selectedVariantId: data.selected_variant_id,
    status: data.status,
  };
}
