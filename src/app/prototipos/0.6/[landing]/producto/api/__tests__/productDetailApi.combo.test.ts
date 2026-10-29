/// <reference types="jest" />
/**
 * Regresión: el detalle debe mapear el seguro del combo (combo.insurance).
 *
 * Bug original: transformCombo mapeaba solo `accessories` y descartaba
 * `insurance`. En combos insurance-only (accessories: []) el banner "Combo
 * incluye" quedaba oculto porque combo.insurance era undefined.
 */
import { fetchProductDetail } from '../productDetailApi';

function baseApiResponse(combo: unknown) {
  return {
    product: {
      id: '491',
      slug: 'lenovo-v15-g4-iru-lpleba0000767',
      name: 'Lenovo V15 + Seguro contra Robo',
      display_name: 'Lenovo V15 + Seguro contra Robo',
      brand: 'Lenovo',
      category: 'laptops',
      type: 'laptop',
      price: '2202.03',
      original_price: null,
      discount: null,
      lowest_quota: '170',
      original_quota: null,
      images: [],
      colors: [],
      description: '',
      short_description: '',
      badges: [],
      specs: [],
      ports: [],
      software: [],
      features: [],
      battery_life: null,
      fast_charge: null,
      has_os: false,
      os_name: null,
      warranty: null,
      stock: 190,
      rating: null,
      review_count: 0,
    },
    combo,
    payment_plans: [],
    similar_products: [],
    limitations: [],
    certifications: [],
    is_available: true,
  };
}

function mockFetchOnce(payload: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => payload,
  }) as unknown as typeof fetch;
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('transformCombo (vía fetchProductDetail)', () => {
  it('mapea el seguro de un combo insurance-only', async () => {
    mockFetchOnce(
      baseApiResponse({
        id: 52,
        code: 'COMBO-LENOVO-V15-ROBO',
        name: 'Lenovo V15 + Seguro Robo',
        display_name: 'Lenovo V15 + Seguro contra Robo',
        description: null,
        image_url: 'https://x/combo.jpg',
        thumbnail_url: 'https://x/combo_thumb.webp',
        micro_url: 'https://x/combo_micro.webp',
        accessories: [],
        insurance: {
          plan_id: 15,
          name: 'Seguro Contra Robo Laptop 12M',
          code: 'INS-LAPTOP-SR-12',
          price: 0,
        },
      }),
    );

    const result = await fetchProductDetail('home', 'lenovo-v15-g4-iru-lpleba0000767-combo-52');

    expect(result).not.toBeNull();
    expect(result!.combo).toBeDefined();
    expect(result!.combo!.accessories).toHaveLength(0);
    // El seguro debe llegar mapeado a camelCase, no undefined.
    expect(result!.combo!.insurance).toEqual({
      planId: 15,
      name: 'Seguro Contra Robo Laptop 12M',
      price: 0,
    });
  });

  it('mapea seguro + accesorio juntos', async () => {
    mockFetchOnce(
      baseApiResponse({
        id: 52,
        code: 'COMBO-LENOVO-V15-ROBO',
        name: 'Lenovo V15 + Seguro Robo',
        display_name: 'Lenovo V15 + Seguro contra Robo',
        description: null,
        accessories: [
          {
            product_id: 1456,
            product_name: 'Mochila Nova Grey/Brown',
            product_sku: 'PERIF-805',
            unit_price: 60,
            is_included_free: true,
            image_url: 'https://x/mochila.webp',
          },
        ],
        insurance: { plan_id: 15, name: 'Seguro Contra Robo Laptop 12M', price: 0 },
      }),
    );

    const result = await fetchProductDetail('home', 'x-combo-52');

    expect(result!.combo!.accessories).toHaveLength(1);
    expect(result!.combo!.accessories[0].productSku).toBe('PERIF-805');
    expect(result!.combo!.insurance).toEqual({
      planId: 15,
      name: 'Seguro Contra Robo Laptop 12M',
      price: 0,
    });
  });

  it('deja insurance undefined cuando el combo no trae seguro', async () => {
    mockFetchOnce(
      baseApiResponse({
        id: 37,
        code: 'BUNDLE-V15-MOCHILA',
        name: 'Lenovo V15 G4 IRU + Mochila Nova',
        display_name: 'Lenovo V15 G4 IRU (con mochila de regalo)',
        description: null,
        accessories: [
          {
            product_id: 1456,
            product_name: 'Mochila Nova Grey/Brown',
            product_sku: 'PERIF-805',
            unit_price: 60,
            is_included_free: true,
          },
        ],
        insurance: null,
      }),
    );

    const result = await fetchProductDetail('home', 'x-combo-37');

    expect(result!.combo!.accessories).toHaveLength(1);
    expect(result!.combo!.insurance).toBeUndefined();
  });

  it('mapea TODOS los seguros del combo (robo 12M + robo 24M + garantía)', async () => {
    mockFetchOnce(
      baseApiResponse({
        id: 52, code: 'COMBO-52', name: 'V15 + mochila + robo + garantía',
        display_name: 'V15 combo', description: null, accessories: [],
        insurance: { plan_id: 15, name: 'Robo 12M', code: 'INS-LAPTOP-SR-12', price: 0 },
        insurances: [
          { plan_id: 15, name: 'Robo 12M', code: 'INS-LAPTOP-SR-12', duration_months: 12, insurance_type: 'seguro_robo', price: 0 },
          { plan_id: 16, name: 'Robo 24M', code: 'INS-LAPTOP-SR-24', duration_months: 24, insurance_type: 'seguro_robo', price: 0 },
          { plan_id: 14, name: 'Garantía 24M', code: 'INS-LAPTOP-GE-24', duration_months: 24, insurance_type: 'garantia_extendida', price: 0 },
        ],
      }),
    );

    const result = await fetchProductDetail('home', 'x-combo-52');

    expect(result!.combo!.insurances).toEqual([
      { planId: 15, name: 'Robo 12M', code: 'INS-LAPTOP-SR-12', price: 0, durationMonths: 12, insuranceType: 'seguro_robo' },
      { planId: 16, name: 'Robo 24M', code: 'INS-LAPTOP-SR-24', price: 0, durationMonths: 24, insuranceType: 'seguro_robo' },
      { planId: 14, name: 'Garantía 24M', code: 'INS-LAPTOP-GE-24', price: 0, durationMonths: 24, insuranceType: 'garantia_extendida' },
    ]);
    // `insurance` no cambia de forma.
    expect(result!.combo!.insurance).toEqual({ planId: 15, name: 'Robo 12M', price: 0 });
  });

  it('backend viejo sin `insurances`: cae a [insurance]', async () => {
    mockFetchOnce(
      baseApiResponse({
        id: 52, code: 'C', name: 'C', display_name: 'C', description: null, accessories: [],
        insurance: { plan_id: 15, name: 'Robo 12M', code: 'INS-LAPTOP-SR-12', price: 0 },
      }),
    );
    const result = await fetchProductDetail('home', 'x-combo-52');
    expect(result!.combo!.insurances).toEqual([
      { planId: 15, name: 'Robo 12M', code: 'INS-LAPTOP-SR-12', price: 0, durationMonths: null, insuranceType: null },
    ]);
  });

  it('sin seguros: insurances vacío', async () => {
    mockFetchOnce(
      baseApiResponse({
        id: 37, code: 'C', name: 'C', display_name: 'C', description: null,
        accessories: [], insurance: null, insurances: [],
      }),
    );
    const result = await fetchProductDetail('home', 'x-combo-37');
    expect(result!.combo!.insurances).toEqual([]);
  });
});
