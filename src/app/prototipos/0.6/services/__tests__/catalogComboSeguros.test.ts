import { mapApiProductToCatalogProduct, type ApiCatalogProduct } from '../catalogApi';

function producto(combo: unknown): ApiCatalogProduct {
  return {
    id: 491, sku: 'SKU', name: 'Lenovo V15', slug: 'lenovo-v15-combo-52', type: 'laptop',
    condition: 'new', brand: { id: 1, name: 'Lenovo', slug: 'lenovo' }, display_order: 0,
    is_featured: false,
    pricing: {
      list_price: 2202, final_price: 2202, discount_percent: 0, currency: 'PEN',
      hook: { monthly_price: 170, term_months: 24, initial_percent: 0, tea: 50 },
      available_terms: [12, 24], available_initials: [0],
    },
    combo,
  } as ApiCatalogProduct;
}

describe('mapApiProductToCatalogProduct · seguros del combo', () => {
  it('mapea combo.insurances[]', () => {
    const p = mapApiProductToCatalogProduct(producto({
      id: 52, accessories: [],
      insurances: [
        { plan_id: 15, name: 'Robo 12M', duration_months: 12, insurance_type: 'seguro_robo', price: 0 },
        { plan_id: 14, name: 'Garantía 24M', duration_months: 24, insurance_type: 'garantia_extendida', price: 0 },
      ],
    }));
    expect(p.comboInsurances).toEqual([
      { planId: '15', name: 'Robo 12M', durationMonths: 12, insuranceType: 'seguro_robo' },
      { planId: '14', name: 'Garantía 24M', durationMonths: 24, insuranceType: 'garantia_extendida' },
    ]);
  });

  it('sin combo o sin seguros: undefined', () => {
    expect(mapApiProductToCatalogProduct(producto(null)).comboInsurances).toBeUndefined();
    expect(mapApiProductToCatalogProduct(producto({ id: 37, accessories: [], insurances: [] })).comboInsurances).toBeUndefined();
  });
});
