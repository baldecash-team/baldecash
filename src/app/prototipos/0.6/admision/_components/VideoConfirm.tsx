import { SuccessScreen } from './SuccessScreen';

/** Mensaje canónico de "videos recibidos" — al finalizar el flujo y al re-consultar el link. */
export const VIDEO_DONE_TITLE = '¡Listo! Ya recibimos tus videos.';
export const VIDEO_DONE_MESSAGE =
  'Tu validación de video está completa. La estamos revisando y seguimos con tu evaluación.';

export function VideoConfirm() {
  return <SuccessScreen title={VIDEO_DONE_TITLE} message={VIDEO_DONE_MESSAGE} whatsapp />;
}
