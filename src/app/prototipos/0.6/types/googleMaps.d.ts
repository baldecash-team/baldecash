/**
 * Google Maps Types - BaldeCash v0.6
 * Type definitions for Google Maps Places API
 */

// Extend global namespace for google.maps
declare global {
  interface Window {
    google: typeof google;
  }
}

/**
 * Parsed address structure from Google Places
 * Maps to Person.address_* fields in backend
 */
export interface ParsedAddress {
  /** Full formatted address from Google */
  formattedAddress: string;
  /** Street name (route) */
  street: string | null;
  /** Street number */
  number: string | null;
  /** Department/Region (administrative_area_level_1) */
  department: string | null;
  /** Province (administrative_area_level_2) */
  province: string | null;
  /** District (locality or sublocality) */
  district: string | null;
  /** Postal code */
  postalCode: string | null;
  /** Latitude */
  latitude: number;
  /** Longitude */
  longitude: number;
}

/**
 * Address autocomplete configuration
 * Sent from backend via WizardField.address_config
 */
export interface AddressAutocompleteConfig {
  /** Country restriction code (e.g., "pe", "co", "mx") */
  country_restriction?: string;
  /** Fields to auto-fill when address is selected */
  auto_fill_fields?: {
    /** Field code for department */
    department?: string;
    /** Field code for province */
    province?: string;
    /** Field code for district */
    district?: string;
    /** Field code for latitude (usually hidden) */
    latitude?: string;
    /** Field code for longitude (usually hidden) */
    longitude?: string;
  };
  /** Show "Use my location" button */
  show_use_location?: boolean;
  /** Require selection from suggestions (no free text) */
  require_selection?: boolean;
}

/**
 * Google Places Autocomplete options
 */
export interface PlacesAutocompleteOptions {
  /** Fields to retrieve from Place Details */
  fields: string[];
  /** Types of results to return */
  types: string[];
  /** Language for results */
  language: string;
  /** Restrict to specific countries */
  componentRestrictions?: {
    country: string | string[];
  };
}

export {};
