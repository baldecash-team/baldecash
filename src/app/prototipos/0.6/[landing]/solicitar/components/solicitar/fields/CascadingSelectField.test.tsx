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
import { render, screen, waitFor } from '@testing-library/react';

import { CascadingSelectField } from './CascadingSelectField';
import { leadLockKey } from '../../../hooks/useLeadPrefill';
import { WizardField } from '../../../../../services/wizardApi';

// --- mocks -----------------------------------------------------------------

const mockFieldValues: Record<string, string> = {};
const mockFieldLabels: Record<string, string> = {};
// Referencias estables entre renders (como el contexto real, que las memoiza):
// con `jest.fn()` nuevo en cada llamada a `useWizard()`, los `useEffect` que
// las llevan en sus dependencias (p. ej. `updateField`) se re-disparan en
// cada render y, si de paso ponen estado, entran en loop infinito.
const mockUpdateField = jest.fn();
const mockSetDynamicOptions = jest.fn();
const mockRegisterDependency = jest.fn();
const mockUnregisterDependency = jest.fn();

jest.mock('../../../context/WizardContext', () => ({
  useWizard: () => ({
    getFieldValue: (code: string) => mockFieldValues[code] ?? '',
    getFieldLabel: (code: string) => mockFieldLabels[code],
    getFieldError: () => undefined,
    updateField: mockUpdateField,
    setDynamicOptions: mockSetDynamicOptions,
    registerDependency: mockRegisterDependency,
    unregisterDependency: mockUnregisterDependency,
  }),
}));

let mockAgreementData: { id: number } | null = null;
let mockLanding = 'una-landing-cualquiera';

jest.mock('../../../../context/LayoutContext', () => ({
  useLayout: () => ({ agreementData: mockAgreementData, landing: mockLanding }),
}));

const mockFetchOptionsFromSource = jest.fn().mockResolvedValue([]);
const mockFetchOptionsWithSearch = jest.fn().mockResolvedValue([]);

jest.mock('../../../../../services/wizardApi', () => ({
  fetchOptionsFromSource: (...args: unknown[]) => mockFetchOptionsFromSource(...args),
  fetchCascadingOptions: jest.fn().mockResolvedValue([]),
  fetchOptionsWithSearch: (...args: unknown[]) => mockFetchOptionsWithSearch(...args),
  fetchOptionById: jest.fn().mockResolvedValue(null),
}));

