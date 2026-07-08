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
import type { CatalogFiltersResponse } from '../types/filters';
import type { Accessory, InsurancePlan } from '../[landing]/solicitar/types/upsell';
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
  /** Cuota REAL que el estudiante eligió en su solicitud (de la application).
   *  Para celulares es en su frecuencia (semanal/quincenal). Null si no aplica. */
  monthly_price: number | null;
  /** Plazo (nº de cuotas nativas) y su equivalente en meses. */
  term?: number | null;
  term_months?: number | null;
  /** Inicial (%) elegido. */
  initial_percent?: number | null;
  /** Monto (S/) de la inicial que pagó el estudiante. La card muestra el monto. */
  initial_amount?: number | null;
  /** Frecuencia de la cuota: 'mensual' | 'semanal' | 'quincenal'. */
  payment_frequency?: string | null;
  /** Accesorios/seguros que el cliente YA tenía en su pedido original
   *  (composición real, acta 1-jul). Card izquierda "el que pediste". */
  accessories?: Array<{ id: number | null; name: string; monthly: number }>;
  insurances?: Array<{ id: number | null; name: string; monthly: number }>;
}

/** Accesorio/seguro elegido en la oferta (para el desglose de confirmación). */
export interface SelectedAddon {
  id: string;
  name: string;
  monthly: number;
  /** Regalo incluido gratis por el combo elegido (BAL-2159): monthly viene en 0. */
  includedFree?: boolean;
}

export interface SelectedEquipment {
  variantId: number;
  name: string;
  slug: string | null;
  imageUrl: string | null;
  brand: string | null;
  monthlyPayment: number | null;
  termMonths: number | null;
  /** Inicial (%) elegido — para el desglose de confirmación (BAL-2097). */
  initialPercent?: number | null;
  /** Monto (S/) de la inicial elegida. La card muestra el monto, no el %. */
  initialAmount?: number | null;
  /** Accesorios/seguros que el cliente sumó (BAL-2064). */
  accessories?: SelectedAddon[];
  insurances?: SelectedAddon[];
}

/** Accesorio de la oferta exclusiva (perfil B del upsell). */
export interface UpsellAccessory {
  product_id: number;
  name: string;
  price: number;
  monthly: number;
  terms: number;
}

/** La oferta exclusiva del Caso 5 (equipo recomendado + accesorio si aplica). */
export interface ExclusiveOffer {
  productId: number;
  variantId: number | null;
  name: string | null;
  slug: string | null;
  brand: string | null;
  imageUrl: string | null;
  monthlyPrice: number;
  combinedMonthly: number;
  termMonths: number;
  /** Monto (S/) de la inicial del exclusivo. La card muestra el monto, no el %. */
  initialAmount?: number | null;
  accessory: UpsellAccessory | null;
}

export interface OfferView {
  offerCode: string;
  maxMonthlyQuota: number;
  expiresAt: string | null;
  landingSlug: string | null;
  requestedProduct: RequestedProduct | null;
  recommended: CatalogProduct | null;
  /** Si el link ya fue consumido: el equipo que el estudiante eligió. */
  alreadySelected?: boolean;
  selectedEquipment?: SelectedEquipment | null;
  /** Código de la solicitud y nombre del estudiante (de la BD). */
  applicationCode?: string | null;
  clientName?: string | null;
  /** Caso 5 (upsell): 'upsell' cuando el token es de esa oferta. */
  offerCase?: 'downgrade' | 'upsell';
  /** Perfil de la oferta exclusiva (A/B/C) — solo upsell. */
  profile?: string | null;
  /** Perfil C: tarifa especial activa → mostrar "Tarifa especial para ti". */
  isCustomRate?: boolean;
  /** Upsell: el pedido del cliente tenía accesorios de combo que se perderán al
   * cambiar de equipo. El FE muestra un aviso de transparencia. */
  hasComboAccessories?: boolean;
  /** La oferta exclusiva — solo upsell. */
  exclusiveOffer?: ExclusiveOffer | null;
  /** Plazos permitidos por la oferta (BAL-2096). Default [24] si el backend no los trae. */
  terms: number[];
  /** Iniciales (%) permitidos por la oferta (BAL-2096). Default [0]. */
  initials: number[];
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

