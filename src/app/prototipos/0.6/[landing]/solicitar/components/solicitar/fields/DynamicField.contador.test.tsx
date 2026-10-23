/**
 * BAL-4960 — `DynamicField` pasa el `show_counter` de la foto al campo real
 * (`TextInput` / `TextArea`) y la precedencia se respeta en los dos diseños.
 * El límite (`max_length`) va siempre al input.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { WizardField } from '../../../../../services/wizardApi';
import { DynamicField, pistaVaEnElCampo } from './DynamicField';
import { CamposV2Provider } from '@/app/prototipos/0.6/components/diseno-2/campos/estilosV2';

const mockValor = jest.fn().mockReturnValue('Ana');
jest.mock('../../../context/WizardContext', () => ({
  useWizard: () => ({
    getFieldValue: mockValor,
    getFieldError: () => undefined,
    updateField: jest.fn(),
    formData: {},
  }),
  FILE_PENDING_REUPLOAD: '__pending__',
}));
jest.mock('../../../../context/LayoutContext', () => ({
  useLayout: () => ({ agreementData: null, landing: 'una-landing' }),
}));
jest.mock('../../../hooks/useFieldTracking', () => ({
  useFieldTracking: () => ({ onFieldFocus: jest.fn(), onFieldBlur: jest.fn() }),
}));
jest.mock('../../../../calculadora/utils/useDatosMatricula', () => ({
  useDatosMatricula: () => null,
}));

function campo(extra: Partial<WizardField> = {}): WizardField {
  return {
    id: 1, code: 'first_name', label: 'Nombres', type: 'text', required: true,
    max_length: 50, options: [], validations: [],
    ...extra,
  } as unknown as WizardField;
}

function montar(field: WizardField, v2: boolean, pista?: string) {
  const el = <DynamicField field={field} pista={pista} />;
  return render(v2 ? <CamposV2Provider>{el}</CamposV2Provider> : el);
}

const contador = () => screen.queryByText('3/50');

describe('DynamicField — contador de caracteres (BAL-4960)', () => {
  it.each([
    ['D1 sin valor lo muestra', false, undefined, true],
    ['D2 sin valor no lo muestra', true, undefined, false],
    ['D1 en true lo muestra', false, true, true],
    ['D1 en false lo oculta', false, false, false],
    ['D2 en true lo muestra', true, true, true],
    ['D2 en false lo oculta', true, false, false],
  ] as const)('%s', (_n, v2, show_counter, visible) => {
    montar(campo(show_counter === undefined ? {} : { show_counter }), v2);
    if (visible) expect(contador()).toBeInTheDocument();
    else expect(contador()).toBeNull();
    expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '50');
  });

  it('celular: también respeta show_counter', () => {
    mockValor.mockReturnValueOnce('987');
    montar(campo({ type: 'phone', code: 'phone', max_length: 9, show_counter: false }), false);
    expect(screen.queryByText('3/9')).toBeNull();
    expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '9');
  });

  it('área de texto: sin valor se ve como siempre; en false se oculta y el límite sigue', () => {
    const { unmount } = montar(campo({ type: 'textarea', code: 'comments' }), true);
    expect(contador()).toBeInTheDocument();
    unmount();
    montar(campo({ type: 'textarea', code: 'comments', show_counter: false }), true);
    expect(contador()).toBeNull();
    expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '50');
  });

  it('D2 con contador: la pista llega al campo y va en su fila', () => {
    montar(campo({ show_counter: true }), true, 'Como aparece en tu DNI');
    expect(screen.getByText('Como aparece en tu DNI').parentElement).toBe(screen.getByText('3/50').parentElement);
  });

  it('pistaVaEnElCampo: solo en D2, texto/celular con máximo y contador visible', () => {
    expect(pistaVaEnElCampo(campo({ show_counter: true }), true)).toBe(true);
    expect(pistaVaEnElCampo(campo(), true)).toBe(false);
    expect(pistaVaEnElCampo(campo({ show_counter: true }), false)).toBe(false);
    expect(pistaVaEnElCampo(campo({ show_counter: true, max_length: null }), true)).toBe(false);
    expect(pistaVaEnElCampo(campo({ show_counter: true, type: 'email' }), true)).toBe(false);
  });
});
