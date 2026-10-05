import type { CatalogProduct, CartItem, WishlistItem } from '../types/catalog';

/**
 * Lo que este resolutor necesita de un item guardado.
 *
 * Se deriva de los tipos reales en vez de redeclararse: si `slug` desapareciera
 * de `WishlistItem`/`CartItem`, un tipo propio seguiria compilando y el
 * resolutor volveria en silencio al lookup por id — justo la regresion que esto
 * existe para evitar.
 */
export type SavedItem = Pick<WishlistItem & CartItem, 'productId' | 'slug' | 'months' | 'initialPercent'>;

export interface SavedItemDetail {
  slug: string;
  params?: { term?: number; initial?: number };
}

/**
 * Decide a que detalle lleva "ver producto" desde favoritos o carrito.
 *
 * @param item          el item guardado, si sigue en la lista
 * @param cardGuardada  la card del catalogo cuyo slug coincide con `item.slug`
 * @param cardPorId     `findProductOrSibling(productId)`
 */
export function resolveSavedItemDetail(
  item: SavedItem | undefined,
  cardGuardada: CatalogProduct | null,
  cardPorId: CatalogProduct | null,
): SavedItemDetail | null {
  const params = item ? { term: item.months, initial: item.initialPercent } : undefined;

  // 1. El slug guardado gana: es la card exacta que el usuario habia guardado.
  //    Buscarla por id devolveria la primera card del producto, y el suelto y
  //    sus combos comparten `id` (BAL-3272, mismo defecto que BAL-3270). Es el
  //    orden que `ProductDetailClient` ya usa para estos mismos drawers.
  if (item?.slug && cardGuardada) return { slug: item.slug, params };

  // 2. El slug guardado ya no existe en el catalogo — un combo archivado, por
  //    ejemplo. Mejor la card viva del producto que una pagina rota. Desde
  //    BAL-3277 `unavailableWishlistIds` ya detecta este caso y el item sale
  //    marcado; esto queda como segunda linea, para cuando el usuario llega
  //    igual (la deteccion es asincrona y puede no haber respondido).
  if (cardPorId) return { slug: cardPorId.slug, params };

  // 3. El producto entero salio del catalogo. Queda el slug guardado.
  if (item?.slug) return { slug: item.slug, params };

  return null;
}
