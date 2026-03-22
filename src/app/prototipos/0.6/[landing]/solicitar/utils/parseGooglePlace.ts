/**
 * parseGooglePlace - Shared utility for parsing Google Places results
 * Extracts address components into a structured ParsedAddress object
 */

import { ParsedAddress } from '../../../types/googleMaps.d';

/**
 * Parse Google Place result into our address structure
 */
export function parseGooglePlace(place: google.maps.places.PlaceResult): ParsedAddress {
  const components = place.address_components || [];

  // Helper to get component by type
  const getComponent = (type: string, useShort = false): string | null => {
    const component = components.find((c: google.maps.GeocoderAddressComponent) => c.types.includes(type));
    return component ? (useShort ? component.short_name : component.long_name) : null;
  };

  return {
    formattedAddress: place.formatted_address || '',
    street: getComponent('route'),
    number: getComponent('street_number'),
    department: getComponent('administrative_area_level_1'),
    province: getComponent('administrative_area_level_2'),
    district: getComponent('locality') || getComponent('sublocality_level_1') || getComponent('sublocality'),
    postalCode: getComponent('postal_code'),
    latitude: place.geometry?.location?.lat() || 0,
    longitude: place.geometry?.location?.lng() || 0,
  };
}
