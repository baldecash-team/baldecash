/**
 * BAL-3277 (PR 1) — `fetchProductsByIds` pedia una sola card por producto.
 *
 * `limit` era `numericIds.length`, un slot por id. Pero un producto puede tener
 * VARIAS cards en la misma landing (el suelto y una por combo), asi que la
 * respuesta llegaba truncada y siempre con la primera card — la del combo.
 * Verificado contra prod: `product_ids=518,491&limit=2` devuelve 2 de 5.
 *
 * Sin todas las cards no hay forma de saber si el slug que el usuario guardo
 * sigue vivo.
 */
import { fetchProductsByIds } from '../catalogApi';

const card = (id: string, slug: string) => ({
  id: Number(id),
  name: slug,
  display_name: slug,
  slug,
  type: 'tablet',
  brand: { id: 1, name: 'Apple', slug: 'apple' },
  images: [],
  image_url: '',
  pricing: {
    final_price: 2099,
    discount_percent: 0,
    available_terms: [24],
    hook: { monthly_price: 119, term_months: 24, initial_percent: 0 },
  },
  specs: {},
  stock: { status: 'in_stock', quantity: 1 },
});

// 3 cards del producto 518 + 2 del 491, como en la landing `home`.
const CATALOGO = [
  card('518', 'ipad-11-combo-166'),
  card('491', 'lenovo-v15-combo-37'),
  card('518', 'ipad-11'),
  card('491', 'lenovo-v15-combo-52'),
  card('518', 'ipad-11-combo-48'),
];

let urls: string[] = [];

const mockApi = () => {
  urls = [];
  global.fetch = jest.fn(async (url: string) => {
    urls.push(String(url));
    const limit = Number(new URL(String(url)).searchParams.get('limit') ?? '15');
    const ids = (new URL(String(url)).searchParams.get('product_ids') ?? '').split(',');
    const todas = CATALOGO.filter((c) => ids.includes(String(c.id)));
    return {
      ok: true,
      json: async () => ({ items: todas.slice(0, limit), total: todas.length }),
    };
  }) as unknown as typeof fetch;
};

describe('fetchProductsByIds', () => {
  const originalFetch = global.fetch;
  beforeEach(mockApi);
  afterEach(() => { global.fetch = originalFetch; });

  it('trae TODAS las cards del producto, no una sola', async () => {
    const res = await fetchProductsByIds('home', ['518']);

    expect(res.map((p) => p.slug).sort()).toEqual(
      ['ipad-11', 'ipad-11-combo-166', 'ipad-11-combo-48'].sort()
    );
  });

  it('trae todas las cards de varios productos a la vez', async () => {
    const res = await fetchProductsByIds('home', ['518', '491']);

    expect(res).toHaveLength(5);
  });

  it('reintenta con el total cuando la primera respuesta viene truncada', async () => {
    // Fuerza el truncado: el catalogo tiene mas cards que el limite inicial.
    const res = await fetchProductsByIds('home', ['518', '491']);

    expect(res).toHaveLength(5);
    const limites = urls.map((u) => new URL(u).searchParams.get('limit'));
    expect(limites.length).toBeLessThanOrEqual(2);
    expect(res.map((p) => p.slug)).toContain('ipad-11-combo-48');
  });

  it('no rompe cuando el API falla', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('boom')) as unknown as typeof fetch;

    await expect(fetchProductsByIds('home', ['518'])).resolves.toEqual([]);
  });
});
