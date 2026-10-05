/// <reference types="jest" />
/**
 * Cliente de `verify-dni`: la validación que responde si la foto ES un
 * documento. `compare-faces` no puede responder eso — solo mira dos rostros,
 * así que dos selfies dan 100% de coincidencia y pasan.
 */
import { verifyDni } from '../kycApi';

const ok = (body: unknown) => ({ ok: true, json: async () => body });
const fail = (status: number, body: unknown) => ({ ok: false, status, json: async () => body });

describe('verifyDni', () => {
  beforeEach(() => { global.fetch = jest.fn(); });
  afterEach(() => { jest.resetAllMocks(); });

  it('manda el DNI y el código de solicitud en snake_case', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(ok({ status: 'verified' }));

    await verifyDni({ image: 'https://s3/dni.jpg', documentNumber: '12345678', applicationCode: 'APP-1' });

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({
      image: 'https://s3/dni.jpg',
      document_number: '12345678',
      application_code: 'APP-1',
    });
  });

  it.each(['verified', 'not_found', 'low_confidence', 'unreadable'] as const)(
    'propaga el veredicto %s',
    async (status) => {
      (global.fetch as jest.Mock).mockResolvedValue(ok({ status }));
      const res = await verifyDni({ image: 'x', documentNumber: '12345678', applicationCode: 'A' });
      expect(res).toEqual({ success: true, status });
    },
  );

  it('propaga el reason del backend cuando rechaza por titularidad', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      fail(403, { detail: { reason: 'ownership_check_failed', message: 'El documento no coincide.' } }),
    );

    const res = await verifyDni({ image: 'x', documentNumber: '12345678', applicationCode: 'A' });

    expect(res.success).toBe(false);
    expect(res.reason).toBe('ownership_check_failed');
    expect(res.error).toBe('El documento no coincide.');
  });

  it('no lanza ante un error de red: devuelve un fallo reintentable', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('offline'));

    const res = await verifyDni({ image: 'x', documentNumber: '12345678', applicationCode: 'A' });

    expect(res.success).toBe(false);
    expect(res.error).toMatch(/conexión/i);
  });

  it('no lanza cuando la respuesta de error no es JSON', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false, status: 500, json: async () => { throw new Error('not json'); },
    });

    const res = await verifyDni({ image: 'x', documentNumber: '12345678', applicationCode: 'A' });

    expect(res.success).toBe(false);
    expect(res.error).toBeTruthy();
  });
});
