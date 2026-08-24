/**
 * @jest-environment node
 *
 * `fetchReferralBannerByRef` — la franja resuelta con el `ref` del hub.
 *
 * Entorno `node` por lo mismo que su gemelo `referralBannerApi.test.ts`: el
 * módulo usa `AbortSignal.timeout`, que el jsdom global de este repo no expone.
 * Bajo jsdom todo se caería al catch y los tests pasarían por el motivo
 * equivocado justo en los casos positivos.
 *
 * Este camino importa más que el de `promotor`: `ref` es el único identificador
 * que viaja en TODOS los flyers, así que es el que decide si un estudiante que
 * escanea un QR ve o no el nombre de quien se lo dio.
 */
import { fetchReferralBannerByRef } from '../referralBannerApi';

const REF = 'ekscah';

const RESPUESTA_OK = {
  ok: true,
  codigo: REF,
  promotor: { nombre: 'Aned' },
  activacion_activa: true,
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

describe('resuelve la franja', () => {
  it('devuelve el primer nombre del promotor', async () => {
    mockFetch(jest.fn(() => respuesta(RESPUESTA_OK)));

    expect(await fetchReferralBannerByRef(REF)).toEqual({
      firstName: 'Aned',
      phoneDisplay: null,
      whatsappUrl: null,
      promoterCode: REF,
      reason: 'ref',
    });
  });

  it('la franja va sin teléfono, no a medias', async () => {
    // El endpoint del hub expone sólo el nombre a propósito. `ReferralBanner`
    // pinta la versión sin chip; un `wa.me` sin destinatario abre WhatsApp en
    // blanco y es peor que no tener el botón.
    mockFetch(jest.fn(() => respuesta(RESPUESTA_OK)));

    const banner = await fetchReferralBannerByRef(REF);
    expect(banner?.whatsappUrl).toBeNull();
    expect(banner?.phoneDisplay).toBeNull();
  });

  it('acepta el código en mayúsculas y lo normaliza', async () => {
    // Un `ref` que pasó por un cliente de correo llega así, y ese código existe.
    const fetchMock = mockFetch(jest.fn(() => respuesta(RESPUESTA_OK)));

    expect((await fetchReferralBannerByRef('EKSCAH'))?.promoterCode).toBe(REF);
    expect(fetchMock.mock.calls[0][0]).toContain(`/api/publico/referido/${REF}`);
  });

  it('pega contra el hub, no contra ws2', async () => {
    // El `ref` lo emite el hub y sólo él sabe a quién corresponde: si esta URL
    // apunta al API de siempre, la franja no se resuelve nunca.
    const fetchMock = mockFetch(jest.fn(() => respuesta(RESPUESTA_OK)));
    await fetchReferralBannerByRef(REF);

    expect(fetchMock.mock.calls[0][0]).toContain('promotores.baldecash.com');
  });
});

describe('no gasta el round-trip cuando no puede existir', () => {
  it.each([
    ['vacío', ''],
    ['nulo', null],
    ['indefinido', undefined],
    ['corto', 'eksca'],
    ['largo', 'ekscaha'],
    ['con caracteres ambiguos', 'eksca0'],
    ['una URL entera pegada', 'https://promotores.baldecash.com/r/ekscah'],
  ])('%s no llama al API', async (_caso, valor) => {
    const fetchMock = mockFetch(jest.fn(() => respuesta(RESPUESTA_OK)));

    expect(await fetchReferralBannerByRef(valor as string | null)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('nunca lanza: la landing carga igual', () => {
  it('el API responde que no', async () => {
    mockFetch(jest.fn(() => respuesta({ ok: false, error: 'Link no válido' })));
    expect(await fetchReferralBannerByRef(REF)).toBeNull();
  });

  it('responde ok pero sin nombre utilizable', async () => {
    // Nunca un placeholder: sin nombre no hay franja.
    mockFetch(jest.fn(() => respuesta({ ok: true, promotor: { nombre: '   ' } })));
    expect(await fetchReferralBannerByRef(REF)).toBeNull();
  });

  it('HTTP no-2xx', async () => {
    mockFetch(jest.fn(() => respuesta({}, false)));
    expect(await fetchReferralBannerByRef(REF)).toBeNull();
  });

  it('el fetch explota', async () => {
    // Un throw acá es la pantalla de error de Next para TODA la página. La
    // franja es decorativa; la landing no.
    mockFetch(jest.fn(() => Promise.reject(new Error('timeout'))));
    await expect(fetchReferralBannerByRef(REF)).resolves.toBeNull();
  });

  it('el cuerpo no es JSON', async () => {
    mockFetch(jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.reject(new Error('bad json')) })));
    await expect(fetchReferralBannerByRef(REF)).resolves.toBeNull();
  });
});
