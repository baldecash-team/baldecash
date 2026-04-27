import { sanitizeProperties, sendEventsBatch, TrackingEvent } from '../eventsApi';

describe('eventsApi', () => {
  describe('sanitizeProperties', () => {
    it('returns undefined for undefined input', () => {
      expect(sanitizeProperties(undefined)).toBeUndefined();
    });

    it('returns undefined for empty object', () => {
      expect(sanitizeProperties({})).toBeUndefined();
    });

    it('passes through safe properties', () => {
      const props = { product_id: 42, brand: 'Lenovo', source: 'catalog' };
      expect(sanitizeProperties(props)).toEqual(props);
    });

    it('strips all blocked PII properties', () => {
      const blocked = {
        value: 'secret',
        field_value: 'secret',
        input_value: 'secret',
        text_value: 'secret',
        password: 'hunter2',
        dni: '12345678',
        email_value: 'a@b.com',
        phone_value: '999999',
        nombre: 'Juan',
        name_value: 'Juan',
        document_number: '12345678',
      };
      expect(sanitizeProperties(blocked)).toBeUndefined();
    });

    it('keeps safe properties while stripping blocked ones', () => {
      const mixed = {
        product_id: 1,
        password: 'hunter2',
        brand: 'HP',
        dni: '12345678',
      };
      expect(sanitizeProperties(mixed)).toEqual({
        product_id: 1,
        brand: 'HP',
      });
    });
  });

  describe('sendEventsBatch', () => {
    const originalFetch = global.fetch;
    const originalWarn = console.warn;

    beforeEach(() => {
      console.warn = jest.fn();
    });

    afterEach(() => {
      global.fetch = originalFetch;
      console.warn = originalWarn;
    });

    it('returns null for empty session', async () => {
      const result = await sendEventsBatch('', [{ event_type: 'page_enter', client_ts: 1, page_url: '/' }]);
      expect(result).toBeNull();
    });

    it('returns null for empty events array', async () => {
      const result = await sendEventsBatch('session-1', []);
      expect(result).toBeNull();
    });

    it('sends sanitized events and returns response', async () => {
      const mockResponse = { accepted: 2, rejected: 0 };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const events: TrackingEvent[] = [
        { event_type: 'page_enter', client_ts: 1000, page_url: '/catalogo', properties: { source: 'nav', password: 'x' } },
        { event_type: 'cta_click', client_ts: 1001, page_url: '/catalogo', properties: { cta_name: 'buy' } },
      ];

      const result = await sendEventsBatch('session-1', events);

      expect(result).toEqual(mockResponse);
      const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(body.session_id).toBe('session-1');
      expect(body.events[0].properties).toEqual({ source: 'nav' });
      expect(body.events[0].properties.password).toBeUndefined();
    });

    it('returns null on HTTP error without throwing', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });

      const result = await sendEventsBatch('session-1', [
        { event_type: 'page_enter', client_ts: 1, page_url: '/' },
      ]);

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith('[Events] Batch rejected:', 500);
    });

    it('returns null on network error without throwing', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await sendEventsBatch('session-1', [
        { event_type: 'page_enter', client_ts: 1, page_url: '/' },
      ]);

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith('[Events] Failed to send batch:', expect.any(Error));
    });
  });
});
