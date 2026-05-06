/**
 * insuranceTelemetry - Batch tracking de la pantalla de seguros (prototipo v0.5).
 *
 * Reusa la pipeline de batch ya existente (`sendEventsBatch` + tipos de
 * `prototipos/0.6/services/eventsApi`). Los dominios de seguros se mapean a los
 * `EventType` existentes para no inflar el schema del backend:
 *
 * | Acción de UX                | EventType            | Discriminador                          |
 * |-----------------------------|----------------------|----------------------------------------|
 * | Agregar / quitar seguro     | `insurance_toggle`   | `active: boolean`                      |
 * | Ver detalle                 | `insurance_view_terms` | -                                   |
 * | Abrir modal advertencia     | `cta_click`          | `cta_id: 'insurance_warning_open'`     |
 * | Cerrar modal advertencia    | `cta_click`          | `cta_id: 'insurance_warning_close'`    |
 * | Elegir seguro desde modal   | `cta_click`          | `cta_id: 'insurance_warning_choose'`   |
 * | Continuar sin seguro        | `cta_click`          | `cta_id: 'insurance_warning_skip'`     |
 * | Bloqueo obligatorio         | `cta_click`          | `cta_id: 'insurance_mandatory_block'`  |
 * | Finalizar solicitud         | `summary_submit`     | -                                      |
 *
 * Reglas del batch:
 *   - flush automático cada 5s
 *   - flush forzado si el buffer llega a 50
 *   - flush al esconder el tab y al `beforeunload`
 *   - reusa el `session_uuid` que haya dejado el `SessionProvider` v0.6, o crea
 *     uno propio en sessionStorage si la pantalla corre fuera del provider.
 *   - mantiene un mirror en sessionStorage (`baldecash-wizard-insurance-events`)
 *     con los últimos 50 eventos crudos para QA.
 */

import {
  sendEventsBatch,
  type EventType,
  type TrackingEvent,
} from '@/app/prototipos/0.6/services/eventsApi';

const FLUSH_INTERVAL_MS = 5_000;
const MAX_BUFFER_SIZE = 50;
const DEBUG_STORAGE_KEY = 'baldecash-wizard-insurance-events';
const FALLBACK_SESSION_KEY = 'baldecash-wizard-events-uuid';

interface BufferedEvent extends TrackingEvent {}

const buffer: BufferedEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let listenersInstalled = false;

