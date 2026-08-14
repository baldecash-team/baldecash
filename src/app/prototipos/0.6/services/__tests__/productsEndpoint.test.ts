import { fetchCatalogData } from '../catalogApi';

/**
 * El front tenia una lista quemada de 2 slugs para elegir entre `/products` y
 * `/products/best-offer`; `system_config` tenia 33. Dos fuentes de verdad para
 * la misma decision, ya divergidas.
 *
 * La del front era ademas redundante: el backend aplica el hook best-offer por
 * su cuenta leyendo `catalog.best_offer_landing_slugs`
 * (ws2 catalog.py:504-510, BAL-2874). Verificado contra produccion comparando
 * los dos endpoints producto por producto y paginando el catalogo completo:
 * `home` 31/31 y `copia-home` 27/27, cero diferencias en cuota, plazo, inicial,
 * frecuencia y precio (BAL-3002).
 */

function mockFetch() {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ items: [], total: 0, filters: {} }),
  }) as unknown as typeof fetch;
}

function urlPedida(): string {
  return (global.fetch as jest.Mock).mock.calls[0][0] as string;
}

describe('fetchCatalogData — endpoint de productos', () => {
  beforeEach(mockFetch);

  // `home` y `copia-home` son las que estaban en la lista quemada; `ucv` y
  // `zona-gamer` las que no. Todas deben pedir lo mismo.
  it.each(['home', 'copia-home', 'ucv', 'zona-gamer'])(
    'pide /products en %s',
    async (slug) => {
      await fetchCatalogData(slug, {});
      // El path tiene que TERMINAR en /products: `toContain` sola pasaria
      // igual con /products/best-offer.
      expect(urlPedida()).toMatch(
        new RegExp(`/public/landing/${slug}/products(\\?|$)`),
      );
    },
  );

  it('no pide best-offer en ninguna landing', async () => {
    for (const slug of ['home', 'copia-home', 'ucv']) {
      mockFetch();
      await fetchCatalogData(slug, {});
      expect(urlPedida()).not.toContain('best-offer');
    }
  });

  // El endpoint no debe llevarse por delante los filtros.
  it('conserva el query string', async () => {
    await fetchCatalogData('home', { limit: 15, filters: { q: 'ipad' } });
    const url = urlPedida();
    expect(url).toContain('/public/landing/home/products?');
    expect(url).toContain('ipad');
  });
});
