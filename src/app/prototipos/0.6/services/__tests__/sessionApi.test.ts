import { patchTrackingSession, __resetPatchDedupe } from '../sessionApi';

describe('patchTrackingSession', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ updated: [] }) })
    ) as unknown as typeof fetch;
    __resetPatchDedupe();
  });

  it('manda los campos al PATCH de la sesión', async () => {
    await patchTrackingSession('uuid-1', { ab_accessories_variant: 'B' });

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(String(url)).toContain('/public/tracking/session/uuid-1');
    expect((init as RequestInit).method).toBe('PATCH');
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      ab_accessories_variant: 'B',
    });
  });

  it('no repite el mismo campo con el mismo valor', async () => {
    await patchTrackingSession('uuid-2', { dni: '12345678' });
    await patchTrackingSession('uuid-2', { dni: '12345678' });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('sí manda un campo distinto de la misma sesión', async () => {
    await patchTrackingSession('uuid-3', { dni: '12345678' });
    await patchTrackingSession('uuid-3', { ab_accessories_variant: 'A' });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('descarta campos vacíos en vez de mandar ruido', async () => {
    await patchTrackingSession('uuid-4', { dni: '', ab_accessories_variant: undefined });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('sin uuid no llama a nada', async () => {
    await patchTrackingSession(null, { dni: '12345678' });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('un fallo de red no se propaga: el tracking nunca rompe el flujo', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('offline'))) as unknown as typeof fetch;

    await expect(
      patchTrackingSession('uuid-5', { dni: '12345678' })
    ).resolves.toBeUndefined();
  });

  it('si falla, el campo no queda marcado como enviado y se puede reintentar', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('offline'))) as unknown as typeof fetch;
    await patchTrackingSession('uuid-6', { dni: '12345678' });

    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    ) as unknown as typeof fetch;
    await patchTrackingSession('uuid-6', { dni: '12345678' });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
