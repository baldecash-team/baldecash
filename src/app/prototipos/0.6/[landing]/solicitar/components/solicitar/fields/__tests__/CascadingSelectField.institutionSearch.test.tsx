/**
 * BAL-5210 — el buscador de institución y carrera (búsqueda en ws2,
 * `min_search_length`) registra `institution_search`. Las listas que no
 * buscan en ws2 (departamento, tipo de documento…) no.
 */
import React from 'react';
import { act, render } from '@testing-library/react';
import { WizardField } from '../../../../../../services/wizardApi';
import { CamposV2Provider } from '@/app/prototipos/0.6/components/diseno-2/campos/estilosV2';

const mockTrack = jest.fn();
jest.mock('../../../../context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: mockTrack, flush: jest.fn() }),
}));

jest.mock('../../../../context/WizardContext', () => ({
  useWizard: () => ({
    getFieldValue: () => '',
    getFieldLabel: () => undefined,
    getFieldError: () => undefined,
    updateField: jest.fn(),
    setDynamicOptions: jest.fn(),
    registerDependency: jest.fn(),
    unregisterDependency: jest.fn(),
  }),
}));

jest.mock('../../../../../context/LayoutContext', () => ({
  useLayout: () => ({ agreementData: null, landing: 'una-landing' }),
}));

const mockFetchOptionsWithSearch = jest.fn();
jest.mock('../../../../../../services/wizardApi', () => ({
  fetchOptionsFromSource: jest.fn().mockResolvedValue([]),
  fetchCascadingOptions: jest.fn().mockResolvedValue([]),
  fetchOptionsWithSearch: (...a: unknown[]) => mockFetchOptionsWithSearch(...a),
  fetchOptionById: jest.fn().mockResolvedValue(null),
}));

type PropsSelect = {
  onSearch?: (t: string) => boolean | void;
  onChange: (v: string, l?: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};
let mockSelect: PropsSelect;
jest.mock('../SelectInput', () => ({
  SelectInput: (p: PropsSelect) => {
    mockSelect = p;
    return <div data-testid="select-input" />;
  },
}));

import { CascadingSelectField } from '../CascadingSelectField';

const campo = (extra: Partial<WizardField>): WizardField =>
  ({ id: 1, code: 'institution', label: 'Institución', type: 'autocomplete', required: true,
    readonly: false, options_source: 'study-centers', min_search_length: 3, ...extra }) as unknown as WizardField;

const busquedas = () => mockTrack.mock.calls.filter((c) => c[0] === 'institution_search').map((c) => c[1]);

async function escribir(t: string) {
  await act(async () => {
    mockSelect.onSearch!(t);
    jest.advanceTimersByTime(300); // debounce de la búsqueda
  });
  await act(async () => {
    await Promise.resolve();
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  mockTrack.mockClear();
  mockFetchOptionsWithSearch.mockReset();
});
afterEach(() => jest.useRealTimers());

describe('CascadingSelectField — institution_search (BAL-5210)', () => {
  it.each([
    ['institution', 'study-centers', 1, false],
    ['career', 'careers', 2, true],
  ])('%s: busca, no encuentra, vuelve a buscar y elige', async (code, source, diseno, v2) => {
    const el = <CascadingSelectField field={campo({ code, options_source: source })} staticOptions={[]} searchable />;
    render(v2 ? <CamposV2Provider>{el}</CamposV2Provider> : el);

    mockFetchOptionsWithSearch.mockResolvedValueOnce([]);
    await escribir('zzzz');
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    mockFetchOptionsWithSearch.mockResolvedValueOnce([{ value: 9, label: 'Opción A' }, { value: 10, label: 'Opción B' }]);
    await escribir('opci');
    act(() => {
      mockSelect.onChange('9', 'Opción A');
      mockSelect.onBlur?.();
    });

    expect(busquedas()).toEqual([
      { field_name: code, query: 'zzzz', results_count: 0, selected_id: null, selected_label: null, searches_before_select: 1, diseno },
      { field_name: code, query: 'opci', results_count: 2, selected_id: '9', selected_label: 'Opción A', searches_before_select: 2, diseno },
    ]);
  });

  it('al salir con una búsqueda pendiente la registra', async () => {
    render(<CascadingSelectField field={campo({})} staticOptions={[]} searchable />);
    mockFetchOptionsWithSearch.mockResolvedValueOnce([{ value: 1, label: 'UPC' }]);
    await escribir('upc');
    act(() => {
      mockSelect.onBlur?.();
    });
    expect(busquedas()).toEqual([expect.objectContaining({ query: 'upc', results_count: 1, selected_id: null })]);
  });

  it('una lista que no busca en ws2 no registra búsquedas', () => {
    render(
      <CascadingSelectField
        field={campo({ code: 'semester', min_search_length: null, options_source: null })}
        staticOptions={[{ value: '1', label: 'Primero' }]}
        searchable
      />,
    );
    expect(mockSelect.onSearch).toBeUndefined();
    act(() => {
      mockSelect.onChange('1', 'Primero');
      mockSelect.onBlur?.();
    });
    expect(busquedas()).toHaveLength(0);
  });
});