  // Caso 5 (upsell): el backend devuelve case='upsell' con la oferta exclusiva.
  if (data.case === 'upsell') {
    const ex = data.exclusive_offer ?? null;
    const acc = ex?.accessory ?? null;
    return {
      offerCode: data.offer_code,
      maxMonthlyQuota: data.max_monthly_quota ?? 0,
      expiresAt: null,
      landingSlug: data.landing_slug ?? null,
      requestedProduct: data.current_product ?? null,
      recommended: null,
      applicationCode: data.application_code ?? null,
      clientName: data.client_name ?? null,
      offerCase: 'upsell',
      profile: data.profile ?? null,
      isCustomRate: data.is_custom_rate ?? false,
      hasComboAccessories: data.has_combo_accessories ?? false,
      exclusiveOffer: ex
        ? {
            productId: ex.product_id,
            variantId: ex.variant_id ?? null,
            name: ex.name ?? null,
            slug: ex.slug ?? null,
            brand: ex.brand ?? null,
            imageUrl: ex.image_url ?? null,
            monthlyPrice: ex.monthly_price ?? 0,
            combinedMonthly: ex.combined_monthly ?? ex.monthly_price ?? 0,
            termMonths: ex.term_months ?? 24,
            initialAmount: ex.initial_amount ?? null,
            accessory: acc,
          }
        : null,
      terms: data.terms ?? [24],
      initials: data.initials ?? [0],
    };
  }

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
            initialPercent: eq.initial_percent ?? null,
            initialAmount: eq.initial_amount ?? null,
            accessories: (data.selected_accessories ?? []).map((a: Record<string, unknown>) => ({
              id: String(a.id),
              name: String(a.name ?? 'Accesorio'),
              monthly: Number(a.monthly ?? 0),
              includedFree: Boolean(a.included_free),
            })),
            insurances: (data.selected_insurances ?? []).map((s: Record<string, unknown>) => ({
              id: String(s.id),
              name: String(s.name ?? 'Seguro'),
              monthly: Number(s.monthly ?? 0),
              includedFree: Boolean(s.included_free),
            })),
          }
        : null,
      terms: data.terms ?? [24],
      initials: data.initials ?? [0],
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
    terms: data.terms ?? [24],
    initials: data.initials ?? [0],
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
  /** Rango real de cuota mensual del catálogo de la oferta (para topar el slider
   *  en el equipo más caro elegible, no en el max de la landing completa). */
  quotaRange: { min: number; max: number } | null;
  total: number;
}

/** GET /public/offer/{token}/filters — filtros UNIFICADOS de la oferta:
 *  estructura + contadores JUNTOS (mismo shape que el catálogo general), ya
 *  topados por la cuota. Reemplaza la doble llamada (estructura del general +
 *  contadores) y el merge en el cliente. El backend oculta opciones en count 0.
 */
