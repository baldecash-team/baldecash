/**
 * BAL-5210 — `DocumentNumberField` y `AddressAutocompleteField` pasan la
 * entrada y la salida del input a quien los pinta (`DynamicField`), sin
 * romper lo suyo: el prefill del DNI al completarse y el foco visual de la
 * dirección.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { WizardField } from '../../../../../../services/wizardApi';

const mockValores: Record<string, string> = {};
const mockUpdateField = jest.fn((code: string, v: string) => {
  mockValores[code] = v;
});
jest.mock('../../../../context/WizardContext', () => ({
  useWizard: () => ({
    formData: Object.fromEntries(Object.entries(mockValores).map(([k, v]) => [k, { value: v }])),
    getFieldValue: (code: string) => mockValores[code] ?? '',
    getFieldError: () => undefined,
    getFieldLabel: () => undefined,
    updateField: mockUpdateField,
    updateFieldBatch: jest.fn(),
    setFieldError: jest.fn(),
    getAllDynamicOptions: () => ({}),
  }),
}));

jest.mock('../../../../../context/LayoutContext', () => ({
  useLayout: () => ({ landing: 'una-landing', landingId: 1, overlayVariant: null }),
}));

const mockCheck = jest.fn();
jest.mock('../../../../hooks/useCheckPerson', () => ({
  useCheckPerson: () => ({ check: mockCheck, isChecking: false, response: null, reset: jest.fn() }),
}));
jest.mock('../../../../hooks/useCouponDocumentCheck', () => ({ useCouponDocumentCheck: () => undefined }));
jest.mock('../../../../context/SessionContext', () => ({ useSessionOptional: () => null }));
jest.mock('../../coupon/CouponDocumentStatus', () => ({ CouponDocumentStatus: () => null }));

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }));
jest.mock('../../../../hooks/useGooglePlacesAutocomplete', () => ({
  // En local no hay llave de Maps: el campo queda para escribir a mano.
  useGooglePlacesAutocomplete: () => ({ isLoaded: false, isLoading: false, error: 'sin llave' }),
}));

import { DocumentNumberField } from '../DocumentNumberField';
import { AddressAutocompleteField } from '../AddressAutocompleteField';

const campo = (code: string, type: string): WizardField =>
  ({ id: 1, code, label: code, type, required: true, readonly: false }) as unknown as WizardField;

beforeEach(() => {
  for (const k of Object.keys(mockValores)) delete mockValores[k];
  jest.clearAllMocks();
  localStorage.clear();
});

describe('DocumentNumberField (BAL-5210)', () => {
  it.each(['document_number', 'supporter_document_number'])(
    '%s: avisa la entrada y la salida del input',
    (code) => {
      const onFocus = jest.fn();
      const onBlur = jest.fn();
      const { container } = render(
        <DocumentNumberField field={campo(code, 'document_number')} onFocus={onFocus} onBlur={onBlur} />,
      );
      const input = container.querySelector('input')!;
      fireEvent.focus(input);
      expect(onFocus).toHaveBeenCalledTimes(1);
      fireEvent.blur(input);
      expect(onBlur).toHaveBeenCalledTimes(1);
    },
  );

  it('la búsqueda automática al completar el DNI sigue saliendo', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const { container, rerender } = render(
      <DocumentNumberField field={campo('document_number', 'document_number')} onFocus={onFocus} onBlur={onBlur} />,
    );
    const input = container.querySelector('input')!;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '00000010' } });
    rerender(<DocumentNumberField field={campo('document_number', 'document_number')} onFocus={onFocus} onBlur={onBlur} />);
    expect(mockCheck).toHaveBeenCalledWith('dni', '00000010');
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});

describe('AddressAutocompleteField (BAL-5210)', () => {
  it('avisa la entrada y la salida, y el foco visual sigue funcionando', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const { getByRole } = render(
      <AddressAutocompleteField field={campo('address', 'address')} onFocus={onFocus} onBlur={onBlur} />,
    );
    const input = getByRole('combobox');
    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(input).toHaveAttribute('aria-expanded', 'true');
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });
});
