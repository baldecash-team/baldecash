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
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

let formData: Record<string, { value?: string; error?: string }> = {};

jest.mock('../../../context/WizardContext', () => ({
  useWizard: () => ({
    getFieldValue: (code: string) => formData[code]?.value ?? '',
    getFieldError: (code: string) => formData[code]?.error,
    updateField: jest.fn(),
    updateFieldBatch: jest.fn(),
  }),
}));

jest.mock('../../../hooks/useGooglePlacesAutocomplete', () => ({
  useGooglePlacesAutocomplete: jest.fn(),
}));

import { AddressAutocompleteField } from './AddressAutocompleteField';
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

  it('en Diseño 2 el error de Google Maps sale como alerta en pantalla', () => {
    mockUseGooglePlaces.mockReturnValue({ isLoaded: false, isLoading: false, error: 'No se pudo cargar Google Maps' });
    const { getByRole } = render(
      <CamposV2Provider>
        <AddressAutocompleteField field={CAMPO} showError={false} />
      </CamposV2Provider>
    );
    expect(getByRole('alert')).toHaveTextContent('No se pudo cargar Google Maps');
  });
});
