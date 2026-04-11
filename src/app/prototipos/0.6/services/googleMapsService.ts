/**
 * Google Maps Service - BaldeCash v0.6
 * Singleton service for dynamically loading Google Maps API
 * Uses the recommended async loading pattern via importLibrary
 */

// Promise for tracking script load state
let googleMapsLoadPromise: Promise<void> | null = null;

/**
 * Bootstrap the Google Maps JS API with loading=async (recommended pattern).
 * This avoids the "loaded directly without loading=async" console warning.
 *
 * IMPORTANT: The `loading=async` query param is required by Google to be in
 * the URL itself — setting `script.async = true` alone is NOT enough. Without
 * this param, Google logs a warning AND some features (including Autocomplete
 * on mobile Safari) may behave unreliably.
 *
 * @see https://developers.google.com/maps/documentation/javascript/load-maps-js-api
 */
async function bootstrapGoogleMaps(apiKey: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&language=es&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.info('[googleMapsService] script loaded', {
        hasGoogle: typeof google !== 'undefined',
        hasPlaces: typeof google !== 'undefined' && !!google?.maps?.places,
        hasAutocomplete:
          typeof google !== 'undefined' && !!google?.maps?.places?.Autocomplete,
      });
      resolve();
    };
    script.onerror = (err) => {
      console.error('[googleMapsService] script failed to load', err);
      googleMapsLoadPromise = null;
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
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
 * Check if Google Maps is loaded and ready
 */
export function isGoogleMapsLoaded(): boolean {
  return typeof google !== 'undefined' && !!google?.maps?.places;
}

/**
 * Reset the load state (for testing/error recovery)
 */
export function resetGoogleMapsLoader(): void {
  googleMapsLoadPromise = null;
}
