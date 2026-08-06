import { mapApiProductToCatalogProduct, ApiCatalogProduct } from '../catalogApi';

/**
 * El catalogo arma `colors` por dos ramas distintas: los color_siblings de una
 * familia (Redmi Negro / Titanium) y el color propio de la variante del producto
 * (iPad "Plata"). Estos tests fijan el contrato de ambas.
 */
function makeApiProduct(overrides: Partial<ApiCatalogProduct> = {}): ApiCatalogProduct {
  return {
    id: 518,
    sku: 'TBAPME0000835-DEF',
    name: 'iPad 11 pulgadas Wi-Fi',
    display_name: 'iPad 11 Wi-Fi',
    slug: 'ipad-11-pulgadas-wi-fi-tbapme0000835',
    type: 'tablet',
    condition: 'new',
    brand: { id: 1, name: 'Apple', slug: 'apple' },
    display_order: 0,
    is_featured: false,
    pricing: {
      list_price: 2000,
      final_price: 1800,
      discount_percent: 10,
      currency: 'PEN',
      hook: {
        monthly_price: 95,
        term_months: 24,
        initial_percent: 0,
        tea: 50,
      },
      available_terms: [12, 24],
      available_initials: [0],
    },
    ...overrides,
  } as ApiCatalogProduct;
}

describe('catalogApi – mapeo de colores', () => {
  describe('color propio (sin color_siblings)', () => {
    it('hereda del producto los datos que el API no manda en el color', () => {
      const result = mapApiProductToCatalogProduct(makeApiProduct({
        color_siblings: [],
        colors: [{
          id: 'color-518',
          name: 'Plata',
          hex: '#C0C0C0',
          image_url: 'https://cdn.test/ipad.webp',
          images: ['https://cdn.test/ipad.webp'],
        }],
      }));

      expect(result.colors).toHaveLength(1);
      // Lo que ya venia del API
      expect(result.colors![0]).toMatchObject({
        id: 'color-518',
        name: 'Plata',
        hex: '#C0C0C0',
        imageUrl: 'https://cdn.test/ipad.webp',
      });
      // Lo heredado del producto: sin esto la card degrada el href y la galeria
      expect(result.colors![0].productId).toBe('518');
      expect(result.colors![0].slug).toBe('ipad-11-pulgadas-wi-fi-tbapme0000835');
      expect(result.colors![0].displayName).toBe('iPad 11 Wi-Fi');
      expect(result.colors![0].price).toBe(1800);
      expect(result.colors![0].quotaMonthly).toBe(95);
    });

    it('cae al name cuando el producto no trae display_name', () => {
      const api = makeApiProduct({
        color_siblings: [],
        colors: [{ id: 'color-518', name: 'Plata', hex: '#C0C0C0' }],
      });
      delete (api as { display_name?: string }).display_name;

      const result = mapApiProductToCatalogProduct(api);

      expect(result.colors![0].displayName).toBe('iPad 11 pulgadas Wi-Fi');
    });
  });

  describe('color_siblings (familia)', () => {
    it('toma los datos de cada sibling, no los del producto primario', () => {
      const result = mapApiProductToCatalogProduct(makeApiProduct({
        id: 1451,
        name: 'Redmi Note 15 Pro 8/256',
        slug: 'redmi-note-15-pro-8256-1077',
        colors: [{ id: 'color-1451', name: 'Negro', hex: '#1A1A1A' }],
        color_siblings: [{
          product_id: 1533,
          sku: 'CEXIME0001553-DEF',
          slug: 'redmi-note-15-pro-8256-titanium-1135',
          name: 'Redmi Note 15 Pro 8/256 Titanium',
          display_name: 'Redmi Note 15 Pro 8/256 Titanium',
          color: 'Titanium',
          color_hex: '#8A8D8F',
          specs: {},
          pricing: {
            list_price: 1078.79,
            final_price: 1078.79,
            discount_percent: 0,
            currency: 'PEN',
            hook: { monthly_price: 82, term_months: 24, initial_percent: 0, tea: 76.413 },
          },
        }],
      }));

      expect(result.colors).toHaveLength(1);
      expect(result.colors![0].productId).toBe('1533');
      expect(result.colors![0].slug).toBe('redmi-note-15-pro-8256-titanium-1135');
      expect(result.colors![0].price).toBe(1078.79);
      expect(result.colors![0].quotaMonthly).toBe(82);
    });
  });

  it('sin colores ni siblings devuelve arreglo vacio', () => {
    const result = mapApiProductToCatalogProduct(makeApiProduct({
      colors: [],
      color_siblings: [],
    }));

    expect(result.colors).toEqual([]);
  });
});
