/// <reference types="jest" />
/**
 * `resumeEvents` — emisor de eventos de la ruta `/kyc/[token]`.
 *
 * El `sink` es inyectable (mismo patrón que `admissionEvents` en
 * `admision/_lib/events.ts`), así que estos tests no necesitan mockear
 * `eventsApi`/`fetch`: inyectan un sink de prueba y verifican directamente
 * los argumentos con los que se llama.
 */
import { resumeEvents } from '../resumeEvents';

describe('resumeEvents', () => {
  it('usa el token del link como session_id', () => {
    const sink = jest.fn();
    const events = resumeEvents('TOK-123', sink);

    events.track('kyc_resume_link_opened', { application_code: 'APP-1' });

    expect(sink).toHaveBeenCalledWith('TOK-123', expect.any(Array));
  });

  it('el evento lleva application_code en properties cuando esta disponible', () => {
    const sink = jest.fn();
    const events = resumeEvents('TOK-123', sink);

    events.track('kyc_resumed', { application_code: 'APP-1' });

    const [, sentEvents] = sink.mock.calls[0];
    expect(sentEvents[0]).toEqual(
      expect.objectContaining({
        event_type: 'kyc_resumed',
        properties: expect.objectContaining({ application_code: 'APP-1', token: 'TOK-123' }),
      }),
    );
  });

  it('kyc_resume_link_expired: sin application_code (no se conoce por diseno), pero con reason', () => {
    const sink = jest.fn();
    const events = resumeEvents('TOK-123', sink);

    events.track('kyc_resume_link_expired', { reason: 'expired' });

    const [, sentEvents] = sink.mock.calls[0];
    expect(sentEvents[0].properties).toEqual({ token: 'TOK-123', reason: 'expired' });
  });

  it('incluye client_ts y page_url en cada evento', () => {
    const sink = jest.fn();
    const events = resumeEvents('TOK-123', sink);

    events.track('kyc_resume_link_opened', { application_code: 'APP-1' });

    const [, sentEvents] = sink.mock.calls[0];
    expect(typeof sentEvents[0].client_ts).toBe('number');
    expect(typeof sentEvents[0].page_url).toBe('string');
  });

  it('fire-and-forget: un sink que tira no rompe al caller', () => {
    const sink = jest.fn(() => {
      throw new Error('boom');
    });
    const events = resumeEvents('TOK-123', sink);

    expect(() => events.track('kyc_resumed', { application_code: 'APP-1' })).not.toThrow();
  });
});
