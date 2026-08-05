/**
 * Tests unitarios para evaluateFamilyFarmAccess (BAL-2521/BAL-2522, DEMO)
 *
 * Mirrors evaluateApi.test.ts's structure for the frozen family-farm
 * contract (whitelist-only, no Equifax):
 * 1. Body incluye dni; sessionUuid opcional → session_uuid solo si se pasa
 * 2. Respuesta tipada (valid / found_in_sibling / access_token) correctamente
 * 3. Error de red → relanza la excepción (sin swallow)
 * 4. Respuesta no-ok (ej. 404) → relanza con mensaje descriptivo
 */

import { evaluateFamilyFarmAccess } from '../landingApi';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  jest.resetAllMocks();
});

describe('evaluateFamilyFarmAccess', () => {
  it('envía dni en el body y NO session_uuid cuando no se pasa sessionUuid', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ valid: true, first_name: 'Ana', access_token: 'tok-123' }),
    } as unknown as Response);

    // NOTA: no se loggea el valor del DNI en este test
    await evaluateFamilyFarmAccess('family-farm-cosechador', { dni: '80011001' });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string);

    expect(url).toContain('/public/landing/family-farm-cosechador/evaluate-family-farm');
    expect(body).toHaveProperty('dni', '80011001');
    expect(body).not.toHaveProperty('session_uuid');
  });

  it('incluye session_uuid en el body cuando se pasa sessionUuid', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ valid: false, found_in_sibling: false }),
    } as unknown as Response);

    await evaluateFamilyFarmAccess('family-farm-fijo', { dni: '80011003', sessionUuid: 'uuid-abc' });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string);

    expect(body).toHaveProperty('dni', '80011003');
    expect(body).toHaveProperty('session_uuid', 'uuid-abc');
  });

  it('devuelve la respuesta tipada correctamente para valid:true', async () => {
    const expectedResponse = { valid: true, first_name: 'Juan', access_token: 'tok-xyz' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => expectedResponse,
    } as unknown as Response);

    const result = await evaluateFamilyFarmAccess('family-farm-cosechador', { dni: '80011001' });

    expect(result.valid).toBe(true);
    expect(result.first_name).toBe('Juan');
    expect(result.access_token).toBe('tok-xyz');
  });

  it('devuelve la respuesta tipada correctamente para found_in_sibling', async () => {
    const expectedResponse = {
      valid: false,
      found_in_sibling: true,
      sibling_landing_slug: 'family-farm-fijo',
      sibling_landing_name: 'Family Farm Fijo',
      first_name: 'Luis',
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => expectedResponse,
    } as unknown as Response);

    const result = await evaluateFamilyFarmAccess('family-farm-cosechador', { dni: '80011002' });

    expect(result.valid).toBe(false);
    expect(result.found_in_sibling).toBe(true);
    expect(result.sibling_landing_slug).toBe('family-farm-fijo');
    expect(result.sibling_landing_name).toBe('Family Farm Fijo');
  });

  it('relanza el error cuando la llamada falla por error de red', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    await expect(
      evaluateFamilyFarmAccess('family-farm-cosechador', { dni: '80011001' }),
    ).rejects.toThrow('Network error');
  });

  it('relanza el error cuando la respuesta no es ok (ej. 404 slug desconocido)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ detail: 'Landing not found' }),
    } as unknown as Response);

    await expect(
      evaluateFamilyFarmAccess('unknown-slug', { dni: '80011001' }),
    ).rejects.toThrow('evaluate-family-farm error: 404');
  });

  // ── sibling_access_token (BAL-2786) ─────────────────────────────────────
  // Backend contract: on a sibling match, the destination token rides under
  // `sibling_access_token`, NEVER under `access_token` (see decision sdd/
  // landing-router-gate-handoff obs 1955 — access_token is unconditionally
  // persisted for the CURRENT landing by FamilyFarmOverlayGate.tsx:91).
  it('devuelve sibling_access_token tipado cuando el backend lo incluye en found_in_sibling', async () => {
    const expectedResponse = {
      valid: false,
      found_in_sibling: true,
      sibling_landing_slug: 'family-farms-baldecash-a',
      sibling_landing_name: 'Family Farms | BaldeCash A',
      first_name: 'Prueba 2',
      sibling_access_token: 'sib-tok-abc123',
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => expectedResponse,
    } as unknown as Response);

    const result = await evaluateFamilyFarmAccess('family-farms-baldecash', { dni: '80011004' });

    expect(result.found_in_sibling).toBe(true);
    expect(result.sibling_access_token).toBe('sib-tok-abc123');
  });

  it('sibling_access_token queda undefined cuando el backend no lo envía (degrada al comportamiento actual)', async () => {
    const expectedResponse = {
      valid: false,
      found_in_sibling: true,
      sibling_landing_slug: 'family-farm-fijo',
      sibling_landing_name: 'Family Farm Fijo',
      first_name: 'Luis',
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => expectedResponse,
    } as unknown as Response);

    const result = await evaluateFamilyFarmAccess('family-farm-cosechador', { dni: '80011002' });

    expect(result.sibling_access_token).toBeUndefined();
  });

  it('no confunde sibling_access_token con access_token en la rama valid:true (branch directo sin cambios)', async () => {
    const expectedResponse = { valid: true, first_name: 'Juan', access_token: 'tok-xyz' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => expectedResponse,
    } as unknown as Response);

    const result = await evaluateFamilyFarmAccess('family-farm-cosechador', { dni: '80011001' });

    expect(result.access_token).toBe('tok-xyz');
    expect(result.sibling_access_token).toBeUndefined();
  });
});
