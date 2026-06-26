/**
 * Tests de offerApi (Caso 4 · BAL-1785 · FE-4).
 *
 * Verifica:
 * - getOffer: mapea la respuesta del backend (snake → camel) y el recomendado.
 * - getCatalog: arma los query params de filtros y mapea items.
 * - errores: parsea {detail:{reason}} → OfferApiError con el reason correcto.
 * - selectEquipment: envía variant_id y devuelve el resultado.
 */

import { getOffer, getCatalog, selectEquipment, OfferApiError } from './offerApi';

// Producto en el shape ApiCatalogProduct mínimo que el mapper acepta.
function apiProduct(id: number, finalPrice: number, monthly: number) {
  return {
    id,
    name: `Equipo ${id}`,
    slug: `equipo-${id}`,
    brand: { id: 1, name: 'Marca', slug: 'marca' },
    type: 'laptop',
    condition: 'nueva',
    images: [],
    specs: {},
    pricing: {
      list_price: finalPrice,
      final_price: finalPrice,
      discount_percent: 0,
      available_terms: [6, 12, 18, 24],
      available_initials: [0],
      hook: {
        monthly_price: monthly,
        term_months: 24,
        initial_percent: 0,
        tea: 30,
      },
    },
  };
}

const originalFetch = global.fetch;
afterEach(() => {
  global.fetch = originalFetch;
});

describe('getOffer', () => {
  it('mapea la respuesta del backend a OfferView', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        offer_code: 'OFF-1',
        max_monthly_quota: 245,
        expires_at: '2026-06-28T05:00:00',
        landing_slug: 'home',
        requested_product: { id: 9, variant_id: null, name: 'ZBook', slug: 'zbook', image_url: null },
        recommended: apiProduct(11, 3000, 240),
        alternatives_count: 31,
      }),
    });

    const offer = await getOffer('tok');
    expect(offer.offerCode).toBe('OFF-1');
    expect(offer.maxMonthlyQuota).toBe(245);
    expect(offer.landingSlug).toBe('home');
    expect(offer.requestedProduct?.name).toBe('ZBook');
    expect(offer.recommended?.id).toBe('11');
    expect(offer.alternativesCount).toBe(31);
  });

  it('lanza OfferApiError con el reason del backend (410 expired)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 410,
      json: async () => ({ detail: { reason: 'expired', message: 'Este enlace expiró.' } }),
    });
    await expect(getOffer('tok')).rejects.toMatchObject({ reason: 'expired', status: 410 });
  });

  it('recommended null cuando el backend no lo trae', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ offer_code: 'X', max_monthly_quota: 100, recommended: null }),
    });
    const offer = await getOffer('tok');
    expect(offer.recommended).toBeNull();
  });
});

describe('getCatalog', () => {
  it('arma los query params de filtros y mapea items', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ max_monthly_quota: 245, items: [apiProduct(1, 2000, 120)], count: 1 }),
    });
    global.fetch = fetchMock;

    const res = await getCatalog('tok', {
      brandIds: [3, 5],
      types: ['laptop'],
      usages: ['estudios'],
      sortBy: 'price_desc',
    });

    expect(res.count).toBe(1);
    expect(res.items[0].id).toBe('1');
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain('/public/offer/tok/catalog');
    expect(calledUrl).toContain('brand_ids=3%2C5');
    expect(calledUrl).toContain('types=laptop');
    expect(calledUrl).toContain('usages=estudios');
    expect(calledUrl).toContain('sort_by=price_desc');
  });

  it('sin filtros no agrega query string de filtros', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ max_monthly_quota: 245, items: [], count: 0 }),
    });
    global.fetch = fetchMock;
    await getCatalog('tok');
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).not.toContain('brand_ids');
    expect(calledUrl).not.toContain('types=');
  });
});

describe('selectEquipment', () => {
  it('envía variant_id y devuelve el resultado', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ offer_id: 7, selected_variant_id: 1137, status: 'accepted' }),
    });
    global.fetch = fetchMock;

    const res = await selectEquipment('tok', 1137);
    expect(res.status).toBe('accepted');
    expect(res.selectedVariantId).toBe(1137);

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ variant_id: 1137 });
  });

  it('lanza OfferApiError en token consumido (410)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 410,
      json: async () => ({ detail: { reason: 'consumed', message: 'Ya utilizado.' } }),
    });
    await expect(selectEquipment('tok', 1)).rejects.toBeInstanceOf(OfferApiError);
  });
});
