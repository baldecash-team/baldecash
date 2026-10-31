/**
 * Nombre del equipo tal como lo vio la persona en la card del catálogo.
 *
 * Todas las entradas que arman el producto elegido (card, ficha, comparador,
 * favoritos, quiz, carrito, copia-home, link especial) guardan en `name` el
 * nombre de venta que arma el backend (`displayName`, ej. «Laptop PM1503CDA R5
 * 16GB 512GB») y en `shortName` el `product.name` interno de BD («PM1503CDA»).
 * La solicitud tiene que mostrar el de la card, así que se muestra `name`.
 *
 * `shortName` queda solo como respaldo: si un producto guardado en una sesión
 * vieja llegara sin `name`, se muestra el nombre corto antes que nada.
 */
export function nombreDelEquipo(
  producto: { name?: string | null; shortName?: string | null } | null | undefined,
): string {
  if (!producto) return '';
  return producto.name?.trim() || producto.shortName?.trim() || '';
}
