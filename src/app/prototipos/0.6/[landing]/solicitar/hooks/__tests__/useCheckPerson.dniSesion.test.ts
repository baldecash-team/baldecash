/**
 * El DNI tiene que quedar en la sesión en cuanto la persona se identifica, no
 * al final del proceso.
 *
 * Hoy `session.dni` está poblado en apenas el 11,4% de las sesiones que
 * crearon solicitud. Sin él no se pueden unir las visitas de una misma
 * persona: quien entra el lunes por un anuncio y vuelve el jueves por tráfico
 * directo cuenta como dos desconocidas distintas, y la venta se le atribuye a
 * la segunda visita.
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCheckPerson } from '../useCheckPerson';
import { patchTrackingSession, __resetPatchDedupe } from '@/app/prototipos/0.6/services/sessionApi';

jest.mock('@/app/prototipos/0.6/services/applicationApi', () => ({
  checkPerson: jest.fn().mockResolvedValue({ exists: false, prefill_data: null }),
}));

jest.mock('@/app/prototipos/0.6/services/sessionApi', () => ({
  patchTrackingSession: jest.fn().mockResolvedValue(undefined),
  __resetPatchDedupe: jest.fn(),
}));

describe('useCheckPerson: DNI en la sesión', () => {
  beforeEach(() => {
    (patchTrackingSession as jest.Mock).mockClear();
    (__resetPatchDedupe as jest.Mock).mockClear();
  });

  it('guarda el documento en la sesión al identificarse', async () => {
    const { result } = renderHook(() =>
      useCheckPerson({ debounceMs: 0, sessionUuid: 'uuid-dni' })
    );

    act(() => {
      result.current.check('dni', '12345678');
    });

    await waitFor(() =>
      expect(patchTrackingSession).toHaveBeenCalledWith('uuid-dni', {
        dni: '12345678',
      })
    );
  });

  it('no lo manda con un documento incompleto', async () => {
    const { result } = renderHook(() =>
      useCheckPerson({ debounceMs: 0, sessionUuid: 'uuid-corto' })
    );

    act(() => {
      result.current.check('dni', '123');
    });

    await new Promise((r) => setTimeout(r, 20));
    expect(patchTrackingSession).not.toHaveBeenCalled();
  });

  it('sin sesión no intenta nada', async () => {
    const { result } = renderHook(() => useCheckPerson({ debounceMs: 0 }));

    act(() => {
      result.current.check('dni', '12345678');
    });

    await new Promise((r) => setTimeout(r, 20));
    expect(patchTrackingSession).not.toHaveBeenCalled();
  });
});
