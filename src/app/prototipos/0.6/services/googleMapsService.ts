/**
 * Google Maps Service - BaldeCash v0.6
 * Singleton service for dynamically loading Google Maps API
 * Uses the recommended async loading pattern via importLibrary
 */

// Promise for tracking script load state
let googleMapsLoadPromise: Promise<void> | null = null;

/**
 * Bootstrap the Google Maps JS API with loading=async (recommended pattern).
 *
 * IMPORTANT — loading=async contract:
 * With `loading=async`, Google Maps does NOT eagerly populate the global
 * namespace (google.maps.places, google.maps.marker, etc). Instead, consumers
 * MUST call `google.maps.importLibrary('<name>')` for each library they need,
 * which resolves with the module. Without this call, `google.maps.places.Autocomplete`
 * is undefined — which is exactly the failure mode observed on iOS Safari
 * where the loader fully respects the async contract.
 *
 * We pre-import 'places' and 'marker' here so the rest of the app can keep
 * using the classic `google.maps.places.Autocomplete` / `google.maps.marker.*`
 * API surface without further refactoring.
 *
 * @see https://developers.google.com/maps/documentation/javascript/load-maps-js-api
 */
async function bootstrapGoogleMaps(apiKey: string): Promise<void> {
  // 1. Inject the loader script.
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&language=es&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = (err) => {
      console.error('[googleMapsService] script failed to load', err);
      googleMapsLoadPromise = null;
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });

  // 2. Pre-import the libraries we need. Required when loading=async is set,
  //    otherwise google.maps.places.Autocomplete / google.maps.marker.* are
  //    undefined even though the script has finished loading.
  if (typeof google === 'undefined' || !google.maps?.importLibrary) {
    throw new Error('google.maps.importLibrary is not available after script load');
  }

  try {
    await Promise.all([
      google.maps.importLibrary('places'),
      google.maps.importLibrary('marker'),
      google.maps.importLibrary('geocoding'),
    ]);
  } catch (err) {
    console.error('[googleMapsService] importLibrary failed', err);
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

  // Check if already loaded
  if (typeof google !== 'undefined' && google.maps && google.maps.places) {
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
