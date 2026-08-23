/**
 * Tests de offerApi (Caso 4 · BAL-1785 · FE-4).
 *
 * Verifica:
 * - getOffer: mapea la respuesta del backend (snake → camel) y el recomendado.
 * - getCatalog: arma los query params de filtros y mapea items.
 * - errores: parsea {detail:{reason}} → OfferApiError con el reason correcto.
 * - selectEquipment: envía variant_id y devuelve el resultado.
 */

import { getOffer, getCatalog, selectEquipment, acceptOffer, OfferApiError } from './offerApi';

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
      }),
    });

    const offer = await getOffer('tok');
    expect(offer.offerCode).toBe('OFF-1');
    expect(offer.maxMonthlyQuota).toBe(245);
    expect(offer.landingSlug).toBe('home');
    expect(offer.requestedProduct?.name).toBe('ZBook');
    expect(offer.recommended?.id).toBe('11');
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

describe('getOffer — oferta estándar con accesorios', () => {
  it('mapea offer_type, la lista de accesorios/seguros y su cuota', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        case: 'standard',
        offer_code: 'OFF-STD-1',
        offer_type: 'upsell',
        client_name: 'Maria',
        product_name: 'Laptop V15',
        product_image_url: 'https://cdn/equipo.png',
        monthly_payment: 180,
        term_months: 24,
        initial_payment: 300,
        tea: 75,
        total_amount: 4320,
        accessories: [
          {
            id: 21,
            product_id: 1295,
            name: 'Audífonos',
            image_url: 'https://cdn/acc.png',
            price: 617.5,
            monthly_payment: 53,
          },
        ],
        insurances: [
          { id: 30, product_id: null, name: 'Seguro Robo', image_url: null, price: 120, monthly_payment: 10 },
        ],
        addons_monthly_payment: 63,
      }),
    });

    const offer = await getOffer('tok');
    expect(offer.offerCase).toBe('standard');
    const std = offer.standardOffer!;
    expect(std.offerType).toBe('upsell');
    expect(std.productImageUrl).toBe('https://cdn/equipo.png');
    expect(std.accessories).toHaveLength(1);
    expect(std.accessories[0]).toMatchObject({ name: 'Audífonos', price: 617.5, monthly: 53, includedFree: false });
    expect(std.insurances[0]).toMatchObject({ name: 'Seguro Robo', monthly: 10, imageUrl: null });
    expect(std.addonsMonthlyPayment).toBe(63);
  });

  it('tolera una oferta estándar sin las listas (backend viejo)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        case: 'standard',
        offer_code: 'OFF-STD-2',
        product_name: 'Laptop V15',
        monthly_payment: 149,
      }),
    });

    const std = (await getOffer('tok')).standardOffer!;
    expect(std.accessories).toEqual([]);
    expect(std.insurances).toEqual([]);
    expect(std.addonsMonthlyPayment).toBe(0);
    expect(std.offerType).toBeNull();
  });
});

describe('getOffer — oferta estándar con rangos de plazo/inicial', () => {
  it('mapea la grilla de opciones', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        case: 'standard',
        offer_code: 'OFF-STD-3',
        product_name: 'Laptop V15',
        term_months: 24,
        initial_payment_percent: 10,
        monthly_payment: 203,
        options: [
          {
            term_months: 12,
            initial_payment_percent: 20,
            initial_payment: 600,
            monthly_payment: 279,
            tea: 75,
            tcea: 90.862,
            total_amount: 3948,
          },
          {
            term_months: 24,
            initial_payment_percent: 10,
            initial_payment: 300,
            monthly_payment: 203,
            tea: 75,
            tcea: 88.1,
            total_amount: 5172,
          },
        ],
      }),
    });

    const std = (await getOffer('tok')).standardOffer!;
    expect(std.options).toHaveLength(2);
    expect(std.options[0]).toEqual({
      termMonths: 12,
      initialPercent: 20,
      initialPayment: 600,
      monthlyPayment: 279,
      tea: 75,
      tcea: 90.862,
      totalAmount: 3948,
    });
  });

  it('una oferta sin rangos no trae opciones', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ case: 'standard', offer_code: 'OFF-STD-4', monthly_payment: 149 }),
    });
    expect((await getOffer('tok')).standardOffer!.options).toEqual([]);
  });
});

describe('acceptOffer', () => {
  it('manda la combinación elegida', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ offer_code: 'X', status: 'accepted' }) });
    global.fetch = fetchMock;

    await acceptOffer('tok', { term: 12, initialPercent: 20 });

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ term: 12, initial_percent: 20 });
  });

  it('sin elección manda un body vacío', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ offer_code: 'X', status: 'accepted' }) });
    global.fetch = fetchMock;

    await acceptOffer('tok');

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({});
  });
});
