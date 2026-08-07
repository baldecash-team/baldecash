import { mapApiCatalogResponse, ApiCatalogProduct, ApiCatalogResponse } from '../catalogApi';

/**
 * El catalogo descarta hermanos de color para no repetir la misma familia en la
 * grilla. Un mismo equipo puede aparecer varias veces en la lista con combos
 * distintos (mismo product_id, distinto landing_product_id) y esas SI son
 * tarjetas separadas: nombre, precio y slug propios.
 */
function producto(over: Partial<ApiCatalogProduct> = {}): ApiCatalogProduct {
  return {
    id: 1,
    sku: 'SKU-TEST',
    name: 'Producto',
    slug: 'producto',
    type: 'laptop',
    condition: 'new',
    brand: { id: 1, name: 'Marca', slug: 'marca' },
    display_order: 0,
    is_featured: false,
    pricing: {
      list_price: 2000,
      final_price: 2000,
      discount_percent: 0,
      currency: 'PEN',
      hook: { monthly_price: 100, term_months: 24, initial_percent: 0, tea: 50 },
      available_terms: [12, 24],
      available_initials: [0],
    },
    ...over,
  } as ApiCatalogProduct;
}

function respuesta(items: ApiCatalogProduct[]): ApiCatalogResponse {
  return {
    items,
    total: items.length,
    page: 1,
    page_size: items.length,
    total_pages: 1,
    limit: items.length,
    offset: 0,
    has_more: false,
  } as ApiCatalogResponse;
}

describe('mapApiCatalogResponse – deduplicacion', () => {
  it('conserva el mismo equipo repetido con combos distintos', () => {
    // Caso real de home: el Lenovo V15 aparece con combo 37 y con combo 52.
    // Ambos traen su color propio (color-491), que apunta al mismo producto.
    const colorPropio = [{ id: 'color-491', name: 'Gris', hex: '#6B7280' }];
    const result = mapApiCatalogResponse(respuesta([
      producto({
        id: 491, landing_product_id: 4012, name: 'Lenovo V15 con mochila',
        slug: 'lenovo-v15-combo-37', colors: colorPropio,
      } as Partial<ApiCatalogProduct>),
      producto({
        id: 491, landing_product_id: 4946, name: 'Lenovo V15 + Seguro + mochila',
        slug: 'lenovo-v15-combo-52', colors: colorPropio,
      } as Partial<ApiCatalogProduct>),
    ]));

    expect(result.products).toHaveLength(2);
    expect(result.products.map(p => p.slug)).toEqual([
      'lenovo-v15-combo-37',
      'lenovo-v15-combo-52',
    ]);
  });

  it('sigue colapsando los hermanos de color de una familia', () => {
    // El Redmi Negro trae al Titanium en color_siblings: una sola tarjeta.
    const result = mapApiCatalogResponse(respuesta([
      producto({
        id: 1451, landing_product_id: 3787, name: 'Redmi Note 15 Pro',
        slug: 'redmi-negro',
        color_siblings: [{
          product_id: 1533, sku: 'CEXIME0001553-DEF', slug: 'redmi-titanium',
          name: 'Redmi Titanium', display_name: 'Redmi Titanium',
          color: 'Titanium', color_hex: '#8A8D8F', specs: {},
          pricing: {
            list_price: 1078.79, final_price: 1078.79, discount_percent: 0,
            currency: 'PEN',
            hook: { monthly_price: 82, term_months: 24, initial_percent: 0, tea: 76 },
          },
        }],
      } as Partial<ApiCatalogProduct>),
      producto({
        id: 1533, landing_product_id: 6482, name: 'Redmi Note 15 Pro Titanium',
        slug: 'redmi-titanium',
      } as Partial<ApiCatalogProduct>),
    ]));

    expect(result.products).toHaveLength(1);
    expect(result.products[0].slug).toBe('redmi-negro');
  });

  it('no descarta productos distintos sin relacion', () => {
    const result = mapApiCatalogResponse(respuesta([
      producto({ id: 1, landing_product_id: 10, slug: 'uno' } as Partial<ApiCatalogProduct>),
      producto({ id: 2, landing_product_id: 20, slug: 'dos' } as Partial<ApiCatalogProduct>),
      producto({ id: 3, landing_product_id: 30, slug: 'tres' } as Partial<ApiCatalogProduct>),
    ]));

    expect(result.products).toHaveLength(3);
  });
});
