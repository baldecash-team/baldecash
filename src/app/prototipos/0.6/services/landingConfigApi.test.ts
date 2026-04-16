/**
 * Tests for landingConfigApi
 *
 * Verifies:
 * - mergeLandingConfig: null/partial/extra-namespaces handling
 * - fetchLandingConfig: success, 404, network error, malformed JSON
 *   all paths must yield DEFAULT_LANDING_CONFIG on failure (never throw)
 */

import { fetchLandingConfig, mergeLandingConfig } from './landingConfigApi';
import { DEFAULT_LANDING_CONFIG } from '../types/landingConfig';

// ============================================================================
// mergeLandingConfig
// ============================================================================

describe('mergeLandingConfig', () => {
  it('returns defaults when input is null', () => {
    expect(mergeLandingConfig(null)).toEqual(DEFAULT_LANDING_CONFIG);
  });

  it('returns defaults when input is undefined', () => {
    expect(mergeLandingConfig(undefined)).toEqual(DEFAULT_LANDING_CONFIG);
  });

  it('returns defaults when given an empty object', () => {
    expect(mergeLandingConfig({})).toEqual(DEFAULT_LANDING_CONFIG);
  });

  it('overrides layout flags from API while keeping defaults for missing keys', () => {
    // Runtime API may send partial layout; cast to match the FE-facing signature.
    const result = mergeLandingConfig({
      layout: { has_catalog: false },
    } as Parameters<typeof mergeLandingConfig>[0]);
    expect(result.layout.has_catalog).toBe(false);
  });

  it('overrides features flags from API while keeping defaults for missing keys', () => {
    const result = mergeLandingConfig({
      features: { has_dni_modal: true, dni_required: true },
    } as Parameters<typeof mergeLandingConfig>[0]);
    expect(result.features.has_dni_modal).toBe(true);
    expect(result.features.dni_required).toBe(true);
  });

  it('merges both layout and features together', () => {
    const result = mergeLandingConfig({
      layout: { has_catalog: false },
      features: { has_dni_modal: true, dni_required: false },
    } as Parameters<typeof mergeLandingConfig>[0]);
    expect(result.layout).toEqual({ has_catalog: false });
    expect(result.features).toEqual({ has_dni_modal: true, dni_required: false, show_platform_commission: false });
  });

  it('passes through unknown namespaces untouched (extensibility)', () => {
    const result = mergeLandingConfig({
      content: { label: 'Hola' },
      branding: { primary_color: '#4654CD' },
    });
    expect(result.content).toEqual({ label: 'Hola' });
    expect(result.branding).toEqual({ primary_color: '#4654CD' });
    // And defaults still present
    expect(result.layout).toEqual(DEFAULT_LANDING_CONFIG.layout);
    expect(result.features).toEqual(DEFAULT_LANDING_CONFIG.features);
  });

  it('ignores non-object extra namespace values', () => {
    const result = mergeLandingConfig({
      // @ts-expect-error - intentionally malformed input
      bogus: 'not-an-object',
      // @ts-expect-error - intentionally malformed input
      zero: 0,
    });
    expect(result.bogus).toBeUndefined();
    expect(result.zero).toBeUndefined();
  });
});

// ============================================================================
// fetchLandingConfig
// ============================================================================

describe('fetchLandingConfig', () => {
  const originalFetch = global.fetch;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    global.fetch = originalFetch;
    warnSpy.mockRestore();
  });

  it('returns merged config on 200 OK', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        slug: 'baldecash-macbook-neo',
        ingredients: [
          { code: 'catalog-off', key: 'layout.has_catalog', value: false },
        ],
        config: {
          layout: { has_catalog: false },
          features: { has_dni_modal: false, dni_required: false },
        },
      }),
    }) as unknown as typeof fetch;

    const result = await fetchLandingConfig('baldecash-macbook-neo');

    expect(result.layout.has_catalog).toBe(false);
    expect(result.features.has_dni_modal).toBe(false);
  });

  it('returns DEFAULT_LANDING_CONFIG on 404', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
    }) as unknown as typeof fetch;

    const result = await fetchLandingConfig('nonexistent');
    expect(result).toEqual(DEFAULT_LANDING_CONFIG);
  });

  it('returns DEFAULT_LANDING_CONFIG on network error', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error('Network down')) as unknown as typeof fetch;

    const result = await fetchLandingConfig('whatever');
    expect(result).toEqual(DEFAULT_LANDING_CONFIG);
    expect(warnSpy).toHaveBeenCalled();
  });

  it('returns DEFAULT_LANDING_CONFIG when JSON parsing fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    }) as unknown as typeof fetch;

    const result = await fetchLandingConfig('broken');
    expect(result).toEqual(DEFAULT_LANDING_CONFIG);
    expect(warnSpy).toHaveBeenCalled();
  });

  it('returns DEFAULT_LANDING_CONFIG when API returns body with no config', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ slug: 'x', preset: null }),
    }) as unknown as typeof fetch;

    const result = await fetchLandingConfig('x');
    expect(result).toEqual(DEFAULT_LANDING_CONFIG);
  });

  it('URL-encodes the slug to prevent path injection', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ slug: 'weird slug/with spaces', preset: null, config: {} }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await fetchLandingConfig('weird slug/with spaces');

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain('weird%20slug%2Fwith%20spaces');
  });

  it('passes revalidate hint for SSR caching', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ slug: 'x', preset: null, config: {} }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await fetchLandingConfig('x');

    const options = fetchMock.mock.calls[0][1] as { next?: { revalidate?: number } };
    expect(options.next?.revalidate).toBe(300);
  });
});
