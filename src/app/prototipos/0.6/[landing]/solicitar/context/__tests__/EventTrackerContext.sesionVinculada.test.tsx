/**
 * sesion_vinculada: se emite UNA sola vez y SOLO cuando la sesión es nueva.
 *
 * Contrasta con session_start, que sí se re-emite en cada carga porque su
 * guard es un ref del provider.
 */
import React from 'react';
import { render, act } from '@testing-library/react';
import { EventTrackerProvider } from '../EventTrackerContext';
import type { TrackingEvent } from '../../../../services/eventsApi';

// jsdom no implementa ResizeObserver y el provider lo usa para recalcular
// scroll_depth cuando cambia el alto del documento.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(global as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub;

jest.mock('next/navigation', () => ({ usePathname: () => '/solicitar' }));

const mockSend = jest.fn();
jest.mock('@/app/prototipos/0.6/services/eventsApi', () => ({
  sendEventsBatch: (sessionId: string, events: TrackingEvent[]) => mockSend(sessionId, events),
  sanitizeProperties: (p?: Record<string, unknown>) => p,
}));

let mockSession: {
  sessionUuid: string | null;
  isNewSession: boolean;
  sessionId: number | null;
};
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/SessionContext', () => ({
  useSession: () => mockSession,
}));

/** Todos los eventos despachados en todos los lotes. */
function eventosEmitidos(): TrackingEvent[] {
  return mockSend.mock.calls.flatMap((call) => call[1] as TrackingEvent[]);
}

function montarYVaciar() {
  const utils = render(<EventTrackerProvider><div /></EventTrackerProvider>);
  // El buffer se vacía por intervalo; adelantamos el reloj en vez de esperar.
  act(() => {
    jest.advanceTimersByTime(6000);
  });
  return utils;
}

/** Lo empujado al dataLayer, que es lo que GTM reenvía a GA4. */
function dataLayerPushes(): Record<string, unknown>[] {
  return (window as Window & { dataLayer?: Record<string, unknown>[] }).dataLayer ?? [];
}

describe('sesion_vinculada', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockSend.mockClear();
    (window as Window & { dataLayer?: unknown[] }).dataLayer = [];
    mockSession = { sessionUuid: 'uuid-nueva', isNewSession: true, sessionId: 42 };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('se emite en una sesión nueva, con el id de sesión en el payload', () => {
    montarYVaciar();

    const evento = eventosEmitidos().find((e) => e.event_type === 'sesion_vinculada');
    expect(evento).toBeDefined();
    expect(evento?.properties).toMatchObject({
      session_id: 'uuid-nueva',
      session_db_id: 42,
    });
  });

  it('NO se emite cuando la sesión se recuperó de localStorage', () => {
    mockSession = { sessionUuid: 'uuid-existente', isNewSession: false, sessionId: 7 };
    montarYVaciar();

    expect(eventosEmitidos().some((e) => e.event_type === 'sesion_vinculada')).toBe(false);
    // El tracker sigue funcionando: session_start sí se emite.
    expect(eventosEmitidos().some((e) => e.event_type === 'session_start')).toBe(true);
  });

  it('NO se emite dos veces si el provider se vuelve a montar en la misma carga', () => {
    // uuid propio: el guard es un Set de módulo compartido entre tests.
    mockSession = { sessionUuid: 'uuid-remount', isNewSession: true, sessionId: 42 };
    const { unmount } = montarYVaciar();
    unmount();
    montarYVaciar();

    const emitidos = eventosEmitidos().filter((e) => e.event_type === 'sesion_vinculada');
    expect(emitidos).toHaveLength(1);
  });

  it('NO se emite mientras no haya uuid de sesión', () => {
    mockSession = { sessionUuid: null, isNewSession: true, sessionId: null };
    montarYVaciar();

    expect(eventosEmitidos().some((e) => e.event_type === 'sesion_vinculada')).toBe(false);
  });

  it('se publica en el dataLayer para que GTM lo mande a GA4', () => {
    mockSession = { sessionUuid: 'uuid-datalayer', isNewSession: true, sessionId: 99 };
    montarYVaciar();

    const push = dataLayerPushes().find((p) => p.event === 'sesion_vinculada');
    expect(push).toBeDefined();
    expect(push).toMatchObject({ session_id: 'uuid-datalayer', session_db_id: 99 });
  });

  it('NO publica en el dataLayer los eventos de alta frecuencia', () => {
    mockSession = { sessionUuid: 'uuid-ruido', isNewSession: true, sessionId: 1 };
    montarYVaciar();

    // session_start y page_enter viajan al backend propio pero no a GA4.
    const nombres = dataLayerPushes().map((p) => p.event);
    expect(nombres).toContain('sesion_vinculada');
    expect(nombres).not.toContain('session_start');
    expect(nombres).not.toContain('page_enter');
  });

  it('no rompe si el dataLayer no existe todavía', () => {
    delete (window as Window & { dataLayer?: unknown[] }).dataLayer;
    mockSession = { sessionUuid: 'uuid-sin-gtm', isNewSession: true, sessionId: 5 };

    expect(() => montarYVaciar()).not.toThrow();
    // El evento igual llega al backend propio.
    expect(eventosEmitidos().some((e) => e.event_type === 'sesion_vinculada')).toBe(true);
  });

  it('manda session_db_id null cuando la creación en backend falló', () => {
    mockSession = { sessionUuid: 'uuid-local', isNewSession: true, sessionId: null };
    montarYVaciar();

    const evento = eventosEmitidos().find((e) => e.event_type === 'sesion_vinculada');
    expect(evento?.properties).toMatchObject({ session_id: 'uuid-local', session_db_id: null });
  });
});
