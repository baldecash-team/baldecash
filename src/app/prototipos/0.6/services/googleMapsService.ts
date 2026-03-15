/// <reference types="@types/google.maps" />
/**
 * Google Maps Service - BaldeCash v0.6
 * Singleton service for dynamically loading Google Maps API
 */

// Promise for tracking script load state
let googleMapsLoadPromise: Promise<void> | null = null;

/**
 * Load Google Maps script dynamically (singleton pattern)
 * Only loads once, subsequent calls return the same promise
 * Uses async loading pattern with importLibrary for optimal performance
 */
export function loadGoogleMapsScript(): Promise<void> {
  // Return existing promise if already loading/loaded
  if (googleMapsLoadPromise) {
    return googleMapsLoadPromise;
  }

  googleMapsLoadPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
      resolve();
      return;
    }

    // Get API key from environment
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      reject(new Error('Google Maps API key not configured'));
      return;
    }

    // Create and append script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=es`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // Verify Places library is available
      if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        resolve();
      } else {
        reject(new Error('Google Maps Places library not available'));
      }
    };

    script.onerror = () => {
      googleMapsLoadPromise = null; // Reset to allow retry
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });

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
