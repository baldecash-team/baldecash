/// <reference types="jest" />
/**
 * BAL-5234 — el mensaje bajo el número de documento en Diseño 2.
 *
 * Monta el `DocumentNumberField` real con el error que da `validateField`
 * (el validador de siempre). Casos:
 * - DNI del familiar igual al del estudiante (8 dígitos, falla la regla
 *   `not_equals_field`) → el mensaje de la regla, no «Tu DNI tiene 8 números».
 * - DNI de 7 dígitos → «Tu DNI…» en el titular, «El DNI…» en un tercero.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { validateField, type WizardField } from '../../../../../../services/wizardApi';

type Valor = string | string[];
let datos: Record<string, { value: Valor; error?: string | null }> = {};

jest.mock('../../../../context/WizardContext', () => ({
  useWizard: () => ({
    formData: datos,
    updateField: jest.fn(),
    setFieldError: jest.fn(),
    getFieldValue: (code: string) => datos[code]?.value ?? '',
    getFieldError: (code: string) => datos[code]?.error ?? undefined,
    getFieldLabel: () => undefined,
    getAllDynamicOptions: () => ({}),
  }),
  FILE_PENDING_REUPLOAD: '__FILE_PENDING_REUPLOAD__',
}));
jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({ landing: 'pago-diferido', landingId: 170, overlayVariant: null }),
}));
jest.mock('../../../../hooks/useCheckPerson', () => ({
  useCheckPerson: () => ({ check: jest.fn(), isChecking: false, response: null, reset: jest.fn() }),
}));
jest.mock('../../../../hooks/useCouponDocumentCheck', () => ({ useCouponDocumentCheck: () => undefined }));
jest.mock('../../../../hooks/useSpecialLinkDocumentCheck', () => ({
  useSpecialLinkDocumentCheck: () => ({ error: null, isChecking: false }),
}));
jest.mock('../../../../context/SessionContext', () => ({ useSessionOptional: () => null }));
jest.mock('../../coupon/CouponDocumentStatus', () => ({ CouponDocumentStatus: () => null }));
jest.mock('@/app/prototipos/0.6/components/diseno-2/campos/estilosV2', () => ({
  ...jest.requireActual('@/app/prototipos/0.6/components/diseno-2/campos/estilosV2'),
  useCamposV2: () => true,
}));

import { DocumentNumberField } from '../DocumentNumberField';

const REGLA = 'El número de documento no puede ser el mismo que el del solicitante';

function campo(overrides: Partial<WizardField>): WizardField {
  return {
    id: 1, code: 'x', label: 'X', type: 'document_number', placeholder: null, help_text: null,
    required: true, readonly: false, hidden: false, grid_columns: 12, grid_columns_mobile: 12,
    prefix: null, suffix: null, min_length: null, max_length: null, min_value: null, max_value: null,
    step: null, pattern: null, mask: null, input_mode: null, options_source: null, options_filter: null,
    options: [], validations: [], dependency_groups: [], max_files: null, default_value: null,
    ...overrides,
  } as WizardField;
}

const TITULAR = campo({
  id: 2, code: 'document_number', label: 'Número de Documento',
  validations: [{ type: 'dni', value: null, message: 'El formato del documento no es válido' }],
} as Partial<WizardField>);

const FAMILIAR = campo({
  id: 30, code: 'supporter_document_number', label: 'DNI del familiar',
  prefill_config: { document_type_field: 'supporter_document_type' },
  validations: [
    { type: 'dni', value: null, message: 'El formato del documento no es válido' },
    { type: 'not_equals_field', value: 'document_number', message: REGLA },
  ],
} as Partial<WizardField>);

function pintar(field: WizardField, numero: string, valores: Record<string, string>) {
  const { error } = validateField(field, numero, valores);
  datos = Object.fromEntries(Object.entries(valores).map(([k, v]) => [k, { value: v }]));
  datos[field.code] = { value: numero, error };
  return { error, ...render(<DocumentNumberField field={field} showError />) };
}

beforeEach(() => {
  localStorage.clear();
});

describe('DocumentNumberField · mensaje en Diseño 2 (BAL-5234)', () => {
  it('DNI del familiar igual al del estudiante → el mensaje de la regla', () => {
    const { error } = pintar(FAMILIAR, '00000010', {
      document_type: 'dni', document_number: '00000010', supporter_document_type: 'dni',
    });
    expect(error).toBe(REGLA);
    expect(screen.getByRole('alert')).toHaveTextContent(REGLA);
    expect(screen.queryByText(/DNI tiene 8 números/)).not.toBeInTheDocument();
  });

  it('DNI del familiar de 7 dígitos → «El DNI tiene 8 números.»', () => {
    const { error } = pintar(FAMILIAR, '0000001', {
      document_type: 'dni', document_number: '00000010', supporter_document_type: 'dni',
    });
    expect(error).toBeTruthy();
    expect(screen.getByRole('alert')).toHaveTextContent('El DNI tiene 8 números.');
  });

  it('DNI del titular de 7 dígitos → «Tu DNI tiene 8 números.»', () => {
    const { error } = pintar(TITULAR, '0000001', { document_type: 'dni' });
    expect(error).toBeTruthy();
    expect(screen.getByRole('alert')).toHaveTextContent('Tu DNI tiene 8 números.');
  });
});
