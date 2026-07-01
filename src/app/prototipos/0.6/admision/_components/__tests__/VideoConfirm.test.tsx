import { VIDEO_DONE_TITLE, VIDEO_DONE_MESSAGE } from '../VideoConfirm';

test('copy de éxito actualizado', () => {
  expect(VIDEO_DONE_TITLE).toBe('¡Validación completada!');
  expect(VIDEO_DONE_MESSAGE).toBe(
    'Seguiremos evaluando tu solicitud y te notificaremos por WhatsApp las novedades.'
  );
});
