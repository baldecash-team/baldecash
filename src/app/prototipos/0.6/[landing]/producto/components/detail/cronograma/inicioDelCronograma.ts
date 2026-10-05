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
 *
 * Sin fecha fija, el "desde" lo calcula ws2 (`desdeBackend`): corte por día y
 * mes destino del pago diferido. Anclar en hoy ponía la cuota 1 en el mes
 * actual, y en renueva (paga-en-diciembre) decía setiembre (BAL-4308). Hoy
 * queda solo como último recurso, mientras llega o si ws2 falla.
 */

import { getFirstPaymentDate, type LandingConfig } from '@/app/prototipos/0.6/types/landingConfig';

export function inicioDelCronograma(
  config: LandingConfig | null | undefined,
  hoy: Date,
  desdeBackend: Date | null = null,
): Date {
  const fija = config ? getFirstPaymentDate(config) : null;
  return fija ?? desdeBackend ?? hoy;
}
