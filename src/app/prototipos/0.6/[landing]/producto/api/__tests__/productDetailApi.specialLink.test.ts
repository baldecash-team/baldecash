/// <reference types="jest" />
/**
 * Link especial (BAL-5191): el detalle y los planes reenvían `acceso` y el
 * resultado trae qué producto abrió el pase o por qué no sirvió.
 */
import { fetchProductDetail, fetchProductPaymentPlans } from '../productDetailApi';

function apiResponse(extra: Record<string, unknown> = {}) {
  return {
    product: {
      id: '42', slug: 'laptop-oculta', name: 'Laptop', display_name: 'Laptop', brand: 'X',
      category: 'laptops', type: 'laptop', price: '2999', original_price: null, discount: null,
      lowest_quota: '100', original_quota: null, images: [], colors: [], description: '',
      short_description: '', badges: [], specs: [], ports: [], software: [], features: [],
      battery_life: null, fast_charge: null, has_os: false, os_name: null, warranty: null,
      stock: 1, rating: null, review_count: 0,
    },
    payment_plans: [],
    similar_products: [],
    limitations: [],
    certifications: [],
    is_available: true,
    ...extra,
  };
}

let fetchMock: jest.Mock;
function mockFetch(payload: unknown) {
  fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => payload });
  global.fetch = fetchMock as unknown as typeof fetch;
}
const urlLlamada = () => String(fetchMock.mock.calls[0][0]);

beforeEach(() => sessionStorage.clear());
afterEach(() => jest.restoreAllMocks());

describe('fetchProductDetail con link especial', () => {
  it('sin token la URL queda como siempre', async () => {
    mockFetch(apiResponse());
    await fetchProductDetail('home', 'laptop-oculta');
    expect(urlLlamada()).toMatch(/\/public\/landing\/home\/products\/laptop-oculta\/detail$/);
  });

  it('sin token y con frecuencia, la URL queda como siempre', async () => {
    mockFetch(apiResponse());
    await fetchProductDetail('home', 'laptop-oculta', 'semanal');
    expect(urlLlamada()).toMatch(/\/detail\?payment_frequency=semanal$/);
  });

  it('con token guardado manda acceso y mapea el producto que abrió', async () => {
    sessionStorage.setItem('baldecash-home-special-link', 'tok');
    mockFetch(apiResponse({ special_link_product_id: 42, special_link_error: null }));
    const r = await fetchProductDetail('home', 'laptop-oculta', 'semanal');
    expect(urlLlamada()).toContain('payment_frequency=semanal');
    expect(urlLlamada()).toContain('acceso=tok');
    expect(r?.specialLinkProductId).toBe(42);
    expect(r?.specialLinkError).toBeUndefined();
  });

  it('el token de otra landing no viaja', async () => {
    sessionStorage.setItem('baldecash-otra-special-link', 'tok');
    mockFetch(apiResponse());
    await fetchProductDetail('home', 'laptop-oculta');
    expect(urlLlamada()).not.toContain('acceso=');
  });

  it('mapea el motivo cuando el token no sirvió', async () => {
    sessionStorage.setItem('baldecash-home-special-link', 'tok');
    mockFetch(apiResponse({ is_available: false, special_link_product_id: null, special_link_error: 'expired' }));
    const r = await fetchProductDetail('home', 'laptop-oculta');
    expect(r?.specialLinkProductId).toBeUndefined();
    expect(r?.specialLinkError).toBe('expired');
  });
});

describe('fetchProductPaymentPlans con link especial', () => {
  it('reenvía acceso para que el formulario reciba la matriz del equipo oculto', async () => {
    sessionStorage.setItem('baldecash-home-special-link', 'tok');
    mockFetch(apiResponse());
    await fetchProductPaymentPlans('home', '42', 'mensual');
    expect(urlLlamada()).toContain('payment_frequency=mensual');
    expect(urlLlamada()).toContain('acceso=tok');
  });

  it('sin token la URL queda como siempre', async () => {
    mockFetch(apiResponse());
    await fetchProductPaymentPlans('home', '42');
    expect(urlLlamada()).toMatch(/\/products\/42\/detail$/);
  });
});
