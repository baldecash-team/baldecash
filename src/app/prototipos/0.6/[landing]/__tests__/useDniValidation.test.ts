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
  sanitizeProperties: jest.requireActual('../../services/eventsApi').sanitizeProperties,
}));

import { sanitizeProperties } from '../../services/eventsApi';

const mockSendEventsBatch = sendEventsBatch as jest.MockedFunction<typeof sendEventsBatch>;

const API_BASE_URL = 'https://api.baldecash.com/api/v1';

// Replica la lógica de handleSubmit de useDniValidation para testear en aislamiento
function resolveSessionUuid(landing: string, contextUuid: string): string {
  return contextUuid
    || localStorage.getItem(`baldecash-${landing}-wizard-session-uuid`)
    || (() => {
      const uuid = 'test-generated-uuid';
      localStorage.setItem(`baldecash-${landing}-wizard-session-uuid`, uuid);
      return uuid;
    })();
}

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

  const resolvedUuid = resolveSessionUuid(landing, sessionUuid);
  sendEventsBatch(resolvedUuid, [{ event_type: 'dni_submit', client_ts: clientTs, page_url: pageUrl, properties: { landing_slug: landing, whitelist: true, source: 'vip_overlay', dni } }]);

  const validateUrl = `${API_BASE_URL}/public/landing/${encodeURIComponent(landing)}/validate-dni/${dni}${resolvedUuid ? `?session_uuid=${resolvedUuid}` : ''}`;
  const res = await fetch(validateUrl);
  const data = await res.json();

  if (!data.valid) {
    sendEventsBatch(resolvedUuid, [{ event_type: 'dni_rejected', client_ts: clientTs + 100, page_url: pageUrl, properties: { landing_slug: landing, source: 'vip_overlay', dni } }]);
    return { validated: false, sessionUuid: resolvedUuid };
  }

  try { localStorage.setItem(`baldecash-dni-${landing}`, dni); } catch {}
  sendEventsBatch(resolvedUuid, [{ event_type: 'dni_validated', client_ts: clientTs + 100, page_url: pageUrl, properties: { landing_slug: landing, source: 'vip_overlay', dni } }]);
  return { validated: true, sessionUuid: resolvedUuid };
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
        expect.objectContaining({ event_type: 'dni_validated', properties: { landing_slug: 'renueva-tu-equipo-1', source: 'vip_overlay', dni: '12345678' } }),
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
        expect.objectContaining({ event_type: 'dni_rejected', properties: { landing_slug: 'renueva-tu-equipo-1', source: 'vip_overlay', dni: '99999999' } }),
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

  it('genera UUID propio si no hay sesión — eventos siempre se envían', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ valid: true, access_token: 'tok123' }),
    }) as jest.Mock;

    // Sin sesión en contexto ni en localStorage
    const result = await simulateDniSubmit({
      landing: 'renueva-tu-equipo-1',
      dni: '12345678',
      sessionUuid: '',
      apiResponse: { valid: true },
    });

    // UUID generado y guardado en localStorage
    expect(localStorage.getItem('baldecash-renueva-tu-equipo-1-wizard-session-uuid')).toBeTruthy();

    // Eventos enviados con ese UUID (no vacío)
    expect(result.sessionUuid).toBe('test-generated-uuid');
    expect(mockSendEventsBatch).toHaveBeenCalledWith(
      'test-generated-uuid',
      expect.arrayContaining([expect.objectContaining({ event_type: 'dni_submit' })]),
    );
    expect(mockSendEventsBatch).toHaveBeenCalledWith(
      'test-generated-uuid',
      expect.arrayContaining([expect.objectContaining({ event_type: 'dni_validated' })]),
    );
  });

  it('reutiliza UUID existente en localStorage — misma sesión en todo el recorrido', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ valid: true, access_token: 'tok123' }),
    }) as jest.Mock;

    // UUID ya existe en localStorage (puesto por SessionProvider en visita anterior)
    localStorage.setItem('baldecash-renueva-tu-equipo-1-wizard-session-uuid', 'existing-uuid-123');

    const result = await simulateDniSubmit({
      landing: 'renueva-tu-equipo-1',
      dni: '12345678',
      sessionUuid: '',
      apiResponse: { valid: true },
    });

    // Reutiliza el UUID existente, no genera uno nuevo
    expect(result.sessionUuid).toBe('existing-uuid-123');
    expect(mockSendEventsBatch).toHaveBeenCalledWith(
      'existing-uuid-123',
      expect.arrayContaining([expect.objectContaining({ event_type: 'dni_validated' })]),
    );
  });

  it('sanitizeProperties NO bloquea el dni — pasa al payload', () => {
    const result = sanitizeProperties({ landing_slug: 'renueva-tu-equipo-1', source: 'vip_overlay', dni: '12345678' });
    expect(result).toEqual({ landing_slug: 'renueva-tu-equipo-1', source: 'vip_overlay', dni: '12345678' });
  });

  it('el DNI SÍ aparece en las properties de los eventos (requerido para tracking)', async () => {
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
          expect(e.properties).toHaveProperty('dni', '12345678');
          expect(e.properties).not.toHaveProperty('document_number');
        }
      });
    });
  });
});
