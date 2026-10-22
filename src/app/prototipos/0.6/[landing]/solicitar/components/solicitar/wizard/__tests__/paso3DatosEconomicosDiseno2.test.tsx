/// <reference types="jest" />
/**
 * BAL-4965 (F6) — Paso 3 · Datos económicos en Diseño 2.
 *
 * Nada acá es nuevo en el kit: F6 reutiliza `SeccionPlegable` (F5) y los
 * campos de F2, y este archivo COMPRUEBA que ya cubren el Paso 3 — igual que
 * `paso2DatosAcademicosDiseno2.test.tsx` lo hizo para el Paso 2.
 *
 * Los campos de "Tus ingresos" copian el código y las opciones reales de la
 * BD local (`GET /public/landing/pago-diferido/wizard`, paso `financial`,
 * verificado 2026-10-22): `income_source`, `employer_name`, `has_ruc`,
 * `business_sector`, `income_receive_method_no_proof`, `monthly_income`,
 * `work_verification_consent`, `supporter_*`. `ruc_number` copia el campo del
 * banco (id 102, sin usar en ningún paso): mismo tipo `text` y la misma
 * validación `ruc` con los prefijos 10/15/17/20.
 *
 * Tres piezas NO existen todavía en la BD local y se agregan sintéticas, con
 * la nota de qué falta para F9:
 * - `income_source` con "Beca" y "Otro" (hoy solo tiene 3 opciones);
 * - una opción "Otra" en `income_receive_method_no_proof` con su campo pegado;
 * - `housing_type`/`rent_amount`: existen, pero asignados al Paso 1
 *   (`personal_data`), no al Paso 3 — moverlos afecta también a Diseño 1 (el
 *   mismo `form_version` sirve a `home`), así que se prueban acá sueltas del
 *   Paso 3 real, solo para comprobar que el mecanismo de "Tu vivienda"
 *   funciona en cuanto el backend las asigne ahí.
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
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

import { DynamicWizardStep } from '../DynamicWizardStep';

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
    id: 3,
    code: 'financial',
    url_slug: 'datos-economicos',
    name: 'Datos económicos',
    title: 'Datos Económicos',
    description: '',
    icon: '',
    order: 3,
    required: true,
    skippable: false,
    estimated_time_minutes: 2,
    is_summary_step: false,
    motivational: null,
    fields,
    ...extra,
  };
}

const muestraSi = (campoDep: string, valores: string[]) => [
  { action: 'show' as const, logic: 'and' as const, conditions: [{ depends_on_field: campoDep, operator: 'in' as const, value: valores }] },
];
const muestraSiIgual = (campoDep: string, valor: string) => [
  { action: 'show' as const, logic: 'and' as const, conditions: [{ depends_on_field: campoDep, operator: 'equals' as const, value: valor }] },
];

// ---------------------------------------------------------------------------
// Campos: código y opciones reales de la BD local (financial, 2026-10-22),
// más las tres piezas sintéticas documentadas arriba.
// ---------------------------------------------------------------------------
const INCOME_SOURCE = campo({
  id: 18,
  code: 'income_source',
  label: 'Fuente de ingreso',
  type: 'select',
  options: [
    { value: 'sueldo_trabajo', label: 'Sueldo de Trabajo' },
    { value: 'negocio_personal', label: 'Negocio Personal' },
    { value: 'apoyo_familiar', label: 'Me apoya un familiar directo' },
    // Sintéticas (D9 / contenido para F9): la BD local todavía no las tiene.
    { value: 'beca', label: 'Beca' },
    { value: 'otro', label: 'Otro' },
  ],
} as Partial<WizardField>);

const EMPLOYER_NAME = campo({
  id: 19, code: 'employer_name', label: 'Empleador', type: 'text',
  hidden: true, dependency_groups: muestraSi('income_source', ['sueldo_trabajo']),
});
const HAS_RUC = campo({
  id: 23, code: 'has_ruc', label: '¿Tienes RUC?', type: 'select',
  options: [{ value: 'si', label: 'Sí' }, { value: 'no', label: 'No' }],
  hidden: true, dependency_groups: muestraSi('income_source', ['negocio_personal']),
} as Partial<WizardField>);
const BUSINESS_SECTOR = campo({
  id: 24, code: 'business_sector', label: 'Rubro', type: 'text',
  hidden: true, dependency_groups: muestraSi('income_source', ['negocio_personal']),
});
// Copia del campo del banco (id 102, "sin_uso"): mismo tipo y validación.
const RUC_NUMBER = campo({
  id: 102, code: 'ruc_number', label: 'Número de RUC', type: 'text', required: false,
  placeholder: 'Ej.: 10458374283', max_length: 11,
  validations: [{ type: 'ruc', value: '10,15,17,20', message: 'Ingresa un RUC válido: 11 dígitos que empiecen en 10, 15, 17 o 20' }],
  hidden: true, dependency_groups: muestraSiIgual('has_ruc', 'si'),
} as Partial<WizardField>);
const INCOME_RECEIVE_METHOD = campo({
  id: 62, code: 'income_receive_method_no_proof', label: '¿Cómo recibes tus ingresos?', type: 'select',
  options: [
    { value: 'deposito_cuenta', label: 'Transferencia' },
    { value: 'yape_plin', label: 'Yape/Plin' },
    { value: 'efectivo', label: 'Efectivo' },
    // Sintética (D9): la lista real todavía no tiene "Otra".
    { value: 'otra', label: 'Otra (escríbela)' },
  ],
  hidden: true, dependency_groups: muestraSi('income_source', ['sueldo_trabajo', 'negocio_personal']),
} as Partial<WizardField>);
// Sintética: el "Otra (escríbela)" pegado a la lista de arriba.
const INCOME_RECEIVE_METHOD_OTHER = campo({
  id: 900, code: 'income_receive_method_other', label: '¿Cómo recibes tus ingresos?', type: 'text',
  hidden: true, dependency_groups: muestraSiIgual('income_receive_method_no_proof', 'otra'),
});
const MONTHLY_INCOME = campo({
  id: 51, code: 'monthly_income', label: 'Ingreso Mensual Aproximado', type: 'currency', prefix: 'S/',
  hidden: true, dependency_groups: muestraSi('income_source', ['sueldo_trabajo', 'negocio_personal']),
});
const WORK_VERIFICATION_CONSENT = campo({
  id: 25, code: 'work_verification_consent', label: 'Autorizo a BaldeCash a verificar la información de mis ingresos', type: 'checkbox',
  hidden: true, dependency_groups: muestraSi('income_source', ['negocio_personal']),
});
const SUPPORTER_RELATIONSHIP = campo({
  id: 26, code: 'supporter_relationship', label: 'Vínculo', type: 'select',
  options: [{ value: 'padre', label: 'Padre' }, { value: 'madre', label: 'Madre' }],
  hidden: true, dependency_groups: muestraSi('income_source', ['apoyo_familiar']),
} as Partial<WizardField>);
const SUPPORTER_DOCUMENT_NUMBER = campo({
  id: 28, code: 'supporter_document_number', label: 'Número de documento de familiar', type: 'document_number',
  hidden: true, dependency_groups: muestraSi('income_source', ['apoyo_familiar']),
});
const SUPPORTER_FULL_NAME = campo({
  id: 29, code: 'supporter_full_name', label: 'Nombres y Apellidos', type: 'text',
  hidden: true, dependency_groups: muestraSi('income_source', ['apoyo_familiar']),
});
const SUPPORTER_PHONE = campo({
  id: 30, code: 'supporter_phone', label: 'Celular', type: 'phone', prefix: '+51',
  hidden: true, dependency_groups: muestraSi('income_source', ['apoyo_familiar']),
  validations: [{ type: 'phone' }],
} as Partial<WizardField>);
// Sintéticas (D9): "Beca" y "Otro" no existen hoy como tipo de ingreso.
const SCHOLARSHIP_AMOUNT = campo({
  id: 901, code: 'scholarship_amount', label: 'Monto de tu beca', type: 'currency', prefix: 'S/',
  hidden: true, dependency_groups: muestraSi('income_source', ['beca']),
});
const OTHER_INCOME_DESCRIPTION = campo({
  id: 902, code: 'other_income_description', label: '¿Cuál es tu otra fuente de ingreso?', type: 'text',
  help_text: { title: 'Ingreso', description: 'Si no recibes ingresos, pon 0.' },
  hidden: true, dependency_groups: muestraSi('income_source', ['otro']),
});
const OTHER_INCOME_AMOUNT = campo({
  id: 903, code: 'other_income_amount', label: 'Ingreso mensual aproximado', type: 'currency', prefix: 'S/',
  hidden: true, dependency_groups: muestraSi('income_source', ['otro']),
});

// "Tu vivienda": campos reales (banco), hoy asignados al Paso 1.
const HOUSING_TYPE = campo({
  id: 7, code: 'housing_type', label: 'Tipo de Vivienda', type: 'select',
  options: [
    { value: 'alquilado_propio', label: 'Cuarto/departamento alquilado (pagado por mí)' },
    { value: 'alquilado_familiar', label: 'Cuarto/departamento alquilado (pagado por familiar)' },
    { value: 'vivienda_propia', label: 'Vivienda familiar / propia' },
    { value: 'residencia_estudiantil', label: 'Residencia estudiantil' },
  ],
} as Partial<WizardField>);
const RENT_AMOUNT = campo({
  id: 8, code: 'rent_amount', label: 'Monto de Alquiler', type: 'currency', prefix: 'S/',
  hidden: true, dependency_groups: muestraSi('housing_type', ['alquilado_propio', 'alquilado_familiar']),
});

const CAMPOS_INGRESOS = [
  INCOME_SOURCE, EMPLOYER_NAME, HAS_RUC, BUSINESS_SECTOR, RUC_NUMBER,
  INCOME_RECEIVE_METHOD, INCOME_RECEIVE_METHOD_OTHER, MONTHLY_INCOME, WORK_VERIFICATION_CONSENT,
  SUPPORTER_RELATIONSHIP, SUPPORTER_DOCUMENT_NUMBER, SUPPORTER_FULL_NAME, SUPPORTER_PHONE,
  SCHOLARSHIP_AMOUNT, OTHER_INCOME_DESCRIPTION, OTHER_INCOME_AMOUNT,
];
const CAMPOS_VIVIENDA = [HOUSING_TYPE, RENT_AMOUNT];

const GRUPOS = [
  { code: 'tus_ingresos', name: 'Tus ingresos', order: 1, is_collapsible: true, field_codes: CAMPOS_INGRESOS.map((f) => f.code) },
  { code: 'tu_vivienda', name: 'Tu vivienda', order: 2, is_collapsible: true, field_codes: CAMPOS_VIVIENDA.map((f) => f.code) },
];
const PASO3 = paso([...CAMPOS_INGRESOS, ...CAMPOS_VIVIENDA], { groups: GRUPOS });

const NADA_TOCADO = new Set<string>();
const pintarV2 = (step: WizardStep, showErrors = false, tocados = NADA_TOCADO) =>
  render(<DynamicWizardStep step={step} showErrors={showErrors} camposTocados={tocados} />);
const pintarV1 = (step: WizardStep, showErrors = false) =>
  render(<DynamicWizardStep step={step} showErrors={showErrors} />);

const seccion = (c: HTMLElement, codigo: string) => c.querySelector(`[data-seccion="${codigo}"]`) as HTMLElement;
const campoEn = (c: HTMLElement, codigo: string) => c.querySelector<HTMLElement>(`[data-campo="${codigo}"]`);

beforeEach(() => {
  updateField.mockClear();
  formData = {};
  window.scrollBy = jest.fn();
});

describe('Secciones del Paso 3 (groups)', () => {
  it('"Tus ingresos" y "Tu vivienda" salen en su orden, como en el prototipo', () => {
    const { container } = pintarV2(PASO3);
    const secciones = Array.from(container.querySelectorAll<HTMLElement>('[data-seccion]')).map((s) => s.dataset.seccion);
    expect(secciones).toEqual(['tus_ingresos', 'tu_vivienda']);
    expect(screen.getByRole('heading', { name: 'Tus ingresos' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tu vivienda' })).toBeInTheDocument();
  });
});

describe('Cada tipo de ingreso muestra sus campos y limpia los del anterior', () => {
  const CASOS: Array<{ tipo: string; visibles: string[] }> = [
    { tipo: 'sueldo_trabajo', visibles: ['employer_name', 'income_receive_method_no_proof', 'monthly_income'] },
    { tipo: 'negocio_personal', visibles: ['has_ruc', 'business_sector', 'income_receive_method_no_proof', 'monthly_income', 'work_verification_consent'] },
    { tipo: 'apoyo_familiar', visibles: ['supporter_relationship', 'supporter_document_number', 'supporter_full_name', 'supporter_phone'] },
    { tipo: 'beca', visibles: ['scholarship_amount'] },
    { tipo: 'otro', visibles: ['other_income_description', 'other_income_amount'] },
  ];
  const TODOS_LOS_DEPENDIENTES = CAMPOS_INGRESOS.filter((f) => f.code !== 'income_source').map((f) => f.code);

  it.each(CASOS)('$tipo: solo sus campos están en pantalla', ({ tipo, visibles }) => {
    formData = { income_source: { value: tipo } };
    const { container } = pintarV2(PASO3);
    for (const codigo of visibles) expect(campoEn(container, codigo)).not.toBeNull();
    for (const codigo of TODOS_LOS_DEPENDIENTES) {
      if (!visibles.includes(codigo)) expect(campoEn(container, codigo)).toBeNull();
    }
  });

  it('al cambiar de "familiar" a "sueldo" se limpia lo que había llenado el familiar (BAL-4026, también en el Paso 3)', () => {
    formData = {
      income_source: { value: 'apoyo_familiar' },
      supporter_relationship: { value: 'madre' },
      supporter_full_name: { value: 'JUANA PEREZ' },
    };
    const { rerender, container } = pintarV2(PASO3);
    expect(campoEn(container, 'supporter_full_name')).not.toBeNull();

    formData = { ...formData, income_source: { value: 'sueldo_trabajo' } };
    rerender(<DynamicWizardStep step={PASO3} camposTocados={NADA_TOCADO} />);
    expect(campoEn(container, 'supporter_full_name')).toBeNull();
    rerender(<DynamicWizardStep step={PASO3} camposTocados={NADA_TOCADO} />);
    expect(updateField).toHaveBeenCalledWith('supporter_full_name', '');
    expect(formData['supporter_full_name']?.value).toBe('');
  });
});

describe('Casilla de autorización obligatoria: bloquea el cierre de la sección', () => {
  function llenarNegocioSinCasilla() {
    formData = {
      income_source: { value: 'negocio_personal' },
      has_ruc: { value: 'no' },
      business_sector: { value: 'Venta de ropa' },
      income_receive_method_no_proof: { value: 'efectivo' },
      monthly_income: { value: '1500' },
      work_verification_consent: { value: 'false' },
    };
  }

  it('sin marcar, la sección de ingresos no se cierra aunque todo lo demás esté lleno', async () => {
    llenarNegocioSinCasilla();
    const { container } = pintarV2(PASO3);
    const ingresos = seccion(container, 'tus_ingresos');
    act(() => campoEn(container, 'monthly_income')!.querySelector('input')!.focus());
    act(() => campoEn(container, 'housing_type')!.querySelector<HTMLElement>('button, input')!.focus());
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(ingresos).toHaveAttribute('data-cerrada', 'false');
  });

  it('marcada, con todo lo demás lleno, sí se cierra', async () => {
    llenarNegocioSinCasilla();
    formData.work_verification_consent = { value: 'true' };
    const { container } = pintarV2(PASO3);
    const ingresos = seccion(container, 'tus_ingresos');
    act(() => campoEn(container, 'monthly_income')!.querySelector('input')!.focus());
    act(() => campoEn(container, 'housing_type')!.querySelector<HTMLElement>('button, input')!.focus());
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(ingresos).toHaveAttribute('data-cerrada', 'true');
  });
});

describe('Resumen de "Tus ingresos" y "Tu vivienda"', () => {
  it('ingresos: monto como "S/ X", Sí/No con etiqueta corta; "Rubro" (texto condicional) reemplaza a "Negocio Personal", igual que una "Otra" (F5, decisión 5)', async () => {
    formData = {
      income_source: { value: 'negocio_personal' },
      has_ruc: { value: 'no' },
      business_sector: { value: 'Venta de ropa' },
      income_receive_method_no_proof: { value: 'efectivo' },
      monthly_income: { value: '1500' },
      work_verification_consent: { value: 'true' },
    };
    const { container } = pintarV2(PASO3);
    act(() => campoEn(container, 'monthly_income')!.querySelector('input')!.focus());
    act(() => campoEn(container, 'housing_type')!.querySelector<HTMLElement>('button, input')!.focus());
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(seccion(container, 'tus_ingresos')).toHaveAttribute('data-cerrada', 'true');
    // "Rubro" es un campo de texto condicional a UNA sola lista (income_source):
    // `camposPegados` (F5) lo trata igual que una "Otra (escríbela)" --queda
    // pegado a "Fuente de ingreso" y su texto reemplaza al de la opción elegida
    // ("Negocio Personal" no aparece). Ver la duda en el reporte.
    expect(screen.getByText('Rubro: Venta de ropa · RUC: No · Efectivo · S/ 1,500')).toBeInTheDocument();
  });

  it('vivienda alquilada: el monto se ve y entra en el resumen', async () => {
    formData = {
      income_source: { value: 'apoyo_familiar' },
      supporter_relationship: { value: 'madre' },
      supporter_document_number: { value: '' },
      supporter_full_name: { value: '' },
      supporter_phone: { value: '' },
      housing_type: { value: 'alquilado_propio' },
      rent_amount: { value: '800' },
    };
    const { container } = pintarV2(PASO3);
    expect(campoEn(container, 'rent_amount')).not.toBeNull();
    act(() => campoEn(container, 'rent_amount')!.querySelector('input')!.focus());
    act(() => campoEn(container, 'income_source')!.querySelector<HTMLElement>('button, input')!.focus());
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(seccion(container, 'tu_vivienda')).toHaveAttribute('data-cerrada', 'true');
    expect(screen.getByText('Cuarto/departamento alquilado (pagado por mí) · S/ 800')).toBeInTheDocument();
  });
});

describe('Vivienda alquilada: el monto aparece y se limpia (requisito 8)', () => {
  it('con "alquilado" el monto se ve; al cambiar a otra opción se oculta y se limpia', () => {
    formData = { housing_type: { value: 'alquilado_familiar' }, rent_amount: { value: '600' } };
    const { rerender, container } = pintarV2(paso(CAMPOS_VIVIENDA, { groups: [GRUPOS[1]] }));
    expect(campoEn(container, 'rent_amount')).not.toBeNull();

    formData = { ...formData, housing_type: { value: 'vivienda_propia' } };
    rerender(<DynamicWizardStep step={paso(CAMPOS_VIVIENDA, { groups: [GRUPOS[1]] })} camposTocados={NADA_TOCADO} />);
    expect(campoEn(container, 'rent_amount')).toBeNull();
    rerender(<DynamicWizardStep step={paso(CAMPOS_VIVIENDA, { groups: [GRUPOS[1]] })} camposTocados={NADA_TOCADO} />);
    expect(updateField).toHaveBeenCalledWith('rent_amount', '');
  });
});

describe('RUC (requisito 5): error con ErrorCampoV2, pista cuando no hay error', () => {
  it('con un valor inválido y showErrors, el error sale con role="alert" y el mensaje de la BD', () => {
    formData = { income_source: { value: 'negocio_personal' }, has_ruc: { value: 'si' }, ruc_number: { value: '12345678901', error: 'Ingresa un RUC válido: 11 dígitos que empiecen en 10, 15, 17 o 20' } };
    const { container } = pintarV2(PASO3, true, new Set(['ruc_number']));
    const error = campoEn(container, 'ruc_number')!.querySelector('[role="alert"]');
    expect(error).toHaveTextContent('Ingresa un RUC válido: 11 dígitos que empiecen en 10, 15, 17 o 20');
  });

  it('sin error, se ve la pista (placeholder) en vez del mensaje', () => {
    formData = { income_source: { value: 'negocio_personal' }, has_ruc: { value: 'si' } };
    const conHint = { ...RUC_NUMBER, hint: 'Ej.: 10458374283' } as WizardField;
    const { container } = pintarV2(paso([INCOME_SOURCE, HAS_RUC, conHint], { groups: [{ ...GRUPOS[0], field_codes: ['income_source', 'has_ruc', 'ruc_number'] }] }));
    expect(campoEn(container, 'ruc_number')!.querySelector('[role="alert"]')).toBeNull();
    expect(campoEn(container, 'ruc_number')!.querySelector('[data-pista="ruc_number"]')).toHaveTextContent('Ej.: 10458374283');
  });
});

describe('"Otra (escríbela)" pegada a "¿Cómo recibes tus ingresos?" (requisito 7)', () => {
  it('el campo condicional sale pegado a su select, dentro de "Tus ingresos"', () => {
    formData = { income_source: { value: 'sueldo_trabajo' }, income_receive_method_no_proof: { value: 'otra' } };
    const { container } = pintarV2(PASO3);
    const otra = campoEn(container, 'income_receive_method_other')!;
    expect(otra).toHaveAttribute('data-pegado-a', 'income_receive_method_no_proof');
    expect(otra.className).toContain('-mt-3');
    expect(otra.closest('[data-seccion]')).toHaveAttribute('data-seccion', 'tus_ingresos');
    expect(campoEn(container, 'income_receive_method_no_proof')?.nextElementSibling).toBe(otra);
  });
});

describe('Documento y celular del familiar (requisito 4)', () => {
  it('el documento conserva su propia etiqueta de la BD ("...de familiar"), no "Número de Documento"', () => {
    formData = { income_source: { value: 'apoyo_familiar' } };
    const { container } = pintarV2(PASO3);
    expect(campoEn(container, 'supporter_document_number')).toHaveTextContent('Número de documento de familiar');
  });

  it('el celular usa el texto genérico ("Ingresa el celular."), no el del titular', () => {
    formData = { income_source: { value: 'apoyo_familiar' }, supporter_phone: { value: '', error: 'Ingresa el celular.' } };
    const { container } = pintarV2(PASO3, true, new Set(['supporter_phone']));
    const error = campoEn(container, 'supporter_phone')!.querySelector('[role="alert"]');
    expect(error).toHaveTextContent('Ingresa el celular.');
    expect(error).not.toHaveTextContent('Ingresa tu celular');
  });
});

describe('Diseño 1: el Paso 3 no cambia', () => {
  it('con groups da el mismo DOM que sin groups (sin secciones ni data-campo)', () => {
    formData = { income_source: { value: 'sueldo_trabajo' } };
    const sinGrupos = paso([...CAMPOS_INGRESOS, ...CAMPOS_VIVIENDA]);
    const antes = pintarV1(sinGrupos).container.innerHTML;
    const despues = pintarV1(PASO3).container.innerHTML;
    expect(despues).toBe(antes);
    expect(despues).not.toContain('data-seccion');
    expect(despues).not.toContain('data-campo');
  });
});