const mockSelectProps: Record<string, unknown> = {};
jest.mock('./SelectInput', () => ({
  SelectInput: (props: {
    label: string; value?: string; disabled?: boolean; savedLabel?: string; placeholder?: string;
    onFocus?: () => void; onBlur?: () => void; onSearch?: (term: string) => void;
  }) => {
    Object.assign(mockSelectProps, props);
    const { label, value, disabled, savedLabel, placeholder } = props;
    return (
      <div
        data-testid="select-input"
        data-value={value}
        data-disabled={disabled ? 'true' : 'false'}
        data-saved-label={savedLabel}
        data-placeholder={placeholder}
      >
        {label}
      </div>
    );
  },
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
  mockLanding = 'una-landing-cualquiera';
  mockFetchOptionsFromSource.mockClear();
  mockFetchOptionsWithSearch.mockClear();
  mockUpdateField.mockClear();
  mockSetDynamicOptions.mockClear();
  mockRegisterDependency.mockClear();
  mockUnregisterDependency.mockClear();
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

  it('muestra la sede vacía y con catálogo en una landing del mapa, sin convenio', async () => {
    mockLanding = 'lead-flujo-normal';
    mockFetchOptionsFromSource.mockResolvedValueOnce([
      { value: 45, label: 'SENATI - Independencia' },
      { value: 65, label: 'SENATI - San Martín de Porres' },
    ]);

    render(<CascadingSelectField field={sedeField} staticOptions={[]} />);

    // Visible aunque el lead no haya traído sede: la persona la elige.
    const input = screen.getByTestId('select-input');
    expect(input).toHaveAttribute('data-value', '');

    // Y con las sedes de SENATI para elegir, que es lo que la hace usable.
    expect(mockFetchOptionsFromSource).toHaveBeenCalledWith(
      'agreement-branches',
      { agreement_id: 16 }
    );

    // Arranca deshabilitado mientras carga el catálogo y se habilita al
    // llegar: sin esto la persona puede abrir un select todavía vacío.
    await waitFor(() =>
      expect(screen.getByTestId('select-input')).toHaveAttribute('data-disabled', 'false')
    );
  });

  it('el mapa no filtra a otras landings sin convenio', () => {
    mockLanding = 'otra-landing-sin-convenio';

    const { container } = render(
      <CascadingSelectField field={sedeField} staticOptions={[]} />
    );

    expect(container).toBeEmptyDOMElement();
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

describe('CascadingSelectField — hooks y foco (BAL-4384)', () => {
  it('pasar de «sin convenio» a «con convenio» no rompe el orden de los hooks', () => {
    const { rerender, container } = render(<CascadingSelectField field={sedeField} staticOptions={[]} />);
    expect(container).toBeEmptyDOMElement();
    mockAgreementData = { id: 16 };
    // Con el `return null` antes de los useState, esto lanzaba
    // «Rendered more hooks than during the previous render».
    expect(() => rerender(<CascadingSelectField field={sedeField} staticOptions={[]} />)).not.toThrow();
    expect(screen.getByTestId('select-input')).toBeInTheDocument();
  });

  it('pasa onFocus y onBlur al desplegable', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const campo = { ...sedeField, code: 'marital_status', options_source: null } as unknown as WizardField;
    render(<CascadingSelectField field={campo} staticOptions={[{ value: 's', label: 'Soltero' }]} onFocus={onFocus} onBlur={onBlur} />);
    (mockSelectProps.onFocus as () => void)();
    (mockSelectProps.onBlur as () => void)();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('«Primero selecciona …» usa la etiqueta del padre cuando no es departamento/provincia', () => {
    const campo = {
      ...sedeField, code: 'carrera_x', options_source: 'geo-units/provinces',
      cascade_from: 'region_x', cascade_param: 'parent_id', cascade_from_label: 'Región',
    } as unknown as WizardField;
    render(<CascadingSelectField field={campo} staticOptions={[]} />);
    expect(screen.getByTestId('select-input')).toHaveAttribute('data-placeholder', 'Primero selecciona región');
  });

  it('para provincia el texto sigue siendo el de siempre', () => {
    const campo = {
      ...sedeField, code: 'province', options_source: 'geo-units/provinces',
      cascade_from: 'department', cascade_param: 'parent_id', cascade_from_label: 'Departamento de entrega',
    } as unknown as WizardField;
    render(<CascadingSelectField field={campo} staticOptions={[]} />);
    expect(screen.getByTestId('select-input')).toHaveAttribute('data-placeholder', 'Primero selecciona departamento');
  });

  it('el buscador de centros manda type=<valor> como siempre (campo 43)', async () => {
    jest.useFakeTimers();
    mockFieldValues['institution_type'] = 'university';
    const campo = { ...sedeField, code: 'institution', type: 'autocomplete', options_source: 'study-centers',
      min_search_length: 3, options_filter: { depends_on: 'institution_type' } } as unknown as WizardField;
    render(<CascadingSelectField field={campo} staticOptions={[]} searchable />);
    (mockSelectProps.onSearch as (t: string) => void)('uni');
    jest.advanceTimersByTime(300);
    expect(mockFetchOptionsWithSearch).toHaveBeenCalledWith('study-centers', 'uni', [['type', 'university']]);
    jest.useRealTimers();
  });

  describe('from_agreement en el buscador de centros', () => {
    const centro = {
      ...sedeField, code: 'institution', type: 'autocomplete', options_source: 'study-centers',
      min_search_length: 3, options_filter: { from_agreement: true },
    } as unknown as WizardField;

    const buscar = (t: string) => {
      (mockSelectProps.onSearch as (t: string) => void)(t);
      jest.advanceTimersByTime(300);
    };

    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('manda el convenio de la landing', () => {
      mockAgreementData = { id: 7 };
      render(<CascadingSelectField field={centro} staticOptions={[]} searchable />);
      buscar('uni');
      expect(mockFetchOptionsWithSearch).toHaveBeenCalledWith('study-centers', 'uni', [['agreement_id', '7']]);
    });

    it('no usa el convenio prestado de las sedes en una landing sin convenio (lead-flujo-normal)', () => {
      // `SEDES_SIN_CONVENIO` existe solo para resolver sedes: esa landing NO es
      // de convenio y cada lead trae su propia institución. Si el filtro usara
      // ese convenio, el buscador mostraría solo SENATI.
      mockLanding = 'lead-flujo-normal';
      render(<CascadingSelectField field={centro} staticOptions={[]} searchable />);
      buscar('uni');
      expect(mockFetchOptionsWithSearch).toHaveBeenCalledWith('study-centers', 'uni', []);
    });
  });
});
