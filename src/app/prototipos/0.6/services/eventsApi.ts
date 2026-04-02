/**
 * Events API Service - BaldeCash v0.6
 *
 * Sends behavioral events in batches to POST /api/v1/public/events/batch
 * Privacy-first: NEVER captures field values, passwords, PII, etc.
 */

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

// ============================================================================
// TYPES
// ============================================================================

/** Phase 1 (MVP) event types */
export type EventType =
  | 'session_start'
  | 'page_enter'
  | 'page_exit'
  | 'form_start'
  | 'form_abandon'
  | 'input_focus'
  | 'input_blur'
  | 'scroll_depth'
  | 'tab_hidden'
  | 'tab_visible'
  // Phase 2: E-commerce & interaction events
  | 'cta_click'
  | 'outbound_click'
  | 'product_view'
  | 'product_click'
  | 'product_hover'
  | 'cart_add'
  | 'cart_remove'
  | 'cart_clear'
  | 'wishlist_add'
  | 'wishlist_remove'
  | 'wishlist_clear'
  | 'compare_add'
  | 'compare_remove'
  | 'compare_open'
  | 'error';

/** Properties that are BLOCKED for privacy reasons */
const BLOCKED_PROPERTIES = new Set([
  'value',
  'field_value',
  'input_value',
  'text_value',
  'password',
  'dni',
  'email_value',
  'phone_value',
  'nombre',
  'name_value',
  'document_number',
]);

export interface TrackingEvent {
  event_type: EventType;
  client_ts: number;
  page_url: string;
  element_id?: string | null;
  properties?: Record<string, unknown>;
}

export interface BatchEventRequest {
  session_id: string;
  events: TrackingEvent[];
}

export interface BatchEventResponse {
  accepted: number;
  rejected: number;
}

// ============================================================================
// PRIVACY VALIDATION
// ============================================================================

/**
 * Strips any blocked properties from the event properties object.
 * This is a client-side safety net - the server also validates.
 */
export function sanitizeProperties(
  properties?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!properties) return undefined;

  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(properties)) {
    if (!BLOCKED_PROPERTIES.has(key)) {
      sanitized[key] = val;
    }
  }
  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

// ============================================================================
// API CALL
// ============================================================================

/**
 * Send a batch of events to the backend.
 * Fire-and-forget: errors are logged but never thrown to the UI.
 */
export async function sendEventsBatch(
  sessionId: string,
  events: TrackingEvent[]
): Promise<BatchEventResponse | null> {
  if (!sessionId || events.length === 0) return null;

  // Sanitize all event properties before sending
  const sanitizedEvents = events.map((evt) => ({
    ...evt,
    properties: sanitizeProperties(evt.properties),
  }));

  try {
    const response = await fetch(`${API_BASE_URL}/public/events/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        events: sanitizedEvents,
      }),
    });

    if (!response.ok) {
      console.warn('[Events] Batch rejected:', response.status);
      return null;
    }

    return (await response.json()) as BatchEventResponse;
  } catch (error) {
    // Never throw - tracking failures must not break the user flow
    console.warn('[Events] Failed to send batch:', error);
    return null;
  }
}
