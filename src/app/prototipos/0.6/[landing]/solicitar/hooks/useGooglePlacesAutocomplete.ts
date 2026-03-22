/**
 * useGooglePlacesAutocomplete Hook - BaldeCash v0.6
 * Manages Google Places Autocomplete integration
 */

import { useEffect, useRef, useState, useCallback, RefObject } from 'react';
import { loadGoogleMapsScript, isGoogleMapsLoaded } from '../../../services/googleMapsService';
import { ParsedAddress } from '../../../types/googleMaps';
import { parseGooglePlace } from '../utils/parseGooglePlace';

interface UseGooglePlacesOptions {
  /** Ref to the input element */
  inputRef: RefObject<HTMLInputElement | null>;
  /** Country restriction (default: "pe") */
  countryRestriction?: string;
  /** Callback when a place is selected */
  onPlaceSelected: (place: ParsedAddress) => void;
  /** Callback on error */
  onError?: (error: string) => void;
}

interface UseGooglePlacesResult {
  /** Whether Google Maps is loaded */
  isLoaded: boolean;
  /** Whether Google Maps is currently loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Clear the current selection */
  clearSelection: () => void;
  /** Get current location via GPS */
  getCurrentLocation: () => Promise<ParsedAddress | null>;
}

/**
 * Hook for Google Places Autocomplete
 */
export function useGooglePlacesAutocomplete({
  inputRef,
  countryRestriction = 'pe',
  onPlaceSelected,
  onError,
}: UseGooglePlacesOptions): UseGooglePlacesResult {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // Load Google Maps script
  useEffect(() => {
    if (isGoogleMapsLoaded()) {
      setIsLoaded(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    loadGoogleMapsScript()
      .then(() => {
        setIsLoaded(true);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        const errorMsg = err instanceof Error ? err.message : 'Error loading Google Maps';
        setError(errorMsg);
        setIsLoading(false);
        onError?.(errorMsg);
      });
  }, [onError]);

  // Initialize Autocomplete when loaded and input is available
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) {
      return;
    }

    try {
      // Create Autocomplete instance
      const options: google.maps.places.AutocompleteOptions = {
        fields: ['formatted_address', 'geometry', 'address_components', 'name'],
        types: ['address'],
        componentRestrictions: { country: countryRestriction },
      };

      autocompleteRef.current = new google.maps.places.Autocomplete(
        inputRef.current,
        options
      );

      // Initialize Geocoder for reverse geocoding
      geocoderRef.current = new google.maps.Geocoder();

      // Handle place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();

        if (!place || !place.geometry) {
          // User pressed enter without selecting from dropdown
          return;
        }

        const parsedAddress = parseGooglePlace(place);
        onPlaceSelected(parsedAddress);
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error initializing autocomplete';
      setError(errorMsg);
      onError?.(errorMsg);
    }

    // Cleanup
    return () => {
      if (autocompleteRef.current && typeof google !== 'undefined' && google?.maps?.event) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [isLoaded, inputRef, countryRestriction, onPlaceSelected, onError]);

  // Clear selection
  const clearSelection = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [inputRef]);

  // Get current location via GPS
  const getCurrentLocation = useCallback(async (): Promise<ParsedAddress | null> => {
    if (!isLoaded || !geocoderRef.current) {
      onError?.('Google Maps not loaded');
      return null;
    }

    if (!navigator.geolocation) {
      onError?.('Geolocation not supported');
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const latLng = { lat: latitude, lng: longitude };

          try {
            const results = await new Promise<google.maps.GeocoderResult[]>(
              (resolveGeocoder, rejectGeocoder) => {
                geocoderRef.current!.geocode(
                  { location: latLng },
                  (
                    results: google.maps.GeocoderResult[] | null,
                    status: google.maps.GeocoderStatus
                  ) => {
                    if (status === 'OK' && results && results.length > 0) {
                      resolveGeocoder(results);
                    } else {
                      rejectGeocoder(new Error('No address found'));
                    }
                  }
                );
              }
            );

            // Parse the first result
            const place = results[0] as unknown as google.maps.places.PlaceResult;
            place.geometry = {
              location: new google.maps.LatLng(latitude, longitude),
            } as google.maps.places.PlaceGeometry;

            const parsedAddress = parseGooglePlace(place);
            resolve(parsedAddress);
          } catch {
            onError?.('No se pudo obtener la dirección');
            resolve(null);
          }
        },
        (geoError) => {
          let errorMsg = 'Error de ubicación';
          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              errorMsg = 'Permiso de ubicación denegado';
              break;
            case geoError.POSITION_UNAVAILABLE:
              errorMsg = 'Ubicación no disponible';
              break;
            case geoError.TIMEOUT:
              errorMsg = 'Tiempo de espera agotado';
              break;
          }
          onError?.(errorMsg);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, [isLoaded, onError]);

  return {
    isLoaded,
    isLoading,
    error,
    clearSelection,
    getCurrentLocation,
  };
}

export default useGooglePlacesAutocomplete;
