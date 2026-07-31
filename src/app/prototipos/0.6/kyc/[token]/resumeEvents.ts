/**
 * Eventos de la ruta `/kyc/[token]` ("Continuar después").
 *
 * Esta ruta vive FUERA de `EventTrackerProvider` (montado en
 * `[landing]/layout.tsx`, que esta ruta no hereda porque `kyc` es un
 * segmento estático hermano de `[landing]`, no un hijo). Por eso
 * `useEventTrackerOptional()` devuelve `null` acá y no se emite nada por esa
 * vía. Este módulo replica el patrón ya usado en `admision/_lib/events.ts`:
 * postea directo a `/public/events/batch` usando el **token del link** como
 * `session_id`, así el backend puede agrupar todo el recorrido de un mismo
 * enlace. Fire-and-forget: nunca rompe el flujo del usuario.
 */
import { sendEventsBatch, type TrackingEvent, type EventType } from '../../services/eventsApi';

export type EventSink = (sessionId: string, events: TrackingEvent[]) => void;

const defaultSink: EventSink = (sessionId, events) => {
  void sendEventsBatch(sessionId, events);
};

/** Propiedades permitidas en un evento (sin PII). */
export type ResumeEventProps = Record<string, string | number | boolean>;

/** Eventos que puede emitir esta ruta — ver EventType (Task 2) para el resto del catálogo. */
export type ResumeEventType = 'kyc_resume_link_opened' | 'kyc_resume_link_expired' | 'kyc_resumed';

export interface ResumeEvents {
  /**
   * Emite un evento de esta ruta. `application_code` va SIEMPRE en
   * `properties` cuando esté disponible (el panel de admin2 filtra por ese
   * campo en SQL; omitirlo lo deja invisible en el panel sin avisar).
   */
  track: (type: ResumeEventType, props?: ResumeEventProps) => void;
}

/**
 * Crea un emisor de eventos ligado al `token` del link (actúa como
 * `session_id`). El `sink` es inyectable para pruebas; por defecto envía al
 * backend.
 */
export function resumeEvents(token: string, sink: EventSink = defaultSink): ResumeEvents {
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
