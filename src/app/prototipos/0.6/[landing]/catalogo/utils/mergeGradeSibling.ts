import type { CatalogProduct, CatalogGradeSibling } from '../types/catalog';

/**
 * Proyecta un hermano de grado sobre su card padre.
 *
 * Hermano de `mergeColorSibling`, y vive aparte por la misma razon: lo usan los
 * resolutores del catalogo y tenerlo duplicado haria que un campo nuevo se
 * agregara en una copia y no en la otra.
 *
 * Un grado trae MENOS campos que un color: solo `productId`, `slug`, `price`,
 * `minTermQuota` e `isAvailable` (ver `CatalogGradeSibling`). No trae specs,
 * imagenes ni nombre, y eso es correcto — los grados son el mismo equipo en
 * distinto estado, asi que las fotos y la ficha tecnica del padre siguen siendo
 * las suyas. Solo cambia lo que de verdad cambia: identidad y precio.
 *
 * El nombre SI queda el del padre, aunque lleve "Grado B" adentro. Nombrar el
 * grado correcto es cosa del detalle y del wizard, que piden el producto por su
 * id/slug y reciben del backend el nombre real; inventarlo aca con un reemplazo
 * de texto daria un nombre que no existe en ninguna tabla.
 */
export function mergeGradeSibling(
  parent: CatalogProduct,
  sibling: CatalogGradeSibling,
  productId: string,
): CatalogProduct {
  return {
    ...parent,
    id: productId,
    slug: sibling.slug || parent.slug,
    // `??` y no `||`: el API manda `null` cuando el grado no tiene pricing
    // cargado, y ahi hay que conservar el del padre en vez de dejar la card en 0.
    price: sibling.price ?? parent.price,
    // `lowestQuota`, la misma punta que muestra la card: si el wizard arrancara
    // con la del plazo mas corto, el numero cambiaria al pasar de una pantalla a
    // la otra sin que nadie tocara nada.
    quotaMonthly: sibling.lowestQuota ?? parent.quotaMonthly,
    // El grado elegido es OTRO producto: el descuento y el precio "antes" del
    // padre son de su propio pricing y no aplican aca. Se limpian en vez de
    // arrastrarse, igual que hace el color cuando el hermano no trae promocion
    // (BAL-2859).
    originalQuotaMonthly: undefined,
    discount: undefined,
  };
}
