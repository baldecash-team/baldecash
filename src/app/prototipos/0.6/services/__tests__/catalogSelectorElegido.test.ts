import { mapApiProductToCatalogProduct, ApiCatalogProduct } from '../catalogApi';

/**
 * BAL-4561: el listado manda `card_selector_mode` en cada tarjeta. El mapeo
 * lo deja en `selectorPreference` solo si es «color», lo único que la web
 * sabe pintar distinto.
 */
function makeApiProduct(overrides: Partial<ApiCatalogProduct> = {}): ApiCatalogProduct {
  return {
    id: 1706,
    sku: 'LPDE0001245',
    name: 'Dell Latitude 7420 i7 16GB 512GB Grado A',
    display_name: 'Dell Latitude 7420 i7 16GB 512GB',
    slug: 'dell-latitude-7420-1245-combo-186',
    type: 'laptop',
    condition: 'reacondicionada',
    grade: 'A',
    grade_siblings: [],
    color_siblings: [],
    brand: { id: 1, name: 'Dell', slug: 'dell' },
    display_order: 0,
    is_featured: false,
    pricing: {
      list_price: 2000,
      final_price: 2000,
      discount_percent: 0,
      currency: 'PEN',
      hook: { monthly_price: 150, term_months: 24, initial_percent: 0, tea: 50 },
      available_terms: [12, 24],
      available_initials: [0],
    },
    ...overrides,
  } as ApiCatalogProduct;
}

describe('catalogApi – lo elegido en el Universo para la tarjeta', () => {
  it('«color» llega a la tarjeta', () => {
    const r = mapApiProductToCatalogProduct(makeApiProduct({ card_selector_mode: 'color' }));
    expect(r.selectorPreference).toBe('color');
    // El grado no se pierde: la etiqueta de la foto lo sigue mostrando.
    expect(r.grade).toBe('A');
  });

  it('sin elección queda vacío', () => {
    expect(mapApiProductToCatalogProduct(makeApiProduct({ card_selector_mode: null })).selectorPreference).toBeUndefined();
  });

  it('contra un backend viejo (el campo no viene) queda vacío', () => {
    expect(mapApiProductToCatalogProduct(makeApiProduct()).selectorPreference).toBeUndefined();
  });

  it('cualquier otro valor se ignora', () => {
    expect(mapApiProductToCatalogProduct(makeApiProduct({ card_selector_mode: 'grado' })).selectorPreference).toBeUndefined();
    expect(mapApiProductToCatalogProduct(makeApiProduct({ card_selector_mode: 'ambos' })).selectorPreference).toBeUndefined();
  });
});
