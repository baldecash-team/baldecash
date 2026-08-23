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
import type { SavedItem } from '../resolveSavedItemDetail';
import type { CatalogProduct, CartItem, WishlistItem } from '../../types/catalog';

const SUELTO = 'ipad-11-pulgadas-wi-fi-tbapme0000835';
const COMBO = 'ipad-11-pulgadas-wi-fi-tbapme0000835-combo-166';

const guardado: SavedItem = { productId: '518', slug: SUELTO, months: 24, initialPercent: 0 };

const card = (slug: string) => ({ id: '518', slug } as unknown as CatalogProduct);
// Lo que devuelve `findProductOrSibling('518')`: la primera card del producto.
const cardDelCombo = card(COMBO);
const cardGuardada = card(SUELTO);

describe('resolveSavedItemDetail', () => {
  it('usa el slug guardado aunque el lookup por id devuelva otra card del mismo producto', () => {
    expect(resolveSavedItemDetail(guardado, cardGuardada, cardDelCombo)).toEqual({
      slug: SUELTO,
      params: { term: 24, initial: 0 },
    });
  });

  it('conserva el plazo y la inicial que el usuario tenia elegidos', () => {
    const item: SavedItem = { ...guardado, months: 12, initialPercent: 20 };

    expect(resolveSavedItemDetail(item, cardGuardada, cardDelCombo)?.params)
      .toEqual({ term: 12, initial: 20 });
  });

  it('cae a la card viva cuando el slug guardado ya no existe en el catalogo', () => {
    // El combo que el usuario habia guardado se archivo. Mandarlo a su slug
    // seria un 404, y `unavailableWishlistIds` no lo detecta porque valida por
    // productId, no por slug.
    expect(resolveSavedItemDetail(guardado, null, cardDelCombo)).toEqual({
      slug: COMBO,
      params: { term: 24, initial: 0 },
    });
  });

  it('usa el slug guardado cuando el producto entero ya no esta en el catalogo', () => {
    expect(resolveSavedItemDetail(guardado, null, null)).toEqual({
      slug: SUELTO,
      params: { term: 24, initial: 0 },
    });
  });

  it('no manda plazo ni inicial cuando no hay item guardado', () => {
    expect(resolveSavedItemDetail(undefined, null, cardDelCombo)).toEqual({ slug: COMBO });
  });

  it('trata un slug vacio como ausente', () => {
    const vacio: SavedItem = { ...guardado, slug: '' };

    expect(resolveSavedItemDetail(vacio, null, cardDelCombo)?.slug).toBe(COMBO);
  });

  it('devuelve null cuando no hay nada que resolver', () => {
    expect(resolveSavedItemDetail(undefined, null, null)).toBeNull();
    expect(resolveSavedItemDetail({ ...guardado, slug: undefined }, null, null)).toBeNull();
  });

  it('acepta tanto WishlistItem como CartItem', () => {
    const w = {} as WishlistItem;
    const c = {} as CartItem;
    const comoSaved: SavedItem[] = [w, c];

    expect(comoSaved).toHaveLength(2);
  });
});
