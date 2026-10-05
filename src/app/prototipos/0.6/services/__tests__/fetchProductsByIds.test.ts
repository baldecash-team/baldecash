/**
 * BAL-3277 (PR 1) — `fetchProductsByIds` pedia una sola card por producto.
 *
 * `limit` era `numericIds.length`, un slot por id. Pero un producto puede tener
 * VARIAS cards en la misma landing (el suelto y una por combo), asi que la
 * respuesta llegaba truncada. Verificado contra prod:
 * `product_ids=518,491&limit=2` devuelve 2 de 5, con `limit=20` devuelve 5.
 *
 * `fetchAllCardsByIds` las trae todas (lo que necesita la validacion de
 * disponibilidad); `fetchProductsByIds` sigue devolviendo una por producto,
 * que es lo que esperan el comparador, la wishlist y el carrito.
 */
import { fetchAllCardsByIds, fetchProductsByIds } from '../catalogApi';

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

/** 3 cards del 518 y 2 del 491, como en la landing `home`. */
const CATALOGO = [
  card('518', 'ipad-11-combo-166'),
  card('491', 'lenovo-v15-combo-37'),
  card('518', 'ipad-11'),
  card('491', 'lenovo-v15-combo-52'),
  card('518', 'ipad-11-combo-48'),
];

const LIMIT_MAX = 500;
let pedidos: { limit: number; ids: string[] }[] = [];

/** Mock fiel al API: trunca por `limit`, informa `total`/`has_more`, 422 sobre 500. */
const mockApi = (catalogo = CATALOGO) => {
  pedidos = [];
  global.fetch = jest.fn(async (url: string) => {
    const u = new URL(String(url));
    const limit = Number(u.searchParams.get('limit') ?? '15');
    const ids = (u.searchParams.get('product_ids') ?? '').split(',');
    pedidos.push({ limit, ids });

    if (limit > LIMIT_MAX) {
      return { ok: false, status: 422, json: async () => ({ detail: 'limit <= 500' }) };
    }
    const todas = catalogo.filter((c) => ids.includes(String(c.id)));
    const items = todas.slice(0, limit);
    return {
      ok: true,
      json: async () => ({ items, total: todas.length, has_more: items.length < todas.length }),
    };
  }) as unknown as typeof fetch;
};

describe('fetchAllCardsByIds', () => {
  const originalFetch = global.fetch;
  beforeEach(() => mockApi());
  afterEach(() => { global.fetch = originalFetch; });

  it('trae TODAS las cards del producto, no una sola', async () => {
    const res = await fetchAllCardsByIds('home', ['518']);

    expect(res?.map((p) => p.slug).sort()).toEqual(
      ['ipad-11', 'ipad-11-combo-166', 'ipad-11-combo-48'].sort()
    );
    expect(pedidos).toHaveLength(1);
  });

  it('reintenta con el total cuando la primera respuesta viene truncada', async () => {
    // 1 id -> primer limit = 3, pero el producto tiene 5 cards: trunca de verdad.
    const cinco = [
      card('518', 'a'), card('518', 'b'), card('518', 'c'), card('518', 'd'), card('518', 'e'),
    ];
    mockApi(cinco);

    const res = await fetchAllCardsByIds('home', ['518']);

    expect(pedidos.map((p) => p.limit)).toEqual([3, 5]);
    expect(res).toHaveLength(5);
  });

  it('no reintenta cuando la primera respuesta ya vino completa', async () => {
    await fetchAllCardsByIds('home', ['491']);

    expect(pedidos).toHaveLength(1);
  });

  it('nunca pide por encima del tope de 500 que el API rechaza con 422', async () => {
    const ids = Array.from({ length: 300 }, (_, i) => String(1000 + i));

    await fetchAllCardsByIds('home', ids);

    expect(Math.max(...pedidos.map((p) => p.limit))).toBeLessThanOrEqual(LIMIT_MAX);
  });

  it('devuelve null cuando el API falla, para no confundirlo con "no hay nada"', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('boom')) as unknown as typeof fetch;

    await expect(fetchAllCardsByIds('home', ['518'])).resolves.toBeNull();
  });

  it('devuelve lista vacia sin pegarle al API cuando no hay ids', async () => {
    await expect(fetchAllCardsByIds('home', [])).resolves.toEqual([]);
    expect(pedidos).toHaveLength(0);
  });
});

describe('fetchProductsByIds', () => {
  const originalFetch = global.fetch;
  beforeEach(() => mockApi());
  afterEach(() => { global.fetch = originalFetch; });

  it('devuelve UNA card por producto, no todas sus cards', async () => {
    // El comparador, la wishlist y el carrito renderizan una fila por id: si
    // llegaran las 3 cards del iPad, saldrian columnas y keys duplicadas.
    const res = await fetchProductsByIds('home', ['518', '491']);

    expect(res.map((p) => p.id)).toEqual(['518', '491']);
  });

  it('devuelve lista vacia cuando el API falla', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('boom')) as unknown as typeof fetch;

    await expect(fetchProductsByIds('home', ['518'])).resolves.toEqual([]);
  });
});
