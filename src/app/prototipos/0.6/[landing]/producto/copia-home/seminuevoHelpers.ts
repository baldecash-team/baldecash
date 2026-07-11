/**
 * Helpers compartidos por las variantes seminuevo de copia-home (catálogo y
 * detalle, mobile y desktop). Fuente única de verdad para la garantía de
 * fábrica por modelo y el envío diferido (15/07).
 */

import { isRefurbishedCondition } from '@/app/prototipos/0.6/components/RefurbishedWarningModal';

/** Nota de envío diferido para iPhone seminuevos e iPads (a partir del miércoles 15/07). */
export const DEFERRED_SHIPPING_NOTE =
  'Lo prepararemos con mucho cuidado para ti. El envío o recojo será a partir del miércoles 15/07.';

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
 * Envío diferido (15/07): iPhone seminuevos e iPads (cualquier condición del
 * iPad; el iPhone solo si es seminuevo).
 */
export function hasDeferredShipping(opts: {
  name: string;
  condition?: string;
  deviceType?: string;
  brand?: string;
}): boolean {
  const { name, condition, deviceType, brand } = opts;
  const refurbished = isRefurbishedCondition(condition);
  const isIphone = /iphone/i.test(name);
  const isIpad = /ipad/i.test(name) || (deviceType === 'tablet' && /apple/i.test(brand ?? ''));
  return (isIphone && refurbished) || isIpad;
}
