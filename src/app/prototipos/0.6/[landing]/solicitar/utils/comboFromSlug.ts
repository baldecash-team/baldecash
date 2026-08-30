/**
 * Combo del que nace un item, deducido del slug de la card.
 *
 * Un mismo equipo convive en varias cards a la vez: el producto suelto y uno o
 * mas combos, todos con el mismo `product_id`. El backend necesita el
 * `combo_id` para saber cual se compro; sin el, solo puede deducirlo del precio,
 * y un combo de regalo (mismo precio que el equipo solo) es indistinguible.
 *
 * `comboId` viaja en el objeto del producto, pero se arma a mano en cada punto
 * de entrada al wizard (catalogo, comparador, copia-home, detalle) y es facil
 * que un punto nuevo se olvide de copiarlo. El slug, en cambio, se propaga
 * siempre porque el wizard lo necesita para pedir los planes de pago — y el
 * backend lo genera con el sufijo `-combo-{id}` para las cards de combo. Esta
 * funcion es la red que ataja esos olvidos.
 */
export function comboIdFromSlug(slug?: string | null): number | undefined {
  if (!slug) return undefined;
  const m = /-combo-(\d+)$/.exec(slug);
  if (!m) return undefined;
  const id = Number(m[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}

/**
 * `comboId` explicito si lo hay; si no, el que delata el slug. `null` cuando no
 * hay combo — es un valor significativo para el backend, que distingue "compro
 * el producto suelto" de "este front no manda el dato".
 */
export function resolveComboId(
  item: { comboId?: number | null; slug?: string | null } | null | undefined,
): number | null {
  if (!item) return null;
  return item.comboId ?? comboIdFromSlug(item.slug) ?? null;
}
