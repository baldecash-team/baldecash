/**
 * El día del que arranca el cronograma dibujado en el detalle del producto.
 *
 * Por defecto es hoy: el catálogo no sabe cuándo van a aprobar la solicitud y
 * lo único honesto es mostrar el calendario relativo al momento en que se mira.
 *
 * Los convenios que cobran contra planilla son la excepción: la campaña fija
 * una fecha y todos empiezan a pagar ese día sin importar cuándo solicitaron.
 * Esa fecha vive en `landing.extra_data.first_payment.date` y la sirve
 * `/public/landing/{slug}/config`; es la misma que ws2 usa para el cronograma
 * del KYC y la que le manda a legacy, así que la vitrina, el contrato y el
 * cronograma real cuentan el mismo calendario.
 */

import { getFirstPaymentDate, type LandingConfig } from '@/app/prototipos/0.6/types/landingConfig';

export function inicioDelCronograma(
  config: LandingConfig | null | undefined,
  hoy: Date,
): Date {
  if (!config) return hoy;
  return getFirstPaymentDate(config) ?? hoy;
}
