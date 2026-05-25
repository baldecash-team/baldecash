/**
 * Tests para la extracción de leadProductsConfig en transformLandingData.
 *
 * Valida que el componente lead_products de la BD se extrae correctamente,
 * que el fallback funciona cuando no existe el componente, y que los
 * campos numéricos se mapean bien (quota_amount, oka_price, etc.).
 */

import type { LeadProduct, LeadProductsConfig } from '../../types/hero';

// ─── helpers: replica la lógica de extracción de landingApi.ts ───────────────

interface RawComponent {
  component_code: string;
  content_config?: Record<string, unknown>;
  is_visible?: boolean;
}

function extractLeadProductsConfig(components: RawComponent[]): LeadProductsConfig | null {
  const leadProductsComponent = components.find(c => c.component_code === 'lead_products');
  const rawLeadProducts = (leadProductsComponent?.content_config || {}) as Record<string, unknown>;

  if (!leadProductsComponent) return null;

  return {
    title: (rawLeadProducts.title as string) || 'Encuentra tu equipo ideal',
    subtitle: (rawLeadProducts.subtitle as string) || 'Financiamiento simple. Aprobación en 24h.',
    products: ((rawLeadProducts.products as LeadProduct[]) || []).map((p) => ({
      id: p.id || String(Math.random()),
      brand: p.brand || '',
      category: p.category || 'laptop',
      name: p.name || '',
      specs: p.specs || '',
      code: p.code || '',
      quotas: p.quotas || 12,
      quota_amount: p.quota_amount || 0,
      oka_price: p.oka_price || 0,
      tcea: p.tcea || 0,
      regular_price: p.regular_price || 0,
    })),
  };
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe('landingApi — leadProductsConfig extraction', () => {

  describe('cuando no existe el componente lead_products', () => {
    it('devuelve null', () => {
      const result = extractLeadProductsConfig([
        { component_code: 'hero', content_config: {} },
      ]);
      expect(result).toBeNull();
    });

    it('devuelve null con array vacío', () => {
      expect(extractLeadProductsConfig([])).toBeNull();
    });
  });

  describe('cuando existe el componente lead_products', () => {
    const baseComponent: RawComponent = {
      component_code: 'lead_products',
      content_config: {
        title: 'Nuestros equipos',
        subtitle: 'Los mejores modelos',
        products: [
          {
            id: 'p1',
            brand: 'Lenovo',
            category: 'laptop',
            name: 'IdeaPad 3',
            specs: '15.6" 512GB SSD · 8GB RAM',
            code: 'CÓD. LNV-001',
            quotas: 12,
            quota_amount: 89.5,
            oka_price: 1799,
            tcea: 48.5,
            regular_price: 2199,
          },
        ],
      },
    };

    it('extrae título y subtítulo correctamente', () => {
      const result = extractLeadProductsConfig([baseComponent]);
      expect(result?.title).toBe('Nuestros equipos');
      expect(result?.subtitle).toBe('Los mejores modelos');
    });

    it('extrae la lista de productos', () => {
      const result = extractLeadProductsConfig([baseComponent]);
      expect(result?.products).toHaveLength(1);
    });

    it('mapea todos los campos numéricos del producto', () => {
      const result = extractLeadProductsConfig([baseComponent]);
      const p = result?.products[0];
      expect(p?.quota_amount).toBe(89.5);
      expect(p?.oka_price).toBe(1799);
      expect(p?.tcea).toBe(48.5);
      expect(p?.regular_price).toBe(2199);
      expect(p?.quotas).toBe(12);
    });

    it('mapea brand y category correctamente', () => {
      const result = extractLeadProductsConfig([baseComponent]);
      const p = result?.products[0];
      expect(p?.brand).toBe('Lenovo');
      expect(p?.category).toBe('laptop');
    });

    it('usa defaults cuando title y subtitle están vacíos', () => {
      const result = extractLeadProductsConfig([{
        component_code: 'lead_products',
        content_config: { products: [] },
      }]);
      expect(result?.title).toBe('Encuentra tu equipo ideal');
      expect(result?.subtitle).toBe('Financiamiento simple. Aprobación en 24h.');
    });

    it('devuelve lista vacía cuando products no existe en content_config', () => {
      const result = extractLeadProductsConfig([{
        component_code: 'lead_products',
        content_config: { title: 'Test' },
      }]);
      expect(result?.products).toEqual([]);
    });

    it('maneja múltiples productos', () => {
      const result = extractLeadProductsConfig([{
        component_code: 'lead_products',
        content_config: {
          title: 'Test',
          subtitle: 'Sub',
          products: [
            { id: '1', brand: 'HP', category: 'laptop', name: 'HP 14', specs: '14"', code: 'HP-001', quotas: 12, quota_amount: 79, oka_price: 1599, tcea: 46.8, regular_price: 1899 },
            { id: '2', brand: 'Samsung', category: 'celular', name: 'A55', specs: '6.6"', code: 'SAM-001', quotas: 12, quota_amount: 59, oka_price: 1199, tcea: 47.2, regular_price: 1499 },
          ],
        },
      }]);
      expect(result?.products).toHaveLength(2);
      expect(result?.products[1].category).toBe('celular');
    });

    it('usa defaults para campos faltantes en un producto', () => {
      const result = extractLeadProductsConfig([{
        component_code: 'lead_products',
        content_config: {
          products: [{ id: 'p1' }],
        },
      }]);
      const p = result?.products[0];
      expect(p?.brand).toBe('');
      expect(p?.category).toBe('laptop');
      expect(p?.quotas).toBe(12);
      expect(p?.quota_amount).toBe(0);
    });

    it('ignora otros componentes y extrae solo lead_products', () => {
      const result = extractLeadProductsConfig([
        { component_code: 'hero', content_config: { title: 'No soy lead_products' } },
        {
          component_code: 'lead_products',
          content_config: { title: 'Soy lead_products', products: [] },
        },
        { component_code: 'footer' },
      ]);
      expect(result?.title).toBe('Soy lead_products');
    });
  });
});

// ─── tests de LeadProductsSection: lógica de fallback ───────────────────────

describe('LeadProductsSection — lógica de fuente de productos', () => {
  const FALLBACK_COUNT = 7; // número de productos en FALLBACK_PRODUCTS

  function resolveProducts(config: LeadProductsConfig | null | undefined): number {
    const fallback = new Array(FALLBACK_COUNT).fill(null);
    const all = config?.products && config.products.length > 0
      ? config.products
      : fallback;
    return all.length;
  }

  it('usa fallback cuando config es null', () => {
    expect(resolveProducts(null)).toBe(FALLBACK_COUNT);
  });

  it('usa fallback cuando config es undefined', () => {
    expect(resolveProducts(undefined)).toBe(FALLBACK_COUNT);
  });

  it('usa fallback cuando products es array vacío', () => {
    expect(resolveProducts({ title: 'T', subtitle: 'S', products: [] })).toBe(FALLBACK_COUNT);
  });

  it('usa productos del admin cuando hay al menos uno', () => {
    const adminProducts: LeadProduct[] = [
      { id: '1', brand: 'HP', category: 'laptop', name: 'Test', specs: '', code: '', quotas: 12, quota_amount: 79, oka_price: 1599, tcea: 46, regular_price: 1899 },
      { id: '2', brand: 'ASUS', category: 'laptop', name: 'Test2', specs: '', code: '', quotas: 12, quota_amount: 99, oka_price: 1999, tcea: 50, regular_price: 2399 },
    ];
    expect(resolveProducts({ title: 'T', subtitle: 'S', products: adminProducts })).toBe(2);
  });
});
