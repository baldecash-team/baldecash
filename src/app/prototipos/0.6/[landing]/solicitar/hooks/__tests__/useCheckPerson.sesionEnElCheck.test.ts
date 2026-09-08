/**
 * El check-person viaja con la sesión que lo pidió.
 *
 * Sin `session_uuid` la consulta llega al backend sin dueño: la fila que deja
 * en `equifax_query` nace con `person_id` y `application_id` en NULL, y no hay
 * forma de reconstruir qué documentos pasaron por una sesión. Es lo que dejó
 * ciego al caso L-126380, donde el prefill vino de un DNI y la solicitud se
 * envió con otro.
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCheckPerson } from '../useCheckPerson';
import { checkPerson } from '@/app/prototipos/0.6/services/applicationApi';

jest.mock('@/app/prototipos/0.6/services/applicationApi', () => ({
  checkPerson: jest.fn().mockResolvedValue({ exists: false, prefill_data: null }),
}));

jest.mock('@/app/prototipos/0.6/services/sessionApi', () => ({
  patchTrackingSession: jest.fn().mockResolvedValue(undefined),
}));

describe('useCheckPerson: la consulta lleva la sesión', () => {
  beforeEach(() => {
    (checkPerson as jest.Mock).mockClear();
  });

  it('manda el session_uuid junto con el documento', async () => {
    const { result } = renderHook(() =>
      useCheckPerson({ debounceMs: 0, sessionUuid: 'uuid-de-la-sesion' })
    );

    act(() => {
      result.current.check('dni', '74860327');
    });

    await waitFor(() =>
      expect(checkPerson).toHaveBeenCalledWith(
        expect.objectContaining({
          document_number: '74860327',
          session_uuid: 'uuid-de-la-sesion',
        })
      )
    );
  });
});
