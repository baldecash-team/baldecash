/**
 * Helpers compartidos por las variantes seminuevo de copia-home (catálogo y
 * detalle, mobile y desktop). Fuente única de verdad para la garantía de
 * fábrica por modelo y la nota de envío diferido.
 */

import {
  formatShippingDate,
  type DeferredDelivery,
} from '@/app/prototipos/0.6/utils/deferredDelivery';

/**
 * Garantía de fábrica según el modelo (regla de negocio):
 *  - iPhone 15 o superior → 12 meses
 *  - iPhone 13 / 13 Pro Max → 6 meses
 *  - resto → warranty del producto o "1 año".
 */
export function factoryWarranty(name: string, fallback?: string): string {
  const m = name.match(/iphone\s*(\d{1,2})/i);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 15) return '12 meses';
    if (n === 13) return '6 meses';
  }
  return fallback || '1 año';
}

/**
 * Nota de envío diferido para el modal de seminuevo (BAL-4032).
 *
 * Devuelve '' cuando el producto no es diferido o cuando el backend no mandó
 * `estimatedFrom`. A propósito NO hay texto de respaldo: la versión anterior
 * traía la fecha escrita a mano ("miércoles 15/07") y siguió anunciándola meses
 * después de que pasara. Es preferible no decir nada a decir una fecha falsa.
 */
export function deferredShippingNote(
  deferredDelivery?: DeferredDelivery | null,
): string {
  if (!deferredDelivery?.isDeferred) return '';
  const fecha = formatShippingDate(deferredDelivery.estimatedFrom);
  if (!fecha) return '';
  return `Lo prepararemos con mucho cuidado para ti. El envío o recojo será a partir del ${fecha}.`;
}
