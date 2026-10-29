/**
 * BAL-5254 — `input_blur` suma `value_length` (cuántos caracteres tenía al
 * salir) SOLO en los campos de números de la persona: celular, celular del
 * familiar, documento y documento del familiar. Nunca el valor.
 */
import { renderHook } from '@testing-library/react';

const mockTrack = jest.fn();
jest.mock('../../context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: mockTrack, flush: jest.fn() }),
}));

import { useFieldTracking } from '../useFieldTracking';
import { largoAlSalir, CAMPOS_CON_LARGO_AL_SALIR } from '../../utils/largoAlSalir';

const blurs = () => mockTrack.mock.calls.filter((c) => c[0] === 'input_blur').map((c) => c[1]);

beforeEach(() => mockTrack.mockClear());

describe('largoAlSalir', () => {
  it('cuenta los caracteres solo en los cuatro campos de números', () => {
    expect([...CAMPOS_CON_LARGO_AL_SALIR].sort()).toEqual(
      ['document_number', 'phone', 'supporter_document_number', 'supporter_phone'],
    );
    expect(largoAlSalir('phone', '98765')).toBe(5);
    expect(largoAlSalir('supporter_phone', ' 987654321 ')).toBe(9);
    expect(largoAlSalir('document_number', '7002001')).toBe(7);
    expect(largoAlSalir('supporter_document_number', '')).toBe(0);
    expect(largoAlSalir('document_number', undefined)).toBe(0);
  });

  it('en otros campos no hay largo', () => {
    expect(largoAlSalir('first_name', 'Ana')).toBeUndefined();
    expect(largoAlSalir('email', 'a@b.pe')).toBeUndefined();
  });
});

describe('useFieldTracking · input_blur', () => {
  it('celular: lleva value_length y nunca el valor', () => {
    const { result } = renderHook(() => useFieldTracking(1));
    result.current.onFieldBlur('phone', true, 5);
    const [props] = blurs();
    expect(props).toMatchObject({ field_name: 'phone', had_value_on_blur: true, value_length: 5 });
    expect(props).not.toHaveProperty('value');
    expect(props).not.toHaveProperty('field_value');
  });

  it('otro campo: aunque llegue un largo, no se manda', () => {
    const { result } = renderHook(() => useFieldTracking(1));
    result.current.onFieldBlur('first_name', true, 3);
    expect(blurs()[0]).not.toHaveProperty('value_length');
  });

  it('sin largo: igual que antes', () => {
    const { result } = renderHook(() => useFieldTracking(1));
    result.current.onFieldBlur('document_number', false);
    expect(blurs()[0]).not.toHaveProperty('value_length');
  });
});
