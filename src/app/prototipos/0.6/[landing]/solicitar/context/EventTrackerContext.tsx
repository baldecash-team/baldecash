'use client';

/**
 * EventTrackerContext - Behavioral event tracking for the wizard
 *
 * Buffers events and sends them in batches every 5 seconds (or on page unload).
 * Automatically tracks: session_start, page_enter, page_exit, scroll_depth,
 * tab_hidden, tab_visible.
 *
 * Exposes `track()` for manual events: input_focus, input_blur, form_start, form_abandon.
 *
 * Privacy: NEVER captures field values. All properties are sanitized before sending.
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { GA_MEASUREMENT_ID } from '@/lib/ga';
import { parseErrorSource } from '@/app/prototipos/0.6/analytics/errorSource';
import { useSession } from './SessionContext';
import {
  TrackingEvent,
  EventType,
  sendEventsBatch,
  sanitizeProperties,
} from '../../../services/eventsApi';

// ============================================================================
// CONFIG
// ============================================================================

/** How often to flush the event buffer (ms) */
const FLUSH_INTERVAL_MS = 5_000;

/** Max events to buffer before forcing a flush */
const MAX_BUFFER_SIZE = 50;

/** Scroll depth thresholds to report */
const SCROLL_THRESHOLDS = [25, 50, 75, 100];

/**
 * UUIDs que ya emitieron `sesion_vinculada` en esta carga de página.
 *
 * Vive a nivel de módulo y no en un ref del provider a propósito: en
 * StrictMode y en las transiciones de ruta el provider se vuelve a montar con
 * la misma sesión, y un ref nuevo dejaría pasar una segunda emisión. Al
 * recargar, el módulo se reinicia, pero entonces la sesión ya no es nueva
 * (`isNewSession` es false) y tampoco se emite.
 */
const sesionesVinculadas = new Set<string>();

/**
 * Ids de sesión que ya se fijaron como propiedad de usuario en GA4.
 *
 * Mismo criterio que `sesionesVinculadas`: vive a nivel de módulo para que un
 * remount del provider no vuelva a fijarla ni duplique el evento de control.
 */
const sesionesPuenteadas = new Set<number>();

/**
 * Eventos que, además de ir al backend propio, se publican en el `dataLayer`
 * para que GTM los reenvíe a GA4 (y de ahí a la exportación de BigQuery).
 *
 * La lista es corta a propósito y conviene mantenerla así: el backend recibe
 * más de 200 tipos de evento, muchos de altísima frecuencia (`scroll_depth`,
 * `input_focus`, `page_enter`). Volcarlos todos a GA4 sería ruido, gastaría
 * cupo de nombres de evento y no aportaría nada al análisis de marketing.
 */
const EVENTOS_A_DATALAYER = new Set<EventType>(['sesion_vinculada']);

/**
 * Publica un evento en el `dataLayer` si está en la lista de arriba.
 *
 * Silencioso por diseño: si no hay `window`, si GTM todavía no cargó o si algo
 * falla, no pasa nada. El tracking nunca debe romper el flujo del usuario, y el
 * evento igual viaja al backend propio por el camino normal.
 */
