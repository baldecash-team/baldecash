/// <reference types="jest" />
/**
 * BAL-5285 — en el paso, los textos del familiar cambian con el vínculo
 * (`supporter_relationship`), en Diseño 1 y Diseño 2, y al cambiar el vínculo
 * el error ya visible se reescribe con el nombre nuevo.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { WizardField, WizardStep } from '../../../../../../services/wizardApi';

type Valor = string | string[];
let formData: Record<string, { value: Valor; error?: string | null; label?: string }> = {};

const setFieldError = jest.fn((code: string, error: string | null) => {
  formData = { ...formData, [code]: { ...formData[code], error } };
});

jest.mock('../../../../context/WizardContext', () => ({
  useWizard: () => ({
    formData,
    updateField: jest.fn(),
    getFieldValue: (code: string) => formData[code]?.value ?? '',
    getFieldError: (code: string) => formData[code]?.error ?? undefined,
    getFieldLabel: (code: string) => formData[code]?.label,
    isFieldTouched: () => false,
    setFieldError,
    setDynamicOptions: jest.fn(),
    getDynamicOptions: () => [],
    getAllDynamicOptions: () => ({}),
    registerDependency: jest.fn(),
    unregisterDependency: jest.fn(),
  }),
  FILE_PENDING_REUPLOAD: '__FILE_PENDING_REUPLOAD__',
}));

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({ deferredPayment: null, agreementData: null, landing: 'home' }),
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
    options: [],
    validations: [],
    dependency_groups: [],
    max_files: null,
    default_value: null,
    ...overrides,
  } as WizardField;
}

const VINCULO = campo({
  id: 26,
  code: 'supporter_relationship',
  label: 'Vínculo con tu familiar',
  type: 'select',
  options: [
    { value: 'padre', label: 'Padre' },
    { value: 'madre', label: 'Madre' },
    { value: 'hermano', label: 'Hermano(a)' },
    { value: 'abuelo', label: 'Abuelo(a)' },
  ],
});
const NOMBRE = campo({ id: 29, code: 'supporter_full_name', label: 'Nombres y apellidos {de_tu_familiar}', placeholder: 'Nombre completo {de_tu_familiar}' });
const CELULAR = campo({
  id: 30,
  code: 'supporter_phone',
  label: 'Celular {de_tu_familiar}',
  type: 'phone',
  hint: 'Lo usamos para contactar a {tu_familiar}.',
  validations: [{ type: 'not_equals_field', value: 'phone', message: 'Ese es tu celular. Escribe el celular {de_tu_familiar}.' }],
});
const SIN_MARCAS = campo({ id: 99, code: 'monthly_income', label: 'Ingreso mensual', hint: 'Aproximado' });

function paso(): WizardStep {
  return {
    id: 35,
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
    fields: [VINCULO, NOMBRE, CELULAR, SIN_MARCAS],
  } as WizardStep;
}

const disenos: Array<[string, ReadonlySet<string> | undefined]> = [
  ['Diseño 1', undefined],
  ['Diseño 2', new Set<string>()],
];

describe.each(disenos)('BAL-5285 textos según el vínculo — %s', (_n, camposTocados) => {
  beforeEach(() => {
    formData = {};
    setFieldError.mockClear();
  });

  const pintar = () => <DynamicWizardStep step={paso()} camposTocados={camposTocados} />;

  it.each([
    ['madre', 'de tu mamá', 'tu mamá'],
    ['padre', 'de tu papá', 'tu papá'],
    ['hermano', 'de tu hermano(a)', 'tu hermano(a)'],
    ['abuelo', 'de tu abuelo(a)', 'tu abuelo(a)'],
    ['', 'de tu familiar', 'tu familiar'],
  ])('vínculo %p', (vinculo, de, tu) => {
    formData = { supporter_relationship: { value: vinculo } };
    const { container } = render(pintar());
    expect(screen.getAllByText(`Celular ${de}`).length).toBeGreaterThan(0);
    expect(screen.getAllByText(`Nombres y apellidos ${de}`).length).toBeGreaterThan(0);
    expect(container.querySelector(`input[placeholder="Nombre completo ${de}"]`)).not.toBeNull();
    expect(screen.getByText(`Lo usamos para contactar a ${tu}.`)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\{(de_)?tu_familiar\}/);
    // Sin marcas, igual que hoy.
    expect(screen.getAllByText('Ingreso mensual').length).toBeGreaterThan(0);
    expect(screen.getByText('Aproximado')).toBeInTheDocument();
  });

  it('al cambiar el vínculo los textos y el error visible se actualizan', () => {
    formData = {
      phone: { value: '987654321' },
      supporter_relationship: { value: 'madre' },
      supporter_phone: { value: '987654321', error: 'Ese es tu celular. Escribe el celular de tu mamá.' },
    };
    const { rerender } = render(pintar());
    expect(screen.getAllByText('Celular de tu mamá').length).toBeGreaterThan(0);

    formData = { ...formData, supporter_relationship: { value: 'padre' } };
    rerender(pintar());
    expect(screen.getAllByText('Celular de tu papá').length).toBeGreaterThan(0);
    expect(screen.queryByText('Celular de tu mamá')).toBeNull();
    expect(setFieldError).toHaveBeenCalledWith('supporter_phone', 'Ese es tu celular. Escribe el celular de tu papá.');
  });
});
