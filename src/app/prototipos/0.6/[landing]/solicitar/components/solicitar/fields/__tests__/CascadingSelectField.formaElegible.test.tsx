/**
 * BAL-4701: las listas chicas del sistema (tipo de documento, estado civil)
 * respetan la forma elegida en el panel. Sin forma elegida siguen con
 * buscador, igual que antes, y el resto de listas del sistema no cambia.
 *
 * Lo que importa del tipo de documento: con botones o tarjetas las opciones
 * se siguen pidiendo a `/public/options/document-types` y se siguen guardando
 * en el caché de opciones dinámicas (`setDynamicOptions`), que es de donde
 * `DocumentNumberField` saca el largo y el formato del número.
 */
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { CascadingSelectField } from '../CascadingSelectField';
import { WizardField } from '../../../../../../services/wizardApi';

const mockFieldValues: Record<string, string> = {};
const mockUpdateField = jest.fn();
const mockSetDynamicOptions = jest.fn();
const mockRegisterDependency = jest.fn();
const mockUnregisterDependency = jest.fn();

jest.mock('../../../../context/WizardContext', () => ({
  useWizard: () => ({
    getFieldValue: (code: string) => mockFieldValues[code] ?? '',
    getFieldLabel: () => undefined,
    getFieldError: () => undefined,
    updateField: mockUpdateField,
    setDynamicOptions: mockSetDynamicOptions,
    registerDependency: mockRegisterDependency,
    unregisterDependency: mockUnregisterDependency,
  }),
}));

jest.mock('../../../../../context/LayoutContext', () => ({
  useLayout: () => ({ agreementData: null, landing: 'una-landing' }),
}));

const mockFetchOptionsFromSource = jest.fn();
jest.mock('../../../../../../services/wizardApi', () => ({
  fetchOptionsFromSource: (...args: unknown[]) => mockFetchOptionsFromSource(...args),
  fetchCascadingOptions: jest.fn().mockResolvedValue([]),
  fetchOptionsWithSearch: jest.fn().mockResolvedValue([]),
  fetchOptionById: jest.fn().mockResolvedValue(null),
}));

jest.mock('../SelectInput', () => ({
  SelectInput: (props: { label: string; searchable?: boolean; options: unknown[] }) => (
    <div data-testid="select-input" data-searchable={props.searchable ? 'true' : 'false'} data-opciones={props.options.length}>
      {props.label}
    </div>
  ),
}));

const TIPOS = [
  { value: 'dni', label: 'DNI', validation: { max_length: 8, pattern: '^\d{8}$', input_mode: 'numeric' } },
  { value: 'ce', label: 'CE', validation: { max_length: 12 } },
  { value: 'pasaporte', label: 'Pasaporte', validation: { max_length: 12 } },
];

const campo = (extra: Partial<WizardField>): WizardField =>
  ({
    id: 1,
    code: 'document_type',
    label: 'Tipo de documento',
    type: 'select',
    options_source: 'document-types',
    required: true,
    readonly: false,
    ...extra,
  }) as unknown as WizardField;

beforeEach(() => {
  for (const k of Object.keys(mockFieldValues)) delete mockFieldValues[k];
  mockUpdateField.mockClear();
  mockSetDynamicOptions.mockClear();
  mockFetchOptionsFromSource.mockReset();
  mockFetchOptionsFromSource.mockResolvedValue(TIPOS);
});

describe('CascadingSelectField — forma elegible en listas chicas del sistema (BAL-4701)', () => {
  it('con «Botones» el tipo de documento se ve como 3 botones y sigue llenando el caché', async () => {
    render(<CascadingSelectField field={campo({ display_mode: 'buttons' })} staticOptions={[]} searchable />);

    expect(await screen.findByRole('button', { name: 'DNI' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'CE' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pasaporte' })).toBeInTheDocument();
    expect(screen.queryByTestId('select-input')).not.toBeInTheDocument();
    // Las reglas del número (largo, solo números en DNI) salen de aquí.
    expect(mockFetchOptionsFromSource).toHaveBeenCalledWith('document-types', expect.anything());
    expect(mockSetDynamicOptions).toHaveBeenCalledWith('document_type', TIPOS);
  });

  it('tocar un botón guarda el valor con su texto', async () => {
    render(<CascadingSelectField field={campo({ display_mode: 'buttons' })} staticOptions={[]} searchable />);
    fireEvent.click(await screen.findByRole('button', { name: 'CE' }));
    expect(mockUpdateField).toHaveBeenCalledWith('document_type', 'ce', 'CE');
  });

  it('con «Tarjetas» el estado civil se ve como tarjetas', async () => {
    const civiles = ['Soltero', 'Casado', 'Viudo', 'Divorciado', 'Conviviente'].map((l) => ({ value: l.toLowerCase(), label: l }));
    mockFetchOptionsFromSource.mockResolvedValue(civiles);
    render(
      <CascadingSelectField
        field={campo({ code: 'marital_status', label: 'Estado civil', options_source: 'marital-status', display_mode: 'cards' })}
        staticOptions={[]}
        searchable
      />
    );
    expect(await screen.findByText('Conviviente')).toBeInTheDocument();
    expect(screen.queryByTestId('select-input')).not.toBeInTheDocument();
  });

  it('con «Desplegable» va sin buscador', async () => {
    render(<CascadingSelectField field={campo({ display_mode: 'dropdown' })} staticOptions={[]} searchable />);
    await waitFor(() => expect(screen.getByTestId('select-input')).toHaveAttribute('data-opciones', '3'));
    expect(screen.getByTestId('select-input')).toHaveAttribute('data-searchable', 'false');
  });

  it('sin forma elegida sigue con buscador, como hoy', async () => {
    render(<CascadingSelectField field={campo({ display_mode: null })} staticOptions={[]} searchable />);
    await waitFor(() => expect(screen.getByTestId('select-input')).toHaveAttribute('data-opciones', '3'));
    expect(screen.getByTestId('select-input')).toHaveAttribute('data-searchable', 'true');
    expect(screen.queryByRole('button', { name: 'DNI' })).not.toBeInTheDocument();
  });

  it('otra lista del sistema con «Botones» guardado sigue con buscador', async () => {
    render(
      <CascadingSelectField
        field={campo({ code: 'department', label: 'Departamento', options_source: 'geo-units/departments', display_mode: 'buttons' })}
        staticOptions={[]}
        searchable
      />
    );
    await waitFor(() => expect(screen.getByTestId('select-input')).toHaveAttribute('data-opciones', '3'));
    expect(screen.getByTestId('select-input')).toHaveAttribute('data-searchable', 'true');
  });

  it('mientras carga no dibuja botones vacíos', () => {
    mockFetchOptionsFromSource.mockReturnValue(new Promise(() => {}));
    render(<CascadingSelectField field={campo({ display_mode: 'buttons' })} staticOptions={[]} searchable />);
    expect(screen.getByTestId('select-input')).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
