/**
 * Tests for googleMapsService
 * Tests the Google Maps script loading logic
 */

import {
  loadGoogleMapsScript,
  isGoogleMapsLoaded,
  resetGoogleMapsLoader,
} from '../googleMapsService';

// Store original env
const originalEnv = process.env;

// Mock document.createElement and document.head.appendChild
const mockScript = {
  src: '',
  async: false,
  defer: false,
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
};

const mockAppendChild = jest.fn();

describe('googleMapsService', () => {
  beforeEach(() => {
    // Reset module state
    resetGoogleMapsLoader();

    // Reset mocks
    jest.clearAllMocks();
    mockScript.src = '';
    mockScript.async = false;
    mockScript.defer = false;
    mockScript.onload = null;
    mockScript.onerror = null;

    // Mock document
    jest.spyOn(document, 'createElement').mockReturnValue(mockScript as unknown as HTMLScriptElement);
    jest.spyOn(document.head, 'appendChild').mockImplementation(mockAppendChild);

    // Reset env
    process.env = { ...originalEnv };

    // Clear google from global
    // @ts-expect-error - Clearing global for test
    delete (global as Record<string, unknown>).google;
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('isGoogleMapsLoaded', () => {
    it('returns false when google is not defined', () => {
      expect(isGoogleMapsLoaded()).toBe(false);
    });

    it('returns false when google.maps is not defined', () => {
      // @ts-expect-error - Setting partial google object for test
      global.google = {};
      expect(isGoogleMapsLoaded()).toBe(false);
    });

    it('returns false when google.maps.places is not defined', () => {
      // @ts-expect-error - Setting partial google object for test
      global.google = { maps: {} };
      expect(isGoogleMapsLoaded()).toBe(false);
    });

    it('returns true when google.maps.places is defined', () => {
      // @ts-expect-error - Setting mock google object for test
      global.google = { maps: { places: {} } };
      expect(isGoogleMapsLoaded()).toBe(true);
    });
  });

  describe('loadGoogleMapsScript', () => {
    it('rejects when API key is not configured', async () => {
      delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      await expect(loadGoogleMapsScript()).rejects.toThrow(
        'Google Maps API key not configured'
      );
    });

    it('resolves immediately if Google Maps is already loaded', async () => {
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-api-key';

      // Mock Google Maps as already loaded
      // @ts-expect-error - Setting mock google object for test
      global.google = { maps: { places: {} } };

      await expect(loadGoogleMapsScript()).resolves.toBeUndefined();

      // Should not have created a new script
      expect(document.createElement).not.toHaveBeenCalled();
    });

    it('creates script with correct attributes', async () => {
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-api-key';

      const loadPromise = loadGoogleMapsScript();

      // Verify script attributes
      expect(mockScript.src).toContain('https://maps.googleapis.com/maps/api/js');
      expect(mockScript.src).toContain('key=test-api-key');
      expect(mockScript.src).toContain('libraries=places');
      expect(mockScript.src).toContain('language=es');
      expect(mockScript.async).toBe(true);
      expect(mockScript.defer).toBe(true);

      // Simulate successful load
      // @ts-expect-error - Setting mock google object for test
      global.google = { maps: { places: {} } };
      mockScript.onload?.();

      await expect(loadPromise).resolves.toBeUndefined();
    });

    it('rejects when script fails to load', async () => {
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-api-key';

      const loadPromise = loadGoogleMapsScript();

      // Simulate load error
      mockScript.onerror?.();

      await expect(loadPromise).rejects.toThrow('Failed to load Google Maps script');
    });

    it('returns same promise for concurrent calls (singleton)', async () => {
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-api-key';

      const promise1 = loadGoogleMapsScript();
      const promise2 = loadGoogleMapsScript();

      // Should be the same promise instance
      expect(promise1).toBe(promise2);

      // Resolve it
      // @ts-expect-error - Setting mock google object for test
      global.google = { maps: { places: {} } };
      mockScript.onload?.();

      await Promise.all([promise1, promise2]);

      // Should only have created one script
      expect(document.createElement).toHaveBeenCalledTimes(1);
    });

    it('rejects when Places library is not available after load', async () => {
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-api-key';

      const loadPromise = loadGoogleMapsScript();

      // Simulate load but without Places
      // @ts-expect-error - Setting partial google object for test
      global.google = { maps: {} };
      mockScript.onload?.();

      await expect(loadPromise).rejects.toThrow(
        'Google Maps Places library not available'
      );
    });
  });

  describe('resetGoogleMapsLoader', () => {
    it('allows new load after reset', async () => {
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-api-key';

      // First load
      const promise1 = loadGoogleMapsScript();

      // Simulate successful load
      // @ts-expect-error - Setting mock google object for test
      global.google = { maps: { places: {} } };
      mockScript.onload?.();
      await promise1;

      // Reset
      resetGoogleMapsLoader();
      // @ts-expect-error - Clear google for test
      delete global.google;

      // Should create new script
      const promise2 = loadGoogleMapsScript();
      expect(promise2).not.toBe(promise1);

      // Resolve second load
      // @ts-expect-error - Setting mock google object for test
      global.google = { maps: { places: {} } };
      mockScript.onload?.();
      await promise2;

      expect(document.createElement).toHaveBeenCalledTimes(2);
    });
  });
});
