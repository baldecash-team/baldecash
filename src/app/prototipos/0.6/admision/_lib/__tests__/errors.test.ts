import { friendlyError, attemptsCopy } from '../errors';

describe('admision/errors', () => {
  describe('friendlyError', () => {
    it('maps network errors to a warm message', () => {
      const msg = friendlyError({ code: 'network', message: 'TypeError: failed' });
      expect(msg.toLowerCase()).toContain('conect');
      expect(msg).not.toContain('TypeError');
    });

    it('maps invalid_code reason to a friendly message mentioning the code', () => {
      const msg = friendlyError({ reason: 'invalid_code', message: 'raw' });
      expect(msg.toLowerCase()).toContain('código');
    });

    it('handles cooldown reason gracefully (no raw message leak)', () => {
      const msg = friendlyError({ reason: 'cooldown', message: 'wait 45s' });
      expect(msg.toLowerCase()).toMatch(/espera|moment|nuevo/);
    });

    it('maps expired reason', () => {
      const msg = friendlyError({ reason: 'expired' });
      expect(msg.toLowerCase()).toContain('venc');
    });

    it('falls back to the backend message when no mapping matches', () => {
      const msg = friendlyError({ code: 'http_400', message: 'Algo específico del backend' });
      expect(msg).toBe('Algo específico del backend');
    });

    it('uses a generic fallback when there is no message at all', () => {
      const msg = friendlyError({});
      expect(msg.length).toBeGreaterThan(0);
    });
  });

  describe('attemptsCopy', () => {
    it('mentions the 3-attempt standard', () => {
      expect(attemptsCopy(1)).toContain('3');
    });

    it('computes remaining attempts out of 3', () => {
      expect(attemptsCopy(1)).toMatch(/2.*de.*3/);
    });

    it('does not show negative remaining', () => {
      expect(attemptsCopy(5)).toMatch(/0.*de.*3/);
    });
  });
});
