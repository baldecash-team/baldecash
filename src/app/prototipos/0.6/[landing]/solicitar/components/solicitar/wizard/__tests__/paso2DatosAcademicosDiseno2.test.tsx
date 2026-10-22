/// <reference types="jest" />
/**
 * BAL-4964 (F5) — Paso 2 · Datos académicos en Diseño 2.
 *
 * `DynamicWizardStep` con `camposTocados` (Diseño 2):
 * - con `groups`, pinta secciones (`SeccionPlegable`) en su orden y deja los
 *   campos sin sección al final;
 * - la sección completa se cierra al salir, con el resumen en etiquetas;
 * - "Otra (escríbela)" se pinta pegado a su lista;
 * - las tarjetas de opción (`RadioGroup`) son un radiogroup de verdad.
 * Sin `camposTocados` (Diseño 1) el DOM es el de siempre.
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { WizardField, WizardStep } from '../../../../../../services/wizardApi';

type Valor = string | string[];
let formData: Record<string, { value: Valor; error?: string | null; label?: string }> = {};

const updateField = jest.fn((fieldId: string, value: Valor, label?: string) => {
  formData = { ...formData, [fieldId]: { ...formData[fieldId], value, ...(label ? { label } : {}) } };
});

jest.mock('../../../../context/WizardContext', () => ({
  useWizard: () => ({
    formData,
    updateField,
    getFieldValue: (code: string) => formData[code]?.value ?? '',
    getFieldError: (code: string) => formData[code]?.error ?? undefined,
    getFieldLabel: (code: string) => formData[code]?.label,
    isFieldTouched: () => false,
    setFieldError: jest.fn(),
    setDynamicOptions: jest.fn(),
    getDynamicOptions: () => [],
    getAllDynamicOptions: () => ({}),
    registerDependency: jest.fn(),
    unregisterDependency: jest.fn(),
  }),
  FILE_PENDING_REUPLOAD: '__FILE_PENDING_REUPLOAD__',
}));

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({ deferredPayment: null, agreementData: null, landing: 'pago-diferido' }),
}));

jest.mock('../../../../hooks/useFieldTracking', () => ({
  useFieldTracking: () => ({ onFieldFocus: jest.fn(), onFieldBlur: jest.fn() }),
}));

jest.mock('../../../../../calculadora/utils/useDatosMatricula', () => ({
  useDatosMatricula: () => null,
}));

jest.mock('../../../../hooks/useGooglePlacesAutocomplete', () => ({
  useGooglePlacesAutocomplete: jest.fn(),
}));

import { DynamicWizardStep } from '../DynamicWizardStep';
import { SelectInput } from '../../fields/SelectInput';
import { RadioGroup } from '../../fields/RadioGroup';
import { CamposV2Provider } from '@/app/prototipos/0.6/components/diseno-2/campos/estilosV2';
import { useGooglePlacesAutocomplete } from '../../../../hooks/useGooglePlacesAutocomplete';

const mockGoogle = useGooglePlacesAutocomplete as jest.Mock;

function campo(overrides: Partial<WizardField>): WizardField {
  return {
    id: 1,
    code: 'x',
    label: 'X',
    type: 'text',
    placeholder: null,
    help_text: null,
    required: true,
    readonly: false,
    hidden: false,
    grid_columns: 12,
    grid_columns_mobile: 12,
    prefix: null,
    suffix: null,
    min_length: null,
    max_length: null,
    min_value: null,
    max_value: null,
    step: null,
    pattern: null,
    mask: null,
    input_mode: null,
    options_source: null,
    options_filter: null,
    options: [],
    validations: [],
    dependency_groups: [],
    max_files: null,
    default_value: null,
    ...overrides,
  } as WizardField;
}

function paso(fields: WizardField[], extra: Partial<WizardStep> = {}): WizardStep {
  return {
    id: 2,
    code: 'academic_data',
    url_slug: 'datos-academicos',
    name: 'Datos académicos',
    title: 'Datos Académicos',
    description: '',
    icon: '',
    order: 2,
    required: true,
    skippable: false,
    estimated_time_minutes: 1,
    is_summary_step: false,
    motivational: null,
    fields,
    ...extra,
  };
}

const SITUACION = campo({
  id: 10,
  code: 'situacion_actual',
  label: 'Situación actual',
  type: 'select',
  display_mode: 'auto',
  options: [
    { value: 'estoy_estudiando', label: 'Estoy estudiando' },
    { value: 'no_estoy_estudiando_ahora', label: 'No estoy estudiando ahora' },
  ],
} as Partial<WizardField>);
const CICLO = campo({
  id: 11,
  code: 'semester',
  label: 'Ciclo Actual',
  type: 'select',
  options: [
    ...Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}° Ciclo` })),
    { value: 'otro', label: 'Otro' },
  ],
} as Partial<WizardField>);
const OTRO_CICLO = campo({
  id: 12,
  code: 'other_semester',
  label: '¿Cuál ciclo?',
  hidden: true,
  dependency_groups: [{ action: 'show', logic: 'and', conditions: [{ depends_on_field: 'semester', operator: 'equals', value: 'otro' }] }],
});
const MONTO = campo({ id: 13, code: 'tuition_amount', label: 'Monto de tu mensualidad', type: 'currency' });
const PAGO = campo({
  id: 14,
  code: 'tuition_payer',
  label: '¿Cómo pagas tu mensualidad?',
  type: 'select',
  display_mode: 'cards',
  options: [
    { value: 'lo_pago_yo', label: 'Lo pago yo' },
    { value: 'pago_la_mitad', label: 'Pago la mitad' },
    { value: 'lo_paga_un_familiar', label: 'Lo paga un familiar' },
    { value: 'otra', label: 'Otra (escríbela)' },
  ],
} as Partial<WizardField>);
const CORREO = campo({ id: 15, code: 'email', label: 'Correo electrónico', type: 'email', required: false });

const GRUPOS = [
  { code: 'mensualidad', name: 'Mensualidad de tus estudios', order: 3, is_collapsible: true, field_codes: ['tuition_amount', 'tuition_payer'] },
  { code: 'tus_estudios', name: 'Tus estudios', order: 2, is_collapsible: true, field_codes: ['situacion_actual', 'semester'] },
];
const PASO2 = paso([CORREO, SITUACION, CICLO, OTRO_CICLO, MONTO, PAGO], { groups: GRUPOS });

const NADA_TOCADO = new Set<string>();
const pintarV2 = (step: WizardStep, showErrors = false) =>
  render(<DynamicWizardStep step={step} showErrors={showErrors} camposTocados={NADA_TOCADO} />);
const pintarV1 = (step: WizardStep, showErrors = false) =>
  render(<DynamicWizardStep step={step} showErrors={showErrors} />);

const ordenDeCampos = (c: HTMLElement) =>
  Array.from(c.querySelectorAll<HTMLElement>('[data-campo]')).map((el) => el.dataset.campo);
const seccion = (c: HTMLElement, codigo: string) => c.querySelector(`[data-seccion="${codigo}"]`) as HTMLElement;

beforeEach(() => {
  updateField.mockClear();
  formData = {};
  mockGoogle.mockReturnValue({ isLoaded: true, isLoading: false, error: null });
  window.scrollBy = jest.fn();
});

describe('Secciones del paso (groups)', () => {
  it('agrupa por groups en su orden, cada sección en el orden del paso, sin sección al final', () => {
    const { container } = pintarV2(PASO2);
    const secciones = Array.from(container.querySelectorAll<HTMLElement>('[data-seccion]')).map((s) => s.dataset.seccion);
    expect(secciones).toEqual(['tus_estudios', 'mensualidad']);
    expect(screen.getByRole('heading', { name: 'Tus estudios' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Mensualidad de tus estudios' })).toBeInTheDocument();
    expect(ordenDeCampos(container)).toEqual(['situacion_actual', 'semester', 'tuition_amount', 'tuition_payer', 'email']);
    // El correo (sin sección) va fuera de toda sección.
    expect(container.querySelector('[data-campo="email"]')?.closest('[data-seccion]')).toBeNull();
  });

  it('una sección cuyos campos están todos escondidos no se pinta', () => {
    const escondido = { action: 'hide' as const, logic: 'and' as const, conditions: [{ depends_on_field: 'situacion_actual', operator: 'equals' as const, value: 'no_estoy_estudiando_ahora' }] };
    formData = { situacion_actual: { value: 'no_estoy_estudiando_ahora' } };
    const { container } = pintarV2(
      paso([SITUACION, { ...MONTO, dependency_groups: [escondido] }, { ...PAGO, dependency_groups: [escondido] }], { groups: GRUPOS }),
    );
    expect(seccion(container, 'mensualidad')).toBeNull();
    expect(seccion(container, 'tus_estudios')).not.toBeNull();
  });

  it('sin groups el paso sale como antes en Diseño 2: una columna, en el orden del paso, sin secciones', () => {
    const { container } = pintarV2(paso([CORREO, SITUACION, CICLO]));
    expect(container.querySelector('[data-seccion]')).toBeNull();
    expect(ordenDeCampos(container)).toEqual(['email', 'situacion_actual', 'semester']);
  });

  it('completa y con el foco afuera, se cierra con el resumen en etiquetas; "Editar" la reabre', () => {
    formData = {
      situacion_actual: { value: 'estoy_estudiando' },
      semester: { value: '8' },
    };
    const { container } = pintarV2(PASO2);
    const tus = seccion(container, 'tus_estudios');
    act(() => tus.querySelector<HTMLElement>('[role="radio"]')!.focus());
    act(() => (container.querySelector('[data-campo="email"] input') as HTMLInputElement).focus());
    expect(tus).toHaveAttribute('data-cerrada', 'true');
    expect(screen.getByText('Estoy estudiando · 8° Ciclo')).toBeInTheDocument();
    // La de mensualidad está incompleta y sigue abierta.
    expect(seccion(container, 'mensualidad')).toHaveAttribute('data-cerrada', 'false');

    fireEvent.click(screen.getByRole('button', { name: 'Editar Tus estudios' }));
    expect(tus).toHaveAttribute('data-cerrada', 'false');
  });

  it('con error al continuar, la sección con error se abre', () => {
    formData = {
      situacion_actual: { value: 'estoy_estudiando' },
      semester: { value: '8' },
    };
    const { container, rerender } = pintarV2(PASO2);
    const tus = seccion(container, 'tus_estudios');
    act(() => tus.querySelector<HTMLElement>('[role="radio"]')!.focus());
    act(() => (container.querySelector('[data-campo="email"] input') as HTMLInputElement).focus());
    expect(tus).toHaveAttribute('data-cerrada', 'true');

    // Un error en un campo de la sección (p. ej. lo devolvió el validador al continuar).
    formData = { ...formData, semester: { value: '8', error: 'Elige tu ciclo.' } };
    rerender(<DynamicWizardStep step={PASO2} showErrors camposTocados={NADA_TOCADO} />);
    expect(tus).toHaveAttribute('data-cerrada', 'false');
  });

  it('una sección no plegable solo agrupa: nunca se cierra', () => {
    formData = { situacion_actual: { value: 'estoy_estudiando' }, semester: { value: '8' } };
    const fijo = paso(PASO2.fields, { groups: [{ ...GRUPOS[1], is_collapsible: false }] });
    const { container } = pintarV2(fijo);
    const tus = seccion(container, 'tus_estudios');
    act(() => tus.querySelector<HTMLElement>('[role="radio"]')!.focus());
    act(() => (container.querySelector('[data-campo="email"] input') as HTMLInputElement).focus());
    expect(tus).toHaveAttribute('data-cerrada', 'false');
    expect(screen.queryByRole('button', { name: /Editar/ })).not.toBeInTheDocument();
  });
});

describe('"Otra (escríbela)" pegado al select', () => {
  it('el campo condicional sale justo debajo de su lista, más junto y dentro de su sección', () => {
    formData = { semester: { value: 'otro' } };
    // El texto viene al final del paso y sin sección: igual va con su lista.
    const { container } = pintarV2(paso([CICLO, MONTO, OTRO_CICLO], { groups: [GRUPOS[1], GRUPOS[0]] }));
    expect(ordenDeCampos(container)).toEqual(['semester', 'other_semester', 'tuition_amount']);
    const otro = container.querySelector<HTMLElement>('[data-campo="other_semester"]')!;
    expect(otro).toHaveAttribute('data-pegado-a', 'semester');
    expect(otro.className).toContain('-mt-3');
    expect(otro.closest('[data-seccion]')).toHaveAttribute('data-seccion', 'tus_estudios');
    // Siguiente hermano directo del select.
    expect(container.querySelector('[data-campo="semester"]')?.nextElementSibling).toBe(otro);
  });

  it('también sin groups, y en Diseño 1 no cambia nada', () => {
    formData = { semester: { value: 'otro' } };
    const v2 = pintarV2(paso([CICLO, MONTO, OTRO_CICLO]));
    expect(ordenDeCampos(v2.container)).toEqual(['semester', 'other_semester', 'tuition_amount']);
    v2.unmount();
    const v1 = pintarV1(paso([CICLO, MONTO, OTRO_CICLO]));
    expect(v1.container.querySelector('[data-pegado-a]')).toBeNull();
    expect(v1.container.innerHTML).not.toContain('-mt-3');
  });
});

describe('Tarjetas de opción (RadioGroup) en Diseño 2', () => {
  it('radiogroup con radios, aria-checked y sin <input type="radio"> anidado', () => {
    formData = { tuition_payer: { value: 'pago_la_mitad' } };
    const { container } = pintarV2(paso([PAGO]));
    const grupo = screen.getByRole('radiogroup', { name: '¿Cómo pagas tu mensualidad?' });
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(4);
    expect(grupo).toContainElement(radios[0]);
    expect(radios[1]).toHaveAttribute('aria-checked', 'true');
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
    expect(container.querySelector('button input[type="radio"]')).toBeNull();
    // Roving tabindex: solo el elegido entra con Tab.
    expect(radios.map((r) => r.getAttribute('tabindex'))).toEqual(['-1', '0', '-1', '-1']);
  });

  it('sin nada elegido, Tab entra por la primera', () => {
    pintarV2(paso([PAGO]));
    expect(screen.getAllByRole('radio').map((r) => r.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', '-1']);
  });

  it('las flechas mueven el foco y eligen la vecina (y envuelven)', () => {
    const onChange = jest.fn();
    const opciones = PAGO.options.map((o) => ({ value: o.value, label: o.label }));
    render(
      <CamposV2Provider>
        <RadioGroup id="tuition_payer" label="Pago" value="lo_pago_yo" onChange={onChange} options={opciones} />
      </CamposV2Provider>,
    );
    const radios = screen.getAllByRole('radio');
    fireEvent.keyDown(radios[0], { key: 'ArrowDown' });
    expect(onChange).toHaveBeenLastCalledWith('pago_la_mitad');
    expect(radios[1]).toHaveFocus();
    fireEvent.keyDown(radios[0], { key: 'ArrowUp' });
    expect(onChange).toHaveBeenLastCalledWith('otra');
    expect(radios[3]).toHaveFocus();
  });

  it('Diseño 1: el mismo DOM de antes (botones con el input radio sr-only, sin roles)', () => {
    formData = { tuition_payer: { value: 'pago_la_mitad' } };
    const { container } = pintarV1(paso([PAGO]));
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: 'Lo pago yo' })).toBeNull();
    const inputs = container.querySelectorAll('button > input[type="radio"].sr-only');
    expect(inputs).toHaveLength(4);
    expect(screen.getByText('Seleccionado')).toBeInTheDocument();
  });
});

describe('Buscador en Diseño 2', () => {
  const INSTITUCIONES = [
    { value: '1', label: 'Universidad del Pacífico' },
    { value: '2', label: 'Universidad de Lima' },
    { value: '3', label: 'Universidad de Piura' },
    { value: '4', label: 'Universidad de San Martín' },
    { value: '5', label: 'Universidad de Ingeniería' },
    { value: '6', label: 'Universidad de Ciencias' },
    { value: '7', label: 'Universidad de Arte' },
  ];
  const abrir = () => fireEvent.click(screen.getByRole('button', { name: /Busca/ }));
  const buscador = () => screen.getByPlaceholderText(/Buscar|Escribe/) as HTMLInputElement;
  const opcionesVisibles = () =>
    Array.from(document.querySelectorAll('[role="listbox"] button')).map((b) => b.textContent);

  it('sin tildes ni mayúsculas, y como máximo 5 visibles', () => {
    render(
      <CamposV2Provider>
        <SelectInput id="institution" label="Institución" value="" onChange={jest.fn()} options={INSTITUCIONES} placeholder="Busca tu institución" />
      </CamposV2Provider>,
    );
    abrir();
    fireEvent.change(buscador(), { target: { value: 'PACIFICO' } });
    expect(opcionesVisibles()).toEqual(['Universidad del Pacífico']);
    fireEvent.change(buscador(), { target: { value: 'univ' } });
    expect(opcionesVisibles()).toHaveLength(5);
  });

  it('al salir con una sola coincidencia, se elige sola (guarda el id)', () => {
    const onChange = jest.fn();
    render(
      <CamposV2Provider>
        <SelectInput id="institution" label="Institución" value="" onChange={onChange} options={INSTITUCIONES} placeholder="Busca tu institución" />
        <input aria-label="siguiente" />
      </CamposV2Provider>,
    );
    abrir();
    fireEvent.change(buscador(), { target: { value: 'pacif' } });
    fireEvent.blur(buscador(), { relatedTarget: screen.getByLabelText('siguiente') });
    expect(onChange).toHaveBeenCalledWith('1', 'Universidad del Pacífico');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('también al salir con Tab desde la opción (no solo desde el buscador)', () => {
    const onChange = jest.fn();
    render(
      <CamposV2Provider>
        <SelectInput id="institution" label="Institución" value="" onChange={onChange} options={INSTITUCIONES} placeholder="Busca tu institución" />
        <input aria-label="siguiente" />
      </CamposV2Provider>,
    );
    abrir();
    fireEvent.change(buscador(), { target: { value: 'pacifico' } });
    const opcion = screen.getByRole('button', { name: 'Universidad del Pacífico' });
    // Tab del buscador a la opción: sigue dentro, no elige ni cierra.
    fireEvent.blur(buscador(), { relatedTarget: opcion });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.blur(opcion, { relatedTarget: screen.getByLabelText('siguiente') });
    expect(onChange).toHaveBeenCalledWith('1', 'Universidad del Pacífico');
  });

  it('con varias coincidencias no elige; con menos de 3 letras tampoco', () => {
    const onChange = jest.fn();
    render(
      <CamposV2Provider>
        <SelectInput id="institution" label="Institución" value="" onChange={onChange} options={INSTITUCIONES} placeholder="Busca tu institución" />
      </CamposV2Provider>,
    );
    abrir();
    fireEvent.change(buscador(), { target: { value: 'univ' } });
    fireEvent.blur(buscador(), { relatedTarget: document.body });
    abrir();
    fireEvent.change(buscador(), { target: { value: 'pa' } });
    fireEvent.blur(buscador(), { relatedTarget: document.body });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('búsqueda remota: desde 3 letras, máx. 5, y si sale antes de que lleguen los resultados elige cuando llegan', () => {
    const onChange = jest.fn();
    const onSearch = jest.fn();
    const Buscador = ({ options, isSearching }: { options: typeof INSTITUCIONES; isSearching: boolean }) => (
      <CamposV2Provider>
        <SelectInput
          id="institution"
          label="Institución"
          value=""
          onChange={onChange}
          options={options}
          placeholder="Busca tu institución"
          onSearch={onSearch}
          isSearching={isSearching}
          minSearchLength={3}
        />
      </CamposV2Provider>
    );
    const { rerender } = render(<Buscador options={[]} isSearching={false} />);
    abrir();
    fireEvent.change(buscador(), { target: { value: 'pa' } });
    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByText(/al menos 3/)).toBeInTheDocument();

    fireEvent.change(buscador(), { target: { value: 'univ' } });
    expect(onSearch).toHaveBeenLastCalledWith('univ');
    rerender(<Buscador options={[]} isSearching />);
    rerender(<Buscador options={INSTITUCIONES} isSearching={false} />);
    expect(opcionesVisibles()).toHaveLength(5);

    // Escribe más y sale antes de la respuesta: decide cuando llega.
    fireEvent.change(buscador(), { target: { value: 'pacifico' } });
    fireEvent.blur(buscador(), { relatedTarget: document.body });
    expect(onChange).not.toHaveBeenCalled();
    rerender(<Buscador options={INSTITUCIONES} isSearching />);
    rerender(<Buscador options={[INSTITUCIONES[0]]} isSearching={false} />);
    expect(onChange).toHaveBeenCalledWith('1', 'Universidad del Pacífico');
  });

  it('Diseño 1: sin el límite de 5 ni la elección sola', () => {
    const onChange = jest.fn();
    render(<SelectInput id="institution" label="Institución" value="" onChange={onChange} options={INSTITUCIONES} placeholder="Busca tu institución" />);
    fireEvent.click(screen.getByText('Busca tu institución'));
    fireEvent.change(buscador(), { target: { value: 'univ' } });
    expect(opcionesVisibles()).toHaveLength(7);
    fireEvent.change(buscador(), { target: { value: 'pacífico' } });
    fireEvent.blur(buscador());
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('Pista y error local (pendiente de F2)', () => {
  const DIRECCION = { ...campo({ id: 20, code: 'address', label: 'Dirección', type: 'address' }), hint: 'Calle, número y distrito.' } as WizardField;

  it('en DynamicWizardStep la pista desaparece cuando el campo tiene un error local (dirección)', () => {
    const tocado = new Set(['address']);
    const sinError = render(<DynamicWizardStep step={paso([DIRECCION])} camposTocados={tocado} />);
    expect(sinError.container.querySelector('[data-pista="address"]')).not.toBeNull();
    sinError.unmount();

    mockGoogle.mockReturnValue({ isLoaded: false, isLoading: false, error: 'No se pudo cargar Google Maps' });
    const conError = render(<DynamicWizardStep step={paso([DIRECCION])} camposTocados={tocado} />);
    expect(conError.container.querySelector('[data-pista="address"]')).toBeNull();
    expect(conError.container.querySelector('[data-campo="address"]')).toHaveAttribute('data-estado', 'error');
  });
});

describe('Diseño 1: el Paso 2 no cambia', () => {
  it('con groups da el mismo DOM que sin groups (sin secciones ni data-campo)', () => {
    formData = { semester: { value: 'otro' }, situacion_actual: { value: 'estoy_estudiando' } };
    const sinGrupos = paso([CORREO, SITUACION, CICLO, OTRO_CICLO, MONTO, PAGO]);
    const antes = pintarV1(sinGrupos).container.innerHTML;
    const despues = pintarV1(PASO2).container.innerHTML;
    expect(despues).toBe(antes);
    expect(despues).not.toContain('data-seccion');
    expect(despues).not.toContain('data-campo');
  });
});