function getOrCreateSessionUuid(): string {
  if (typeof window === 'undefined') return '';

  // 1) Reusa el UUID que dejó el SessionProvider de v0.6 (cualquier landing).
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.startsWith('baldecash-') && key.endsWith('-wizard-session-uuid')) {
        const value = localStorage.getItem(key);
        if (value) return value;
      }
    }
  } catch {
    // localStorage bloqueado: continuamos al fallback.
  }

  // 2) Fallback: UUID propio en sessionStorage para que QA pueda correlacionar.
  try {
    const existing = sessionStorage.getItem(FALLBACK_SESSION_KEY);
    if (existing) return existing;
    const uuid =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `proto-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    sessionStorage.setItem(FALLBACK_SESSION_KEY, uuid);
    return uuid;
  } catch {
    return '';
  }
}

function pushDebugMirror(events: BufferedEvent[]): void {
  try {
    const previousRaw = sessionStorage.getItem(DEBUG_STORAGE_KEY);
    const previous: TrackingEvent[] = previousRaw ? JSON.parse(previousRaw) : [];
    const next = [...previous, ...events].slice(-MAX_BUFFER_SIZE);
    sessionStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function flushInsuranceEvents(): void {
  if (typeof window === 'undefined' || buffer.length === 0) return;
  const events = buffer.splice(0);
  pushDebugMirror(events);

  const uuid = getOrCreateSessionUuid();
  if (uuid) {
    void sendEventsBatch(uuid, events);
  }

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[seguros][batch flush]', { count: events.length, events });
  }
}

function ensureListeners(): void {
  if (listenersInstalled || typeof window === 'undefined') return;
  listenersInstalled = true;

  flushTimer = setInterval(flushInsuranceEvents, FLUSH_INTERVAL_MS);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushInsuranceEvents();
  });
  window.addEventListener('beforeunload', flushInsuranceEvents);
}

function enqueue(
  eventType: EventType,
  properties?: Record<string, unknown>,
  elementId?: string,
): void {
  if (typeof window === 'undefined') return;
  ensureListeners();

  buffer.push({
    event_type: eventType,
    client_ts: Date.now(),
    page_url: window.location.pathname,
    element_id: elementId ?? null,
    properties,
  });

  if (buffer.length >= MAX_BUFFER_SIZE) {
    flushInsuranceEvents();
  }
}

// ============================================================================
// API de dominio (mapeada a EventTypes existentes — sin cambios en el backend)
// ============================================================================

export interface InsuranceCtaContext {
  insurance_id?: string | null;
  insurance_name?: string | null;
  monthly_price?: number | null;
  is_mandatory?: boolean;
  has_seen_warning?: boolean;
  selected_count?: number;
}

export const insuranceTracking = {
  toggle(args: {
    insurance_id: string;
    insurance_name: string;
    active: boolean;
    monthly_price?: number | null;
  }): void {
    enqueue(
      'insurance_toggle',
      {
        insurance_id: args.insurance_id,
        insurance_name: args.insurance_name,
        active: args.active,
        monthly_price: args.monthly_price ?? null,
      },
      `insurance-${args.insurance_id}`,
    );
  },

  viewTerms(args: { insurance_id: string; insurance_name?: string | null }): void {
    enqueue(
      'insurance_view_terms',
      {
        insurance_id: args.insurance_id,
        insurance_name: args.insurance_name ?? null,
      },
      `insurance-${args.insurance_id}`,
    );
  },

  warningOpen(ctx: InsuranceCtaContext = {}): void {
    enqueue('cta_click', { cta_id: 'insurance_warning_open', ...normalize(ctx) });
  },

  warningClose(ctx: InsuranceCtaContext = {}): void {
    enqueue('cta_click', { cta_id: 'insurance_warning_close', ...normalize(ctx) });
  },

  warningChooseInsurance(ctx: InsuranceCtaContext = {}): void {
    enqueue('cta_click', { cta_id: 'insurance_warning_choose', ...normalize(ctx) });
  },

  warningSkipInsurance(ctx: InsuranceCtaContext = {}): void {
    enqueue('cta_click', { cta_id: 'insurance_warning_skip', ...normalize(ctx) });
  },

  mandatoryBlock(ctx: InsuranceCtaContext = {}): void {
    enqueue('cta_click', { cta_id: 'insurance_mandatory_block', ...normalize(ctx) });
  },

  finalize(args: {
    insurance_selected: boolean;
    insurance_id?: string | null;
    accessory_count?: number;
    total_monthly?: number | null;
  }): void {
    enqueue('summary_submit', {
      insurance_selected: args.insurance_selected,
      insurance_id: args.insurance_id ?? null,
      accessory_count: args.accessory_count ?? null,
      total_monthly: args.total_monthly ?? null,
    });
  },
};

function normalize(ctx: InsuranceCtaContext): Record<string, unknown> {
  return {
    insurance_id: ctx.insurance_id ?? null,
    insurance_name: ctx.insurance_name ?? null,
    monthly_price: ctx.monthly_price ?? null,
    is_mandatory: ctx.is_mandatory ?? false,
    has_seen_warning: ctx.has_seen_warning ?? false,
    selected_count: ctx.selected_count ?? 0,
  };
}

// ============================================================================
// Helpers para QA / tests (mirror en sessionStorage)
// ============================================================================

export function getInsuranceEventsDebug(): TrackingEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(DEBUG_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TrackingEvent[]) : [];
  } catch {
    return [];
  }
}

export function clearInsuranceEventsDebug(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(DEBUG_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function __resetInsuranceTrackingForTests(): void {
  buffer.length = 0;
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  listenersInstalled = false;
}