export async function getOfferFilters(
  token: string,
  filters: OfferCatalogFilters = {},
): Promise<CatalogFiltersResponse> {
  // Los filtros aplicados hacen los contadores CONTEXTUALES (reactivos), como el
  // catálogo general. El endpoint de filtros solo consume estas dimensiones (no
  // q/gamas/price: no aplican al conteo de la oferta).
  const params = new URLSearchParams();
  if (filters.brandIds?.length) params.set('brand_ids', filters.brandIds.join(','));
  if (filters.types?.length) params.set('types', filters.types.join(','));
  if (filters.usages?.length) params.set('usages', filters.usages.join(','));
  if (filters.labels?.length) params.set('labels', filters.labels.join(','));
  if (filters.conditions?.length) params.set('conditions', filters.conditions.join(','));
  if (filters.minQuota != null) params.set('min_quota', String(filters.minQuota));
  if (filters.maxQuota != null) params.set('max_quota', String(filters.maxQuota));
  if (filters.specs && Object.keys(filters.specs).length > 0) {
    params.set('specs', JSON.stringify(filters.specs));
  }
  const qs = params.toString();
  const url = `${API_BASE_URL}/public/offer/${encodeURIComponent(token)}/filters${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw await parseError(res);
  const d = await res.json();
  // El backend ya devuelve el shape del general; solo se rellenan las dimensiones
  // que la oferta no usa (price_range/gamas/spec_groups) para cumplir el tipo.
  return {
    brands: d.brands ?? [],
    types: d.types ?? [],
    conditions: d.conditions ?? [],
    labels: d.labels ?? [],
    usages: d.usages ?? [],
    specs: d.specs ?? {},
    quota_range: d.quota_range ?? { min: 0, max: 0, term_months: 24, initial_percent: 0, tea: 0, description: '' },
    price_range: { min: 0, max: 0, currency: 'PEN' },
    gamas: [],
    spec_groups: [],
    sort_options: d.sort_options ?? [],
  };
}

/** POST /public/offer/{token}/select — registra el equipo elegido.
 *  `comboId`: si el equipo viene de un combo, se envía para que el backend
 *  sincronice el accesorio correcto a legacy (un equipo puede estar en varios
 *  combos, así que el variant_id solo no basta). */
export async function selectEquipment(
  token: string,
  variantId: number,
  comboId?: number | null,
  addons?: { accessoryIds?: number[]; insuranceIds?: number[] },
  pricing?: { term?: number; initial?: number },
): Promise<{ offerId: number; selectedVariantId: number; status: string }> {
  const res = await fetch(`${API_BASE_URL}/public/offer/${encodeURIComponent(token)}/select`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      variant_id: variantId,
      ...(comboId != null ? { combo_id: comboId } : {}),
      ...(addons?.accessoryIds?.length ? { accessory_ids: addons.accessoryIds } : {}),
      ...(addons?.insuranceIds?.length ? { insurance_ids: addons.insuranceIds } : {}),
      // Plazo/inicial elegidos (BAL-2097): el backend valida/registra con esta celda.
      ...(pricing?.term != null ? { term: pricing.term } : {}),
      ...(pricing?.initial != null ? { initial: pricing.initial } : {}),
    }),
  });
  if (!res.ok) throw await parseError(res);
  const data = await res.json();
  return {
    offerId: data.offer_id,
    selectedVariantId: data.selected_variant_id,
    status: data.status,
  };
}

/** Un accesorio o seguro disponible en la oferta (BAL-2064). */
export interface OfferAddon {
  id: number;
  name: string;
  imageUrl?: string | null;
  monthly: number;
  kind: 'accessory' | 'insurance';
}

/** GET /public/offer/{token}/addons — accesorios/seguros que caben en el
 *  threshold restante sobre el equipo elegido. */
export async function getOfferAddons(
  token: string,
  variantId: number,
  selected?: { accessoryIds?: number[]; insuranceIds?: number[]; term?: number; initial?: number },
): Promise<{ remaining: number; accessories: OfferAddon[]; insurances: OfferAddon[] }> {
  const params = new URLSearchParams({ variant_id: String(variantId) });
  if (selected?.accessoryIds?.length) params.set('accessory_ids', selected.accessoryIds.join(','));
  if (selected?.insuranceIds?.length) params.set('insurance_ids', selected.insuranceIds.join(','));
  if (selected?.term != null) params.set('term', String(selected.term));
  if (selected?.initial != null) params.set('initial', String(selected.initial));
  const res = await fetch(
    `${API_BASE_URL}/public/offer/${encodeURIComponent(token)}/addons?${params.toString()}`,
    { cache: 'no-store' },
  );
  if (!res.ok) throw await parseError(res);
  const d = await res.json();
  const mapAcc = (a: Record<string, unknown>): OfferAddon => ({
    id: Number(a.id),
    name: String(a.name ?? a.displayName ?? 'Accesorio'),
    imageUrl: (a.image ?? a.imageUrl ?? a.thumbnail) as string | null | undefined,
    monthly: Number(a.monthlyQuota ?? a.monthly ?? 0),
    kind: 'accessory',
  });
  const mapIns = (a: Record<string, unknown>): OfferAddon => ({
    id: Number(a.id),
    name: String(a.name ?? a.planName ?? 'Seguro'),
    imageUrl: (a.image ?? a.imageUrl) as string | null | undefined,
    monthly: Number(a.monthlyPrice ?? a.monthly ?? 0),
    kind: 'insurance',
  });
  return {
    remaining: Number(d.remaining ?? 0),
    accessories: (d.accessories ?? []).map(mapAcc),
    insurances: (d.insurances ?? []).map(mapIns),
  };
}

/** Nombres legibles por slug de categoría de accesorio (los que usa el catálogo).
 *  Para slugs no mapeados se capitaliza el propio slug. */
const ACCESSORY_CATEGORY_NAMES: Record<string, string> = {
  otro: 'Otro',
  auriculares: 'Auriculares',
  hub: 'Hub',
  mochila: 'Mochilas',
  mouse: 'Mouse',
  teclado: 'Teclados',
  cargador: 'Cargadores',
  funda: 'Fundas',
  soporte: 'Soportes',
  camara: 'Cámaras',
  impresora: 'Impresoras',
};

/** Normaliza `category` de /addons (viene como slug string) al shape
 *  { slug, name } que espera el tipo Accessory y los chips de categoría. */
function normalizeAccessoryCategory(raw: unknown): Accessory['category'] {
  if (raw && typeof raw === 'object' && 'slug' in (raw as Record<string, unknown>)) {
    return raw as Accessory['category'];
  }
  if (typeof raw === 'string' && raw.trim()) {
    const slug = raw.trim();
    const name = ACCESSORY_CATEGORY_NAMES[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1);
    return { slug, name };
  }
  return { slug: 'otro', name: 'Otro' };
}

/** Versión "rica" de /addons: devuelve el shape completo que esperan las cards
 *  del flujo regular (Accessory / InsurancePlan). El backend ya lo entrega
 *  (to_public_response + InsuranceListingService); acá solo se re-tipa/normaliza.
 *  Se usa en la página de mini-checkout (/oferta/{token}/accesorios). */
export async function getOfferAddonsRich(
  token: string,
  variantId: number,
  selected?: { accessoryIds?: number[]; insuranceIds?: number[]; term?: number; initial?: number },
  comboId?: number | null,
): Promise<{ remaining: number; equipoMonthly: number; equipoInitialAmount: number; equipoFrequency: string; equipoTerm: number | null; accessories: Accessory[]; insurances: InsurancePlan[]; comboFreeAddons: { accessories: { id: string; name: string }[]; insurances: { id: string; name: string }[] } }> {
  const params = new URLSearchParams({ variant_id: String(variantId) });
  if (selected?.accessoryIds?.length) params.set('accessory_ids', selected.accessoryIds.join(','));
  if (selected?.insuranceIds?.length) params.set('insurance_ids', selected.insuranceIds.join(','));
  if (selected?.term != null) params.set('term', String(selected.term));
  if (selected?.initial != null) params.set('initial', String(selected.initial));
  if (comboId != null) params.set('combo_id', String(comboId));
  const res = await fetch(
    `${API_BASE_URL}/public/offer/${encodeURIComponent(token)}/addons?${params.toString()}`,
    { cache: 'no-store' },
  );
  if (!res.ok) throw await parseError(res);
  const d = await res.json();
  const accessories: Accessory[] = (d.accessories ?? []).map((a: Record<string, unknown>) => ({
    id: String(a.id),
    name: String(a.name ?? 'Accesorio'),
    description: String(a.description ?? ''),
    price: Number(a.price ?? 0),
    monthlyQuota: Number(a.monthlyQuota ?? 0),
    image: String(a.image ?? ''),
    thumbnailUrl: (a.thumbnailUrl ?? a.image) as string | undefined,
    // El endpoint /addons devuelve `category` como slug (string). El tipo
    // Accessory (y AccessoryCard/los chips) esperan { slug, name }. Normalizamos
    // igual que AccessoriesSection para no romper `key={cat.slug}` ni los labels.
    category: normalizeAccessoryCategory(a.category),
    term: Number(a.term ?? 24),
    isRecommended: Boolean(a.isRecommended),
    compatibleWith: (a.compatibleWith as string[]) ?? ['all'],
    specs: (a.specs as Accessory['specs']) ?? undefined,
    brand: (a.brand ?? null) as Accessory['brand'],
  }));
  const insurances: InsurancePlan[] = (d.insurances ?? []).map((s: Record<string, unknown>) => ({
    id: String(s.id),
    code: String(s.code ?? ''),
    name: String(s.name ?? 'Seguro'),
    description: String(s.description ?? ''),
    monthlyPrice: Number(s.monthlyPrice ?? 0),
    totalPrice: Number(s.totalPrice ?? 0),
    paymentMonths: Number(s.paymentMonths ?? 24),
    insuranceType: String(s.insuranceType ?? ''),
    coverage: (s.coverage as InsurancePlan['coverage']) ?? [],
    exclusions: (s.exclusions as string[]) ?? [],
    isRecommended: Boolean(s.isRecommended),
    tier: (s.tier as InsurancePlan['tier']) ?? 'basic',
    durationMonths: Number(s.durationMonths ?? 24),
    provider: (s.provider ?? null) as InsurancePlan['provider'],
  }));
  const comboFreeAddons = {
    accessories: ((d.combo_free_addons?.accessories) ?? []).map((a: Record<string, unknown>) => ({
      id: String(a.id),
      name: String(a.name ?? 'Accesorio'),
    })),
    insurances: ((d.combo_free_addons?.insurances) ?? []).map((s: Record<string, unknown>) => ({
      id: String(s.id),
      name: String(s.name ?? 'Seguro'),
    })),
  };
  return {
    remaining: Number(d.remaining ?? 0),
    equipoMonthly: Number(d.equipo_monthly ?? 0),
    equipoInitialAmount: Number(d.equipo_initial_amount ?? 0),
    equipoFrequency: String(d.equipo_frequency ?? 'mensual'),
    equipoTerm: d.equipo_term != null ? Number(d.equipo_term) : null,
    accessories,
    insurances,
    comboFreeAddons,
  };
}
