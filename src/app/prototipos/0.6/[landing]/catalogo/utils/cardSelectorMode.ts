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

/**
 * Fuera de la landing de reacondicionados la card normal muestra colores, y
 * solo cambia a grados cuando el producto está AGRUPADO por grado: dos o más
 * grados hermanos en la misma familia.
 *
 * Por qué hace falta: al agrupar el grado A con el B, el catálogo muestra UNA
 * card por familia. Sin el selector, el B quedaba escondido detrás del A en
 * Home y nadie podía elegirlo.
 *
 * Por qué desde 2 y no desde 1 como en reacondicionados: allí la card es
 * austera y el grado es lo que el equipo ES. En la card normal un grado solo no
 * es un grupo. Por eso el grado único NO entra aquí: lo resuelve
 * `gradosDeLaCard`, que lo pinta con su botón ya elegido y, igual que el
 * agrupado, en lugar del color. Sin grado, sigue igual.
 */
const MIN_GRADOS_AGRUPADOS = 2;

export function tieneGradosAgrupados(product: {
  gradeSiblings?: { grade: string; isAvailable: boolean }[] | null;
}): boolean {
  return (product.gradeSiblings?.length ?? 0) >= MIN_GRADOS_AGRUPADOS;
}

/** Lo mínimo de un grado que necesita la franja de la card. */
interface GradoDeCard {
  grade: string;
  productId: number;
  slug: string;
  price: number | null;
  minTermQuota: number | null;
  isAvailable: boolean;
}

/**
 * Los grados que pinta la card.
 *
 * Si el producto está agrupado, son sus hermanos tal como llegan. Si NO tiene
 * hermanos pero SÍ tiene grado (`grade` del listado), es una lista de uno: el
 * propio producto. Sin esto, 21 de los 27 reacondicionados de Home tenían
 * grado y no lo mostraban en ningún botón, solo los 6 agrupados.
 *
 * El grado único se arma con los datos de la card —su id y su slug—, así que
 * nunca cuenta como «otro hermano»: pulsarlo no cambia el producto ni navega.
 * Va disponible porque es la card que el listado está ofreciendo.
 *
 * Sin grado (`grade` nulo) y sin hermanos devuelve vacío: esa card no cambia.
 */
export function gradosDeLaCard<T extends GradoDeCard>(product: {
  id: string | number;
  slug: string;
  price: number;
  grade?: string | null;
  gradeSiblings?: T[] | null;
}): (T | GradoDeCard)[] {
  const hermanos = product.gradeSiblings ?? [];
  if (hermanos.length > 0) return hermanos;
  if (!product.grade) return [];
  return [{
    grade: product.grade,
    productId: Number(product.id),
    slug: product.slug,
    price: product.price,
    minTermQuota: null,
    isAvailable: true,
  }];
}
