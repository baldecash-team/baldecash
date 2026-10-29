/// <reference types="jest" />
/**
 * BAL-5277 — el campo dirección registra sus eventos en Diseño 1 y 2:
 * sugerencia de Google, «Usar mi ubicación actual», mapa y ubigeo
 * autollenado. Nunca la dirección ni las coordenadas.
 */
import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react';

const mockTrack = jest.fn();
jest.mock('../../../../context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: mockTrack, flush: jest.fn() }),
}));

jest.mock('../../../../context/WizardContext', () => ({
  useWizard: () => ({
    getFieldValue: () => '',
    getFieldError: () => undefined,
    updateField: jest.fn(),
    updateFieldBatch: jest.fn(),
  }),
}));

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }));

let placeSeleccionado: ((p: unknown) => void) | null = null;
jest.mock('../../../../hooks/useGooglePlacesAutocomplete', () => ({
  useGooglePlacesAutocomplete: (o: { onPlaceSelected: (p: unknown) => void }) => {
    placeSeleccionado = o.onPlaceSelected;
    return { isLoaded: true, isLoading: false, error: null };
  },
}));

const mockResolve = jest.fn();
jest.mock('../../../../../../services/wizardApi', () => ({
  resolveGeoUnits: (...a: unknown[]) => mockResolve(...a),
}));

// El modal real dibuja Google Maps; aquí basta con sus avisos.
let modal: Record<string, (...a: unknown[]) => void> & { isOpen?: boolean } = {};
jest.mock('../LocationModal', () => ({
  LocationModal: (p: Record<string, (...a: unknown[]) => void> & { isOpen?: boolean }) => {
    modal = p;
    return null;
  },
}));

import { AddressAutocompleteField } from '../AddressAutocompleteField';
import { CamposV2Provider } from '@/app/prototipos/0.6/components/diseno-2/campos/estilosV2';
import type { WizardField } from '../../../../../../services/wizardApi';

const CAMPO = {
  id: 1,
  code: 'address',
  label: 'Dirección',
  type: 'address',
  required: true,
  address_config: {
    auto_fill_fields: { department: 'department', province: 'province', district: 'district', latitude: 'lat', longitude: 'lng' },
  },
} as unknown as WizardField;

const LUGAR = {
  formattedAddress: 'Jr. Secreto 123, Lima',
  latitude: -12.0464,
  longitude: -77.0428,
  department: 'Lima',
  province: 'Lima',
  district: 'Miraflores',
};

function montar(v2: boolean) {
  const campo = <AddressAutocompleteField field={CAMPO} />;
  return render(v2 ? <CamposV2Provider>{campo}</CamposV2Provider> : campo);
}

const eventos = () => mockTrack.mock.calls.map((c) => [c[0], c[1]]);
const tipos = () => mockTrack.mock.calls.map((c) => c[0]);

function geolocalizacion(impl: (ok: PositionCallback, mal: PositionErrorCallback) => void) {
  Object.defineProperty(global.navigator, 'geolocation', {
    configurable: true,
    value: { getCurrentPosition: jest.fn(impl) },
  });
}

beforeEach(() => {
  mockTrack.mockClear();
  mockResolve.mockReset();
  modal = {};
});

describe.each([
  ['Diseño 1', false, 1],
  ['Diseño 2', true, 2],
])('AddressAutocompleteField — eventos BAL-5277 (%s)', (_n, v2, diseno) => {
  it('elige una sugerencia: selected + ubigeo completo, sin la dirección', async () => {
    mockResolve.mockResolvedValue({
      department: { id: 15, label: 'Lima' },
      province: { id: 1501, label: 'Lima' },
      district: { id: 150122, label: 'Miraflores' },
    });
    montar(v2);
    await act(async () => {
      await placeSeleccionado!(LUGAR);
    });
    expect(eventos()).toEqual([
      ['address_suggestion_selected', { field_name: 'address', posicion: null, cantidad: null, diseno }],
      ['address_ubigeo_autofill', {
        field_name: 'address', completo: true, departamento: true, provincia: true, distrito: true, origen: 'sugerencia', diseno,
      }],
    ]);
    const todo = JSON.stringify(mockTrack.mock.calls);
    expect(todo).not.toContain('Secreto');
    expect(todo).not.toContain('-12.0464');
  });

  it('«Usar mi ubicación»: concedido → abre el mapa; mueve el pin; confirma', async () => {
    mockResolve.mockResolvedValue({ department: { id: 15, label: 'Lima' }, province: null, district: null });
    geolocalizacion((ok) => ok({ coords: { latitude: -12, longitude: -77 } } as GeolocationPosition));
    const { getByRole } = montar(v2);
    fireEvent.click(getByRole('button', { name: /usar mi ubicaci/i }));
    act(() => {
      modal.onPinMovido();
      modal.onPinMovido();
    });
    await act(async () => {
      modal.onConfirm(LUGAR);
    });
    await waitFor(() => expect(tipos()).toContain('address_ubigeo_autofill'));
    expect(eventos()).toEqual([
      ['address_geolocate', { field_name: 'address', resultado: 'concedido', origen: 'boton', diseno }],
      ['address_map_open', { field_name: 'address', pantalla: 'mapa', diseno }],
      ['address_map_pin_move', { field_name: 'address', diseno }],
      ['address_map_confirm', { field_name: 'address', pin_movido: true, diseno }],
      ['address_map_close', { field_name: 'address', confirmado: true, diseno }],
      ['address_ubigeo_autofill', {
        field_name: 'address', completo: false, departamento: true, provincia: false, distrito: false, origen: 'mapa', diseno,
      }],
    ]);
  });

  it('«Usar mi ubicación»: permiso negado → mapa en «permiso»; dentro reintenta y cierra sin confirmar', () => {
    geolocalizacion((_ok, mal) => mal!({ code: 1, message: 'x', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError));
    const { getByRole } = montar(v2);
    fireEvent.click(getByRole('button', { name: /usar mi ubicaci/i }));
    act(() => {
      modal.onGeolocalizado('error', 'sin_senal');
      modal.onClose();
    });
    expect(eventos()).toEqual([
      ['address_geolocate', { field_name: 'address', resultado: 'negado', origen: 'boton', diseno }],
      ['address_map_open', { field_name: 'address', pantalla: 'permiso', diseno }],
      ['address_geolocate', { field_name: 'address', resultado: 'error', origen: 'modal', motivo: 'sin_senal', diseno }],
      ['address_map_close', { field_name: 'address', confirmado: false, diseno }],
    ]);
  });
});
