/**
 * Productos que no vienen del catálogo.
 *
 * El asistente asume que todo producto seleccionado salió de una tarjeta del
 * catálogo, y de ahí derivan tres comportamientos: le pide los planes de pago
 * que le falten, valida que siga publicado, y recalcula su cuota cuando cambia
 * el plazo o la inicial.
 *
 * Para un producto que NO está en el catálogo, los tres hacen daño:
 *
 * - Pedirle planes al catálogo devuelve los del producto publicado, que no
 *   corresponden al financiamiento que la persona armó. Y si ese producto está
 *   publicado con precio en cero, devuelve cuotas en cero que pisan la buena.
 * - Validar disponibilidad lo marca como no disponible, porque está fuera del
 *   catálogo a propósito, y bloquea un recorrido válido.
 * - Recalcular la cuota la reemplaza por una calculada sobre los plazos del
 *   catálogo, no sobre el que la persona eligió.
 *
 * La calculadora marca así sus productos: su cuota ya se calculó contra el
 * simulador con el plazo elegido, y es la que la persona vio en pantalla.
 */

import type { SelectedProduct } from './ProductContext';

/** Un producto marcado así no se busca ni se valida contra el catálogo. */
export function estaFueraDelCatalogo(product: SelectedProduct): boolean {
  return product.outOfCatalog === true;
}

/**
 * Si hay que pedirle los planes de pago al catálogo.
 *
 * Un producto fuera del catálogo nunca los necesita: no tiene planes allá, y
 * la respuesta se usaría para pisar su cuota.
 */
export function necesitaPlanesDePago(product: SelectedProduct): boolean {
  if (estaFueraDelCatalogo(product)) return false;

  return !product.paymentPlans || product.paymentPlans.length === 0;
}

/**
 * Si su cuota se puede recalcular a partir de los planes del catálogo.
 *
 * Vale tanto para el cambio de plazo como para el de inicial: en los dos casos
 * el reemplazo vendría de una grilla que este producto no usa.
 */
export function admiteRecalculoDeCuota(product: SelectedProduct): boolean {
  return !estaFueraDelCatalogo(product);
}

/** Los productos que sí se validan contra el catálogo. */
export function soloLosDelCatalogo(products: SelectedProduct[]): SelectedProduct[] {
  return products.filter(p => !estaFueraDelCatalogo(p));
}
