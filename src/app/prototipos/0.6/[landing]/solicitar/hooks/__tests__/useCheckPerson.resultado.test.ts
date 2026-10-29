/**
 * BAL-5276 (punto 3): `useCheckPerson` avisa el resultado de cada check
 * (`onResultado`), también cuando falla.
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCheckPerson } from '../useCheckPerson';
import { checkPerson } from '@/app/prototipos/0.6/services/applicationApi';

jest.mock('@/app/prototipos/0.6/services/applicationApi', () => ({
  checkPerson: jest.fn(),
}));
jest.mock('@/app/prototipos/0.6/services/sessionApi', () => ({
  patchTrackingSession: jest.fn().mockResolvedValue(undefined),
}));

it('encontrado con prellenado', async () => {
  (checkPerson as jest.Mock).mockResolvedValueOnce({ exists: true, prefill_data: { first_name: 'Ana' } });
  const onResultado = jest.fn();
  const { result } = renderHook(() => useCheckPerson({ debounceMs: 0, onResultado }));
  act(() => result.current.check('dni', '12345678'));
  await waitFor(() => expect(onResultado).toHaveBeenCalledWith({ resultado: 'encontrado', prellenado: true }));
});

it('bloqueado por la lista blanca', async () => {
  (checkPerson as jest.Mock).mockResolvedValueOnce({ exists: false, prefill_data: null, whitelist: { allowed: false } });
  const onResultado = jest.fn();
  const { result } = renderHook(() => useCheckPerson({ debounceMs: 0, onResultado }));
  act(() => result.current.check('dni', '12345678'));
  await waitFor(() => expect(onResultado).toHaveBeenCalledWith({ resultado: 'bloqueado_lista', prellenado: false }));
});

it('error del servicio', async () => {
  (checkPerson as jest.Mock).mockRejectedValueOnce(new Error('caído'));
  const onResultado = jest.fn();
  const { result } = renderHook(() => useCheckPerson({ debounceMs: 0, onResultado }));
  act(() => result.current.check('dni', '12345678'));
  await waitFor(() => expect(onResultado).toHaveBeenCalledWith({ resultado: 'error', prellenado: false }));
});
