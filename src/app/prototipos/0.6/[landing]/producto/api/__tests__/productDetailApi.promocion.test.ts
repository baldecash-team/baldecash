/// <reference types="jest" />
/**
 * BAL-3922: el mapper del detalle trae la promoción del producto principal.
 *
 * El wire del producto principal viene en snake_case (`banner_text`,
 * `banner_bg_color`…) y el dominio del front está en camelCase. Ojo: los
 * productos SIMILARES ya llegan en camelCase desde el backend — son dos
 * formatos distintos en la MISMA respuesta, así que el mapper del principal no
 * puede copiar el objeto tal cual como hace el de similares.
 *
 * El payload de abajo es el real de prod, verificado el 16-sep-2026 en
 * GET /public/landing/renueva-tu-equipo-2/products/
 *     tablet-legion-tbleal0001254-combo-181/detail
 */
import { fetchProductDetail } from '../productDetailApi';

/** Plantilla tal como la manda prod para el producto principal: snake_case. */
const PLANTILLA_DE_PROD = {
  code: 'PRECIO-EXCLUSIVO',
  banner_text: '¡PRECIO EXCLUSIVO!',
  banner_style: 'top_bar',
  border_color: '#4654CD',
  banner_bg_color: '#4654CD',
  banner_text_color: '#FFFFFF',
  banner_icon: 'star',
  cta_text: '¡Lo quiero!',
  cta_style: 'golden',
  show_specs: false,
  show_links: true,
};

const PROMO_DE_PROD = {
  id: 24,
  name: 'PRECIO EXCLUSIVO',
  code: 'PRECIO-EXCLUSIVO',
  discount_type: 'percentage',
  discount_value: 30.0,
  valid_until: null,
  template: PLANTILLA_DE_PROD,
};

function respuestaApi(promotion: unknown) {
  return {
    product: {
      id: '1254',
      slug: 'tablet-legion-tbleal0001254',
      name: 'Tablet Legion Y700',
      display_name: 'Tablet Legion Y700',
      brand: 'Lenovo',
      category: 'tablets',
      type: 'tablet',
      price: '2296.00',
      original_price: null,
      discount: null,
      lowest_quota: '122',
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
      stock: 1,
      rating: null,
      review_count: 0,
      promotion,
    },
    combo: null,
    payment_plans: [],
    similar_products: [],
    limitations: [],
    certifications: [],
    is_available: true,
  };
}

function mockFetch(body: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => body,
  }) as unknown as typeof fetch;
}

describe('fetchProductDetail — promoción del producto principal (BAL-3922)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('trae la promoción y convierte la plantilla de snake_case a camelCase', async () => {
    mockFetch(respuestaApi(PROMO_DE_PROD));

    const res = await fetchProductDetail('renueva-tu-equipo-2', 'tablet-legion-tbleal0001254-combo-181');

    expect(res?.product.promotion).toBeTruthy();
    expect(res?.product.promotion?.discountValue).toBe(30);
    expect(res?.product.promotion?.discountType).toBe('percentage');

    const t = res?.product.promotion?.template;
    // Lo que el render necesita para pintar el sello: si alguno de estos
    // quedara undefined, la barra saldría gris y sin texto.
    expect(t?.bannerText).toBe('¡PRECIO EXCLUSIVO!');
    expect(t?.bannerStyle).toBe('top_bar');
    expect(t?.bannerBgColor).toBe('#4654CD');
    expect(t?.bannerTextColor).toBe('#FFFFFF');
    expect(t?.borderColor).toBe('#4654CD');
    expect(t?.bannerIcon).toBe('star');
  });

  it('sin promoción el producto no la inventa', async () => {
    mockFetch(respuestaApi(null));

    const res = await fetchProductDetail('renueva-tu-equipo-2', 'tablet-legion-tbleal0001254-combo-181');

    expect(res?.product.promotion).toBeUndefined();
  });

  it('con `template` en null conserva la promoción pero sin plantilla', async () => {
    mockFetch(respuestaApi({ ...PROMO_DE_PROD, template: null }));

    const res = await fetchProductDetail('renueva-tu-equipo-2', 'tablet-legion-tbleal0001254-combo-181');

    expect(res?.product.promotion).toBeTruthy();
    expect(res?.product.promotion?.template).toBeNull();
  });
});
