/// <reference types="jest" />
/**
 * BAL-4026 — El campo del familiar al cambiar la fuente de ingreso.
 *
 * Pasos del reporte:
 *   1. Fuente de ingreso = "Me apoya un familiar directo"
 *   2. Cambiar el DNI del familiar -> se abre "Nombres y Apellidos"
 *   3. Cambiar la fuente a "Sueldo de trabajo"
 *   4. El campo "Nombres y Apellidos" SEGUIA AHI
 *
 * `supporter_full_name` es el unico campo del wizard que es a la vez destino de
 * un prellenado por documento Y tiene una regla `show`. Las tres pantallas que
 * calculan visibilidad (el paso, `validateStep` y el resumen) miraban solo el
 * estado del lookup y devolvian temprano, asi que su regla
 * `show: income_source in ["apoyo_familiar"]` nunca se evaluaba.
 *
 * Este archivo fija las dos mitades del sintoma: el campo desaparece de la
 * pantalla Y su valor sale del estado del formulario. La segunda importa igual
 * que la primera: `mapFormData` manda al backend toda clave con valor, asi que
 * un nombre que se queda viaja en el submit y se guarda un familiar en una
 * solicitud que declaro sueldo de trabajo.
 */
import React from 'react';
import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { WizardField, WizardStep } from '../../../../../../services/wizardApi';

// ---------------------------------------------------------------------------
// Estado del formulario: es un store de verdad, no un mock inerte. El test
// tiene que poder leer que quedo dentro despues de cambiar la fuente.
// ---------------------------------------------------------------------------
type Valor = string | string[];
let formData: Record<string, { value: Valor; error?: string | null }> = {};

const updateField = jest.fn((fieldId: string, value: Valor) => {
  formData = { ...formData, [fieldId]: { ...formData[fieldId], value } };
});

jest.mock('../../../../context/WizardContext', () => ({
  useWizard: () => ({
    formData,
    updateField,
    getFieldValue: (code: string) => formData[code]?.value ?? '',
    getFieldError: () => undefined,
    getFieldLabel: () => undefined,
    isFieldTouched: () => false,
    setFieldError: jest.fn(),
    setDynamicOptions: jest.fn(),
    getDynamicOptions: () => [],
  }),
  FILE_PENDING_REUPLOAD: '__FILE_PENDING_REUPLOAD__',
}));

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({ deferredPayment: null, agreementData: null, landing: 'copia-home' }),
}));

jest.mock('../../../../hooks/useFieldTracking', () => ({
  useFieldTracking: () => ({ onFieldFocus: jest.fn(), onFieldBlur: jest.fn() }),
}));

jest.mock('../../../../../calculadora/utils/useDatosMatricula', () => ({
  useDatosMatricula: () => null,
}));

import { DynamicWizardStep } from '../DynamicWizardStep';

