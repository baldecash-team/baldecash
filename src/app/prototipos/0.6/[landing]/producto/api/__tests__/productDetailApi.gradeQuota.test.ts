/// <reference types="jest" />
/**
 * BAL-2861: la tarjeta de grado muestra la cuota, no el precio de lista.
 *
 * El API expone `min_term_quota` por grado (la cuota del plazo más corto). El
 * mapper tiene que traerla y normalizar `null` a `undefined`, que es como el
 * dominio modela la ausencia: así el null no viaja al resto del front y nadie
 * río abajo tiene que acordarse de que `null !== undefined` es true en JS.
 *
 * Lo que impide el "S/0" es el guard del render, no esto — ahí se descarta
 * también el 0. Son dos defensas distintas.
 */
import { fetchProductDetail } from '../productDetailApi';

function baseApiResponse(gradeSiblings: unknown[]) {
  return {
    product: {
      id: '515',
      slug: 'ideapad-slim-3-15irh8-i7-lple0000817',
      name: 'IdeaPad Slim 3 15IRH8 i7',
      display_name: 'IdeaPad Slim 3 15IRH8 i7',
      brand: 'Lenovo',
      category: 'laptops',
      type: 'laptop',
      price: '2296.00',
      original_price: null,
      discount: null,
      lowest_quota: '122',
      original_quota: null,
      images: [],
      colors: [],
      grade_siblings: gradeSiblings,
      description: '',
      short_description: '',
      badges: [],
      specs: [],
      ports: [],
      software: [],
      features: [],
      battery_life: null,
      fast_charge: null,
      has_os: false,
      os_name: null,
      warranty: null,
      stock: 1,
      rating: null,
      review_count: 0,
    },
    combo: null,
    payment_plans: [],
    similar_products: [],
    limitations: [],
    certifications: [],
    is_available: true,
  };
}

/** Fila tal como llega hoy del API de producción, verificada contra prod. */
function apiSibling(overrides: Record<string, unknown> = {}) {
  return {
    grade: 'A',
    product_id: 515,
    slug: 'ideapad-slim-3-15irh8-i7-lple0000817',
    price: 2296.0,
    stock_available: 1,
    is_available: true,
    lowest_quota: 122.0,
    lowest_quota_initial_percent: 0,
    lowest_quota_term_months: 24,
    min_term_quota: 410.0,
    min_term_months: 6,
    ...overrides,
  };
}

function mockFetchOnce(payload: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => payload,
  }) as unknown as typeof fetch;
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('gradeSiblings.minTermQuota (vía fetchProductDetail)', () => {
  it('mapea min_term_quota del API', async () => {
    mockFetchOnce(baseApiResponse([apiSibling()]));

    const result = await fetchProductDetail('family-farms-baldecash-a', 'x');

    expect(result!.product.gradeSiblings![0].minTermQuota).toBe(410);
  });

  it('normaliza null a undefined, no lo deja pasar', async () => {
    // El dominio modela la ausencia como `undefined`; el null del wire no debe
    // filtrarse. Sin este test, quitar el `?? undefined` no rompe nada visible.
    mockFetchOnce(baseApiResponse([apiSibling({ min_term_quota: null })]));

    const result = await fetchProductDetail('family-farms-baldecash-a', 'x');

    expect(result!.product.gradeSiblings![0].minTermQuota).toBeUndefined();
  });

  it('deja undefined cuando el API todavía no manda el campo', async () => {
    const sinCampo = apiSibling();
    delete (sinCampo as Record<string, unknown>).min_term_quota;
    mockFetchOnce(baseApiResponse([sinCampo]));

    const result = await fetchProductDetail('family-farms-baldecash-a', 'x');

    expect(result!.product.gradeSiblings![0].minTermQuota).toBeUndefined();
  });

  it('no toca el precio de lista: el panel de ahorro lo sigue usando', async () => {
    mockFetchOnce(baseApiResponse([apiSibling()]));

    const result = await fetchProductDetail('family-farms-baldecash-a', 'x');

    expect(result!.product.gradeSiblings![0].price).toBe(2296);
  });
});
