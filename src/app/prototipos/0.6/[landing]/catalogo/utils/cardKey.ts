/**
 * Clave de identidad de una card del catalogo.
 *
 * `id` NO identifica una card: el equipo suelto y cada uno de sus combos son
 * cards distintas de la misma landing con el MISMO id, y solo se distinguen por
 * el slug (`{base}` vs `{base}-combo-{id}`). Identificar por id hace que
 * favoritos y comparar las confundan entre si — eso era BAL-3328, mismo defecto
 * que BAL-3270 y BAL-3272 ya arreglaron para la navegacion.
 *
 * Acepta tanto una card del catalogo (`id`) como un item guardado
 * (`productId`), para que un solo criterio sirva a los dos lados.
 *
 * Sin slug cae al id: un favorito guardado antes de este cambio sigue teniendo
 * clave y no se pierde. Es una aproximacion — resuelve a la card del producto,
 * no necesariamente al combo que el usuario habia guardado — pero degradar a
 * "el favorito existe" es mejor que descartarlo.
 */
export function cardKey(card: { slug?: string; productId?: string; id?: string }): string {
  const slug = card.slug?.trim();
  if (slug) return slug;
  return card.productId ?? card.id ?? '';
}
