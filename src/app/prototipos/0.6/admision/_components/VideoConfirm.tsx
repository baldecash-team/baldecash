import { SuccessScreen } from './SuccessScreen';

/** Mensaje canónico de "videos recibidos" — al finalizar el flujo y al re-consultar el link. */
export const VIDEO_DONE_TITLE = '¡Validación completada!';
export const VIDEO_DONE_MESSAGE =
  'Seguiremos evaluando tu solicitud y te notificaremos por WhatsApp las novedades.';

export function VideoConfirm() {
  return <SuccessScreen title={VIDEO_DONE_TITLE} message={VIDEO_DONE_MESSAGE} whatsapp />;
}
