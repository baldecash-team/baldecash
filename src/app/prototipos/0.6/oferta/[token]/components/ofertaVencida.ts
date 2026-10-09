/**
 * Texto de la pantalla "Esta oferta venció", según el caso de la oferta.
 *
 * En el downgrade (Caso 4) la oferta que vence sin que el cliente elija cierra
 * la solicitud (rechazo automático): no hay nada que "reactivar", así que el
 * texto no lo promete. El upsell y la oferta estándar conservan su copy.
 *
 * El caso viaja en el 410 del backend (`detail.offer_case`): con el link
 * vencido ya no hay oferta cargada de dónde leerlo.
 */
import { OfferApiError } from '../../../services/offerApi';
import type { OfertaEstadoIcon } from './OfertaEstadoMensaje';

export interface CopyDeEstado {
  icon: OfertaEstadoIcon;
  title: string;
  body: string;
}

export const OFERTA_VENCIDA_DOWNGRADE: CopyDeEstado = {
  icon: 'clock',
  title: 'Esta oferta venció',
  body: 'El tiempo para elegir tu equipo terminó y tu solicitud se cerró. Si quieres volver a intentarlo, escríbenos.',
};

/** `offer_case` del error del backend (downgrade/upsell/standard), o null. */
export function casoDelError(err: unknown): string | null {
  if (!(err instanceof OfferApiError)) return null;
  const caso = err.data?.offer_case;
  return typeof caso === 'string' && caso ? caso : null;
}

/** El copy de un link muerto: el de `porDefecto` salvo el downgrade vencido. */
export function copyDeLinkMuerto(
  porDefecto: CopyDeEstado,
  reason: string,
  offerCase: string | null | undefined,
): CopyDeEstado {
  if (reason === 'expired' && offerCase === 'downgrade') return OFERTA_VENCIDA_DOWNGRADE;
  return porDefecto;
}
