/**
 * `getSolicitarConfig` — qué pasa cuando la config NO se puede leer.
 *
 * El 403 (landing con gate, token ausente o vencido) devolvía
 * `DEFAULT_SOLICITAR_FLOW`, y ese default no es neutro: afirma `accessories` e
 * `insurance`, y omite `kyc`. En las landings de Family Farms —que tienen
 * justo lo contrario— un token perdido se traducía en un wizard que se iba a
 * /complementos, rebotaba a la confirmación sin `code` y terminaba en la
 * pantalla de demostración SIN haber creado la solicitud. Medido en prod: el
 * ~17% de las llamadas de esas landings salió sin token.
 *
 * El resto de los fallos (red, 5xx) conserva el default a propósito: ahí no hay
 * evidencia de daño y las landings públicas coinciden con él.
 */

import {
  getSolicitarConfig,
  DEFAULT_SOLICITAR_FLOW,
  SolicitarConfigUnavailableError,
} from '../landingApi';
import { clearVipData } from '../../components/hero/DniModal';

const SLUG = 'family-farms-baldecash-b';

function stubLocation() {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { reload: jest.fn(), assign: jest.fn(), search: '', pathname: '/', href: '' },
  });
}

function mockFetch(status: number, body: unknown = {}) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as unknown as typeof fetch;
}

describe('getSolicitarConfig — config que no se pudo leer', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    stubLocation();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    clearVipData(SLUG);
    jest.restoreAllMocks();
  });

  it('403: NO inventa la config, propaga que es desconocida', async () => {
    mockFetch(403, { detail: 'VIP access token required' });

    await expect(getSolicitarConfig(SLUG)).rejects.toBeInstanceOf(
      SolicitarConfigUnavailableError,
    );
  });

  it('404: sí usa el default — es lo mismo que responde el backend sin config', async () => {
    mockFetch(404, { detail: 'Landing not found' });

    await expect(getSolicitarConfig(SLUG)).resolves.toEqual(DEFAULT_SOLICITAR_FLOW);
  });

  it('500 y errores de red: default, como siempre', async () => {
    mockFetch(500);
    await expect(getSolicitarConfig(SLUG)).resolves.toEqual(DEFAULT_SOLICITAR_FLOW);

    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;
    await expect(getSolicitarConfig(SLUG)).resolves.toEqual(DEFAULT_SOLICITAR_FLOW);
  });

  it('200: devuelve las secciones de la landing, ordenadas', async () => {
    mockFetch(200, {
      sections: [
        { type: 'kyc', enabled: true, order: 5 },
        { type: 'wizard_steps', enabled: true, order: 2 },
        { type: 'accessories', enabled: false, order: 1 },
      ],
      is_coupon_required: true,
    });

    const cfg = await getSolicitarConfig(SLUG);

    expect(cfg.sections.map((s) => s.type)).toEqual(['accessories', 'wizard_steps', 'kyc']);
    expect(cfg.is_coupon_required).toBe(true);
  });
});
