/**
 * Landing Config types.
 *
 * Mirrors the shape returned by GET /public/landing/{slug}/config,
 * where values come already cast (bool/int/float/string/JSON) and
 * grouped by namespace (the first segment of the key before the dot).
 */

export interface LandingConfigLayout {
  /** Whether the landing exposes a product catalog. */
  has_catalog: boolean;
}

export interface FloatingCtaConfig {
  title: string;
  subtitle: string;
  icon: string;
  expanded_title: string;
  expanded_description: string;
  cta_text: string;
  url: string;
}

export type DniCaptureMode = 'modal' | 'inline';

export interface LandingConfigFeatures {
  /** Whether to show the DNI modal on landing load. */
  has_dni_modal: boolean;
  /** Whether the DNI modal is required (user cannot skip). */
  dni_required: boolean;
  /** Whether to show the "Comisión de plataformas digitales" row in cronograma. */
  show_platform_commission: boolean;
  /** ISO date for VIP countdown end (e.g. "2026-04-25T05:00:00.000Z"). Empty string = no countdown. */
  vip_countdown: string;
  /** Whether to validate DNI against a whitelist before accepting. */
  has_dni_whitelist: boolean;
  /** How the DNI is captured: 'modal' (popup) or 'inline' (embedded in overlay). */
  dni_capture_mode: DniCaptureMode;
  /** Floating CTA button config. null = no button. */
  floating_cta: FloatingCtaConfig | null;
  /** Overlay variant slug. Empty = default VIP overlay. */
  overlay_variant: string;
  /** ISO date deadline for overlay access. Empty = no deadline. */
  overlay_deadline: string;
}

/**
 * Resolved landing configuration, grouped by namespace.
 * Namespaces are intentionally open to allow extensibility via seeding
 * without frontend changes — unknown namespaces are typed as `unknown`.
 */
export interface LandingConfig {
  layout: LandingConfigLayout;
  features: LandingConfigFeatures;
  [namespace: string]: Record<string, unknown> | LandingConfigLayout | LandingConfigFeatures;
}

/**
 * Pago diferido a nivel landing (namespace `deferred_payment`).
 * Viene de `landing.extra_data.deferred_payment` y lo expone el endpoint
 * /public/landing/{slug}/config. Cuando `enabled` es true, el primer pago se
 * corre `deferred_months` meses hacia adelante.
 */
export interface DeferredPaymentConfig {
  /** Si el pago diferido está activo para esta landing. */
  enabled: boolean;
  /** Cantidad de meses que se adelanta/corre el primer pago. */
  deferred_months: number;
  /** Etiqueta de campaña (ej. "paga-en-septiembre"). Informativa. */
  source?: string;
}

/**
 * Extrae de forma segura el namespace `deferred_payment` de un LandingConfig
 * resuelto. Devuelve null cuando está ausente o no está habilitado.
 */
export function getDeferredPayment(config: LandingConfig): DeferredPaymentConfig | null {
  const raw = (config as Record<string, unknown>)['deferred_payment'] as
    | Partial<DeferredPaymentConfig>
    | undefined;
  if (!raw || raw.enabled !== true) return null;
  return {
    enabled: true,
    deferred_months:
      typeof raw.deferred_months === 'number' && raw.deferred_months > 0
        ? raw.deferred_months
        : 0,
    source: typeof raw.source === 'string' ? raw.source : undefined,
  };
}

/**
 * Calculadora de efectivo a nivel landing (namespace `calculadora`).
 * Viene de `landing.extra_data.calculadora` y lo expone el endpoint
 * /public/landing/{slug}/config.
 */
export interface CalculadoraConfig {
  enabled: boolean;
  efectivoProductId: number | null;
  monto: { min: number; max: number; step: number };
  plazos: number[];
  inicial: { percents: number[] };
  tea: number;
}

/**
 * Extrae de forma segura el namespace `calculadora`. Devuelve null cuando está
 * ausente o no está habilitado (fail-safe, como getDeferredPayment).
 */
export function getCalculadora(config: LandingConfig): CalculadoraConfig | null {
  const raw = (config as Record<string, unknown>)['calculadora'] as
    | Record<string, unknown>
    | undefined;
  if (!raw || raw.enabled !== true) return null;
  const monto = (raw.monto ?? {}) as Record<string, unknown>;
  const inicial = (raw.inicial ?? {}) as Record<string, unknown>;
  const num = (v: unknown, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
  const nums = (v: unknown) => (Array.isArray(v) ? v.map((x) => Number(x)).filter(Number.isFinite) : []);
  return {
    enabled: true,
    efectivoProductId:
      typeof raw.efectivo_product_id === 'number' ? raw.efectivo_product_id : null,
    monto: { min: num(monto.min), max: num(monto.max), step: num(monto.step, 100) || 100 },
    plazos: nums(raw.plazos),
    inicial: { percents: nums(inicial.percents).length ? nums(inicial.percents) : [0] },
    tea: num(raw.tea),
  };
}

/** A single ingredient (key-value) linked to the landing. */
export interface LandingConfigIngredient {
  code: string;
  key: string;
  value: unknown;
}

/** Raw API response for the config endpoint. */
export interface LandingConfigResponse {
  slug: string;
  ingredients: LandingConfigIngredient[];
  config: Partial<LandingConfig> & Record<string, Record<string, unknown>>;
}

/** Logo overrides per overlay variant. */
export const OVERLAY_VARIANT_LOGOS: Record<string, string> = {
  cade: 'https://baldecash.s3.amazonaws.com/company/logo-cade-2026.webp',
};

/** Default config used when the API is unreachable or returns null/empty. */
export const DEFAULT_LANDING_CONFIG: LandingConfig = {
  layout: {
    has_catalog: true,
  },
  features: {
    has_dni_modal: false,
    dni_required: false,
    show_platform_commission: false,
    vip_countdown: '',
    has_dni_whitelist: false,
    dni_capture_mode: 'modal',
    floating_cta: null,
    overlay_variant: '',
    overlay_deadline: '',
  },
};
