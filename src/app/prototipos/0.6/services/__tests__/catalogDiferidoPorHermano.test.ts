import { mapApiProductToCatalogProduct, ApiCatalogProduct } from '../catalogApi';

/**
 * El backend manda `is_deferred_delivery` en los DOS ejes de hermanos (color y
 * grado). El mapeo lo dropeaba: ese era el primer punto de corte del bug —el
 * dato llegaba del API y moría antes de la card.
 *
 * El flag es del producto, con override por landing, y no de la familia: en
 * `copia-home` el Advance CN4058 grado B está diferido y el Semi Nuevo y el C
 * no, los tres con el flag global en 0.
 */
function makeApiProduct(overrides: Partial<ApiCatalogProduct> = {}): ApiCatalogProduct {
  return {
    id: 1566,
    sku: 'ADV-CN4058-B',
    name: 'Advance Notebook CN4058 2 en 1 (Reacondicionada Grado B)',
    display_name: 'Advance Notebook CN4058 2 en 1',
    slug: 'advance-cn4058-grado-b',
    type: 'laptop',
    condition: 'refurbished',
    brand: { id: 2, name: 'Advance', slug: 'advance' },
    display_order: 0,
    is_featured: false,
    pricing: {
      list_price: 999,
      final_price: 899,
      discount_percent: 10,
      currency: 'PEN',
      hook: { monthly_price: 70, term_months: 24, initial_percent: 0, tea: 50 },
      available_terms: [12, 24],
      available_initials: [0],
    },
    ...overrides,
  } as ApiCatalogProduct;
}

const gradoApi = (grade: string, productId: number, deferred?: boolean) => ({
  grade,
  product_id: productId,
  slug: `advance-cn4058-grado-${grade.toLowerCase()}`,
  price: 899,
  stock_available: 3,
  is_available: true,
  name: `Advance CN4058 (Grado ${grade})`,
  min_term_quota: 180,
  lowest_quota: 70,
  ...(deferred === undefined ? {} : { is_deferred_delivery: deferred }),
});

const colorApi = (productId: number, name: string, deferred?: boolean) => ({
  product_id: productId,
  sku: `ADV-${productId}`,
  slug: `advance-${name.toLowerCase()}`,
  name: `Advance ${name}`,
  display_name: `Advance ${name}`,
  color: name,
  color_hex: '#000000',
  specs: {},
  pricing: { list_price: 999, final_price: 899, discount_percent: 10, currency: 'PEN', hook: null },
  ...(deferred === undefined ? {} : { is_deferred_delivery: deferred }),
});

describe('catalogApi – el diferido por hermano sobrevive al mapeo', () => {
  it('conserva el flag de cada GRADO por separado', () => {
    const result = mapApiProductToCatalogProduct(makeApiProduct({
      grade_siblings: [gradoApi('B', 1566, true), gradoApi('C', 1567, false)],
    } as Partial<ApiCatalogProduct>));

    const porGrado = Object.fromEntries(
      (result.gradeSiblings ?? []).map(g => [g.grade, g.isDeferredDelivery]),
    );
    // El B diferido y el C no: si el mapeo dropeara el campo, ambos serían undefined.
    expect(porGrado).toEqual({ B: true, C: false });
  });

  it('conserva el flag de cada COLOR por separado', () => {
    const result = mapApiProductToCatalogProduct(makeApiProduct({
      color_siblings: [colorApi(900, 'Negro', true), colorApi(901, 'Plata', false)],
    } as Partial<ApiCatalogProduct>));

    const porColor = Object.fromEntries(
      (result.colors ?? []).map(c => [c.name, c.isDeferredDelivery]),
    );
    expect(porColor).toEqual({ Negro: true, Plata: false });
  });

  it('sin el campo (backend viejo) queda undefined, no false', () => {
    // `false` significaría "este hermano NO está diferido" y apagaría un aviso
    // legítimo; `undefined` deja que la card caiga a su propio flag.
    const result = mapApiProductToCatalogProduct(makeApiProduct({
      grade_siblings: [gradoApi('B', 1566)],
      color_siblings: [colorApi(900, 'Negro')],
    } as Partial<ApiCatalogProduct>));

    expect(result.gradeSiblings?.[0].isDeferredDelivery).toBeUndefined();
    expect(result.colors?.[0].isDeferredDelivery).toBeUndefined();
  });
});
