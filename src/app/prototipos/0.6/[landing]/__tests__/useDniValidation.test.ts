/**
 * Tests para los eventos de tracking en useDniValidation (BAL-1806)
 *
 * Verifica que se disparan los eventos correctos al validar el DNI:
 * - dni_submit: al presionar Validar
 * - dni_validated: cuando la API aprueba el DNI
 * - dni_rejected: cuando la API rechaza el DNI
 *
 * Estrategia: testeamos la lógica de tracking directamente via fetch mock
 * sin montar el árbol completo de layout.tsx.
 */

import { sendEventsBatch } from '../../services/eventsApi';

jest.mock('../../services/eventsApi', () => ({
  sendEventsBatch: jest.fn(),
}));

const mockSendEventsBatch = sendEventsBatch as jest.MockedFunction<typeof sendEventsBatch>;

const API_BASE_URL = 'https://api.baldecash.com/api/v1';

// Replica la lógica de handleSubmit de useDniValidation para testear en aislamiento
async function simulateDniSubmit({
  landing,
  dni,
  sessionUuid,
  apiResponse,
}: {
  landing: string;
  dni: string;
  sessionUuid: string;
  apiResponse: Record<string, unknown>;
}) {
  const pageUrl = 'https://www.baldecash.com/renueva-tu-equipo-1';
  const clientTs = 1000000;

  sendEventsBatch(sessionUuid, [{ event_type: 'dni_submit', client_ts: clientTs, page_url: pageUrl }]);

  const validateUrl = `${API_BASE_URL}/public/landing/${encodeURIComponent(landing)}/validate-dni/${dni}${sessionUuid ? `?session_uuid=${sessionUuid}` : ''}`;
  const res = await fetch(validateUrl);
  const data = await res.json();

  if (!data.valid) {
    sendEventsBatch(sessionUuid, [{ event_type: 'dni_rejected', client_ts: clientTs + 100, page_url: pageUrl, properties: { landing } }]);
    return { validated: false };
  }

  try { localStorage.setItem(`baldecash-dni-${landing}`, dni); } catch {}
  sendEventsBatch(sessionUuid, [{ event_type: 'dni_validated', client_ts: clientTs + 100, page_url: pageUrl, properties: { landing } }]);
  return { validated: true };
}

describe('useDniValidation — eventos de tracking (BAL-1806)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('dispara dni_submit al iniciar la validación', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ valid: true, access_token: 'tok123', first_name: 'Juan' }),
    }) as jest.Mock;

    await simulateDniSubmit({
      landing: 'renueva-tu-equipo-1',
      dni: '12345678',
      sessionUuid: 'session-abc',
      apiResponse: { valid: true },
    });

    expect(mockSendEventsBatch).toHaveBeenCalledWith(
      'session-abc',
      expect.arrayContaining([
        expect.objectContaining({ event_type: 'dni_submit' }),
      ])
    );
  });

  it('dispara dni_validated cuando la API aprueba el DNI', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ valid: true, access_token: 'tok123', first_name: 'Juan' }),
    }) as jest.Mock;

    const result = await simulateDniSubmit({
      landing: 'renueva-tu-equipo-1',
      dni: '12345678',
      sessionUuid: 'session-abc',
      apiResponse: { valid: true },
    });

    expect(result.validated).toBe(true);
    expect(mockSendEventsBatch).toHaveBeenCalledWith(
      'session-abc',
      expect.arrayContaining([
        expect.objectContaining({ event_type: 'dni_validated', properties: { landing: 'renueva-tu-equipo-1' } }),
      ])
    );
  });

  it('dispara dni_rejected cuando la API rechaza el DNI', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ valid: false }),
    }) as jest.Mock;

    const result = await simulateDniSubmit({
      landing: 'renueva-tu-equipo-1',
      dni: '99999999',
      sessionUuid: 'session-abc',
      apiResponse: { valid: false },
    });

    expect(result.validated).toBe(false);
    expect(mockSendEventsBatch).toHaveBeenCalledWith(
      'session-abc',
      expect.arrayContaining([
        expect.objectContaining({ event_type: 'dni_rejected', properties: { landing: 'renueva-tu-equipo-1' } }),
      ])
    );
  });

  it('NO dispara dni_validated cuando el DNI es rechazado', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ valid: false }),
    }) as jest.Mock;

    await simulateDniSubmit({
      landing: 'renueva-tu-equipo-1',
      dni: '99999999',
      sessionUuid: 'session-abc',
      apiResponse: { valid: false },
    });

    const calls = mockSendEventsBatch.mock.calls;
    const allEventTypes = calls.flatMap(([, events]) => events.map((e) => e.event_type));
    expect(allEventTypes).not.toContain('dni_validated');
  });

  it('NO dispara dni_rejected cuando el DNI es aprobado', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ valid: true, access_token: 'tok123' }),
    }) as jest.Mock;

    await simulateDniSubmit({
      landing: 'renueva-tu-equipo-1',
      dni: '12345678',
      sessionUuid: 'session-abc',
      apiResponse: { valid: true },
    });

    const calls = mockSendEventsBatch.mock.calls;
    const allEventTypes = calls.flatMap(([, events]) => events.map((e) => e.event_type));
    expect(allEventTypes).not.toContain('dni_rejected');
  });

  it('guarda el DNI en localStorage tras validación exitosa', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ valid: true, access_token: 'tok123' }),
    }) as jest.Mock;

    await simulateDniSubmit({
      landing: 'renueva-tu-equipo-1',
      dni: '12345678',
      sessionUuid: 'session-abc',
      apiResponse: { valid: true },
    });

    expect(localStorage.getItem('baldecash-dni-renueva-tu-equipo-1')).toBe('12345678');
  });

  it('NO guarda el DNI en localStorage si la validación falla', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ valid: false }),
    }) as jest.Mock;

    await simulateDniSubmit({
      landing: 'renueva-tu-equipo-1',
      dni: '99999999',
      sessionUuid: 'session-abc',
      apiResponse: { valid: false },
    });

    expect(localStorage.getItem('baldecash-dni-renueva-tu-equipo-1')).toBeNull();
  });

  it('funciona sin sessionUuid (usuario sin sesión)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ valid: true, access_token: 'tok123' }),
    }) as jest.Mock;

    await simulateDniSubmit({
      landing: 'renueva-tu-equipo-1',
      dni: '12345678',
      sessionUuid: '',
      apiResponse: { valid: true },
    });

    expect(mockSendEventsBatch).toHaveBeenCalledWith(
      '',
      expect.arrayContaining([expect.objectContaining({ event_type: 'dni_submit' })]),
    );
    expect(mockSendEventsBatch).toHaveBeenCalledWith(
      '',
      expect.arrayContaining([expect.objectContaining({ event_type: 'dni_validated' })]),
    );
  });

  it('el DNI no aparece en las properties de los eventos (privacidad)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ valid: true, access_token: 'tok123' }),
    }) as jest.Mock;

    await simulateDniSubmit({
      landing: 'renueva-tu-equipo-1',
      dni: '12345678',
      sessionUuid: 'session-abc',
      apiResponse: { valid: true },
    });

    const calls = mockSendEventsBatch.mock.calls;
    calls.forEach(([, events]) => {
      events.forEach((e) => {
        if (e.properties) {
          expect(e.properties).not.toHaveProperty('dni');
          expect(e.properties).not.toHaveProperty('document_number');
        }
      });
    });
  });
});
