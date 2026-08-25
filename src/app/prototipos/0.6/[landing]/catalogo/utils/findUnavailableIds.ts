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

/** Que forma toma cada item que sobrevive al filtro. */
export type ProyeccionSalida = 'cardKey' | 'productId';

export interface FindUnavailableIdsOptions {
  /**
   * 'cardKey' (default): clave de card (slug, o productId si el item no
   * tiene slug). La usa la wishlist porque su storage puede tener dos
   * entradas con el mismo productId (el suelto y su combo, BAL-3328) y
   * devolver productId las confundiria entre si.
   *
   * 'productId': el `productId` crudo del item. La usa el carrito porque
   * sus consumidores (CartDrawer, NavbarCart) siguen comparando por
   * productId — el carrito tiene su propia identidad via `comboId` y queda
   * fuera del alcance de BAL-3328.
   */
  output?: ProyeccionSalida;
}

/**
 * Devuelve la clave (ver `output`) de los items guardados que ya no se
 * pueden abrir.
 *
 * El FILTRO siempre compara por SLUG cuando el item lo tiene, porque el
 * `productId` no identifica una card: el suelto y sus combos lo comparten.
 * Si al usuario se le archiva el combo que habia guardado, el producto sigue
 * vivo por la card suelta y una comparacion por id lo daria por disponible —
 * mandandolo a una pagina muerta (BAL-3277). Esto aplica a AMBOS llamadores
 * (carrito y wishlist): quitarle el slug al item de entrada para forzar la
 * comparacion por id reintroduce ese mismo bug (regresion post-BAL-3328).
 *
 * La PROYECCION de salida si difiere segun el llamador — ver
 * `FindUnavailableIdsOptions.output`.
 */
export function findUnavailableIds(
  items: ItemGuardado[],
  cardsVivas: CardViva[],
  options: FindUnavailableIdsOptions = {},
): string[] {
  const { output = 'cardKey' } = options;
  const idsVivos = new Set(cardsVivas.map((c) => c.id));
  const slugsVivos = new Set(cardsVivas.map((c) => c.slug));

  return items
    .filter((i) => (i.slug ? !slugsVivos.has(i.slug) : !idsVivos.has(i.productId)))
    .map((i) => (output === 'productId' ? i.productId : cardKey(i)));
}
