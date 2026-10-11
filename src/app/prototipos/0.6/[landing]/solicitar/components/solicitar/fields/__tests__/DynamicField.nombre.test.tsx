/**
 * BAL-4465. En un campo de nombre de persona el texto ya no se recorta en
 * silencio: un correo pegado quedaba como «drufastovillalobosgmailcom» y
 * pasaba como nombre. Ahora se guarda tal cual y el aviso sale debajo del
 * campo mientras se escribe, sin esperar a «Continuar».
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { WizardField } from '../../../../../../services/wizardApi';

const mockUpdateField = jest.fn();
const mockFieldValues: Record<string, string> = {};

jest.mock('../../../../context/WizardContext', () => ({
  useWizard: () => ({
    getFieldValue: (code: string) => mockFieldValues[code] ?? '',
    getFieldError: () => undefined,
    updateField: mockUpdateField,
    formData: {},
  }),
  FILE_PENDING_REUPLOAD: '__pending__',
}));

jest.mock('../../../../../context/LayoutContext', () => ({
  useLayout: () => ({ agreementData: null, landing: 'una-landing' }),
}));

jest.mock('../../../../hooks/useFieldTracking', () => ({
  useFieldTracking: () => ({ onFieldFocus: jest.fn(), onFieldBlur: jest.fn() }),
}));

jest.mock('../TextInput', () => ({
  TextInput: ({
    id,
    value,
    onChange,
    error,
  }: {
    id: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
  }) => (
    <div>
      <input data-testid={id} value={value} onChange={(e) => onChange(e.target.value)} />
      {error && <p role="alert">{error}</p>}
    </div>
  ),
}));

import { DynamicField } from '../DynamicField';

const campo = (code: string, label: string) =>
  ({
    id: 1,
    code,
    label,
    type: 'text',
    required: true,
    readonly: false,
    options: [],
    validations: [],
    dependency_groups: [],
  }) as unknown as WizardField;

beforeEach(() => {
  mockUpdateField.mockClear();
  for (const k of Object.keys(mockFieldValues)) delete mockFieldValues[k];
});

describe('DynamicField — nombre escrito a mano (BAL-4465)', () => {
  it('guarda el correo tal cual (no lo recorta) para poder avisar', () => {
    render(<DynamicField field={campo('first_name', 'Nombres')} />);
    fireEvent.change(screen.getByTestId('first_name'), {
      target: { value: 'drufastovillalobos@gmail.com' },
    });
    expect(mockUpdateField).toHaveBeenCalledWith('first_name', 'drufastovillalobos@gmail.com');
  });

  it('muestra el aviso debajo del campo sin esperar a Continuar', () => {
    mockFieldValues.first_name = 'drufastovillalobos@gmail.com';
    render(<DynamicField field={campo('first_name', 'Nombres')} />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Escribe solo tu nombre, sin correo ni números'
    );
  });

  it('avisa también en el nombre del familiar', () => {
    mockFieldValues.supporter_full_name = '916848556';
    render(<DynamicField field={campo('supporter_full_name', 'Nombres y Apellidos')} />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Escribe solo el nombre de tu familiar, sin correo ni números'
    );
  });

  it('un nombre real no muestra aviso', () => {
    mockFieldValues.maternal_surname = "D'Angelo";
    render(<DynamicField field={campo('maternal_surname', 'Apellido Materno')} />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('un campo de texto que no es nombre no avisa por números', () => {
    mockFieldValues.company_name = 'Tienda 24';
    render(<DynamicField field={campo('company_name', 'Empresa')} />);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
