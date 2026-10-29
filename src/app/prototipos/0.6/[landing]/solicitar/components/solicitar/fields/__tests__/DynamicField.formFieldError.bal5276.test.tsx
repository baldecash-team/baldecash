/**
 * BAL-5276 (pedido de Brenda): en Diseño 1 `form_field_error` registra los
 * errores AL SALIR del campo del familiar (BAL-5255) y los del «Continuar»,
 * con `momento`, `field_name`, `error_rule` y `error_message`. Nunca el valor.
 *
 * Mismo arnés que DynamicField.errorAlSalir.bal5255: el contexto del wizard
 * es un estado de verdad (escribir borra el error del campo).
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import type { WizardField } from '../../../../../../services/wizardApi';

type Estado = Record<string, { value?: string; error?: string }>;
const mockWizardCtx = createContext<unknown>(null);

jest.mock('../../../../context/WizardContext', () => ({
  useWizard: () => jest.requireActual('react').useContext(mockWizardCtx),
  FILE_PENDING_REUPLOAD: '__pending__',
}));
const mockTrack = jest.fn();
jest.mock('../../../../context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: mockTrack }),
}));
jest.mock('../../../../../context/LayoutContext', () => ({
  useLayout: () => ({ agreementData: null, landing: 'una-landing' }),
}));
jest.mock('../../../../hooks/useFieldTracking', () => ({
  useFieldTracking: () => ({ onFieldFocus: jest.fn(), onFieldBlur: jest.fn() }),
}));
jest.mock('../../../../../calculadora/utils/useDatosMatricula', () => ({ useDatosMatricula: () => null }));
jest.mock('../TextInput', () => ({
  contadorVisible: () => false,
  TextInput: ({ id, value, onChange, onBlur, error }: { id: string; value: string; onChange: (v: string) => void; onBlur: () => void; error?: string }) => (
    <div>
      <input aria-label={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
      {error && <p role="alert">{error}</p>}
    </div>
  ),
}));
// El DNI real busca a la persona en el buró: acá solo importa que pinte el
// error cuando `showError` lo deja, como hace el componente de verdad.
jest.mock('../DocumentNumberField', () => ({
  DocumentNumberField: ({ field, showError, onBlur }: { field: { code: string }; showError: boolean; onBlur: () => void }) => {
    const w = useContext(mockWizardCtx) as { getFieldValue: (c: string) => string; getFieldError: (c: string) => string | undefined; updateField: (c: string, v: string) => void };
    return (
      <div>
        <input aria-label={field.code} value={w.getFieldValue(field.code) ?? ''} onChange={(e) => w.updateField(field.code, e.target.value)} onBlur={onBlur} />
        {showError && w.getFieldError(field.code) && <p role="alert">{w.getFieldError(field.code)}</p>}
      </div>
    );
  },
}));

import { DynamicField } from '../DynamicField';
import { useErroresDeCampoD1 } from '../../../../hooks/useErroresDeCampoD1';
import { validateStepDetallado, type WizardStep } from '../../../../../../services/wizardApi';
import { __limpiarOrigenesDeErrores } from '../../../../../../services/origenDeErrores';

function Wizard({ inicial, children }: { inicial: Estado; children: React.ReactNode }) {
  const [formData, setFormData] = useState<Estado>(inicial);
  const updateField = useCallback((c: string, v: string) => setFormData((p) => ({ ...p, [c]: { value: v } })), []);
  const setFieldError = useCallback(
    (c: string, e: string | null) => setFormData((p) => ({ ...p, [c]: { value: p[c]?.value, ...(e ? { error: e } : {}) } })),
    [],
  );
  const valor = useMemo(() => ({
    formData,
    updateField,
    setFieldError,
    getFieldValue: (c: string) => formData[c]?.value ?? '',
    getFieldError: (c: string) => formData[c]?.error,
    getAllDynamicOptions: () => ({}),
  }), [formData, updateField, setFieldError]);
  return <mockWizardCtx.Provider value={valor}>{children}</mockWizardCtx.Provider>;
}

const campo = (over: Partial<WizardField>): WizardField =>
  ({ label: 'x', required: true, options: [], validations: [], dependency_groups: [], max_files: 1, ...over }) as WizardField;

const CELULAR = campo({
  code: 'supporter_phone', type: 'phone', min_length: 9, max_length: 9,
  validations: [{ type: 'not_equals_field', value: 'phone', message: 'Es el mismo celular del solicitante' }],
} as Partial<WizardField>);
const NOMBRE = campo({ code: 'supporter_name', type: 'text' } as Partial<WizardField>);

const PASO = { code: 'datos_familiar', title: 'Familiar', fields: [CELULAR, NOMBRE] } as unknown as WizardStep;
const SOLICITANTE: Estado = { phone: { value: '987654321' } };

/** El paso de Diseño 1: el campo + el hook, y un «Continuar» con el validador real. */
function PasoD1() {
  useErroresDeCampoD1(PASO, true);
  const w = useContext(mockWizardCtx) as { formData: Estado; setFieldError: (c: string, e: string | null) => void };
  const continuar = () => {
    const valores = Object.fromEntries(Object.entries(w.formData).map(([k, v]) => [k, v?.value ?? '']));
    validateStepDetallado(PASO, valores, w.setFieldError, {});
  };
  return (
    <>
      <DynamicField field={CELULAR} />
      <button type="button" onClick={continuar}>Continuar</button>
    </>
  );
}

