/**
 * Tests unitarios para evaluateLandingAccess
 *
 * Cubre los 4 casos de contrato del endpoint /evaluate:
 * 1. Payload con accessToken → body incluye access_token, no dni
 * 2. Payload con dni → body incluye dni, no access_token
 * 3. Respuesta tipada correctamente con los campos esperados
 * 4. Error de red → relanza la excepción (sin swallow)
 */

import { evaluateLandingAccess } from '../landingApi';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  jest.resetAllMocks();
});

describe('evaluateLandingAccess', () => {
  it('envía access_token (y NO dni) cuando el payload incluye accessToken', async () => {
    const mockResponse: Response = {
      ok: true,
      json: async () => ({ status: 'normal', catalog_url: 'https://baldecash.com/locker-truck/catalogo', first_name: 'Juan' }),
    } as unknown as Response;

    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    await evaluateLandingAccess('locker-truck', { accessToken: 'abc-token-123' });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [, options] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string);

    expect(body).toHaveProperty('access_token', 'abc-token-123');
    expect(body).not.toHaveProperty('dni');
  });

  it('envía dni (y NO access_token) cuando el payload incluye dni', async () => {
    const mockResponse: Response = {
      ok: true,
      json: async () => ({ status: 'no_normal', catalog_url: null, first_name: null }),
    } as unknown as Response;

    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    // NOTA: no se loggea el valor del DNI en este test (REQ-11)
    await evaluateLandingAccess('locker-truck', { dni: '12345678' });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string);

    expect(body).toHaveProperty('dni', '12345678');
    expect(body).not.toHaveProperty('access_token');
  });

  it('devuelve la respuesta tipada correctamente', async () => {
    const expectedResponse = {
      status: 'normal' as const,
      catalog_url: 'https://baldecash.com/locker-truck/catalogo',
      first_name: 'Ana',
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => expectedResponse,
    } as unknown as Response);

    const result = await evaluateLandingAccess('locker-truck', { accessToken: 'token-xyz' });

    expect(result.status).toBe('normal');
    expect(result.catalog_url).toBe('https://baldecash.com/locker-truck/catalogo');
    expect(result.first_name).toBe('Ana');
  });

  it('relanza el error cuando la llamada falla por error de red', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    await expect(
      evaluateLandingAccess('locker-truck', { accessToken: 'token-xyz' }),
    ).rejects.toThrow('Network error');
  });

  it('relanza el error cuando la respuesta no es ok (ej. 500)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as unknown as Response);

    await expect(
      evaluateLandingAccess('locker-truck', { dni: '87654321' }),
    ).rejects.toThrow('evaluate error: 500');
  });
});
