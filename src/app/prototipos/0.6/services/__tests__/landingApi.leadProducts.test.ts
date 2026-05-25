/**
 * Tests para la extracción de leadProductsConfig en transformLandingData.
 *
 * LeadProductsConfig usa product_ids (array de IDs numéricos) — los productos
 * se cargan dinámicamente desde /public/landing/{slug}/products en el cliente.
 */

import type { LeadProductsConfig } from '../../types/hero';

// ─── helpers: replica la lógica de extracción de landingApi.ts ───────────────

interface RawComponent {
  component_code: string;
  content_config?: Record<string, unknown>;
  is_visible?: boolean;
}

function extractLeadProductsConfig(components: RawComponent[]): LeadProductsConfig | null {
  const leadProductsComponent = components.find(c => c.component_code === 'lead_products');
  if (!leadProductsComponent) return null;

  const rawLeadProducts = (leadProductsComponent.content_config || {}) as Record<string, unknown>;

  return {
    title: (rawLeadProducts.title as string) || 'Encuentra tu equipo ideal',
    subtitle: (rawLeadProducts.subtitle as string) || 'Financiamiento simple. Aprobación en 24h.',
    product_ids: ((rawLeadProducts.product_ids as number[]) || []),
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
        product_ids: [101, 202, 303],
      },
    };

    it('extrae título y subtítulo correctamente', () => {
      const result = extractLeadProductsConfig([baseComponent]);
      expect(result?.title).toBe('Nuestros equipos');
      expect(result?.subtitle).toBe('Los mejores modelos');
    });

    it('extrae la lista de product_ids', () => {
      const result = extractLeadProductsConfig([baseComponent]);
      expect(result?.product_ids).toEqual([101, 202, 303]);
    });

    it('usa defaults cuando title y subtitle están vacíos', () => {
      const result = extractLeadProductsConfig([{
        component_code: 'lead_products',
        content_config: { product_ids: [] },
      }]);
      expect(result?.title).toBe('Encuentra tu equipo ideal');
      expect(result?.subtitle).toBe('Financiamiento simple. Aprobación en 24h.');
    });

    it('devuelve product_ids vacío cuando no existe en content_config', () => {
      const result = extractLeadProductsConfig([{
        component_code: 'lead_products',
        content_config: { title: 'Test' },
      }]);
      expect(result?.product_ids).toEqual([]);
    });

    it('maneja múltiples product_ids', () => {
      const result = extractLeadProductsConfig([{
        component_code: 'lead_products',
        content_config: {
          title: 'Test',
          subtitle: 'Sub',
          product_ids: [1, 2, 3, 4, 5],
        },
      }]);
      expect(result?.product_ids).toHaveLength(5);
      expect(result?.product_ids[4]).toBe(5);
    });

    it('ignora otros componentes y extrae solo lead_products', () => {
      const result = extractLeadProductsConfig([
        { component_code: 'hero', content_config: { title: 'No soy lead_products' } },
        {
          component_code: 'lead_products',
          content_config: { title: 'Soy lead_products', product_ids: [42] },
        },
        { component_code: 'footer' },
      ]);
      expect(result?.title).toBe('Soy lead_products');
      expect(result?.product_ids).toEqual([42]);
    });
  });
});

// ─── tests de LeadProductsSection: lógica de fuente de productos ─────────────

describe('LeadProductsSection — lógica de product_ids', () => {
  function hasProductIds(config: LeadProductsConfig | null | undefined): boolean {
    return (config?.product_ids?.length ?? 0) > 0;
  }

  it('no tiene product_ids cuando config es null', () => {
    expect(hasProductIds(null)).toBe(false);
  });

  it('no tiene product_ids cuando config es undefined', () => {
    expect(hasProductIds(undefined)).toBe(false);
  });

  it('no tiene product_ids cuando el array está vacío', () => {
    expect(hasProductIds({ title: 'T', subtitle: 'S', product_ids: [] })).toBe(false);
  });

  it('tiene product_ids cuando hay al menos uno', () => {
    expect(hasProductIds({ title: 'T', subtitle: 'S', product_ids: [101, 202] })).toBe(true);
  });
});
