/**
 * Tests for useGooglePlacesAutocomplete hook
 * Tests address autocomplete with 5 different Peruvian addresses
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useGooglePlacesAutocomplete } from '../useGooglePlacesAutocomplete';
import { ParsedAddress } from '../../../../types/googleMaps';

// Mock the googleMapsService
jest.mock('../../../../services/googleMapsService', () => ({
  loadGoogleMapsScript: jest.fn(),
  isGoogleMapsLoaded: jest.fn(),
}));

import { loadGoogleMapsScript, isGoogleMapsLoaded } from '../../../../services/googleMapsService';

const mockLoadGoogleMapsScript = loadGoogleMapsScript as jest.MockedFunction<typeof loadGoogleMapsScript>;
const mockIsGoogleMapsLoaded = isGoogleMapsLoaded as jest.MockedFunction<typeof isGoogleMapsLoaded>;

// Mock Google Maps objects
const mockAutocomplete = {
  addListener: jest.fn(),
  getPlace: jest.fn(),
};

const mockGeocoder = {
  geocode: jest.fn(),
};

// Store reference to place_changed listener
let placeChangedCallback: (() => void) | null = null;

// Setup Google Maps mock
const setupGoogleMapsMock = () => {
  const mockMapsEvent = {
    clearInstanceListeners: jest.fn(),
  };

  // @ts-expect-error - Setting mock google object for test
  global.google = {
    maps: {
      places: {
        Autocomplete: jest.fn().mockImplementation(() => {
          mockAutocomplete.addListener.mockImplementation((event: string, callback: () => void) => {
            if (event === 'place_changed') {
              placeChangedCallback = callback;
            }
          });
          return mockAutocomplete;
        }),
      },
      Geocoder: jest.fn().mockImplementation(() => mockGeocoder),
      LatLng: jest.fn().mockImplementation((lat: number, lng: number) => ({
        lat: () => lat,
        lng: () => lng,
      })),
      event: mockMapsEvent,
    },
  };
};

// ============================================================================
// TEST DATA: 5 Different Peruvian Addresses
// ============================================================================

const TEST_ADDRESSES: Array<{
  name: string;
  placeResult: google.maps.places.PlaceResult;
  expected: ParsedAddress;
}> = [
  {
    name: 'Av. Javier Prado Este, San Borja, Lima',
    placeResult: {
      formatted_address: 'Av. Javier Prado Este 4600, San Borja 15037, Peru',
      geometry: {
        location: {
          lat: () => -12.0893,
          lng: () => -76.9856,
        },
      } as google.maps.places.PlaceGeometry,
      address_components: [
        { long_name: 'Av. Javier Prado Este', short_name: 'Av. Javier Prado Este', types: ['route'] },
        { long_name: '4600', short_name: '4600', types: ['street_number'] },
        { long_name: 'San Borja', short_name: 'San Borja', types: ['locality'] },
        { long_name: 'Lima', short_name: 'Lima', types: ['administrative_area_level_2'] },
        { long_name: 'Lima', short_name: 'Lima', types: ['administrative_area_level_1'] },
        { long_name: '15037', short_name: '15037', types: ['postal_code'] },
      ],
    },
    expected: {
      formattedAddress: 'Av. Javier Prado Este 4600, San Borja 15037, Peru',
      street: 'Av. Javier Prado Este',
      number: '4600',
      department: 'Lima',
      province: 'Lima',
      district: 'San Borja',
      postalCode: '15037',
      latitude: -12.0893,
      longitude: -76.9856,
    },
  },
  {
    name: 'Jr. de la Union, Lima Centro',
    placeResult: {
      formatted_address: 'Jr. de la Union 300, Cercado de Lima 15001, Peru',
      geometry: {
        location: {
          lat: () => -12.0464,
          lng: () => -77.0319,
        },
      } as google.maps.places.PlaceGeometry,
      address_components: [
        { long_name: 'Jiron de la Union', short_name: 'Jr. de la Union', types: ['route'] },
        { long_name: '300', short_name: '300', types: ['street_number'] },
        { long_name: 'Cercado de Lima', short_name: 'Cercado de Lima', types: ['locality'] },
        { long_name: 'Lima', short_name: 'Lima', types: ['administrative_area_level_2'] },
        { long_name: 'Lima', short_name: 'Lima', types: ['administrative_area_level_1'] },
        { long_name: '15001', short_name: '15001', types: ['postal_code'] },
      ],
    },
    expected: {
      formattedAddress: 'Jr. de la Union 300, Cercado de Lima 15001, Peru',
      street: 'Jiron de la Union',
      number: '300',
      department: 'Lima',
      province: 'Lima',
      district: 'Cercado de Lima',
      postalCode: '15001',
      latitude: -12.0464,
      longitude: -77.0319,
    },
  },
  {
    name: 'Calle Las Begonias, San Isidro',
    placeResult: {
      formatted_address: 'Calle Las Begonias 450, San Isidro 15073, Peru',
      geometry: {
        location: {
          lat: () => -12.0977,
          lng: () => -77.0347,
        },
      } as google.maps.places.PlaceGeometry,
      address_components: [
        { long_name: 'Calle Las Begonias', short_name: 'C. Las Begonias', types: ['route'] },
        { long_name: '450', short_name: '450', types: ['street_number'] },
        { long_name: 'San Isidro', short_name: 'San Isidro', types: ['locality'] },
        { long_name: 'Lima', short_name: 'Lima', types: ['administrative_area_level_2'] },
        { long_name: 'Lima', short_name: 'Lima', types: ['administrative_area_level_1'] },
        { long_name: '15073', short_name: '15073', types: ['postal_code'] },
      ],
    },
    expected: {
      formattedAddress: 'Calle Las Begonias 450, San Isidro 15073, Peru',
      street: 'Calle Las Begonias',
      number: '450',
      department: 'Lima',
      province: 'Lima',
      district: 'San Isidro',
      postalCode: '15073',
      latitude: -12.0977,
      longitude: -77.0347,
    },
  },
  {
    name: 'Av. Larco, Miraflores',
    placeResult: {
      formatted_address: 'Av. Jose Larco 345, Miraflores 15074, Peru',
      geometry: {
        location: {
          lat: () => -12.1191,
          lng: () => -77.0311,
        },
      } as google.maps.places.PlaceGeometry,
      address_components: [
        { long_name: 'Avenida Jose Larco', short_name: 'Av. Larco', types: ['route'] },
        { long_name: '345', short_name: '345', types: ['street_number'] },
        { long_name: 'Miraflores', short_name: 'Miraflores', types: ['locality'] },
        { long_name: 'Lima', short_name: 'Lima', types: ['administrative_area_level_2'] },
        { long_name: 'Lima', short_name: 'Lima', types: ['administrative_area_level_1'] },
        { long_name: '15074', short_name: '15074', types: ['postal_code'] },
      ],
    },
    expected: {
      formattedAddress: 'Av. Jose Larco 345, Miraflores 15074, Peru',
      street: 'Avenida Jose Larco',
      number: '345',
      department: 'Lima',
      province: 'Lima',
      district: 'Miraflores',
      postalCode: '15074',
      latitude: -12.1191,
      longitude: -77.0311,
    },
  },
  {
    name: 'Av. Brasil, Jesus Maria',
    placeResult: {
      formatted_address: 'Av. Brasil 2000, Jesus Maria 15072, Peru',
      geometry: {
        location: {
          lat: () => -12.0767,
          lng: () => -77.0442,
        },
      } as google.maps.places.PlaceGeometry,
      address_components: [
        { long_name: 'Avenida Brasil', short_name: 'Av. Brasil', types: ['route'] },
        { long_name: '2000', short_name: '2000', types: ['street_number'] },
        { long_name: 'Jesus Maria', short_name: 'Jesus Maria', types: ['locality'] },
        { long_name: 'Lima', short_name: 'Lima', types: ['administrative_area_level_2'] },
        { long_name: 'Lima', short_name: 'Lima', types: ['administrative_area_level_1'] },
        { long_name: '15072', short_name: '15072', types: ['postal_code'] },
      ],
    },
    expected: {
      formattedAddress: 'Av. Brasil 2000, Jesus Maria 15072, Peru',
      street: 'Avenida Brasil',
      number: '2000',
      department: 'Lima',
      province: 'Lima',
      district: 'Jesus Maria',
      postalCode: '15072',
      latitude: -12.0767,
      longitude: -77.0442,
    },
  },
];

describe('useGooglePlacesAutocomplete', () => {
  let inputRef: React.RefObject<HTMLInputElement | null>;
  let mockInput: HTMLInputElement;

  beforeEach(() => {
    jest.clearAllMocks();
    placeChangedCallback = null;

    // Create mock input element
    mockInput = document.createElement('input');
    inputRef = { current: mockInput };

    // Default: Google Maps not loaded
    mockIsGoogleMapsLoaded.mockReturnValue(false);
    mockLoadGoogleMapsScript.mockResolvedValue(undefined);

    setupGoogleMapsMock();
  });

  afterAll(() => {
    // @ts-expect-error - Clear google for test
    delete global.google;
  });

  describe('initialization', () => {
    it('starts in loading state when Google Maps is not loaded', () => {
      mockIsGoogleMapsLoaded.mockReturnValue(false);
      mockLoadGoogleMapsScript.mockReturnValue(new Promise(() => {})); // Never resolves

      const onPlaceSelected = jest.fn();
      const { result } = renderHook(() =>
        useGooglePlacesAutocomplete({
          inputRef,
          onPlaceSelected,
        })
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isLoaded).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('sets isLoaded to true when Google Maps is already loaded', async () => {
      mockIsGoogleMapsLoaded.mockReturnValue(true);

      const onPlaceSelected = jest.fn();
      const { result } = renderHook(() =>
        useGooglePlacesAutocomplete({
          inputRef,
          onPlaceSelected,
        })
      );

      expect(result.current.isLoaded).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('loads Google Maps script and initializes autocomplete', async () => {
      mockIsGoogleMapsLoaded.mockReturnValue(false);
      mockLoadGoogleMapsScript.mockResolvedValue(undefined);

      const onPlaceSelected = jest.fn();
      const { result } = renderHook(() =>
        useGooglePlacesAutocomplete({
          inputRef,
          onPlaceSelected,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(mockLoadGoogleMapsScript).toHaveBeenCalled();
      expect(google.maps.places.Autocomplete).toHaveBeenCalledWith(
        mockInput,
        expect.objectContaining({
          fields: ['formatted_address', 'geometry', 'address_components', 'name'],
          types: ['address'],
          componentRestrictions: { country: 'pe' },
        })
      );
    });

    it('handles script load error', async () => {
      mockIsGoogleMapsLoaded.mockReturnValue(false);
      mockLoadGoogleMapsScript.mockRejectedValue(new Error('Failed to load'));

      const onPlaceSelected = jest.fn();
      const onError = jest.fn();
      const { result } = renderHook(() =>
        useGooglePlacesAutocomplete({
          inputRef,
          onPlaceSelected,
          onError,
        })
      );

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load');
      });

      expect(result.current.isLoaded).toBe(false);
      expect(onError).toHaveBeenCalledWith('Failed to load');
    });
  });

  // ============================================================================
  // ADDRESS PARSING TESTS - 5 Different Peruvian Addresses
  // ============================================================================

  describe('address parsing', () => {
    TEST_ADDRESSES.forEach(({ name, placeResult, expected }, index) => {
      it(`Test ${index + 1}: correctly parses "${name}"`, async () => {
        mockIsGoogleMapsLoaded.mockReturnValue(false);
        mockLoadGoogleMapsScript.mockResolvedValue(undefined);

        const onPlaceSelected = jest.fn();
        renderHook(() =>
          useGooglePlacesAutocomplete({
            inputRef,
            onPlaceSelected,
          })
        );

        // Wait for initialization
        await waitFor(() => {
          expect(placeChangedCallback).not.toBe(null);
        });

        // Mock getPlace to return our test address
        mockAutocomplete.getPlace.mockReturnValue(placeResult);

        // Trigger place selection
        act(() => {
          placeChangedCallback?.();
        });

        // Verify the parsed address
        expect(onPlaceSelected).toHaveBeenCalledTimes(1);
        const parsedAddress = onPlaceSelected.mock.calls[0][0] as ParsedAddress;

        expect(parsedAddress.formattedAddress).toBe(expected.formattedAddress);
        expect(parsedAddress.street).toBe(expected.street);
        expect(parsedAddress.number).toBe(expected.number);
        expect(parsedAddress.department).toBe(expected.department);
        expect(parsedAddress.province).toBe(expected.province);
        expect(parsedAddress.district).toBe(expected.district);
        expect(parsedAddress.postalCode).toBe(expected.postalCode);
        expect(parsedAddress.latitude).toBe(expected.latitude);
        expect(parsedAddress.longitude).toBe(expected.longitude);
      });
    });
  });

  describe('edge cases', () => {
    it('handles place without geometry (user pressed enter without selecting)', async () => {
      mockIsGoogleMapsLoaded.mockReturnValue(false);
      mockLoadGoogleMapsScript.mockResolvedValue(undefined);

      const onPlaceSelected = jest.fn();
      renderHook(() =>
        useGooglePlacesAutocomplete({
          inputRef,
          onPlaceSelected,
        })
      );

      await waitFor(() => {
        expect(placeChangedCallback).not.toBe(null);
      });

      // Mock getPlace to return place without geometry
      mockAutocomplete.getPlace.mockReturnValue({
        formatted_address: 'Some address',
        geometry: undefined,
      });

      act(() => {
        placeChangedCallback?.();
      });

      // Should NOT call onPlaceSelected when geometry is missing
      expect(onPlaceSelected).not.toHaveBeenCalled();
    });

    it('handles missing address components gracefully', async () => {
      mockIsGoogleMapsLoaded.mockReturnValue(false);
      mockLoadGoogleMapsScript.mockResolvedValue(undefined);

      const onPlaceSelected = jest.fn();
      renderHook(() =>
        useGooglePlacesAutocomplete({
          inputRef,
          onPlaceSelected,
        })
      );

      await waitFor(() => {
        expect(placeChangedCallback).not.toBe(null);
      });

      // Mock getPlace with minimal data (only formatted_address and geometry)
      mockAutocomplete.getPlace.mockReturnValue({
        formatted_address: 'Some incomplete address, Peru',
        geometry: {
          location: {
            lat: () => -12.0,
            lng: () => -77.0,
          },
        },
        address_components: [], // Empty components
      });

      act(() => {
        placeChangedCallback?.();
      });

      expect(onPlaceSelected).toHaveBeenCalledTimes(1);
      const parsedAddress = onPlaceSelected.mock.calls[0][0] as ParsedAddress;

      // Should handle missing components with null values
      expect(parsedAddress.formattedAddress).toBe('Some incomplete address, Peru');
      expect(parsedAddress.street).toBe(null);
      expect(parsedAddress.number).toBe(null);
      expect(parsedAddress.department).toBe(null);
      expect(parsedAddress.province).toBe(null);
      expect(parsedAddress.district).toBe(null);
      expect(parsedAddress.postalCode).toBe(null);
      expect(parsedAddress.latitude).toBe(-12.0);
      expect(parsedAddress.longitude).toBe(-77.0);
    });

    it('uses sublocality when locality is not available', async () => {
      mockIsGoogleMapsLoaded.mockReturnValue(false);
      mockLoadGoogleMapsScript.mockResolvedValue(undefined);

      const onPlaceSelected = jest.fn();
      renderHook(() =>
        useGooglePlacesAutocomplete({
          inputRef,
          onPlaceSelected,
        })
      );

      await waitFor(() => {
        expect(placeChangedCallback).not.toBe(null);
      });

      // Mock getPlace with sublocality instead of locality
      mockAutocomplete.getPlace.mockReturnValue({
        formatted_address: 'Some address in sublocality',
        geometry: {
          location: {
            lat: () => -12.1,
            lng: () => -77.1,
          },
        },
        address_components: [
          { long_name: 'Barranco Norte', short_name: 'Barranco N.', types: ['sublocality_level_1'] },
          { long_name: 'Lima', short_name: 'Lima', types: ['administrative_area_level_1'] },
        ],
      });

      act(() => {
        placeChangedCallback?.();
      });

      const parsedAddress = onPlaceSelected.mock.calls[0][0] as ParsedAddress;
      expect(parsedAddress.district).toBe('Barranco Norte');
    });
  });

  describe('clearSelection', () => {
    it('clears the input value', async () => {
      mockIsGoogleMapsLoaded.mockReturnValue(true);

      // Set initial value
      mockInput.value = 'Some address';

      const onPlaceSelected = jest.fn();
      const { result } = renderHook(() =>
        useGooglePlacesAutocomplete({
          inputRef,
          onPlaceSelected,
        })
      );

      act(() => {
        result.current.clearSelection();
      });

      expect(mockInput.value).toBe('');
    });
  });

  describe('country restriction', () => {
    it('uses custom country restriction when provided', async () => {
      mockIsGoogleMapsLoaded.mockReturnValue(false);
      mockLoadGoogleMapsScript.mockResolvedValue(undefined);

      const onPlaceSelected = jest.fn();
      renderHook(() =>
        useGooglePlacesAutocomplete({
          inputRef,
          countryRestriction: 'co', // Colombia
          onPlaceSelected,
        })
      );

      await waitFor(() => {
        expect(google.maps.places.Autocomplete).toHaveBeenCalled();
      });

      expect(google.maps.places.Autocomplete).toHaveBeenCalledWith(
        mockInput,
        expect.objectContaining({
          componentRestrictions: { country: 'co' },
        })
      );
    });
  });

  describe('getCurrentLocation', () => {
    const mockGeolocation = {
      getCurrentPosition: jest.fn(),
    };

    beforeEach(() => {
      // Mock navigator.geolocation
      Object.defineProperty(navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true,
        configurable: true,
      });
    });

    it('returns null when Google Maps is not loaded', async () => {
      mockIsGoogleMapsLoaded.mockReturnValue(false);
      mockLoadGoogleMapsScript.mockReturnValue(new Promise(() => {})); // Never resolves

      const onPlaceSelected = jest.fn();
      const onError = jest.fn();
      const { result } = renderHook(() =>
        useGooglePlacesAutocomplete({
          inputRef,
          onPlaceSelected,
          onError,
        })
      );

      let location: ParsedAddress | null = null;
      await act(async () => {
        location = await result.current.getCurrentLocation();
      });

      expect(location).toBe(null);
      expect(onError).toHaveBeenCalledWith('Google Maps not loaded');
    });

    it('returns null when geolocation is not supported', async () => {
      // Remove geolocation
      Object.defineProperty(navigator, 'geolocation', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      mockIsGoogleMapsLoaded.mockReturnValue(true);

      const onPlaceSelected = jest.fn();
      const onError = jest.fn();
      const { result } = renderHook(() =>
        useGooglePlacesAutocomplete({
          inputRef,
          onPlaceSelected,
          onError,
        })
      );

      let location: ParsedAddress | null = null;
      await act(async () => {
        location = await result.current.getCurrentLocation();
      });

      expect(location).toBe(null);
      expect(onError).toHaveBeenCalledWith('Geolocation not supported');
    });

    it('handles geolocation permission denied', async () => {
      mockIsGoogleMapsLoaded.mockReturnValue(false);
      mockLoadGoogleMapsScript.mockResolvedValue(undefined);

      mockGeolocation.getCurrentPosition.mockImplementation(
        (_success: PositionCallback, error: PositionErrorCallback) => {
          error({
            code: 1, // PERMISSION_DENIED
            message: 'User denied',
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3,
          } as GeolocationPositionError);
        }
      );

      const onPlaceSelected = jest.fn();
      const onError = jest.fn();
      const { result } = renderHook(() =>
        useGooglePlacesAutocomplete({
          inputRef,
          onPlaceSelected,
          onError,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      let location: ParsedAddress | null = { formattedAddress: 'temp' } as ParsedAddress;
      await act(async () => {
        location = await result.current.getCurrentLocation();
      });

      expect(location).toBe(null);
      expect(onError).toHaveBeenCalledWith('Permiso de ubicación denegado');
    });
  });
});
