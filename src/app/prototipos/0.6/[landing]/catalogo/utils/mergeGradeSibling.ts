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
 * El nombre SI viaja, porque el backend manda el de BD (`name` del hermano).
 * Lo que NO se hace es fabricarlo: reemplazar "Grado B" por "Grado C" sobre el
 * nombre del padre daria un titulo que no existe en ninguna tabla —los nombres
 * no siguen un patron unico, el grado A suele venir sin sufijo y los demas con
 * "(Reacondicionada Grado X)"— y ademas discreparia del que muestra el detalle.
 */
export function comboIdDelGrado(
  parent: Pick<CatalogProduct, 'comboId'>,
  sibling: Pick<CatalogGradeSibling, 'comboId'>,
): number | undefined {
  // Backend viejo: el campo no viaja y lo único seguro es el combo de la card.
  if (sibling.comboId === undefined) return parent.comboId;
  // `null` = ese grado va suelto: no se arrastra el combo de otro grado.
  return sibling.comboId ?? undefined;
}

/**
 * Un grado que no se puede elegir en la card: sin stock, o sin cuota
 * calculable. Sin cuota pasaba en las cards de combo con el backend viejo
 * (`lowest_quota: null`): la card caía a la cuota del grado anterior y
 * mostraba la del A con el B elegido. Mejor el botón apagado que una cuota
 * ajena. El grado de la propia card nunca cuenta: sus datos son los de la card.
 */
export function gradoNoElegible(
  sibling: Pick<CatalogGradeSibling, 'productId' | 'isAvailable' | 'lowestQuota'>,
  cardProductId: string | number,
): boolean {
  if (!sibling.isAvailable) return true;
  if (String(sibling.productId) === String(cardProductId)) return false;
  return sibling.lowestQuota == null;
}

export function mergeGradeSibling(
  parent: CatalogProduct,
  sibling: CatalogGradeSibling,
  productId: string,
): CatalogProduct {
  return {
    ...parent,
    id: productId,
    slug: sibling.slug || parent.slug,
    // El combo del grado elegido, no el de la card: el submit lo reenvía y con
    // el de otro grado el pedido salía con el kit del equipo equivocado.
    comboId: comboIdDelGrado(parent, sibling),
    // El nombre del grado, de BD. Sin esto el wizard y el aviso de
    // reacondicionado nombran el grado que trajo el listado. `displayName`
    // primero: es el de la card del grado y en un combo trae «(con … de
    // regalo)», que `name` no tiene.
    displayName: sibling.displayName || sibling.name || parent.displayName,
    name: sibling.name || parent.name,
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
