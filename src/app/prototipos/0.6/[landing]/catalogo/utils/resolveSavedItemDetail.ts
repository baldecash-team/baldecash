import type { CatalogProduct } from '../types/catalog';

/** Lo minimo que comparten `WishlistItem` y `CartItem` para esto. */
export interface SavedItem {
  productId: string;
  slug?: string;
  months: number;
  initialPercent: number;
}

export interface SavedItemDetail {
  slug: string;
  params?: { term?: number; initial?: number };
}

export function resolveSavedItemDetail(
  item: SavedItem | undefined,
  cardEnCatalogo: CatalogProduct | null,
): SavedItemDetail | null {
  const params = item ? { term: item.months, initial: item.initialPercent } : undefined;

  // El slug guardado gana: es la card exacta que el usuario habia guardado. La
  // busqueda por id es el fallback, no al reves — el suelto y sus combos
  // comparten `id`, asi que devuelve la primera card de la lista y no la
  // guardada (BAL-3272, mismo defecto que BAL-3270). Es el orden que
  // `ProductDetailClient` ya usa para estos mismos drawers.
  if (item?.slug) return { slug: item.slug, params };
  if (cardEnCatalogo) return { slug: cardEnCatalogo.slug, params };
  return null;
}
