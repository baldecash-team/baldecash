/**
 * BAL-3272 — "ver producto" desde favoritos y carrito abria el combo.
 *
 * El item guardado ya trae su `slug` (la card exacta que el usuario habia
 * guardado), pero los handlers preferian rebuscar la card por `id`. Como el
 * suelto y sus combos comparten `id`, el lookup devuelve la primera card de la
 * lista — la del combo. Es el mismo defecto que BAL-3270, un camino mas abajo.
 *
 * `ProductDetailClient` ya resuelve esto al derecho; esto alinea al catalogo.
 */
import { resolveSavedItemDetail } from '../resolveSavedItemDetail';
import type { CatalogProduct } from '../../types/catalog';

const guardado = {
  productId: '518',
  slug: 'ipad-11-pulgadas-wi-fi-tbapme0000835',
  months: 24,
  initialPercent: 0,
};

// Lo que devuelve `findProductOrSibling('518')`: la primera card del producto.
const cardDelCombo = {
  id: '518',
  slug: 'ipad-11-pulgadas-wi-fi-tbapme0000835-combo-166',
} as unknown as CatalogProduct;

describe('resolveSavedItemDetail', () => {
  it('usa el slug guardado en el item aunque el lookup por id devuelva otra card del mismo producto', () => {
    expect(resolveSavedItemDetail(guardado, cardDelCombo)).toEqual({
      slug: 'ipad-11-pulgadas-wi-fi-tbapme0000835',
      params: { term: 24, initial: 0 },
    });
  });

  it('conserva el plazo y la inicial que el usuario tenia elegidos', () => {
    const item = { ...guardado, months: 36, initialPercent: 20 };

    expect(resolveSavedItemDetail(item, cardDelCombo)?.params).toEqual({ term: 36, initial: 20 });
  });

  it('cae al lookup por id cuando el item guardado no tiene slug', () => {
    const sinSlug = { productId: '518', months: 24, initialPercent: 0 };

    expect(resolveSavedItemDetail(sinSlug, cardDelCombo)).toEqual({
      slug: 'ipad-11-pulgadas-wi-fi-tbapme0000835-combo-166',
      params: { term: 24, initial: 0 },
    });
  });

  it('devuelve null cuando no hay item guardado ni card en el catalogo', () => {
    expect(resolveSavedItemDetail(undefined, null)).toBeNull();
  });

  it('usa el slug guardado aunque el producto ya no este en el catalogo', () => {
    expect(resolveSavedItemDetail(guardado, null)).toEqual({
      slug: 'ipad-11-pulgadas-wi-fi-tbapme0000835',
      params: { term: 24, initial: 0 },
    });
  });
});
