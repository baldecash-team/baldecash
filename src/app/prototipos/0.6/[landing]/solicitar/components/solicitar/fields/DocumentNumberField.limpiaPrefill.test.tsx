/**
 * Cambiar el documento invalida los datos que autocompletó el documento anterior.
 *
 * El 02-sep-2026 la solicitud L-126380 se envió con el DNI de una persona y el
 * nombre, el sexo y la fecha de nacimiento de otra: el prefill de un documento
 * previo quedó en el formulario cuando el documento cambió. El legacy no lo
 * copió —arma su persona con el reporte del buró— pero ws2 guardó la mezcla y
 * la solicitud se aprobó así.
 *
 * Mientras no vuelva un prefill para el documento nuevo, esos campos tienen que
 * estar vacíos: un formulario vacío se completa, uno con datos ajenos se firma.
 */
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';

import { DocumentNumberField } from './DocumentNumberField';
import { WizardField } from '../../../../../services/wizardApi';

const mockFieldValues: Record<string, string> = {};
const mockUpdateField = jest.fn((code: string, value: string) => {
  mockFieldValues[code] = value;
});

jest.mock('../../../context/WizardContext', () => ({
  useWizard: () => ({
    getFieldValue: (code: string) => mockFieldValues[code] ?? '',
    getFieldError: () => undefined,
    updateField: (code: string, value: string) => mockUpdateField(code, value),
    formData: mockFieldValues,
  }),
}));

jest.mock('../../../../context/LayoutContext', () => ({
  useLayout: () => ({ landing: 'ucv', overlayVariant: null }),
}));

jest.mock('../../../context/SessionContext', () => ({
  useSessionOptional: () => null,
}), { virtual: true });

jest.mock('../../../hooks/useCheckPerson', () => ({
  useCheckPerson: () => ({
    check: jest.fn(),
    isChecking: false,
    response: null,
    error: null,
    reset: jest.fn(),
  }),
}));

jest.mock('./TextInput', () => ({
  TextInput: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <input
      data-testid="dni"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

const field = {
  code: 'document_number',
  label: 'Numero de documento',
  required: true,
  prefill_config: {
    fields_to_fill: [
      'first_name',
      'paternal_surname',
      'maternal_surname',
      'birth_date',
      'gender',
    ],
  },
} as unknown as WizardField;

describe('DocumentNumberField: el prefill no sobrevive al cambio de documento', () => {
  beforeEach(() => {
    for (const key of Object.keys(mockFieldValues)) delete mockFieldValues[key];
    mockUpdateField.mockClear();
  });

  it('borra los datos del documento anterior cuando se corrige el DNI', () => {
    Object.assign(mockFieldValues, {
      document_number: '74860627',
      first_name: 'Luis Gustavo',
      paternal_surname: 'Choque',
      maternal_surname: 'Flores',
      birth_date: '1999-09-23',
      gender: 'male',
      _prefill_status_document_number: 'found',
    });

    render(<DocumentNumberField field={field} />);
    fireEvent.change(screen.getByTestId('dni'), { target: { value: '74860327' } });

    expect(mockUpdateField).toHaveBeenCalledWith('first_name', '');
    expect(mockUpdateField).toHaveBeenCalledWith('paternal_surname', '');
    expect(mockUpdateField).toHaveBeenCalledWith('maternal_surname', '');
    expect(mockUpdateField).toHaveBeenCalledWith('birth_date', '');
    expect(mockUpdateField).toHaveBeenCalledWith('gender', '');
  });

  it('no borra nada si el documento no cambio', () => {
    Object.assign(mockFieldValues, {
      document_number: '74860327',
      first_name: 'Adriana Estefany',
      _prefill_status_document_number: 'found',
    });

    render(<DocumentNumberField field={field} />);
    fireEvent.change(screen.getByTestId('dni'), { target: { value: '74860327' } });

    expect(mockUpdateField).not.toHaveBeenCalledWith('first_name', '');
  });
});
