import type { EventType } from '../eventsApi';

/**
 * Guardarraíl de tipos: si alguno de estos strings sale del union, esto no
 * compila. El backend descarta en silencio los eventos no catalogados, así que
 * un typo acá se traduce en métricas vacías sin ningún error visible.
 */
const RESUME_EVENTS: EventType[] = [
  'kyc_pause_click',
  'kyc_pause_requested',
  'kyc_resume_link_sent',
  'kyc_resume_link_send_error',
  'kyc_resume_link_opened',
  'kyc_resume_link_expired',
  'kyc_resumed',
];

it('los 7 eventos de continuar-despues estan en el union EventType', () => {
  expect(new Set(RESUME_EVENTS).size).toBe(7);
});
