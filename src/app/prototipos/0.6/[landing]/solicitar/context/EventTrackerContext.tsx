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
  const { sessionUuid } = useSession();
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
  }, [pathname, sessionUuid, enqueue]);

  // ------------------------------------------------------------------
  // Auto: scroll_depth tracking
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!sessionUuid) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

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
            },
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
