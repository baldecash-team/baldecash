import { mapApiProductToCatalogProduct, ApiCatalogProduct } from '../catalogApi';

function makeApiProduct(paymentHooks?: Record<string, unknown>): ApiCatalogProduct {
  return {
    id: 1,
    sku: 'TEST-SKU',
    name: 'Test Product',
    slug: 'test-product',
    type: 'celular',
    condition: 'new',
    brand: { id: 1, name: 'TestBrand', slug: 'testbrand' },
    display_order: 0,
    is_featured: false,
    pricing: {
      list_price: 2000,
      final_price: 2000,
      discount_percent: 0,
      currency: 'PEN',
      hook: {
        monthly_price: 100,
        term_months: 24,
        initial_percent: 0,
        tea: 50,
      },
      available_terms: [12, 24],
      available_initials: [0],
      payment_hooks: paymentHooks as ApiCatalogProduct['pricing']['payment_hooks'],
    },
  };
}

describe('catalogApi – payment_hooks mapping', () => {
  it('maps enriched payment_hooks correctly', () => {
    const product = makeApiProduct({
      semanal: { price: 49, term_months: 12, initial_percent: 0 },
      quincenal: { price: 94, term_months: 12, initial_percent: 20 },
    });

    const result = mapApiProductToCatalogProduct(product);

    expect(result.paymentHooks).toBeDefined();
    expect(result.paymentHooks!['semanal']).toEqual({
      price: 49,
      termMonths: 12,
      initialPercent: 0,
    });
    expect(result.paymentHooks!['quincenal']).toEqual({
      price: 94,
      termMonths: 12,
      initialPercent: 20,
    });
  });

  it('is backward compatible with old number format', () => {
    const product = makeApiProduct({
      semanal: 219,
      quincenal: 94,
    });

    const result = mapApiProductToCatalogProduct(product);

    expect(result.paymentHooks).toBeDefined();
    expect(result.paymentHooks!['semanal']).toEqual({
      price: 219,
      termMonths: null,
      initialPercent: null,
    });
    expect(result.paymentHooks!['quincenal']).toEqual({
      price: 94,
      termMonths: null,
      initialPercent: null,
    });
  });

  it('handles null payment_hooks', () => {
    const product = makeApiProduct(undefined);

    const result = mapApiProductToCatalogProduct(product);

    expect(result.paymentHooks).toBeUndefined();
  });
});
