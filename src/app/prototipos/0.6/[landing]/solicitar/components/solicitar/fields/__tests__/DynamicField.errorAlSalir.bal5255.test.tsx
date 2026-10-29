/**
 * BAL-5255 (Diseño 1): celular, DNI y correo del familiar muestran su error al
 * salir del campo si tienen algo escrito; vacío no avisa; al corregir se va.
 *
 * El contexto del wizard es un estado de verdad (mismo contrato que
 * `WizardContext`: escribir borra el error del campo).
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
const DNI = campo({
  code: 'supporter_document_number', type: 'document_number', min_length: 8, max_length: 9,
  validations: [{ type: 'not_equals_field', value: 'document_number', message: 'Ese es tu DNI. Escribe el DNI de tu familiar.' }],
} as Partial<WizardField>);
const CORREO = campo({
  code: 'supporter_email', type: 'email',
  validations: [{ type: 'not_equals_field', value: 'email', message: 'Es tu mismo correo' }],
} as Partial<WizardField>);
const OTRO = campo({ code: 'company_name', type: 'text', min_length: 5 } as Partial<WizardField>);

const SOLICITANTE: Estado = { phone: { value: '987654321' }, document_number: { value: '12345678' }, email: { value: 'yo@correo.pe' } };

function montar(field: WizardField) {
  render(<Wizard inicial={SOLICITANTE}><DynamicField field={field} /></Wizard>);
  return screen.getByLabelText(field.code);
}
const escribir = (input: HTMLElement, v: string) => fireEvent.change(input, { target: { value: v } });

describe('BAL-5255 · Diseño 1 · error al salir del campo del familiar', () => {
  it('celular: faltan dígitos → error al salir; al corregir se va', () => {
    const input = montar(CELULAR);
    escribir(input, '98765');
    expect(screen.queryByRole('alert')).toBeNull();
    fireEvent.blur(input);
    expect(screen.getByRole('alert')).toHaveTextContent('Mínimo 9 caracteres');
    escribir(input, '912345678');
    expect(screen.queryByRole('alert')).toBeNull();
    fireEvent.blur(input);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('celular igual al del solicitante → el mensaje de not_equals_field', () => {
    const input = montar(CELULAR);
    escribir(input, '987654321');
    fireEvent.blur(input);
    expect(screen.getByRole('alert')).toHaveTextContent('Es el mismo celular del solicitante');
  });

  it('DNI: corto y mismo DNI del solicitante; al corregir se va', () => {
    const input = montar(DNI);
    escribir(input, '1234');
    fireEvent.blur(input);
    expect(screen.getByRole('alert')).toHaveTextContent('Mínimo 8 caracteres');
    escribir(input, '12345678');
    expect(screen.queryByRole('alert')).toBeNull();
    fireEvent.blur(input);
    expect(screen.getByRole('alert')).toHaveTextContent('Ese es tu DNI. Escribe el DNI de tu familiar.');
    escribir(input, '87654321');
    fireEvent.blur(input);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('correo: mal escrito y el mismo del solicitante', () => {
    const input = montar(CORREO);
    escribir(input, 'mama@');
    fireEvent.blur(input);
    expect(screen.getByRole('alert')).toHaveTextContent(/correo válido/);
    escribir(input, 'yo@correo.pe');
    fireEvent.blur(input);
    expect(screen.getByRole('alert')).toHaveTextContent('Es tu mismo correo');
  });

  it('vacío al salir: no avisa nada', () => {
    const input = montar(CELULAR);
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(screen.queryByRole('alert')).toBeNull();
    escribir(input, '98');
    escribir(input, '');
    fireEvent.blur(input);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('un campo sin regla contra el solicitante sigue esperando al Continuar', () => {
    const input = montar(OTRO);
    escribir(input, 'ab');
    fireEvent.blur(input);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
