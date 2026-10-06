/**
 * BAL-4354 — Lista con «El cliente puede marcar varias».
 *
 * Las cinco formas (Casillas, Botones, Tarjetas, Desplegable, Buscador) en
 * versión de varias: marcar una NO desmarca otra, el marcador es cuadradito
 * (`role="checkbox"` + `aria-checked`), la ayuda fija «Puedes marcar varias»
 * y el valor que va a `updateField` es `string[]`. Sin mockear los campos: se
 * prueba lo que de verdad ve el cliente.
 */
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { WizardField } from '../../../../../../services/wizardApi';

const mockUpdateField = jest.fn();
let mockFormData: Record<string, { value: string | string[]; label?: string }> = {};
jest.mock('../../../../context/WizardContext', () => ({
  useWizard: () => ({
    getFieldValue: (code: string) => mockFormData[code]?.value ?? '',
    getFieldError: () => undefined,
    updateField: mockUpdateField,
    formData: mockFormData,
  }),
  FILE_PENDING_REUPLOAD: '__pending__',
}));
jest.mock('../../../../../context/LayoutContext', () => ({
  useLayout: () => ({ agreementData: null, landing: 'una-landing' }),
}));
jest.mock('../../../../hooks/useFieldTracking', () => ({
  useFieldTracking: () => ({ onFieldFocus: jest.fn(), onFieldBlur: jest.fn() }),
}));

import { DynamicField } from '../DynamicField';

const INTERESES = [
  { value: 'deportes', label: 'Deportes' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'musica', label: 'Música' },
  { value: 'arte', label: 'Arte' },
];

const campo = (extra: Partial<WizardField> = {}): WizardField =>
  ({
    id: 1,
    code: 'intereses',
    label: '¿Qué te interesa?',
    type: 'select',
    required: true,
    allow_multiple: true,
    options: INTERESES,
    dependency_groups: [],
    ...extra,
  }) as unknown as WizardField;

/** Simula el contexto real: cada `updateField` guarda y se vuelve a dibujar. */
function montar(field: WizardField) {
  mockFormData = {};
  const utils = render(<DynamicField field={field} />);
  mockUpdateField.mockImplementation((code: string, value: string[], label?: string) => {
    mockFormData = { ...mockFormData, [code]: { value, label } };
    utils.rerender(<DynamicField field={field} />);
  });
  return utils;
}

beforeEach(() => {
  mockUpdateField.mockReset();
  mockFormData = {};
});

const FORMAS: Array<[string, WizardField['display_mode']]> = [
  ['Casillas', 'checkboxes'],
  ['Botones', 'buttons'],
  ['Tarjetas', 'cards'],
];

describe.each(FORMAS)('%s con varias', (_nombre, displayMode) => {
  it('marcar dos guarda las dos como lista y ninguna desmarca a la otra', () => {
    montar(campo({ display_mode: displayMode }));
    expect(screen.getByText('Puedes marcar varias')).toBeInTheDocument();
    const casillas = screen.getAllByRole('checkbox');
    expect(casillas).toHaveLength(4);
    expect(screen.queryAllByRole('radio')).toHaveLength(0);

    fireEvent.click(screen.getByRole('checkbox', { name: /Deportes/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Tecnología/ }));

    expect(mockUpdateField).toHaveBeenLastCalledWith('intereses', ['deportes', 'tecnologia'], 'Deportes, Tecnología');
    expect(screen.getByRole('checkbox', { name: /Deportes/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('checkbox', { name: /Tecnología/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('checkbox', { name: /Música/ })).toHaveAttribute('aria-checked', 'false');
  });

  it('tocar una marcada la desmarca', () => {
    montar(campo({ display_mode: displayMode }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Deportes/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Música/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Deportes/ }));
    expect(mockUpdateField).toHaveBeenLastCalledWith('intereses', ['musica'], 'Música');
  });
});

describe('Desplegable con varias', () => {
  it('el cuadro muestra «Deportes, Tecnología» y al abrirse hay casillas', () => {
    montar(campo({ display_mode: 'dropdown' }));
    const cuadro = screen.getByRole('button', { name: /¿Qué te interesa\?/ });
    expect(cuadro).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(cuadro);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Deportes' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Tecnología' }));
    expect(mockUpdateField).toHaveBeenLastCalledWith('intereses', ['deportes', 'tecnologia'], 'Deportes, Tecnología');
    // Sigue abierto: marcar otra no cierra el desplegable.
    expect(screen.getByRole('button', { name: /¿Qué te interesa\?/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: /¿Qué te interesa\?/ })).toHaveTextContent('Deportes, Tecnología');
  });

  it('Escape cierra el desplegable', () => {
    montar(campo({ display_mode: 'dropdown' }));
    fireEvent.click(screen.getByRole('button', { name: /¿Qué te interesa\?/ }));
    fireEvent.keyDown(screen.getByRole('checkbox', { name: 'Arte' }), { key: 'Escape' });
    expect(screen.queryByRole('checkbox', { name: 'Arte' })).not.toBeInTheDocument();
  });
});

describe('Buscador con varias', () => {
  it('filtra al escribir, agrega como chip y se quita con la «×»', () => {
    montar(campo({ display_mode: 'search' }));
    const buscador = screen.getByRole('combobox');
    fireEvent.focus(buscador);
    fireEvent.change(buscador, { target: { value: 'tecno' } });
    const lista = screen.getByRole('listbox');
    expect(within(lista).getAllByRole('option')).toHaveLength(1);
    fireEvent.click(within(lista).getByRole('option', { name: 'Tecnología' }));

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'dep' } });
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
    expect(mockUpdateField).toHaveBeenLastCalledWith('intereses', ['deportes', 'tecnologia'], 'Deportes, Tecnología');

    fireEvent.click(screen.getByRole('button', { name: 'Quitar Tecnología' }));
    expect(mockUpdateField).toHaveBeenLastCalledWith('intereses', ['deportes'], 'Deportes');
  });
});

describe('Recomendada con varias (sin forma elegida)', () => {
  it('con 4 opciones salen Casillas, no tarjetas de una respuesta', () => {
    montar(campo({ display_mode: null }));
    expect(document.querySelector('[data-forma-varias="checkboxes"]')).not.toBeNull();
  });

  it('sin varias la lista sigue siendo de una respuesta (sin la ayuda)', () => {
    montar(campo({ allow_multiple: false, display_mode: 'cards' }));
    expect(screen.queryByText('Puedes marcar varias')).not.toBeInTheDocument();
    expect(document.querySelector('[data-forma-varias]')).toBeNull();
  });
});

it('un valor viejo de una sola respuesta se muestra marcado', () => {
  mockFormData = { intereses: { value: 'arte' } };
  render(<DynamicField field={campo({ display_mode: 'checkboxes' })} />);
  expect(screen.getByRole('checkbox', { name: /Arte/ })).toHaveAttribute('aria-checked', 'true');
});
