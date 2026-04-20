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
  },
};
