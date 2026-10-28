/**
 * BAL-5210 — DNI, DNI del familiar y dirección no registraban entrada ni
 * salida: `DynamicField` los mandaba a componentes propios sin conectarles
 * `useFieldTracking`. Ahora reciben `onFocus`/`onBlur` igual que los demás,
 * con el mismo `field_name` que usa `form_step_validation_error`.
 */
import React from 'react';
import { render } from '@testing-library/react';
import { WizardField } from '../../../../../../services/wizardApi';

const mockValores: Record<string, string> = {};
jest.mock('../../../../context/WizardContext', () => ({
  useWizard: () => ({
    getFieldValue: (code: string) => mockValores[code] ?? '',
    getFieldError: () => undefined,
    updateField: jest.fn(),
    formData: {},
  }),
}));

jest.mock('../../../../../context/LayoutContext', () => ({
  useLayout: () => ({ agreementData: null, landing: 'una-landing' }),
}));

const mockOnFieldFocus = jest.fn();
const mockOnFieldBlur = jest.fn();
const mockPasoDelRegistro = jest.fn();
jest.mock('../../../../hooks/useFieldTracking', () => ({
  useFieldTracking: (paso?: number) => {
    mockPasoDelRegistro(paso);
    return { onFieldFocus: mockOnFieldFocus, onFieldBlur: mockOnFieldBlur };
  },
}));

const mockProps: Record<string, { onFocus?: () => void; onBlur?: () => void }> = {};
jest.mock('../DocumentNumberField', () => ({
  DocumentNumberField: (p: { field: { code: string }; onFocus?: () => void; onBlur?: () => void }) => {
    mockProps[p.field.code] = p;
    return <div data-testid="documento" />;
  },
}));
jest.mock('../AddressAutocompleteField', () => ({
  AddressAutocompleteField: (p: { field: { code: string }; onFocus?: () => void; onBlur?: () => void }) => {
    mockProps[p.field.code] = p;
    return <div data-testid="direccion" />;
  },
}));

import { DynamicField } from '../DynamicField';

const campo = (code: string, type: string): WizardField =>
  ({ id: 1, code, label: code, type, required: true, readonly: false, options: [] }) as unknown as WizardField;

beforeEach(() => {
  for (const k of Object.keys(mockValores)) delete mockValores[k];
  for (const k of Object.keys(mockProps)) delete mockProps[k];
  jest.clearAllMocks();
});

describe('DynamicField — entrada y salida de DNI y dirección (BAL-5210)', () => {
  it.each([
    ['document_number', 'document_number'],
    ['supporter_document_number', 'document_number'],
    ['address', 'address'],
    ['address', 'address_autocomplete'],
  ])('%s (%s) registra input_focus / input_blur con su código', (code, type) => {
    render(<DynamicField field={campo(code, type)} stepOrder={1} />);
    expect(mockPasoDelRegistro).toHaveBeenCalledWith(1);
    const p = mockProps[code];
    expect(p.onFocus).toEqual(expect.any(Function));
    expect(p.onBlur).toEqual(expect.any(Function));

    p.onFocus!();
    expect(mockOnFieldFocus).toHaveBeenCalledWith(code);

    p.onBlur!();
    expect(mockOnFieldBlur).toHaveBeenLastCalledWith(code, false);

    // Solo dice si había algo escrito, nunca qué.
    mockValores[code] = '70020010';
    p.onBlur!();
    expect(mockOnFieldBlur).toHaveBeenLastCalledWith(code, true);
  });
});
