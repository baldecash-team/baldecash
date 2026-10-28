import {
  verificarDniDelLinkEspecial,
  MENSAJE_LINK_ESPECIAL_DNI,
} from '../specialLinkDni';
import { MENSAJE_LINK_ESPECIAL_VENCIDO } from '../specialLink';

let fetchMock: jest.Mock;

function responde(body: unknown, ok = true) {
  fetchMock.mockResolvedValueOnce({ ok, status: ok ? 200 : 500, json: async () => body });
}

beforeEach(() => {
  fetchMock = jest.fn();
  global.fetch = fetchMock as unknown as typeof fetch;
});

describe('verificarDniDelLinkEspecial', () => {
  it('manda token, landing y dni al resolver público', async () => {
    responde({ valid: true, reason: null, dni_matches: true });
    await verificarDniDelLinkEspecial('tok/+=', 'home', '70020010');
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain('/public/special-link/tok%2F%2B%3D?');
    expect(url).toContain('landing=home');
    expect(url).toContain('dni=70020010');
  });

  it('DNI que coincide: sin error', async () => {
    responde({ valid: true, reason: null, dni_matches: true });
    expect(await verificarDniDelLinkEspecial('t', 'home', '70020010')).toEqual({ error: null });
  });

  it('DNI distinto: el mensaje exacto del link personal', async () => {
    responde({ valid: true, reason: null, dni_matches: false });
    expect(await verificarDniDelLinkEspecial('t', 'home', '99999900'))
      .toEqual({ error: MENSAJE_LINK_ESPECIAL_DNI });
    expect(MENSAJE_LINK_ESPECIAL_DNI).toBe('Este link es personal y no corresponde a tu DNI.');
  });

  it.each(['expired', 'consumed', 'revoked', 'invalid', 'mismatch'])(
    'link no válido (%s): el mensaje de link vencido',
    async (reason) => {
      responde({ valid: false, reason, dni_matches: null });
      expect(await verificarDniDelLinkEspecial('t', 'home', '70020010'))
        .toEqual({ error: MENSAJE_LINK_ESPECIAL_VENCIDO });
    },
  );

  it('switch apagado (disabled): no bloquea, decide el envío', async () => {
    responde({ valid: false, reason: 'disabled', dni_matches: null });
    expect(await verificarDniDelLinkEspecial('t', 'home', '70020010')).toBeNull();
  });

  it('falla de red: no bloquea', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    expect(await verificarDniDelLinkEspecial('t', 'home', '70020010')).toBeNull();
  });

  it('HTTP 500: no bloquea', async () => {
    responde({}, false);
    expect(await verificarDniDelLinkEspecial('t', 'home', '70020010')).toBeNull();
  });

  it('respuesta sin dni_matches (backend viejo): no bloquea', async () => {
    responde({ valid: true, reason: null });
    expect(await verificarDniDelLinkEspecial('t', 'home', '70020010')).toBeNull();
  });
});
