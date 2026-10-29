/// <reference types="jest" />
/**
 * BAL-5276 (punto 3): el resultado del documento y «¿No eres tú?» quedan
 * registrados, en los dos diseños y sin el número.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { WizardField } from '../../../../../../services/wizardApi';
import { resultadoDelCheck, type ResultadoDelCheck } from '../../../../hooks/useCheckPerson';

type Valor = string | string[];
let datos: Record<string, { value: Valor; error?: string | null }> = {};
let mockV2 = false;
const mockTrack = jest.fn();
let mockOnResultado: ((r: ResultadoDelCheck) => void) | undefined;

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
jest.mock('../../../../context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: mockTrack }),
}));
jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({ landing: 'pago-diferido', landingId: 170, overlayVariant: null }),
}));
jest.mock('../../../../hooks/useCheckPerson', () => ({
  ...jest.requireActual('../../../../hooks/useCheckPerson'),
  useCheckPerson: (opts: { onResultado?: (r: ResultadoDelCheck) => void }) => {
    mockOnResultado = opts.onResultado;
    return { check: jest.fn(), isChecking: false, response: null, reset: jest.fn() };
  },
}));
jest.mock('../../../../hooks/useCouponDocumentCheck', () => ({ useCouponDocumentCheck: () => undefined }));
jest.mock('../../../../hooks/useSpecialLinkDocumentCheck', () => ({
  useSpecialLinkDocumentCheck: () => ({ error: null, isChecking: false }),
}));
jest.mock('../../../../context/SessionContext', () => ({ useSessionOptional: () => null }));
jest.mock('../../coupon/CouponDocumentStatus', () => ({ CouponDocumentStatus: () => null }));
jest.mock('@/app/prototipos/0.6/components/diseno-2/campos/estilosV2', () => ({
  ...jest.requireActual('@/app/prototipos/0.6/components/diseno-2/campos/estilosV2'),
  useCamposV2: () => mockV2,
}));

import { DocumentNumberField } from '../DocumentNumberField';

const TITULAR = {
  id: 2, code: 'document_number', label: 'Número de Documento', type: 'document_number', placeholder: null,
  help_text: null, required: true, readonly: false, hidden: false, grid_columns: 12, grid_columns_mobile: 12,
  prefix: null, suffix: null, min_length: null, max_length: null, min_value: null, max_value: null,
  step: null, pattern: null, mask: null, input_mode: null, options_source: null, options_filter: null,
  options: [], validations: [], dependency_groups: [], max_files: null, default_value: null,
  prefill_config: { fields_to_fill: ['first_name'] },
} as unknown as WizardField;

const DNI = '70020010';

beforeEach(() => {
  mockTrack.mockClear();
  mockOnResultado = undefined;
  datos = { document_type: { value: 'dni' }, document_number: { value: DNI } };
  localStorage.clear();
});

describe('resultadoDelCheck', () => {
  it('traduce cada respuesta', () => {
    expect(resultadoDelCheck({ exists: true, prefill_data: { first_name: 'Ana' } as never }))
      .toEqual({ resultado: 'encontrado', prellenado: true });
    expect(resultadoDelCheck({ exists: false, prefill_data: null }))
      .toEqual({ resultado: 'no_encontrado', prellenado: false });
    expect(resultadoDelCheck({ exists: true, prefill_data: null, whitelist: { allowed: false } as never }))
      .toEqual({ resultado: 'bloqueado_lista', prellenado: false });
    expect(resultadoDelCheck(null)).toEqual({ resultado: 'error', prellenado: false });
  });
});

describe('DocumentNumberField · document_check_result', () => {
  it.each([[false, 1], [true, 2]])('v2=%s emite el resultado con su diseño y sin el número', (v2, diseno) => {
    mockV2 = v2;
    render(<DocumentNumberField field={TITULAR} />);
    mockOnResultado?.({ resultado: 'encontrado', prellenado: true });
    expect(mockTrack).toHaveBeenCalledWith('document_check_result', {
      resultado: 'encontrado',
      prellenado: true,
      field_code: 'document_number',
      tipo_documento: 'dni',
      diseno,
    });
    expect(JSON.stringify(mockTrack.mock.calls)).not.toContain(DNI);
  });
});

describe('DocumentNumberField · document_not_me_click (Diseño 2)', () => {
  it('tocar «¿No eres tú?» lo registra sin el número', () => {
    mockV2 = true;
    datos = {
      ...datos,
      _prefill_status_document_number: { value: 'found' },
      first_name: { value: 'ANA MARIA' },
    };
    render(<DocumentNumberField field={TITULAR} />);
    fireEvent.click(screen.getByRole('button', { name: /No soy yo/ }));
    expect(mockTrack).toHaveBeenCalledWith('document_not_me_click', {
      field_code: 'document_number',
      tipo_documento: 'dni',
      diseno: 2,
    });
    expect(JSON.stringify(mockTrack.mock.calls)).not.toContain(DNI);
  });
});
