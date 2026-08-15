/**
 * Tests del gate de `agreement-branches` en CascadingSelectField.
 *
 * El campo `sede` se alimenta del convenio de la landing, así que en una
 * landing sin convenio no hay catálogo y esconderlo es correcto: un select
 * vacío no es mejor que ningún select.
 *
 * La excepción es el lead de un socio (A365). Ahí la sede no sale del convenio
 * —la eligió el agente al empujar el lead— y llega prellenada, con etiqueta y
 * bloqueada. Esconderla en ese caso oculta un dato que ya está viajando en el
 * submit y sobre el que se liquida al socio.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';

import { CascadingSelectField } from './CascadingSelectField';
import { leadLockKey } from '../../../hooks/useLeadPrefill';
import { WizardField } from '../../../../../services/wizardApi';

// --- mocks -----------------------------------------------------------------

const mockFieldValues: Record<string, string> = {};
const mockFieldLabels: Record<string, string> = {};

jest.mock('../../../context/WizardContext', () => ({
  useWizard: () => ({
    getFieldValue: (code: string) => mockFieldValues[code] ?? '',
    getFieldLabel: (code: string) => mockFieldLabels[code],
    getFieldError: () => undefined,
    updateField: jest.fn(),
    setDynamicOptions: jest.fn(),
    registerDependency: jest.fn(),
    unregisterDependency: jest.fn(),
  }),
}));

let mockAgreementData: { id: number } | null = null;

jest.mock('../../../../context/LayoutContext', () => ({
  useLayout: () => ({ agreementData: mockAgreementData }),
}));

const mockFetchOptionsFromSource = jest.fn().mockResolvedValue([]);

jest.mock('../../../../../services/wizardApi', () => ({
  fetchOptionsFromSource: (...args: unknown[]) => mockFetchOptionsFromSource(...args),
  fetchCascadingOptions: jest.fn().mockResolvedValue([]),
  fetchOptionsWithSearch: jest.fn().mockResolvedValue([]),
  fetchOptionById: jest.fn().mockResolvedValue(null),
}));

jest.mock('./SelectInput', () => ({
  SelectInput: ({ label, value, disabled, savedLabel }: {
    label: string; value?: string; disabled?: boolean; savedLabel?: string;
  }) => (
    <div
      data-testid="select-input"
      data-value={value}
      data-disabled={disabled ? 'true' : 'false'}
      data-saved-label={savedLabel}
    >
      {label}
    </div>
  ),
}));

// --- fixtures --------------------------------------------------------------

const sedeField = {
  id: 57,
  code: 'sede',
  label: 'Sede',
  type: 'select',
  options_source: 'agreement-branches',
  required: false,
  readonly: false,
} as unknown as WizardField;

beforeEach(() => {
  for (const k of Object.keys(mockFieldValues)) delete mockFieldValues[k];
  for (const k of Object.keys(mockFieldLabels)) delete mockFieldLabels[k];
  mockAgreementData = null;
  mockFetchOptionsFromSource.mockClear();
});

// --- tests -----------------------------------------------------------------

describe('CascadingSelectField — gate de agreement-branches', () => {
  it('esconde la sede en una landing sin convenio', () => {
    const { container } = render(
      <CascadingSelectField field={sedeField} staticOptions={[]} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra la sede prellenada por el lead aunque no haya convenio', () => {
    mockFieldValues['sede'] = '45';
    mockFieldLabels['sede'] = 'SENATI - Independencia';
    mockFieldValues[leadLockKey('sede')] = 'true';

    render(
      <CascadingSelectField field={sedeField} staticOptions={[]} disabled />
    );

    const input = screen.getByTestId('select-input');
    expect(input).toHaveAttribute('data-value', '45');
    // El nombre viene del prellenado, no del catálogo: sin esto el campo se
    // vería vacío y encima bloqueado.
    expect(input).toHaveAttribute('data-saved-label', 'SENATI - Independencia');
    expect(input).toHaveAttribute('data-disabled', 'true');
  });

  it('no pide el catálogo de sedes cuando no hay convenio', () => {
    mockFieldValues['sede'] = '45';
    mockFieldLabels['sede'] = 'SENATI - Independencia';
    mockFieldValues[leadLockKey('sede')] = 'true';

    render(<CascadingSelectField field={sedeField} staticOptions={[]} disabled />);

    // `/public/options/agreement-branches` exige `agreement_id`: pedirlo sin
    // convenio es un 422 garantizado.
    expect(mockFetchOptionsFromSource).not.toHaveBeenCalled();
  });

  it('sigue pidiendo el catálogo en una landing con convenio', () => {
    mockAgreementData = { id: 16 };

    render(<CascadingSelectField field={sedeField} staticOptions={[]} />);

    expect(screen.getByTestId('select-input')).toBeInTheDocument();
    expect(mockFetchOptionsFromSource).toHaveBeenCalledWith(
      'agreement-branches',
      { agreement_id: 16 }
    );
  });
});
