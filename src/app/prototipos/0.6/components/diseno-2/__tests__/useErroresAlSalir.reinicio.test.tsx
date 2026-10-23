/**
 * Hallazgo menor del QA F10 (BAL-4969): un campo que el formulario vació solo
 * (el número de documento al cambiar de tipo) deja de contar como tocado, así
 * que no muestra "Ingresa tu número…" antes de que la persona lo toque.
 */
import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';

const mockSetFieldError = jest.fn();
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/WizardContext', () => ({
  useWizard: () => ({
    formData: { document_number: { value: '' } },
    setFieldError: mockSetFieldError,
    getAllDynamicOptions: () => ({}),
  }),
}));

import { useErroresAlSalir, reiniciarCampoTocado } from '../useErroresAlSalir';
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

beforeEach(() => mockSetFieldError.mockClear());

it('tocado al salir; reiniciado por el formulario, deja de estarlo y se limpia su error', () => {
  const { getByLabelText } = render(<Prueba />);
  fireEvent.blur(getByLabelText('numero'));
  expect(visto.tocados.has('document_number')).toBe(true);
  expect(mockSetFieldError).toHaveBeenCalledWith('document_number', 'Este campo es requerido');

  mockSetFieldError.mockClear();
  act(() => reiniciarCampoTocado('document_number'));
  expect(visto.tocados.has('document_number')).toBe(false);
  expect(mockSetFieldError).toHaveBeenCalledWith('document_number', null);
  expect(mockSetFieldError).not.toHaveBeenCalledWith('document_number', 'Este campo es requerido');
});
