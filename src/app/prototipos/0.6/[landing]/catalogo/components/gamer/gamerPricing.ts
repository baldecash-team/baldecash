import { termInFrequency } from '@/app/prototipos/0.6/services/catalogApi';

/**
 * El plazo y la inicial que muestran los componentes de Zona Gamer.
 *
 * Zona Gamer mostraba `maxTermMonths` (el plazo maximo disponible) junto a la
 * cuota del hook, que corresponde a OTRO plazo — la misma mezcla que BAL-2983
 * arreglo en el buscador y BAL-2998 en las cards. Hoy no se nota porque los 23
 * productos de `zona-gamer` tienen hook == maximo y todos son mensuales, pero
 * el dia que entre un producto semanal o con hook distinto, empieza a mentir
 * sin que nada avise (BAL-3001).
 *
 * La referencia es `ProductCard.tsx:299` y `:316-319`.
 */

interface GamerPricingSource {
  maxTermMonths?: number | null;
  hookTermMonths?: number | null;
  paymentFrequency?: string | null;
}

/**
 * Plazo en MESES, sin convertir por frecuencia. Es el que viaja al carrito:
 * el pricing razona en meses y la conversion es solo de presentacion.
 */
export function gamerTermMonths(product: GamerPricingSource): number {
  return product.hookTermMonths ?? product.maxTermMonths ?? 24;
}

/**
 * Plazo en la frecuencia nativa, para mostrar. En semanal 24 meses se ven como
 * 6, igual que en la card (ProductCard.tsx:316-319).
 */
export function gamerDisplayTerm(product: GamerPricingSource): number {
  return termInFrequency(gamerTermMonths(product), product.paymentFrequency);
}

/**
 * Numero de cuotas en la frecuencia nativa — lo que el CartItem llama `term`
 * (48 semanas / 24 quincenas / 24 meses). Es la cuenta inversa de
 * `gamerDisplayTerm`: mismo plazo, contado en periodos en vez de meses.
 * Referencia: `ProductCard.tsx:325` (nativeTermCount).
 */
export function gamerNativeTerm(product: GamerPricingSource): number {
  const months = gamerTermMonths(product);
  if (product.paymentFrequency === 'semanal') return months * 4;
  if (product.paymentFrequency === 'quincenal') return months * 2;
  return months;
}
