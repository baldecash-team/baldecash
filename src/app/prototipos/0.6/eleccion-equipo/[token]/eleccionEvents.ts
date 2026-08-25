/**
 * Eventos de la ruta `/eleccion-equipo/[token]`.
 *
 * Esta ruta vive FUERA de `EventTrackerProvider` (montado en
 * `[landing]/layout.tsx`, que esta ruta no hereda porque `eleccion-equipo` es
 * un segmento estático hermano de `[landing]`, no un hijo), así que
 * `useAnalytics()` sería mudo acá. Mismo patrón que `kyc/[token]/resumeEvents`
 * y `admision/_lib/events`: se postea directo a `/public/events/batch` usando
 * el **token del link** como `session_id`, para que todo el recorrido de un
 * mismo enlace quede agrupado. Fire-and-forget: nunca rompe el flujo.
 *
 * DOS REGLAS QUE NO SE NEGOCIAN:
 * 1. Los `event_type` tienen que estar EXACTAMENTE como el catálogo del
 *    backend (`EQUIPMENT_SELECTION_EVENT_TYPES` en `app/schemas/user_event.py`):
 *    uno que no esté se descarta en silencio — 200 OK y el dato no existe.
 * 2. Nunca datos personales ni el serial en `properties`. El backend tiene una
 *    lista de propiedades prohibidas y descarta el evento ENTERO si alguna
 *    aparece. Por eso acá solo viajan `unit_id`, `display_number`, contadores y
 *    `reason`.
 */
import { sendEventsBatch, type TrackingEvent, type EventType } from '../../services/eventsApi';

export type EventSink = (sessionId: string, events: TrackingEvent[]) => void;

const defaultSink: EventSink = (sessionId, events) => {
  void sendEventsBatch(sessionId, events);
};

/** Propiedades permitidas en un evento de esta ruta (sin PII, sin serial). */
export type EleccionEventProps = Record<string, string | number | boolean | null>;

/** Los 10 eventos de esta pantalla, ya dados de alta en el backend. */
export type EleccionEventType =
  | 'equipment_selection_link_open'
  | 'equipment_selection_already_chosen'
  | 'equipment_selection_empty'
  | 'equipment_selection_gallery_open'
  | 'equipment_selection_photo_change'
  | 'equipment_selection_video_play'
  | 'equipment_selection_click'
  | 'equipment_selection_confirmed'
  | 'equipment_selection_error'
  | 'equipment_selection_link_expired';

export interface EleccionEvents {
  track: (type: EleccionEventType, props?: EleccionEventProps) => void;
}

/**
 * Crea un emisor ligado al `token` del link (que actúa como `session_id`). El
 * `sink` es inyectable para pruebas; por defecto envía al backend.
 */
export function eleccionEvents(token: string, sink: EventSink = defaultSink): EleccionEvents {
  function emit(event_type: EventType, properties: Record<string, unknown>): void {
    const evt: TrackingEvent = {
      event_type,
      client_ts: Date.now(),
      page_url: typeof location !== 'undefined' ? location.href : '',
      properties,
    };
    try {
      sink(token, [evt]);
    } catch {
      // nunca propagar errores de tracking
    }
  }

  return {
    track: (type, props = {}) => emit(type, { token, ...props }),
  };
}
