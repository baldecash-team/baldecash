/**
 * BAL-5276 (punto 1): Diseño 1 también emite `form_field_error`, con las
 * mismas propiedades que Diseño 2 y una vez por error.
 */
import React from 'react';
import { render } from '@testing-library/react';

const mockTrack = jest.fn();
let mockFormData: Record<string, { value?: string; error?: string | null }> = {};
jest.mock('../../context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: mockTrack }),
}));
jest.mock('../../context/WizardContext', () => ({
  useWizard: () => ({ formData: mockFormData }),
}));

import { useErroresDeCampoD1 } from '../useErroresDeCampoD1';
import type { WizardStep } from '../../../../services/wizardApi';

const PASO = {
  code: 'personal_data',
  fields: [
    { code: 'phone', label: 'Celular', type: 'phone' },
    { code: 'email', label: 'Correo', type: 'email' },
  ],
} as unknown as WizardStep;

function Prueba({ activo = true }: { activo?: boolean }) {
  useErroresDeCampoD1(PASO, activo);
  return null;
}

beforeEach(() => {
  mockTrack.mockClear();
  mockFormData = {};
});

it('cada error del paso sale una vez con las propiedades de Diseño 2 y diseno 1', () => {
  mockFormData = {
    phone: { value: '98765', error: 'Mínimo 9 caracteres' },
    email: { value: '', error: 'Este campo es requerido' },
  };
  const { rerender } = render(<Prueba />);
  expect(mockTrack).toHaveBeenCalledTimes(2);
  // Sin origen anotado: lo puso un «Continuar» (sin regla conocida).
  expect(mockTrack).toHaveBeenCalledWith('form_field_error', {
    step_code: 'personal_data',
    field_code: 'phone',
    field_name: 'phone',
    error_field: 'phone',
    error_rule: null,
    error_message: 'Mínimo 9 caracteres',
    momento: 'continuar',
    diseno: 1,
  });
  // Nunca el valor escrito.
  expect(JSON.stringify(mockTrack.mock.calls)).not.toContain('98765');

  // Mismo error en un nuevo render (otro «Continuar»): no se repite.
  mockFormData = { ...mockFormData };
  rerender(<Prueba />);
  expect(mockTrack).toHaveBeenCalledTimes(2);
});

it('un error que se corrige y vuelve a fallar cuenta otra vez', () => {
  mockFormData = { phone: { value: '1', error: 'Mínimo 9 caracteres' } };
  const { rerender } = render(<Prueba />);
  mockFormData = { phone: { value: '12', error: null } };
  rerender(<Prueba />);
  mockFormData = { phone: { value: '12', error: 'Mínimo 9 caracteres' } };
  rerender(<Prueba />);
  expect(mockTrack).toHaveBeenCalledTimes(2);
});

it('apagado (Diseño 2) no emite nada', () => {
  mockFormData = { phone: { value: '1', error: 'Mínimo 9 caracteres' } };
  render(<Prueba activo={false} />);
  expect(mockTrack).not.toHaveBeenCalled();
});