function montar() {
  render(<Wizard inicial={SOLICITANTE}><PasoD1 /></Wizard>);
  return screen.getByLabelText('supporter_phone');
}
const escribir = (input: HTMLElement, v: string) => fireEvent.change(input, { target: { value: v } });
const errores = () => mockTrack.mock.calls.filter((c) => c[0] === 'form_field_error').map((c) => c[1]);

beforeEach(() => {
  mockTrack.mockClear();
  __limpiarOrigenesDeErrores();
});

describe('BAL-5276 · Diseño 1 · form_field_error al salir y al Continuar', () => {
  it('celular del familiar corto → al_salir con error_rule min_length', () => {
    const input = montar();
    escribir(input, '98765');
    expect(errores()).toHaveLength(0);
    fireEvent.blur(input);
    expect(errores()).toEqual([{
      step_code: 'datos_familiar',
      field_code: 'supporter_phone',
      field_name: 'supporter_phone',
      error_field: 'supporter_phone',
      error_rule: 'min_length',
      error_message: 'Mínimo 9 caracteres',
      momento: 'al_salir',
      diseno: 1,
    }]);
    expect(JSON.stringify(mockTrack.mock.calls)).not.toContain('98765');
  });

  it('celular del familiar igual al del solicitante → al_salir con error_rule not_equals_field', () => {
    const input = montar();
    escribir(input, '987654321');
    fireEvent.blur(input);
    expect(errores()).toEqual([expect.objectContaining({
      field_name: 'supporter_phone',
      error_rule: 'not_equals_field',
      error_message: 'Es el mismo celular del solicitante',
      momento: 'al_salir',
      diseno: 1,
    })]);
    expect(JSON.stringify(mockTrack.mock.calls)).not.toContain('987654321');
  });

  it('salir dos veces con el mismo error cuenta una; corregir y volver a fallar cuenta otra', () => {
    const input = montar();
    escribir(input, '98765');
    fireEvent.blur(input);
    fireEvent.blur(input);
    expect(errores()).toHaveLength(1);
    escribir(input, '9876');
    fireEvent.blur(input);
    expect(errores()).toHaveLength(2);
  });

  it('«Continuar» con campos vacíos → momento continuar y error_rule required', () => {
    montar();
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    const lista = errores();
    expect(lista).toHaveLength(2);
    expect(lista).toEqual(expect.arrayContaining([
      expect.objectContaining({ field_name: 'supporter_phone', error_rule: 'required', momento: 'continuar', diseno: 1 }),
      expect.objectContaining({ field_name: 'supporter_name', error_rule: 'required', momento: 'continuar', diseno: 1 }),
    ]));
    // Otro «Continuar» con los mismos errores no los repite.
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(errores()).toHaveLength(2);
  });
});
