/**
 * Link especial (BAL-5191): en una landing tipo lead, el pase ya identifica al
 * estudiante y no se le pide el formulario de lead. Sin pase, igual que antes.
 */
import { renderHook, waitFor } from '@testing-library/react';
import { useLeadGuard, markLeadLanding } from '../useLeadGuard';

const replace = jest.fn();

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...window.location, replace },
  });
});

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  replace.mockClear();
  markLeadLanding('lead-x');
});

it('sin pase y sin lead redirige al formulario (como siempre)', async () => {
  const { result } = renderHook(() => useLeadGuard('lead-x'));
  await waitFor(() => expect(result.current).toBe(false));
  expect(replace).toHaveBeenCalled();
});

it('con pase guardado deja pasar sin redirigir', async () => {
  sessionStorage.setItem('baldecash-lead-x-special-link', 'tok');
  const { result } = renderHook(() => useLeadGuard('lead-x'));
  expect(result.current).toBe(true);
  await waitFor(() => expect(result.current).toBe(true));
  expect(replace).not.toHaveBeenCalled();
});

it('el pase de otra landing no abre esta', async () => {
  sessionStorage.setItem('baldecash-otra-special-link', 'tok');
  const { result } = renderHook(() => useLeadGuard('lead-x'));
  await waitFor(() => expect(result.current).toBe(false));
  expect(replace).toHaveBeenCalled();
});
