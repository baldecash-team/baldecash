import { cardKey } from './cardKey';

/** Lo minimo que este calculo necesita de un item guardado. */
export interface ItemGuardado {
  productId: string;
  slug?: string;
}

/** Lo minimo que necesita de una card viva del catalogo. */
export interface CardViva {
  id: string;
  slug: string;
}

/**
 * Devuelve las claves de card (ver cardKey) de los items guardados que ya no
 * se pueden abrir.
 *
 * Compara por SLUG cuando el item lo tiene, porque el `productId` no identifica
 * una card: el suelto y sus combos lo comparten. Si al usuario se le archiva el
 * combo que habia guardado, el producto sigue vivo por la card suelta y una
 * comparacion por id lo daria por disponible — mandandolo a una pagina muerta
 * (BAL-3277).
 *
 * La salida es la clave de card (cardKey: slug, o productId si el item no
 * tiene slug) y no el `productId` crudo, porque el storage de wishlist ahora
 * puede tener dos entradas con el mismo productId (el suelto y su combo,
 * BAL-3328) y devolver productId las confundiria entre si. Los consumidores
 * de `unavailableWishlistIds` deben comparar por cardKey, no por productId.
 */
export function findUnavailableIds(
  items: ItemGuardado[],
  cardsVivas: CardViva[],
): string[] {
  const idsVivos = new Set(cardsVivas.map((c) => c.id));
  const slugsVivos = new Set(cardsVivas.map((c) => c.slug));

  return items
    .filter((i) => (i.slug ? !slugsVivos.has(i.slug) : !idsVivos.has(i.productId)))
    .map((i) => cardKey(i));
}
