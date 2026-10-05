/// <reference types="jest" />
/**
 * El 400 de `/public/form/submit` trae `error_code` junto a `detail`. El
 * cliente tiene que pasarlo: sin él, useSubmitApplication no elige el mensaje
 * y `form_submit_error` queda como `unknown`.
 */
import { submitApplication } from '../applicationApi';

const fail = (status: number, body: unknown) => ({ ok: false, status, json: async () => body });

const request = {
  session_uuid: 's-1',
  form_data: {},
  product_data: {},
} as unknown as Parameters<typeof submitApplication>[0];

describe('submitApplication: errores del API', () => {
  beforeEach(() => { global.fetch = jest.fn(); });
  afterEach(() => { jest.resetAllMocks(); });

  it('propaga error_code y detail de un 400', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      fail(400, { detail: 'Sin stock disponible para este equipo', error_code: 'OUT_OF_STOCK' }),
    );

    const res = await submitApplication(request);

    expect(res).toEqual({
      success: false,
      error: 'Sin stock disponible para este equipo',
      error_code: 'OUT_OF_STOCK',
    });
  });

  it('un 400 sin código deja error_code indefinido', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      fail(400, { detail: 'Sesión no encontrada', error_code: null }),
    );

    const res = await submitApplication(request);

    expect(res.success).toBe(false);
    expect(res.error).toBe('Sesión no encontrada');
    expect(res.error_code).toBeUndefined();
  });
});
