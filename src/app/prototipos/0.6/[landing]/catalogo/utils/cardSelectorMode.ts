/**
 * Qué muestra la card de reacondicionados en la franja bajo el nombre.
 *
 * La regla la fijó negocio: cada card muestra grados O colores, nunca las dos
 * cosas, y nunca un selector vacío.
 *
 * Los GRADOS se pintan desde 1: en un reacondicionado el grado no es una opción
 * a elegir, es lo que el equipo ES, y el cliente necesita verlo en el catálogo
 * antes de entrar. Con el umbral en 2 la card de un equipo con un solo grado
 * dejaba un hueco de 44px donde debía decir "A · Excelente estado", y el grado
 * solo sobrevivía si alguien lo había escrito en el nombre del producto.
 *
 * Los COLORES siguen exigiendo 2, que es donde el argumento original vale: un
 * color único no informa de nada que la foto no diga ya. (El catálogo estándar
 * sí pinta desde un color — BAL-2824 —, pero esta variante es más austera.)
 *
 * Los grados le ganan a los colores porque son lo que distingue a un equipo
 * reacondicionado y lo que cambia el precio.
 *
 * `none` NO significa "no dibujar nada": el contenedor se pinta igual, vacío y
 * con el mismo alto, para que la grilla no quede dispareja (ver ProductCard).
 */
export type SelectorMode = 'grades' | 'colors' | 'none';

/** El grado se informa desde 1: es lo que el equipo ES, no una opción a elegir. */
const MIN_GRADOS = 1;
/** Un color único no informa nada que la foto no diga ya: hace falta poder elegir. */
const MIN_COLORES = 2;

export function cardSelectorMode(product: {
  gradeSiblings?: { grade: string; isAvailable: boolean }[] | null;
  colors?: unknown[] | null;
}): SelectorMode {
  // Los grados agotados cuentan para el modo: se muestran en gris, así el
  // cliente sabe que ese grado existe aunque hoy no se pueda comprar.
  if ((product.gradeSiblings?.length ?? 0) >= MIN_GRADOS) return 'grades';
  if ((product.colors?.length ?? 0) >= MIN_COLORES) return 'colors';
  return 'none';
}
