/**
 * Landing Config API service.
 *
 * Fetches the resolved config preset for a landing from the public endpoint.
 * All errors are swallowed and replaced by DEFAULT_LANDING_CONFIG so a missing
 * backend never breaks the landing render.
 */

import {
  DEFAULT_LANDING_CONFIG,
  type LandingConfig,
  type LandingConfigResponse,
} from '../types/landingConfig';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

/** Revalidate cached config every 5 minutes. */
const REVALIDATE_SECONDS = 300;

/**
 * Merge a partial config (from API) on top of DEFAULT_LANDING_CONFIG, preserving
 * unknown namespaces as-is and ensuring the known namespaces always have their
 * expected shape.
 */
export function mergeLandingConfig(
  partial: LandingConfigResponse['config'] | null | undefined,
): LandingConfig {
  if (!partial) return { ...DEFAULT_LANDING_CONFIG };

  const layout = {
    ...DEFAULT_LANDING_CONFIG.layout,
    ...((partial.layout as Partial<LandingConfig['layout']> | undefined) ?? {}),
  };

  const features = {
    ...DEFAULT_LANDING_CONFIG.features,
    ...((partial.features as Partial<LandingConfig['features']> | undefined) ?? {}),
  };

  // Pass through any extra namespaces (extensibility without FE changes).
  const extras: Record<string, Record<string, unknown>> = {};
  for (const [key, value] of Object.entries(partial)) {
    if (key !== 'layout' && key !== 'features' && value && typeof value === 'object') {
      extras[key] = value as Record<string, unknown>;
    }
  }

  return {
    ...extras,
    layout,
    features,
  };
}

/**
 * Fetch the config for a landing. Returns DEFAULT_LANDING_CONFIG on any failure
 * (network error, 404, malformed body). Never throws.
 */
export async function fetchLandingConfig(slug: string): Promise<LandingConfig> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/public/landing/${encodeURIComponent(slug)}/config`,
      { next: { revalidate: REVALIDATE_SECONDS } },
    );

    if (!response.ok) {
      return { ...DEFAULT_LANDING_CONFIG };
    }

    const data = (await response.json()) as LandingConfigResponse;
    return mergeLandingConfig(data?.config);
  } catch (err) {
    console.warn('[landingConfigApi] fetch failed, using defaults:', err);
    return { ...DEFAULT_LANDING_CONFIG };
  }
}
