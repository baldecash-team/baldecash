/**
 * @jest-environment node
 *
 * `fetchReferralBanner` corre en el render del server component de la landing.
 *
 * El entorno `node` no es cosmético: el módulo usa `AbortSignal.timeout`, que el
 * `jsdom` global de este repo (jest.config.js) NO expone. Bajo jsdom la llamada
 * se cae al catch y la función devuelve `null` SIEMPRE — o sea, los tests
 * pasarían por el motivo equivocado justo en los casos positivos.
 *
 * Lo único que este archivo protege es la propiedad que hace que sea seguro
 * ponerlo ahí: pase lo que pase, devuelve `null` y NO lanza. Un `throw` en un
 * server component es la pantalla de error de Next para toda la página — la
 * franja es decorativa, la landing no.
 */
import { fetchReferralBanner } from '../referralBannerApi';

const UTM_TERM = 'punto_upn__promo_4a2eji__act_8x7idb';

const RESPUESTA_OK = {
  show: true,
  reason: 'ok',
  promoter_code: 'jperez',
  first_name: 'Marco',
  phone_display: '999 888 777',
  whatsapp_url: 'https://wa.me/51999888777?text=Hola%20Marco',
};

function mockFetch(impl: jest.Mock) {
  global.fetch = impl as unknown as typeof fetch;
  return impl;
}

function respuesta(body: unknown, ok = true) {
  return Promise.resolve({ ok, json: () => Promise.resolve(body) });
}

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('fetchReferralBanner · cortes antes de la red', () => {
  it('sin promotor no llama al API', async () => {
    const f = mockFetch(jest.fn());
    await expect(fetchReferralBanner(null, UTM_TERM)).resolves.toBeNull();
    expect(f).not.toHaveBeenCalled();
  });

  it('sin el token en utm_term tampoco llama al API', async () => {
    // El `?promotor=` suelto es justo la forma de un intento de enumeración: no
    // vale ni el round-trip.
    const f = mockFetch(jest.fn());
    await expect(fetchReferralBanner('jperez', 'punto_upn__act_8x7idb')).resolves.toBeNull();
    expect(f).not.toHaveBeenCalled();
  });
});

describe('fetchReferralBanner · respuesta del API', () => {
  it('mapea el caso completo', async () => {
    mockFetch(jest.fn(() => respuesta(RESPUESTA_OK)));
    await expect(fetchReferralBanner('jperez', UTM_TERM)).resolves.toEqual({
      firstName: 'Marco',
      phoneDisplay: '999 888 777',
      whatsappUrl: 'https://wa.me/51999888777?text=Hola%20Marco',
      promoterCode: 'jperez',
      reason: 'ok',
    });
  });

  it('manda promotor y utm_term codificados', async () => {
    const f = mockFetch(jest.fn(() => respuesta(RESPUESTA_OK)));
    await fetchReferralBanner('jperez', 'punto_upn-breña__promo_4a2eji');
    const url = String(f.mock.calls[0][0]);
    expect(url).toContain('promotor=jperez');
    expect(url).toContain(encodeURIComponent('punto_upn-breña__promo_4a2eji'));
  });

  it('show: false devuelve null', async () => {
    mockFetch(jest.fn(() => respuesta({ ...RESPUESTA_OK, show: false })));
    await expect(fetchReferralBanner('jperez', UTM_TERM)).resolves.toBeNull();
  });

  it('sin teléfono devuelve la franja sin link', async () => {
    mockFetch(
      jest.fn(() =>
        respuesta({
          ...RESPUESTA_OK,
          reason: 'sin_telefono',
          phone_display: null,
          whatsapp_url: null,
        }),
      ),
    );
    const r = await fetchReferralBanner('jperez', UTM_TERM);
    expect(r?.firstName).toBe('Marco');
    expect(r?.whatsappUrl).toBeNull();
  });
});

describe('fetchReferralBanner · degradación', () => {
  it('un 500 del API no lanza: devuelve null', async () => {
    mockFetch(jest.fn(() => respuesta({}, false)));
    await expect(fetchReferralBanner('jperez', UTM_TERM)).resolves.toBeNull();
  });

  it('un timeout no lanza: devuelve null', async () => {
    mockFetch(jest.fn(() => Promise.reject(new Error('TimeoutError'))));
    await expect(fetchReferralBanner('jperez', UTM_TERM)).resolves.toBeNull();
  });

  it('un body corrupto no lanza: devuelve null', async () => {
    mockFetch(
      jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.reject(new Error('bad json')) })),
    );
    await expect(fetchReferralBanner('jperez', UTM_TERM)).resolves.toBeNull();
  });

  it('pide la respuesta cacheada una hora y con timeout propio', async () => {
    // Sin `revalidate` esto es una consulta a Aurora por pageview en la página
    // de más tráfico del negocio; sin `signal` no hay techo de espera.
    const f = mockFetch(jest.fn(() => respuesta(RESPUESTA_OK)));
    await fetchReferralBanner('jperez', UTM_TERM);
    const opciones = f.mock.calls[0][1];
    expect(opciones.next.revalidate).toBe(3600);
    expect(opciones.signal).toBeDefined();
  });
});
