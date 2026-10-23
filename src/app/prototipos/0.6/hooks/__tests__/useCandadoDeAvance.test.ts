/**
 * E2E BAL-4969: el candado de los botones que envían o avanzan. El segundo
 * clic de un doble clic no pasa; pasado el tiempo, se puede volver a avanzar.
 */
import { renderHook } from '@testing-library/react';
import { useCandadoDeAvance } from '../useCandadoDeAvance';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it('el primer tomar pasa y el segundo inmediato no', () => {
  const { result } = renderHook(() => useCandadoDeAvance(1000));
  expect(result.current()).toBe(true);
  expect(result.current()).toBe(false);
});

it('se abre solo pasado el tiempo', () => {
  const { result } = renderHook(() => useCandadoDeAvance(1000));
  result.current();
  jest.advanceTimersByTime(1001);
  expect(result.current()).toBe(true);
});
