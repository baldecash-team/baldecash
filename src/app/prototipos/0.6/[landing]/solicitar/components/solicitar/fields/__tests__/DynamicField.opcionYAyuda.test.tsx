/**
 * BAL-5254 — `option_selected` al elegir una opción (botones, tarjetas,
 * desplegable, listas del sistema) y `help_open` al abrir la ayuda de un
 * campo, en Diseño 1 y Diseño 2. Nunca un texto escrito: solo el código.
 */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { WizardField } from '../../../../../../services/wizardApi';
import { CamposV2Provider } from '@/app/prototipos/0.6/components/diseno-2/campos/estilosV2';

const mockTrack = jest.fn();
jest.mock('../../../../context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: mockTrack, flush: jest.fn() }),
}));

const mockValores: Record<string, string> = {};
jest.mock('../../../../context/WizardContext', () => ({
  useWizard: () => ({
    getFieldValue: (code: string) => mockValores[code] ?? '',
    getFieldLabel: () => undefined,
    getFieldError: () => undefined,
    updateField: (code: string, v: string) => {
      mockValores[code] = v;
    },
    setDynamicOptions: jest.fn(),
    registerDependency: jest.fn(),
    unregisterDependency: jest.fn(),
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

jest.mock('../../../../../calculadora/utils/useDatosMatricula', () => ({
  useDatosMatricula: () => null,
}));

// El desplegable real abre un portal; acá basta con un botón por opción.
type PropsSelect = { id: string; options: { value: string; label: string }[]; onChange: (v: string, l?: string) => void };
jest.mock('../SelectInput', () => ({
  SelectInput: (p: PropsSelect) => (
    <div>
      {p.options.map((o) => (
        <button key={o.value} type="button" data-testid={`sel-${p.id}-${o.value}`} onClick={() => p.onChange(o.value, o.label)}>
          {o.label}
        </button>
      ))}
    </div>
  ),
}));

import { DynamicField } from '../DynamicField';
import { FieldTooltip } from '../FieldTooltip';

const opciones = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: i + 1, value: `op${i + 1}`, label: `Opción ${i + 1}` }));

const campo = (extra: Partial<WizardField>): WizardField =>
  ({
    id: 1,
    code: 'gender',
    label: 'Género',
    type: 'radio',
    required: true,
    readonly: false,
    hidden: false,
    options: opciones(2),
    validations: [],
    dependency_groups: [],
    help_text: null,
    ...extra,
  }) as unknown as WizardField;

const elegidas = () => mockTrack.mock.calls.filter((c) => c[0] === 'option_selected').map((c) => c[1]);
const ayudas = () => mockTrack.mock.calls.filter((c) => c[0] === 'help_open').map((c) => c[1]);

function pintar(f: WizardField, v2: boolean) {
  const el = <DynamicField field={f} />;
  return render(v2 ? <CamposV2Provider>{el}</CamposV2Provider> : el);
}

beforeEach(() => {
  mockTrack.mockClear();
  for (const k of Object.keys(mockValores)) delete mockValores[k];
});

describe.each([
  ['Diseño 1', false],
  ['Diseño 2', true],
])('option_selected · %s', (_n, v2) => {
  it('botones (2-3 opciones): primera elección y cambio', () => {
    const { rerender } = pintar(campo({}), v2);
    fireEvent.click(screen.getByText('Opción 1'));
    // El mock de useWizard no re-renderiza solo.
    rerender(v2 ? <CamposV2Provider><DynamicField field={campo({})} /></CamposV2Provider> : <DynamicField field={campo({})} />);
    fireEvent.click(screen.getByText('Opción 2'));
    expect(elegidas()).toEqual([
      { field_name: 'gender', option_value: 'op1', is_change: false },
      { field_name: 'gender', option_value: 'op2', is_change: true },
    ]);
  });

  it('tarjetas (4-5 opciones)', () => {
    pintar(campo({ code: 'marital_status', options: opciones(4) }), v2);
    fireEvent.click(screen.getByText('Opción 3'));
    expect(elegidas()).toEqual([{ field_name: 'marital_status', option_value: 'op3', is_change: false }]);
  });

  it('desplegable (6+ opciones)', () => {
    mockValores.semester = 'op1';
    pintar(campo({ code: 'semester', options: opciones(7) }), v2);
    fireEvent.click(screen.getByTestId('sel-semester-op5'));
    expect(elegidas()).toEqual([{ field_name: 'semester', option_value: 'op5', is_change: true }]);
  });

  it('lista (select) por CascadingSelectField', () => {
    pintar(campo({ code: 'housing_type', type: 'select', options: opciones(8) }), v2);
    fireEvent.click(screen.getByTestId('sel-housing_type-op8'));
    expect(elegidas()).toEqual([{ field_name: 'housing_type', option_value: 'op8', is_change: false }]);
  });

  it('volver a tocar la misma opción no se registra', () => {
    mockValores.gender = 'op1';
    pintar(campo({}), v2);
    fireEvent.click(screen.getByText('Opción 1')); // la desmarca (valor vacío)
    expect(elegidas()).toEqual([]);
  });
});

describe.each([
  ['Diseño 1', false],
  ['Diseño 2', true],
])('help_open · %s', (_n, v2) => {
  const conAyuda = campo({
    code: 'monthly_income',
    type: 'text',
    options: [],
    help_text: { title: 'Ingresos', description: 'Lo que ganas al mes' },
  } as unknown as Partial<WizardField>);

  function abrir(container: HTMLElement) {
    const disparador = container.querySelector('.cursor-help') as HTMLElement;
    expect(disparador).not.toBeNull();
    act(() => {
      fireEvent.mouseEnter(disparador);
    });
    return disparador;
  }

  it('abrir la ayuda registra help_open una vez por apertura', () => {
    const { container } = pintar(conAyuda, v2);
    const disparador = abrir(container);
    expect(ayudas()).toEqual([{ field_name: 'monthly_income' }]);
    act(() => {
      fireEvent.mouseLeave(disparador);
    });
    act(() => {
      fireEvent.mouseEnter(disparador);
    });
    expect(ayudas()).toEqual([{ field_name: 'monthly_income' }, { field_name: 'monthly_income' }]);
  });
});

it('una ayuda fuera del formulario (sin campo) no registra help_open', () => {
  const { container } = render(<FieldTooltip content="Filtro de precio" />);
  act(() => {
    fireEvent.mouseEnter(container.querySelector('.cursor-help') as HTMLElement);
  });
  expect(ayudas()).toEqual([]);
});
