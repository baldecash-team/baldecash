/// <reference types="jest" />
/**
 * BAL-5207 — Eventos de «Otro» escrito en el mismo campo (Diseño 2, BAL-5205).
 *
 * - `form_field_other_open`: la persona elige «Otr…» y la lista se vuelve caja.
 *   NO cuando la caja ya sale así al llegar al paso (recarga o vuelta con «Otro»).
 * - `form_field_other_back`: toca «Ver opciones».
 */
import React, { StrictMode } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

const mockTrack = jest.fn();
jest.mock('../../../../context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: mockTrack }),
}));

jest.mock('../../../../../calculadora/utils/useDatosMatricula', () => ({
  useDatosMatricula: () => null,
}));

jest.mock('../../../../hooks/useGooglePlacesAutocomplete', () => ({
  useGooglePlacesAutocomplete: () => ({ isLoaded: true, isLoading: false, error: null }),
}));

import { DynamicWizardStep } from '../DynamicWizardStep';

function campo(overrides: Partial<WizardField>): WizardField {
  return {
    id: 1, code: 'x', label: 'X', type: 'text', placeholder: null, help_text: null, required: true,
    readonly: false, hidden: false, grid_columns: 12, grid_columns_mobile: 12, prefix: null, suffix: null,
    min_length: null, max_length: null, min_value: null, max_value: null, step: null, pattern: null,
    mask: null, input_mode: null, options_source: null, options_filter: null, options: [], validations: [],
    dependency_groups: [], max_files: null, default_value: null,
    ...overrides,
  } as WizardField;
}

const CICLO = campo({
  id: 11,
  code: 'semester',
  label: 'Ciclo Actual',
  type: 'select',
  options: [{ value: '1', label: '1° Ciclo' }, { value: 'otro', label: 'Otro' }],
});
const OTRO_CICLO = campo({
  id: 12,
  code: 'other_semester',
  label: '¿Cuál ciclo?',
  hidden: true,
  dependency_groups: [{ action: 'show', logic: 'and', conditions: [{ depends_on_field: 'semester', operator: 'equals', value: 'otro' }] }],
});
const PASO2 = {
  id: 2, code: 'academic_data', url_slug: 'datos-academicos', name: 'Datos académicos', title: 'Datos Académicos',
  description: '', icon: '', order: 2, required: true, skippable: false, estimated_time_minutes: 1,
  is_summary_step: false, motivational: null, fields: [CICLO, OTRO_CICLO],
} as WizardStep;

const NADA = new Set<string>();
const pintar = () => <StrictMode><DynamicWizardStep step={PASO2} camposTocados={NADA} /></StrictMode>;
const PROPS = { field_code: 'semester', other_field_code: 'other_semester', step_code: 'academic_data', diseno: 2 };
const llamadas = (evento: string) => mockTrack.mock.calls.filter(([e]) => e === evento);

beforeEach(() => {
  mockTrack.mockClear();
  updateField.mockClear();
  formData = {};
});

it('elegir «Otro» emite form_field_other_open una sola vez, con la lista, su «¿Cuál…?» y el paso', () => {
  const { rerender } = render(pintar());
  expect(llamadas('form_field_other_open')).toHaveLength(0);
  formData = { semester: { value: 'otro', label: 'Otro' } };
  rerender(pintar());
  expect(screen.getByRole('textbox', { name: '¿Cuál ciclo?' })).toBeInTheDocument();
  expect(llamadas('form_field_other_open')).toEqual([['form_field_other_open', PROPS]]);
  // Escribir no vuelve a emitir.
  fireEvent.change(screen.getByRole('textbox', { name: '¿Cuál ciclo?' }), { target: { value: 'Décimo' } });
  rerender(pintar());
  expect(llamadas('form_field_other_open')).toHaveLength(1);
});

it('llegar al paso con «Otro» ya elegido (recarga) NO emite form_field_other_open', () => {
  formData = { semester: { value: 'otro' }, other_semester: { value: 'Décimo' } };
  render(pintar());
  expect(screen.getByRole('textbox', { name: '¿Cuál ciclo?' })).toBeInTheDocument();
  expect(llamadas('form_field_other_open')).toHaveLength(0);
});

it('«Ver opciones» emite form_field_other_back; volver a elegir «Otro» emite open de nuevo', () => {
  formData = { semester: { value: 'otro' }, other_semester: { value: 'Décimo' } };
  const { rerender } = render(pintar());
  fireEvent.click(screen.getByRole('button', { name: 'Ver opciones' }));
  expect(llamadas('form_field_other_back')).toEqual([['form_field_other_back', PROPS]]);
  rerender(pintar());
  expect(screen.queryByRole('textbox', { name: '¿Cuál ciclo?' })).toBeNull();
  formData = { semester: { value: 'otro', label: 'Otro' } };
  rerender(pintar());
  expect(llamadas('form_field_other_open')).toEqual([['form_field_other_open', PROPS]]);
});

it('Diseño 1 no emite nada de esto', () => {
  const { rerender } = render(<DynamicWizardStep step={PASO2} />);
  formData = { semester: { value: 'otro', label: 'Otro' } };
  rerender(<DynamicWizardStep step={PASO2} />);
  expect(llamadas('form_field_other_open')).toHaveLength(0);
  expect(llamadas('form_field_other_back')).toHaveLength(0);
});