function publicarEnDataLayer(event: TrackingEvent): void {
  if (typeof window === 'undefined') return;
  if (!EVENTOS_A_DATALAYER.has(event.event_type)) return;

  try {
    const w = window as Window & { dataLayer?: Record<string, unknown>[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({
      event: event.event_type,
      ...(event.properties ?? {}),
    });
  } catch {
    // Sin dataLayer disponible no hay nada que hacer.
  }
}

/**
 * Envía el evento a GA4 directamente por gtag, sin pasar por GTM.
 *
 * La app carga gtag.js con el ID de medición de la propiedad exportada a
 * BigQuery (ver `src/app/layout.tsx`), así que este camino no depende de que
 * haya una etiqueta configurada en el contenedor ni de permisos sobre él.
 *
 * `gtag.js` se carga con `strategy="lazyOnload"`, de modo que cuando una sesión
 * nace temprano `window.gtag` todavía puede no existir. En ese caso el evento
 * NO se descarta: se encola en el `dataLayer` con el formato de `arguments` que
 * usa el snippet oficial, y gtag.js lo procesa al inicializarse.
 */
function publicarEnGa4(event: TrackingEvent): void {
  if (typeof window === 'undefined') return;
  if (!EVENTOS_A_DATALAYER.has(event.event_type)) return;

  const w = window as Window & {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  };
  const params = { ...(event.properties ?? {}) };

  try {
    if (typeof w.gtag === 'function') {
      w.gtag('event', event.event_type, params);
      return;
    }

    w.dataLayer = w.dataLayer || [];
    // Encolar con la misma forma que `function gtag(){dataLayer.push(arguments)}`.
    (function encolar(this: void, ..._args: unknown[]) {
      // eslint-disable-next-line prefer-rest-params
      (w.dataLayer as unknown[]).push(arguments);
    })('event', event.event_type, params);
  } catch {
    // GA4 no disponible: el evento igual viaja al backend propio.
  }
}

/**
 * Fija el id de sesión del backend como propiedad de usuario en GA4.
 *
 * Por qué no basta con el evento `sesion_vinculada`: el id lo produce el
 * servidor, así que hay una carrera. Si cuando el evento sale el id todavía no
 * llegó al navegador, la sesión entera queda anónima para Google — le pasa a
 * una de cada cuatro visitas. Como propiedad de usuario, en cambio, el dato se
 * adjunta a TODOS los eventos siguientes: basta con que llegue uno.
 *
 * Se manda por las dos vías porque cubren cosas distintas: `user_properties`
 * viaja en el payload de cada evento, y `user_id` es el campo nativo del
 * export a BigQuery (hoy vacío al 100%), que es el más fácil de cruzar.
 *
 * Silencioso por diseño, igual que el resto del puente: si gtag falta o falla,
 * el evento de control igual viaja al backend propio y ahí se ve la diferencia.
 */
function fijarSesionEnGa4(sessionDbId: number): void {
  if (typeof window === 'undefined') return;

  const w = window as Window & {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  };
  const id = String(sessionDbId);

  try {
    if (typeof w.gtag === 'function') {
      w.gtag('set', 'user_properties', { session_db_id: id });
      if (GA_MEASUREMENT_ID) {
        w.gtag('config', GA_MEASUREMENT_ID, { user_id: id });
      }
      return;
    }

    // gtag.js carga con `lazyOnload`: si todavía no está, se encola con la
    // forma de `arguments` que usa el snippet oficial y la procesa al iniciar.
    w.dataLayer = w.dataLayer || [];
    const encolar = function (this: void) {
      // eslint-disable-next-line prefer-rest-params
      (w.dataLayer as unknown[]).push(arguments);
    } as (...args: unknown[]) => void;
    encolar('set', 'user_properties', { session_db_id: id });
    if (GA_MEASUREMENT_ID) {
      encolar('config', GA_MEASUREMENT_ID, { user_id: id });
    }
  } catch {
    // GA4 no disponible o bloqueado: lo delata el evento de control.
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

interface EventTrackerContextValue {
  /** Track a custom event */
  track: (
    eventType: EventType,
    properties?: Record<string, unknown>,
    elementId?: string
  ) => void;
  /** Flush pending events immediately */
  flush: () => void;
}

const EventTrackerContext = createContext<EventTrackerContextValue | undefined>(
  undefined
);

export const useEventTracker = () => {
  const context = useContext(EventTrackerContext);
  if (!context) {
    throw new Error(
      'useEventTracker must be used within an EventTrackerProvider'
    );
  }
  return context;
};

/**
 * Optional version that returns null outside the provider.
 */
export const useEventTrackerOptional = () => {
  return useContext(EventTrackerContext);
};

// ============================================================================
// HELPERS
// ============================================================================

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipod/.test(ua)) return 'mobile';
  if (/tablet|ipad/.test(ua)) return 'tablet';
  return 'desktop';
}

function getPageUrl(): string {
  if (typeof window === 'undefined') return '';
  return window.location.pathname;
}

// ============================================================================
// PROVIDER
// ============================================================================

interface EventTrackerProviderProps {
  children: ReactNode;
}

export const EventTrackerProvider: React.FC<EventTrackerProviderProps> = ({
  children,
}) => {
  const { sessionUuid, isNewSession, sessionId } = useSession();
  const pathname = usePathname();

  // Buffer of pending events
  const bufferRef = useRef<TrackingEvent[]>([]);
  // Track session start so we only send it once
  const sessionStartSentRef = useRef(false);
  // Track which scroll depths were already reported for this page
  const reportedScrollDepthsRef = useRef<Set<number>>(new Set());
  // Track page enter timestamp for page_exit time_on_page_ms
  const pageEnterTsRef = useRef<number>(Date.now());
  // Previous pathname for page_exit
  const prevPathnameRef = useRef<string | null>(null);
  // Flush timer
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Ref for session UUID to avoid stale closures in event listeners
  const sessionUuidRef = useRef(sessionUuid);
  sessionUuidRef.current = sessionUuid;

  // ------------------------------------------------------------------
  // Core: enqueue an event
  // ------------------------------------------------------------------
  const enqueue = useCallback((event: TrackingEvent) => {
    // Punto único por donde pasan tanto los eventos manuales (`track`) como
    // los automáticos, así que es el lugar correcto para los puentes a GA4.
    // Dos caminos independientes: por GTM (si el contenedor tiene la etiqueta)
    // y por gtag directo (que no depende del contenedor).
    publicarEnDataLayer(event);
    publicarEnGa4(event);

    bufferRef.current.push(event);
    // Force flush if buffer is too large
    if (bufferRef.current.length >= MAX_BUFFER_SIZE) {
      flushNow();
    }
  }, []);

  // ------------------------------------------------------------------
  // Flush: send all buffered events
  // ------------------------------------------------------------------
  const flushNow = useCallback(() => {
    const uuid = sessionUuidRef.current;
    if (!uuid || bufferRef.current.length === 0) return;

    const events = [...bufferRef.current];
    bufferRef.current = [];

    // Fire-and-forget
    sendEventsBatch(uuid, events);
  }, []);

  // ------------------------------------------------------------------
  // Public: track a custom event
  // ------------------------------------------------------------------
  const track = useCallback(
    (
      eventType: EventType,
      properties?: Record<string, unknown>,
      elementId?: string
    ) => {
      enqueue({
        event_type: eventType,
        client_ts: Date.now(),
        page_url: getPageUrl(),
        element_id: elementId || null,
        properties: sanitizeProperties(properties),
      });
    },
    [enqueue]
  );

  // ------------------------------------------------------------------
  // Auto: session_start (once per session UUID)
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!sessionUuid || sessionStartSentRef.current) return;
    sessionStartSentRef.current = true;

    enqueue({
      event_type: 'session_start',
      client_ts: Date.now(),
      page_url: getPageUrl(),
      element_id: null,
      properties: {
        viewport_w: window.innerWidth,
        viewport_h: window.innerHeight,
        device_type: getDeviceType(),
        user_agent: navigator.userAgent,
        referrer: document.referrer || undefined,
        language: navigator.language,
      },
    });
  }, [sessionUuid, enqueue]);

  // ------------------------------------------------------------------
  // Auto: sesion_vinculada (SOLO en sesiones nuevas, una única vez)
  //
  // A diferencia de session_start —que se re-emite en cada carga porque su
  // guard es un ref del provider— este evento se dispara únicamente cuando la
  // sesión nace: `isNewSession` sólo es true si no había uuid en localStorage.
  // Al recargar, la sesión se recupera y el flag queda en false, así que no
  // se vuelve a emitir. El Set de módulo cubre los remounts.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!sessionUuid || !isNewSession || sesionesVinculadas.has(sessionUuid)) return;
    sesionesVinculadas.add(sessionUuid);

    enqueue({
      event_type: 'sesion_vinculada',
      client_ts: Date.now(),
      page_url: getPageUrl(),
      element_id: null,
      properties: {
        session_id: sessionUuid,
        // ID numérico del backend: null si la creación de sesión falló y se
        // está usando el uuid local como fallback.
        session_db_id: sessionId,
        landing_path: getPageUrl(),
        device_type: getDeviceType(),
      },
    });
  }, [sessionUuid, isNewSession, sessionId, enqueue]);

  // ------------------------------------------------------------------
  // Auto: puente con GA4 + evento de control (ga_link_sent)
  //
  // Cuelga de `sessionId` (el id numérico del backend) y no de `isNewSession`:
  // una sesión recuperada de localStorage también tiene que quedar
  // identificada en GA4, si no las recargas se pierden.
  //
  // El evento de control es la contraparte propia del envío a Google. Sin él,
  // cuando una sesión no aparece en GA4 no se puede distinguir si el evento no
  // se generó o si se generó y lo bloquearon — dos causas con arreglos
  // opuestos. El backend propio es dominio nuestro y nadie lo bloquea.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (sessionId == null || sesionesPuenteadas.has(sessionId)) return;
    sesionesPuenteadas.add(sessionId);

    fijarSesionEnGa4(sessionId);

    enqueue({
      event_type: 'ga_link_sent',
      client_ts: Date.now(),
      page_url: getPageUrl(),
      element_id: null,
      properties: {
        session_db_id: sessionId,
        ts: Date.now(),
      },
    });
  }, [sessionId, enqueue]);

  // ------------------------------------------------------------------
  // Auto: page_enter / page_exit on route changes
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!sessionUuid) return;

    const now = Date.now();

    // Emit page_exit for the previous page
    if (prevPathnameRef.current && prevPathnameRef.current !== pathname) {
      enqueue({
        event_type: 'page_exit',
        client_ts: now,
        page_url: prevPathnameRef.current,
        element_id: null,
        properties: {
          exit_method: 'navigation',
          time_on_page_ms: now - pageEnterTsRef.current,
        },
      });
    }

    // Emit page_enter for the new page
    enqueue({
      event_type: 'page_enter',
      client_ts: now,
      page_url: pathname,
      element_id: null,
      properties: {
        url: pathname,
      },
    });

    // Reset for new page
    prevPathnameRef.current = pathname;
    pageEnterTsRef.current = now;
    reportedScrollDepthsRef.current = new Set();
    lastDocHeightRef.current = 0;
  }, [pathname, sessionUuid, enqueue]);

  // ------------------------------------------------------------------
  // Auto: scroll_depth tracking
  // ------------------------------------------------------------------
  // Track the last known document height so we can detect when async content
  // loads and the page grows significantly. Without this, a short skeleton
  // page produces a premature 100% scroll_depth that blocks all later reports.
  const lastDocHeightRef = useRef<number>(0);

  useEffect(() => {
    if (!sessionUuid) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      // If the document grew significantly (async content loaded), reset
      // thresholds so scroll depth is re-evaluated against the real page.
      if (lastDocHeightRef.current > 0 && docHeight > lastDocHeightRef.current * 1.3) {
        reportedScrollDepthsRef.current = new Set();
      }
      lastDocHeightRef.current = docHeight;

      const pct = Math.round((scrollTop / docHeight) * 100);

      for (const threshold of SCROLL_THRESHOLDS) {
        if (pct >= threshold && !reportedScrollDepthsRef.current.has(threshold)) {
          reportedScrollDepthsRef.current.add(threshold);
          enqueue({
            event_type: 'scroll_depth',
            client_ts: Date.now(),
            page_url: getPageUrl(),
            element_id: null,
            properties: {
              depth_pct: threshold,
              time_to_reach_ms: Date.now() - pageEnterTsRef.current,
              viewport_w: window.innerWidth,
              doc_height: Math.round(document.documentElement.scrollHeight),
            },
          });
        }
      }
    };

    // Also re-evaluate scroll when the document body resizes (async content).
    const resizeObserver = new ResizeObserver(() => {
      handleScroll();
    });
    resizeObserver.observe(document.documentElement);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [sessionUuid, enqueue]);

  // ------------------------------------------------------------------
  // Auto: tab_hidden / tab_visible
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!sessionUuid) return;

    const handleVisibility = () => {
      const eventType: EventType =
        document.visibilityState === 'hidden' ? 'tab_hidden' : 'tab_visible';

      enqueue({
        event_type: eventType,
        client_ts: Date.now(),
        page_url: getPageUrl(),
        element_id: null,
        properties: {
          time_on_page_ms: Date.now() - pageEnterTsRef.current,
        },
      });

      // Flush immediately when tab is hidden (user might close)
      if (document.visibilityState === 'hidden') {
        flushNow();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibility);
  }, [sessionUuid, enqueue, flushNow]);

  // ------------------------------------------------------------------
  // Auto: page_exit + flush on beforeunload
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!sessionUuid) return;

    const handleBeforeUnload = () => {
      enqueue({
        event_type: 'page_exit',
        client_ts: Date.now(),
        page_url: getPageUrl(),
        element_id: null,
        properties: {
          exit_method: 'close',
          time_on_page_ms: Date.now() - pageEnterTsRef.current,
        },
      });
      flushNow();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionUuid, enqueue, flushNow]);

  // ------------------------------------------------------------------
  // Auto: outbound_click tracking (links to external domains)
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!sessionUuid) return;

    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.href;
      if (!href) return;

      try {
        const url = new URL(href);
        // Only track links to external domains
        if (url.hostname !== window.location.hostname) {
          enqueue({
            event_type: 'outbound_click',
            client_ts: Date.now(),
            page_url: getPageUrl(),
            element_id: anchor.id || null,
            properties: {
              url: href,
              domain: url.hostname,
              text: anchor.textContent?.trim().slice(0, 100),
            },
          });
        }
      } catch {
        // Invalid URL, ignore
      }
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, [sessionUuid, enqueue]);

  // ------------------------------------------------------------------
  // Auto: global error tracking (window.onerror + unhandledrejection)
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!sessionUuid) return;

    const handleError = (event: ErrorEvent) => {
      enqueue({
        event_type: 'error',
        client_ts: Date.now(),
        page_url: getPageUrl(),
        element_id: null,
        properties: {
          error_type: 'runtime',
          message: event.message?.slice(0, 200),
          // `file` y `release` salen como campos sueltos porque los bundles de
          // Next.js tienen nombre por hash: la URL sola no ubica el origen sin
          // cruzarla con el despliegue.
          ...parseErrorSource(event.filename),
          page: pathname,
          line: event.lineno,
          col: event.colno,
        },
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        reason instanceof Error
          ? reason.message
          : typeof reason === 'string'
            ? reason
            : 'Unknown rejection';
      enqueue({
        event_type: 'error',
        client_ts: Date.now(),
        page_url: getPageUrl(),
        element_id: null,
        properties: {
          error_type: 'unhandled_rejection',
          message: message.slice(0, 200),
        },
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [sessionUuid, enqueue, pathname]);

  // ------------------------------------------------------------------
  // Periodic flush timer
  // ------------------------------------------------------------------
  useEffect(() => {
    flushTimerRef.current = setInterval(flushNow, FLUSH_INTERVAL_MS);
    return () => {
      if (flushTimerRef.current) {
        clearInterval(flushTimerRef.current);
      }
      // Flush remaining events on unmount
      flushNow();
    };
  }, [flushNow]);

  // ------------------------------------------------------------------
  // Memoize context value
  // ------------------------------------------------------------------
  const value = useMemo(
    () => ({
      track,
      flush: flushNow,
    }),
    [track, flushNow]
  );

  return (
    <EventTrackerContext.Provider value={value}>
      {children}
    </EventTrackerContext.Provider>
  );
};

export default EventTrackerProvider;
