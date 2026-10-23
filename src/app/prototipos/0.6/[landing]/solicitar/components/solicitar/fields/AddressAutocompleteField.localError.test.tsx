/// <reference types="jest" />
/**
 * BAL-4960 (revisión F2) — "si hay error visible, la pista no se muestra".
 *
 * `AddressAutocompleteField` tiene errores LOCALES (geolocalización, carga de
 * Google Maps) que nunca llegan a `formData`. `onLocalErrorChange` es el
 * aviso que usa `DynamicWizardStep` para ocultar la pista aunque ese error
 * no haya pasado por el validador del campo — ver `DynamicField.tsx` y
 * `DynamicWizardStep.tsx`.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

let formData: Record<string, { value?: string; error?: string }> = {};
const mockUpdateField = jest.fn();

jest.mock('../../../context/WizardContext', () => ({
  useWizard: () => ({
    getFieldValue: (code: string) => formData[code]?.value ?? '',
    getFieldError: (code: string) => formData[code]?.error,
    updateField: (...a: unknown[]) => mockUpdateField(...a),
    updateFieldBatch: jest.fn(),
  }),
}));

const mockSentry = jest.fn();
jest.mock('@sentry/nextjs', () => ({ captureException: (...a: unknown[]) => mockSentry(...a) }));

jest.mock('../../../hooks/useGooglePlacesAutocomplete', () => ({
  useGooglePlacesAutocomplete: jest.fn(),
}));

import { AddressAutocompleteField, AVISO_SIN_MAPA } from './AddressAutocompleteField';
import { useGooglePlacesAutocomplete } from '../../../hooks/useGooglePlacesAutocomplete';
import { CamposV2Provider } from '@/app/prototipos/0.6/components/diseno-2/campos/estilosV2';
import type { WizardField } from '../../../../../services/wizardApi';

const mockUseGooglePlaces = useGooglePlacesAutocomplete as jest.Mock;

const CAMPO: WizardField = {
  id: 1,
  code: 'address',
  label: 'Dirección',
  type: 'address',
  required: true,
} as unknown as WizardField;

beforeEach(() => {
  formData = {};
  mockUseGooglePlaces.mockReturnValue({ isLoaded: true, isLoading: false, error: null });
});

describe('AddressAutocompleteField — error local (BAL-4960, revisión F2)', () => {
  it('avisa con `true` cuando falla la carga de Google Maps, aunque no haya error en formData', () => {
    mockUseGooglePlaces.mockReturnValue({ isLoaded: false, isLoading: false, error: 'No se pudo cargar Google Maps' });
    const onLocalErrorChange = jest.fn();
    render(<AddressAutocompleteField field={CAMPO} showError={false} onLocalErrorChange={onLocalErrorChange} />);
    expect(onLocalErrorChange).toHaveBeenCalledWith(true);
  });

  it('avisa con `false` cuando no hay ningún error local', () => {
    const onLocalErrorChange = jest.fn();
    render(<AddressAutocompleteField field={CAMPO} showError={false} onLocalErrorChange={onLocalErrorChange} />);
    expect(onLocalErrorChange).toHaveBeenCalledWith(false);
  });

});

describe('AddressAutocompleteField — sin Google Maps (QA en celular, BAL-4969)', () => {
  beforeEach(() => {
    mockSentry.mockClear();
    mockUseGooglePlaces.mockReturnValue({ isLoaded: false, isLoading: false, error: 'Google Maps API key not configured' });
  });

  it.each([
    ['Diseño 2', true],
    ['Diseño 1', false],
  ])('%s: nunca muestra el texto técnico; muestra el aviso amable', (_n, v2) => {
    const campo = <AddressAutocompleteField field={CAMPO} showError={false} />;
    const { getByRole, queryByText, queryByRole } = render(v2 ? <CamposV2Provider>{campo}</CamposV2Provider> : campo);
    expect(queryByText(/API key/i)).not.toBeInTheDocument();
    expect(getByRole('status')).toHaveTextContent(AVISO_SIN_MAPA);
    // No es un error de la persona: no sale como alerta ni marca el campo.
    expect(queryByRole('alert')).not.toBeInTheDocument();
    expect(getByRole('combobox')).not.toHaveAttribute('aria-invalid');
  });

  it('el campo queda habilitado para escribir la dirección a mano y la guarda', () => {
    const { getByRole } = render(
      <CamposV2Provider>
        <AddressAutocompleteField field={CAMPO} showError={false} />
      </CamposV2Provider>
    );
    const input = getByRole('combobox');
    expect(input).toBeEnabled();
    expect(input).toHaveAccessibleDescription(AVISO_SIN_MAPA);
    fireEvent.change(input, { target: { value: 'Av. Arequipa 123' } });
    expect(mockUpdateField).toHaveBeenCalledWith('address', 'Av. Arequipa 123');
  });

  it('el motivo técnico va a Sentry', () => {
    render(<AddressAutocompleteField field={CAMPO} showError={false} />);
    expect(mockSentry).toHaveBeenCalledTimes(1);
    const [error, contexto] = mockSentry.mock.calls[0];
    expect((error as Error).message).toContain('Google Maps API key not configured');
    expect(contexto).toMatchObject({ tags: { modulo: 'direccion_autocompletado', accion: 'cargar_google_maps' } });
  });

  it('mientras carga sigue deshabilitado (Maps todavía puede llegar)', () => {
    mockUseGooglePlaces.mockReturnValue({ isLoaded: false, isLoading: true, error: null });
    const { getByRole } = render(<AddressAutocompleteField field={CAMPO} showError={false} />);
    expect(getByRole('combobox')).toBeDisabled();
    expect(mockSentry).not.toHaveBeenCalled();
  });
});
