/**
 * E2E BAL-4969 (bug 4): `form_field_error` salía a cada tecla mientras el
 * campo seguía inválido (8 filas de "Mínimo 9 caracteres" al tipear un
 * celular). Debe salir al validar —al salir del campo o al intentar
 * continuar— y una vez por error.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';

const mockTrack = jest.fn();
let mockFormData: Record<string, { value?: string; error?: string | null }> = {};
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: mockTrack }),
}));
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/WizardContext', () => ({
  useWizard: () => ({
    formData: mockFormData,
    // Como el contexto real: el cambio de valor limpia el error y la
    // revalidación lo vuelve a poner.
    setFieldError: (codigo: string, error: string | null) => {
      mockFormData = { ...mockFormData, [codigo]: { ...mockFormData[codigo], error } };
    },
    getAllDynamicOptions: () => ({}),
  }),
}));

import { useErroresAlSalir } from '../useErroresAlSalir';
import type { WizardStep } from '@/app/prototipos/0.6/services/wizardApi';

const PASO = {
  code: 'personal_data',
  fields: [
    { code: 'phone_secondary', label: 'Celular', type: 'text', required: false, min_length: 9, dependency_groups: [], validations: [] },
    { code: 'first_name', label: 'Nombres', type: 'text', required: true, dependency_groups: [], validations: [] },
  ],
} as unknown as WizardStep;

function Prueba() {
  const { onBlur } = useErroresAlSalir(PASO);
  return (
    <>
      <div data-campo="phone_secondary" onBlur={onBlur}><input aria-label="celular" /></div>
      <div data-campo="first_name" onBlur={onBlur}><input aria-label="nombres" /></div>
    </>
  );
}

const llamadasDeError = () => mockTrack.mock.calls.filter(([e]) => e === 'form_field_error');

beforeEach(() => {
  mockTrack.mockClear();
  mockFormData = { phone_secondary: { value: '9' }, first_name: { value: 'Ana' } };
});

it('tipear con el campo inválido no emite; salir del campo emite una vez', () => {
  const { getByLabelText, rerender } = render(<Prueba />);
  fireEvent.blur(getByLabelText('celular'));
  expect(llamadasDeError()).toHaveLength(1);
  expect(llamadasDeError()[0][1]).toEqual(expect.objectContaining({ field_code: 'phone_secondary', error_message: 'Mínimo 9 caracteres' }));

  // Cada tecla: valor nuevo, error limpio (como el contexto real).
  for (const v of ['90', '900', '9000', '90000', '900000']) {
    mockFormData = { ...mockFormData, phone_secondary: { value: v, error: null } };
    rerender(<Prueba />);
  }
  expect(llamadasDeError()).toHaveLength(1);

  // Volver a salir con el MISMO error no lo cuenta otra vez.
  fireEvent.blur(getByLabelText('celular'));
  expect(llamadasDeError()).toHaveLength(1);
});

it('un error nuevo después de corregir vuelve a contar al salir', () => {
  const { getByLabelText, rerender } = render(<Prueba />);
  fireEvent.blur(getByLabelText('celular'));
  mockFormData = { ...mockFormData, phone_secondary: { value: '900000051', error: null } };
  rerender(<Prueba />);
  mockFormData = { ...mockFormData, phone_secondary: { value: '9000', error: null } };
  rerender(<Prueba />);
  expect(llamadasDeError()).toHaveLength(1);
  fireEvent.blur(getByLabelText('celular'));
  expect(llamadasDeError()).toHaveLength(2);
});

it('el error que pone "Continuar" en un campo sin tocar se emite una vez', () => {
  const { rerender } = render(<Prueba />);
  mockFormData = { ...mockFormData, first_name: { value: '', error: 'Este campo es requerido' } };
  rerender(<Prueba />);
  rerender(<Prueba />);
  expect(llamadasDeError()).toHaveLength(1);
  expect(llamadasDeError()[0][1]).toEqual(expect.objectContaining({ field_code: 'first_name' }));
});
