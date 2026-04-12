/**
 * Google Maps Service - BaldeCash v0.6
 * Singleton service for dynamically loading Google Maps API
 * Uses the recommended async loading pattern via importLibrary
 */

// Promise for tracking script load state
let googleMapsLoadPromise: Promise<void> | null = null;

/**
 * Bootstrap the Google Maps JS API using the OFFICIAL inline bootstrap loader
 * from Google. This pattern creates `google.maps.importLibrary` synchronously
 * BEFORE any script is actually fetched, so consumers can `await importLibrary`
 * without race conditions.
 *
 * Why we can't just inject a <script> tag manually:
 * - With `loading=async` in the URL, `google.maps` is not populated eagerly.
 * - On iOS Safari specifically, there is a measurable window between
 *   `script.onload` firing and `google.maps.importLibrary` actually existing,
 *   because the loader keeps executing work after onload resolves.
 * - The inline bootstrap loader side-steps this by installing a shim for
 *   `importLibrary` up front, then lazily loading the real script only once
 *   the first library is requested.
 *
 * @see https://developers.google.com/maps/documentation/javascript/load-maps-js-api#use-the-importlibrary
 */

// Type augmentation for the bootstrap loader install function
type ImportLibraryFn = (name: string) => Promise<unknown>;

function installBootstrapLoader(apiKey: string): void {
  // This is Google's official inline bootstrap loader, expanded for clarity.
  // It exposes `google.maps.importLibrary(name)` immediately; the real script
  // is fetched the first time importLibrary is called.
  //
  // Source: https://developers.google.com/maps/documentation/javascript/load-maps-js-api#dynamic-library-import
  const g = window as unknown as {
    google?: { maps?: { importLibrary?: ImportLibraryFn; __ib__?: (v: unknown) => void } };
  };

  // If the loader (or a full google.maps) is already installed, do nothing.
  if (g.google?.maps?.importLibrary) return;

  g.google = g.google || {};
  g.google.maps = g.google.maps || {};

  const d = g.google.maps;

  const requested = new Set<string>();
  let loaderPromise: Promise<void> | null = null;

  const loadScript = (): Promise<void> => {
    if (loaderPromise) return loaderPromise;
    loaderPromise = new Promise<void>((resolve, reject) => {
      const params = new URLSearchParams();
      params.set('key', apiKey);
      params.set('v', 'weekly');
      params.set('libraries', Array.from(requested).join(','));
      params.set('language', 'es');
      params.set('loading', 'async');
      params.set('callback', 'google.maps.__ib__');

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
      script.async = true;
      script.defer = true;
      script.nonce =
        (document.querySelector('script[nonce]') as HTMLScriptElement | null)?.nonce || '';

      d.__ib__ = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps script'));
      document.head.appendChild(script);
    });
    return loaderPromise;
  };

  d.importLibrary = ((name: string) => {
    requested.add(name);
    return loadScript().then(() => {
      // After the script loads, Google replaces this shim with the real
      // importLibrary. Call through to it with the requested library name.
      const real = (window as unknown as { google: { maps: { importLibrary: ImportLibraryFn } } })
        .google.maps.importLibrary;
      return real(name);
    });
  }) as ImportLibraryFn;
}

async function bootstrapGoogleMaps(apiKey: string): Promise<void> {
  // 1. Install the inline bootstrap loader (synchronous; no network yet).
  installBootstrapLoader(apiKey);

  // 2. Request every library we need in parallel. The first call triggers
  //    the actual script download. Subsequent calls share the same promise.
  if (typeof google === 'undefined' || !google.maps?.importLibrary) {
    throw new Error('[googleMapsService] bootstrap loader failed to install importLibrary');
  }

  try {
    await Promise.all([
      google.maps.importLibrary('places'),
      google.maps.importLibrary('marker'),
      google.maps.importLibrary('geocoding'),
      google.maps.importLibrary('maps'),
    ]);
  } catch (err) {
    console.error('[googleMapsService] importLibrary failed', err);
    googleMapsLoadPromise = null;
    throw err;
  }

  console.info('[googleMapsService] script loaded', {
    hasGoogle: typeof google !== 'undefined',
    hasPlaces: typeof google !== 'undefined' && !!google?.maps?.places,
    hasAutocomplete:
      typeof google !== 'undefined' && !!google?.maps?.places?.Autocomplete,
    hasMarker: typeof google !== 'undefined' && !!google?.maps?.marker,
    hasGeocoder: typeof google !== 'undefined' && !!google?.maps?.Geocoder,
  });
}

/**
 * Load Google Maps script dynamically (singleton pattern)
 * Only loads once, subsequent calls return the same promise
 */
export function loadGoogleMapsScript(): Promise<void> {
  // Return existing promise if already loading/loaded
  if (googleMapsLoadPromise) {
    return googleMapsLoadPromise;
  }

  // Check if already fully loaded (Autocomplete/marker/Geocoder available).
  // We intentionally don't short-circuit on just `google.maps.places` because
  // the bootstrap loader installs an empty `google.maps` shim before the real
  // script is fetched — that namespace exists but has no classes yet.
  if (isGoogleMapsLoaded()) {
    googleMapsLoadPromise = Promise.resolve();
    return googleMapsLoadPromise;
  }

  // Get API key from environment
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    googleMapsLoadPromise = Promise.reject(new Error('Google Maps API key not configured'));
    return googleMapsLoadPromise;
  }

  googleMapsLoadPromise = bootstrapGoogleMaps(apiKey);
  return googleMapsLoadPromise;
}

/**
 * Check if Google Maps is loaded and ready.
 * We specifically check for `Autocomplete` (not just the `places` namespace)
 * because with `loading=async` the namespace can exist as an empty object
 * until `importLibrary('places')` resolves.
 */
export function isGoogleMapsLoaded(): boolean {
  return (
    typeof google !== 'undefined' &&
    !!google?.maps?.places?.Autocomplete &&
    !!google?.maps?.marker &&
    !!google?.maps?.Geocoder
  );
}

/**
 * Reset the load state (for testing/error recovery)
 */
export function resetGoogleMapsLoader(): void {
  googleMapsLoadPromise = null;
}
