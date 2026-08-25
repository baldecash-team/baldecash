/**
 * Qué muestra la card de reacondicionados en la franja bajo el nombre.
 *
 * La regla la fijó negocio: cada card muestra grados O colores, nunca las dos
 * cosas, y nunca un selector vacío. El umbral es 2 y no 1 porque un selector de
 * un solo elemento no se puede elegir: es decoración. (El catálogo estándar sí
 * pinta desde un color — BAL-2824 —, pero acá el criterio es "se puede elegir".)
 *
 * Los grados le ganan a los colores porque son lo que distingue a un equipo
 * reacondicionado y lo que cambia el precio.
 *
 * `none` NO significa "no dibujar nada": el contenedor se pinta igual, vacío y
 * con el mismo alto, para que la grilla no quede dispareja (ver ProductCard).
 */
export type SelectorMode = 'grades' | 'colors' | 'none';

/** Mínimo de opciones para que algo sea elegible. */
const MIN_OPCIONES = 2;

export function cardSelectorMode(product: {
  gradeSiblings?: { grade: string; isAvailable: boolean }[] | null;
  colors?: unknown[] | null;
}): SelectorMode {
  // Los grados agotados cuentan para el modo: se muestran en gris, así el
  // cliente sabe que ese grado existe aunque hoy no se pueda comprar.
  if ((product.gradeSiblings?.length ?? 0) >= MIN_OPCIONES) return 'grades';
  if ((product.colors?.length ?? 0) >= MIN_OPCIONES) return 'colors';
  return 'none';
}
