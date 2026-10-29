/**
 * BAL-5255 (Diseño 2): celular, DNI y correo del familiar —los que se comparan
 * contra el solicitante (`not_equals_field`)— avisan al salir si tienen algo
 * escrito, con el mensaje de «Continuar»; vacíos NO avisan al salir (su
 * «obligatorio» espera al «Continuar»); al corregir, el error se va.
 * Los demás campos siguen como siempre en Diseño 2 (vacío al salir avisa).
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import type { WizardField, WizardStep } from '@/app/prototipos/0.6/services/wizardApi';

type Estado = Record<string, { value?: string; error?: string }>;
const mockWizardCtx = createContext<unknown>(null);
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/WizardContext', () => ({
  useWizard: () => jest.requireActual('react').useContext(mockWizardCtx),
}));

import { useErroresAlSalir } from '../useErroresAlSalir';

const campo = (over: Partial<WizardField>): WizardField =>
  ({ label: 'x', required: true, options: [], validations: [], dependency_groups: [], max_files: 1, ...over }) as WizardField;

const PASO = {
  code: 'economic',
  fields: [
    campo({ code: 'supporter_phone', type: 'phone', min_length: 9, max_length: 9,
      validations: [{ type: 'not_equals_field', value: 'phone', message: 'Es el mismo celular del solicitante' }] } as Partial<WizardField>),
    campo({ code: 'supporter_document_number', type: 'document_number', min_length: 8, max_length: 9,
      validations: [{ type: 'not_equals_field', value: 'document_number', message: 'Ese es tu DNI. Escribe el DNI de tu familiar.' }] } as Partial<WizardField>),
    campo({ code: 'supporter_email', type: 'email',
      validations: [{ type: 'not_equals_field', value: 'email', message: 'Es tu mismo correo' }] } as Partial<WizardField>),
    campo({ code: 'company_name', type: 'text' }),
  ],
} as unknown as WizardStep;

const mockAcciones: { setFieldError: (c: string, e: string | null) => void } = { setFieldError: () => {} };

function Campos() {
  const w = useContext(mockWizardCtx) as { formData: Estado; updateField: (c: string, v: string) => void };
  const { camposTocados, onBlur } = useErroresAlSalir(PASO);
  return (
    <div onBlur={onBlur}>
      {PASO.fields.map((f) => (
        <div key={f.code} data-campo={f.code}>
          <input aria-label={f.code} value={w.formData[f.code]?.value ?? ''} onChange={(e) => w.updateField(f.code, e.target.value)} />
          {camposTocados.has(f.code) && w.formData[f.code]?.error && <p data-error={f.code}>{w.formData[f.code]?.error}</p>}
        </div>
      ))}
    </div>
  );
}

function Wizard() {
  const [formData, setFormData] = useState<Estado>({
    phone: { value: '987654321' }, document_number: { value: '12345678' }, email: { value: 'yo@correo.pe' },
  });
  // Mismo contrato que `WizardContext`: escribir borra el error del campo.
  const updateField = useCallback((c: string, v: string) => setFormData((p) => ({ ...p, [c]: { value: v } })), []);
  const setFieldError = useCallback(
    (c: string, e: string | null) => setFormData((p) => ({ ...p, [c]: { value: p[c]?.value, ...(e ? { error: e } : {}) } })),
    [],
  );
  useEffect(() => {
    mockAcciones.setFieldError = setFieldError;
  }, [setFieldError]);
  const valor = useMemo(() => ({ formData, updateField, setFieldError, getAllDynamicOptions: () => ({}) }), [formData, updateField, setFieldError]);
  return <mockWizardCtx.Provider value={valor}><Campos /></mockWizardCtx.Provider>;
}

const error = (codigo: string) => document.querySelector(`[data-error="${codigo}"]`)?.textContent ?? null;
const escribir = (codigo: string, v: string) => fireEvent.change(screen.getByLabelText(codigo), { target: { value: v } });
const salir = (codigo: string) => fireEvent.blur(screen.getByLabelText(codigo));

describe('BAL-5255 · Diseño 2 · error al salir del campo del familiar', () => {
  beforeEach(() => render(<Wizard />));

  it('celular: faltan dígitos al salir; al corregir se va', () => {
    escribir('supporter_phone', '98765');
    salir('supporter_phone');
    expect(error('supporter_phone')).toBe('Mínimo 9 caracteres');
    escribir('supporter_phone', '912345678');
    expect(error('supporter_phone')).toBeNull();
  });

  it('celular igual al del solicitante', () => {
    escribir('supporter_phone', '987654321');
    salir('supporter_phone');
    expect(error('supporter_phone')).toBe('Es el mismo celular del solicitante');
  });

  it('DNI: mismo DNI del solicitante; al corregir se va', () => {
    escribir('supporter_document_number', '12345678');
    salir('supporter_document_number');
    expect(error('supporter_document_number')).toBe('Ese es tu DNI. Escribe el DNI de tu familiar.');
    escribir('supporter_document_number', '87654321');
    expect(error('supporter_document_number')).toBeNull();
  });

  it('correo: el mismo del solicitante', () => {
    escribir('supporter_email', 'yo@correo.pe');
    salir('supporter_email');
    expect(error('supporter_email')).toBe('Es tu mismo correo');
  });

  it('vacío al salir no avisa, ni aunque se haya tocado y vaciado', () => {
    salir('supporter_phone');
    expect(error('supporter_phone')).toBeNull();
    escribir('supporter_phone', '98');
    salir('supporter_phone');
    expect(error('supporter_phone')).toBe('Mínimo 9 caracteres');
    escribir('supporter_phone', '');
    salir('supporter_phone');
    expect(error('supporter_phone')).toBeNull();
  });

  it('el «obligatorio» de Continuar se queda en un familiar vaciado', () => {
    escribir('supporter_phone', '98');
    salir('supporter_phone');
    escribir('supporter_phone', '');
    act(() => mockAcciones.setFieldError('supporter_phone', 'Este campo es requerido'));
    expect(error('supporter_phone')).toBe('Este campo es requerido');
  });

  it('los demás campos de Diseño 2 siguen avisando vacíos al salir', () => {
    salir('company_name');
    expect(error('company_name')).toBe('Este campo es requerido');
  });
});
