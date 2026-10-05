/**
 * Feature flags resolved from backend system_config (via layout API).
 * Centralized so every consumer references the same parsed value.
 */

/** Default when layout settings are not yet available.
 * false = single-product (navega directo a /solicitar/). Es el caso seguro:
 * mientras settings carga (primeros renders vacíos), "Lo quiero" no debe abrir
 * el modal de carrito por error. Cuando el BD tiene el valor real, este se usa. */
const DEFAULT_ALLOW_MULTI_PRODUCT = false;

/**
 * Resolve allow_multi_product from layout settings (BD).
 * Falls back to default (false) when settings are not available.
 * @param settings - Record from LayoutContext.settings
 */
export function getAllowMultiProduct(settings?: Record<string, string>): boolean {
  const dbValue = settings?.['marketing.allow_multi_product'];
  if (dbValue !== undefined) return dbValue !== 'false';
  return DEFAULT_ALLOW_MULTI_PRODUCT;
}

/** Static fallback for contexts without layout data */
export const ALLOW_MULTI_PRODUCT = DEFAULT_ALLOW_MULTI_PRODUCT;

// ── Max Monthly Quota ────────────────────────────────────────────────

const DEFAULT_MAX_MONTHLY_QUOTA = 600;

/**
 * Resolve max_monthly_quota from layout settings (BD).
 * Falls back to 600 when settings are not available.
 * @param settings - Record from LayoutContext.settings
 */
export function getMaxMonthlyQuota(settings?: Record<string, string>): number {
  const dbValue = settings?.['finance.max_monthly_quota'];
  if (dbValue !== undefined) {
    const parsed = Number(dbValue);
    return isNaN(parsed) ? DEFAULT_MAX_MONTHLY_QUOTA : parsed;
  }
  return DEFAULT_MAX_MONTHLY_QUOTA;
}

/** Static fallback for contexts without layout data */
export const MAX_MONTHLY_QUOTA = DEFAULT_MAX_MONTHLY_QUOTA;
