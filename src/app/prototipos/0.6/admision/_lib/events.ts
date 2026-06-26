/**
 * Eventos de admisión por link y etapa (mejora #10).
 * Reusa la infraestructura de eventos de baldecash (`sendEventsBatch` →
 * POST /public/events/batch). El `token` del link actúa como `session_id`,
 * de modo que el backend puede agrupar todo el recorrido de un link único.
 * Fire-and-forget: nunca rompe el flujo del usuario.
 */
import { sendEventsBatch, type TrackingEvent, type EventType } from '../../services/eventsApi';

export type EventSink = (sessionId: string, events: TrackingEvent[]) => void;

const defaultSink: EventSink = (sessionId, events) => {
  void sendEventsBatch(sessionId, events);
};

export interface AdmissionEvents {
  /** Apertura del link. */
  linkOpen: () => void;
  /** Entrada a una etapa (marca el inicio para medir su duración). */
  stageEnter: (stage: string) => void;
  /** Salida de una etapa (emite `duration_ms` desde el último `stageEnter`). */
  stageExit: (stage: string) => void;
  /** Flujo completado. */
  completed: () => void;
}

/**
 * Crea un emisor de eventos ligado a un `token` de link.
 * El `sink` es inyectable para pruebas; por defecto envía al backend.
 */
export function admissionEvents(token: string, sink: EventSink = defaultSink): AdmissionEvents {
  const enterTs = new Map<string, number>();

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
    linkOpen: () => emit('admission_link_open', { token }),
    stageEnter: (stage: string) => {
      enterTs.set(stage, Date.now());
      emit('admission_stage_enter', { token, stage });
    },
    stageExit: (stage: string) => {
      const start = enterTs.get(stage);
      const duration_ms = start != null ? Date.now() - start : 0;
      emit('admission_stage_exit', { token, stage, duration_ms });
    },
    completed: () => emit('admission_completed', { token }),
  };
}
