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
 * Devuelve los `productId` de los items guardados que ya no se pueden abrir.
 *
 * Compara por SLUG cuando el item lo tiene, porque el `productId` no identifica
 * una card: el suelto y sus combos lo comparten. Si al usuario se le archiva el
 * combo que habia guardado, el producto sigue vivo por la card suelta y una
 * comparacion por id lo daria por disponible — mandandolo a una pagina muerta
 * (BAL-3277).
 *
 * La salida sigue siendo `productId` porque es lo que hoy consumen los
 * componentes para deshabilitar el item. Eso es correcto mientras el storage
 * este keyeado por `productId` (hay a lo sumo una entrada por producto); cuando
 * la clave pase a slug, esto tiene que devolver slugs.
 */
export function findUnavailableIds(
  items: ItemGuardado[],
  cardsVivas: CardViva[],
): string[] {
  const idsVivos = new Set(cardsVivas.map((c) => c.id));
  const slugsVivos = new Set(cardsVivas.map((c) => c.slug));

  return items
    .filter((i) => (i.slug ? !slugsVivos.has(i.slug) : !idsVivos.has(i.productId)))
    .map((i) => i.productId);
}
