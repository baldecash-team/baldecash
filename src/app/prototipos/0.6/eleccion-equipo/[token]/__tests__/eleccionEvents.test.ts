/// <reference types="jest" />
/**
 * `eleccionEvents` — emisor de eventos de la ruta `/eleccion-equipo/[token]`.
 *
 * El `sink` es inyectable (mismo patrón que `resumeEvents` del KYC), así que
 * estos tests no mockean `eventsApi` ni `fetch`.
 */
import { eleccionEvents } from '../eleccionEvents';

describe('eleccionEvents', () => {
  it('usa el token del link como session_id', () => {
    const sink = jest.fn();
    eleccionEvents('TOK-123', sink).track('equipment_selection_link_open', { units_count: 3 });

    expect(sink).toHaveBeenCalledWith('TOK-123', expect.any(Array));
  });

  it('el evento lleva el token y las propiedades del call site', () => {
    const sink = jest.fn();
    eleccionEvents('TOK-123', sink).track('equipment_selection_gallery_open', {
      unit_id: 7,
      display_number: 2,
    });

    const [, eventos] = sink.mock.calls[0];
    expect(eventos[0]).toEqual(
      expect.objectContaining({
        event_type: 'equipment_selection_gallery_open',
        properties: { token: 'TOK-123', unit_id: 7, display_number: 2 },
      }),
    );
  });

  it('incluye client_ts y page_url en cada evento', () => {
    const sink = jest.fn();
    eleccionEvents('TOK-123', sink).track('equipment_selection_confirmed', { unit_id: 7 });

    const [, eventos] = sink.mock.calls[0];
    expect(typeof eventos[0].client_ts).toBe('number');
    expect(typeof eventos[0].page_url).toBe('string');
  });

  it('fire-and-forget: un sink que tira no rompe el flujo del cliente', () => {
    const sink = jest.fn(() => { throw new Error('boom'); });
    const events = eleccionEvents('TOK-123', sink);

    expect(() => events.track('equipment_selection_error', { reason: 'x' })).not.toThrow();
  });
});
