/**
 * BAL-4969 (casuísticas): `form_field_error` se emite al salir de un campo
 * con error (estaba en el catálogo de ws2 pero nadie lo mandaba).
 */
import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';

const mockSetFieldError = jest.fn();
const mockTrack = jest.fn();
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: mockTrack }),
}));
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/WizardContext', () => ({
  useWizard: () => ({
    formData: { document_number: { value: '' } },
    setFieldError: mockSetFieldError,
    getAllDynamicOptions: () => ({}),
  }),
}));

import { useErroresAlSalir } from '../useErroresAlSalir';
import type { WizardStep } from '@/app/prototipos/0.6/services/wizardApi';

const PASO = {
  code: 'personal_data',
  fields: [{ code: 'document_number', label: 'Número', type: 'document_number', required: true, dependency_groups: [], validations: [] }],
} as unknown as WizardStep;

const visto: { tocados: ReadonlySet<string> } = { tocados: new Set() };
function Prueba() {
  const { camposTocados, onBlur } = useErroresAlSalir(PASO);
  React.useEffect(() => {
    visto.tocados = camposTocados;
  }, [camposTocados]);
  return (
    <div data-campo="document_number" onBlur={onBlur}>
      <input aria-label="numero" />
    </div>
  );
}

beforeEach(() => {
  mockSetFieldError.mockClear();
  mockTrack.mockClear();
});

it('al salir del campo con error emite form_field_error con el campo y el paso', () => {
  const { getByLabelText } = render(<Prueba />);
  fireEvent.blur(getByLabelText('numero'));
  expect(mockTrack).toHaveBeenCalledWith('form_field_error', expect.objectContaining({
    step_code: 'personal_data',
    field_code: 'document_number',
    error_message: 'Este campo es requerido',
    diseno: 2,
  }));
});

it('sin salir del campo no emite nada', () => {
  render(<Prueba />);
  expect(mockTrack).not.toHaveBeenCalled();
  void act;
});