// ---------------------------------------------------------------------------
// El paso "Datos economicos" tal como lo entrega
// GET /public/landing/copia-home/wizard (verificado contra produccion).
// ---------------------------------------------------------------------------
function campo(overrides: Partial<WizardField>): WizardField {
  return {
    id: 1,
    code: 'x',
    label: 'X',
    type: 'text',
    placeholder: null,
    help_text: null,
    required: false,
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

const SOLO_SI_FAMILIAR = [
  {
    action: 'show' as const,
    logic: 'and' as const,
    conditions: [
      { depends_on_field: 'income_source', operator: 'in' as const, value: ['apoyo_familiar'] },
    ],
  },
];

const paso: WizardStep = {
  id: 3,
  code: 'financial',
  url_slug: 'datos-economicos',
  name: 'Datos económicos',
  title: 'Datos económicos',
  description: '',
  icon: '',
  order: 3,
  required: true,
  skippable: false,
  estimated_time_minutes: 2,
  is_summary_step: false,
  motivational: null,
  fields: [
    campo({
      id: 10,
      code: 'income_source',
      label: 'Fuente de ingreso',
      type: 'radio',
      options: [
        { value: 'sueldo_trabajo', label: 'Sueldo de trabajo' },
        { value: 'negocio_personal', label: 'Negocio personal' },
        { value: 'apoyo_familiar', label: 'Me apoya un familiar directo' },
      ],
    }),
    campo({
      id: 11,
      code: 'supporter_document_number',
      label: 'Número de documento de familiar',
      type: 'document_number',
      hidden: true,
      dependency_groups: SOLO_SI_FAMILIAR,
      prefill_config: {
        prefill_fields: { supporter_full_name: ['first_name', 'paternal_surname', 'maternal_surname'] },
        document_type_field: 'supporter_document_type',
      },
    } as Partial<WizardField>),
    campo({
      id: 12,
      code: 'supporter_full_name',
      label: 'Nombres y Apellidos',
      type: 'text',
      hidden: true,
      dependency_groups: SOLO_SI_FAMILIAR,
    }),
  ],
};

function pintar() {
  return render(<DynamicWizardStep step={paso} />);
}

/**
 * El input de "Nombres y Apellidos". `DynamicField` le pone como `id` el codigo
 * del campo, pero el `<label>` no lo referencia con `for`, asi que
 * `getByLabelText` no lo encuentra: se busca por el id.
 */
function campoNombresYApellidos(c: HTMLElement) {
  return c.querySelector('#supporter_full_name');
}

beforeEach(() => {
  updateField.mockClear();
  formData = {};
});

describe('BAL-4026 — pasos exactos del reporte', () => {
  it('al volver a "Sueldo de trabajo" el campo "Nombres y Apellidos" no esta Y su valor no esta en el estado del formulario', () => {
    // 1. Fuente de ingreso = "Me apoya un familiar directo"
    formData = { income_source: { value: 'apoyo_familiar' } };
    const { rerender, container } = pintar();

    // 2. Cambiar el DNI del familiar: el lookup no encuentra a la persona y
    //    destapa "Nombres y Apellidos" para que lo escriban a mano.
    act(() => {
      formData = {
        ...formData,
        supporter_document_type: { value: 'dni' },
        supporter_document_number: { value: '74391469' },
        _prefill_status_supporter_document_number: { value: 'not_found' },
        supporter_full_name: { value: 'JUAN PEREZ GOMEZ' },
      };
    });
    rerender(<DynamicWizardStep step={paso} />);

    // El campo esta abierto: es el estado del que parte el reporte.
    expect(campoNombresYApellidos(container)).toBeInTheDocument();

    // 3. Cambiar la fuente de ingreso a "Sueldo de trabajo"
    act(() => {
      formData = { ...formData, income_source: { value: 'sueldo_trabajo' } };
    });
    rerender(<DynamicWizardStep step={paso} />);

    // 4a. El sintoma visible: el campo ya no esta en pantalla.
    expect(campoNombresYApellidos(container)).not.toBeInTheDocument();

    // 4b. El sintoma invisible: el valor tampoco quedo en el estado. Si queda,
    //     `mapFormData` lo manda igual y se guarda el nombre de un familiar en
    //     una solicitud que declaro sueldo de trabajo.
    rerender(<DynamicWizardStep step={paso} />);
    expect(updateField).toHaveBeenCalledWith('supporter_full_name', '');
    expect(formData['supporter_full_name']?.value).toBe('');
  });

  it('mientras la fuente siga siendo "familiar", el campo se mantiene con lo escrito', () => {
    formData = {
      income_source: { value: 'apoyo_familiar' },
      supporter_document_type: { value: 'dni' },
      supporter_document_number: { value: '74391469' },
      _prefill_status_supporter_document_number: { value: 'not_found' },
      supporter_full_name: { value: 'JUAN PEREZ GOMEZ' },
    };
    const { rerender, container } = pintar();
    rerender(<DynamicWizardStep step={paso} />);

    expect(campoNombresYApellidos(container)).toBeInTheDocument();
    expect(updateField).not.toHaveBeenCalledWith('supporter_full_name', '');
    expect(formData['supporter_full_name']?.value).toBe('JUAN PEREZ GOMEZ');
  });
});
