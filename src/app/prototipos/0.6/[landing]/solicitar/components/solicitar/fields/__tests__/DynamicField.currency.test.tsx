/**
 * BAL-4395 — todo campo `currency` del wizard muestra la coma de miles y le
 * pasa a `updateField` el número limpio. Sin TextInput mockeado: se prueba lo
 * que de verdad ve el cliente.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WizardField } from '../../../../../../services/wizardApi';

const mockUpdateField = jest.fn();
const mockGetFieldValue = jest.fn().mockReturnValue('');
jest.mock('../../../../context/WizardContext', () => ({
  useWizard: () => ({
    getFieldValue: mockGetFieldValue,
    getFieldError: () => undefined,
    updateField: mockUpdateField,
    formData: {},
  }),
  FILE_PENDING_REUPLOAD: '__pending__',
}));
jest.mock('../../../../../context/LayoutContext', () => ({
  useLayout: () => ({ agreementData: null, landing: 'una-landing' }),
}));
const mockFocus = jest.fn();
const mockBlur = jest.fn();
jest.mock('../../../../hooks/useFieldTracking', () => ({
  useFieldTracking: () => ({ onFieldFocus: mockFocus, onFieldBlur: mockBlur }),
}));

import { DynamicField } from '../DynamicField';

const campoMonto = (extra: Partial<WizardField> = {}): WizardField =>
  ({
    id: 1,
    code: 'monthly_income',
    label: 'Ingreso mensual',
    type: 'currency',
    required: true,
    prefix: 'S/',
    options: [],
    ...extra,
  }) as unknown as WizardField;

beforeEach(() => {
  mockUpdateField.mockClear();
  mockGetFieldValue.mockReset().mockReturnValue('');
});

describe('DynamicField — currency con separador de miles', () => {
  it('se renderiza como texto con teclado decimal, no como type=number', () => {
    render(<DynamicField field={campoMonto()} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.type).toBe('text');
    expect(input.getAttribute('inputmode')).toBe('decimal');
    expect(screen.getByText('S/')).toBeInTheDocument();
  });

  it('escribir 2500 guarda «2500» y, ya guardado, se ve «2,500»', () => {
    const { rerender } = render(<DynamicField field={campoMonto()} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '2500' } });
    expect(mockUpdateField).toHaveBeenLastCalledWith('monthly_income', '2500');
    mockGetFieldValue.mockReturnValue('2500');
    rerender(<DynamicField field={campoMonto()} />);
    expect(input.value).toBe('2,500');
  });

  it('pegar «S/ 2,500.50» manda a updateField «2500.50»', () => {
    render(<DynamicField field={campoMonto()} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'S/ 2,500.50' } });
    expect(mockUpdateField).toHaveBeenLastCalledWith('monthly_income', '2500.50');
  });

  it('un valor ya guardado se muestra con coma', () => {
    mockGetFieldValue.mockReturnValue('1234567.5');
    render(<DynamicField field={campoMonto()} />);
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('1,234,567.5');
  });

  it('foco y blur siguen yendo a las métricas', () => {
    mockGetFieldValue.mockReturnValue('2500');
    render(<DynamicField field={campoMonto()} />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(mockFocus).toHaveBeenCalledWith('monthly_income');
    expect(mockBlur).toHaveBeenCalledWith('monthly_income', true);
  });
});
