/**
 * BAL-4966 · `obtenerPlanesDeSeguro` distingue "no hay planes" de "no pudimos
 * preguntar". `getLandingInsurances` se traga los errores y devuelve `[]`, y
 * con eso el Paso 4 soltaba (para siempre) los seguros elegidos ante un 500.
 */

import { getLandingInsurances, obtenerPlanesDeSeguro } from '../landingApi';

function responder(status: number, body: unknown = {}) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  }) as unknown as typeof fetch;
}

describe('obtenerPlanesDeSeguro', () => {
  let consola: jest.SpyInstance;
  beforeEach(() => {
    consola = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => consola.mockRestore());

  it('200: devuelve los planes', async () => {
    responder(200, { plans: [{ id: '14' }] });
    await expect(obtenerPlanesDeSeguro('pago-diferido', 'Laptop', 3200, 24)).resolves.toEqual([{ id: '14' }]);
  });

  it('404: la landing no tiene seguros → []', async () => {
    responder(404);
    await expect(obtenerPlanesDeSeguro('pago-diferido', 'Laptop', 3200, 24)).resolves.toEqual([]);
  });

  it('500: lanza (no es "no hay planes")', async () => {
    responder(500);
    await expect(obtenerPlanesDeSeguro('pago-diferido', 'Laptop', 3200, 24)).rejects.toThrow('API error: 500');
  });

  it('corte de red: lanza', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch')) as unknown as typeof fetch;
    await expect(obtenerPlanesDeSeguro('pago-diferido', 'Laptop', 3200, 24)).rejects.toThrow('Failed to fetch');
  });

  it('getLandingInsurances sigue igual: con 500 devuelve []', async () => {
    responder(500);
    await expect(getLandingInsurances('pago-diferido', 'Laptop', 3200, 24)).resolves.toEqual([]);
  });

  it('con combo: manda combo_id (R7)', async () => {
    responder(200, { plans: [] });
    await obtenerPlanesDeSeguro('home', 'Laptop', 2202, 24, null, null, 52);
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('combo_id=52');
  });

  it('sin combo: no manda combo_id', async () => {
    responder(200, { plans: [] });
    await obtenerPlanesDeSeguro('home', 'Laptop', 2202, 24);
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).not.toContain('combo_id');
  });
});
