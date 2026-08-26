import type { CatalogProduct } from '../types/catalog';
import { mergeColorSibling } from './mergeColorSibling';
import { mergeGradeSibling } from './mergeGradeSibling';

/**
 * Devuelve la card que el usuario toco, resolviendo el color elegido si lo hay.
 *
 * `product.id` NO identifica una card: el suelto y cada uno de sus combos son
 * cards distintas de la misma landing con el MISMO id, y solo se distinguen por
 * el slug (`{base}` vs `{base}-combo-{id}`) y el `landing_product_id`. Buscar
 * por id en la lista del catalogo devuelve la primera card, que suele ser la del
 * combo: eso era BAL-3270, con "Lo quiero" en el iPad suelto abriendo el combo
 * con lapiz y case.
 *
 * Por eso aca no se busca nada por id. El color elegido siempre sale de
 * `clickedCard.colors` (ver `ProductCard`: `selectedColor` se busca en
 * `product.colors`), asi que la card tocada tiene toda la informacion necesaria
 * y no hace falta mirar el resto del catalogo.
 */
export function resolveWizardTarget(
  clickedCard: CatalogProduct,
  activeProductId: string,
): CatalogProduct {
  if (activeProductId === clickedCard.id) return clickedCard;

  const sibling = clickedCard.colors?.find((c) => c.productId === activeProductId);
  if (sibling) return mergeColorSibling(clickedCard, sibling, activeProductId);

  // Grado elegido en la card (landing de reacondicionados). Cada grado es un
  // Product aparte, asi que el wizard tiene que recibir el del grado y no el que
  // trajo el listado: sin esto, elegir el grado C llevaba a solicitar el B
  // (BAL-3340).
  const grado = clickedCard.gradeSiblings?.find(
    (g) => String(g.productId) === activeProductId,
  );
  if (grado) return mergeGradeSibling(clickedCard, grado, activeProductId);

  return clickedCard;
}
