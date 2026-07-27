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

describe('sesion_vinculada', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockSend.mockClear();
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

  it('manda session_db_id null cuando la creación en backend falló', () => {
    mockSession = { sessionUuid: 'uuid-local', isNewSession: true, sessionId: null };
    montarYVaciar();

    const evento = eventosEmitidos().find((e) => e.event_type === 'sesion_vinculada');
    expect(evento?.properties).toMatchObject({ session_id: 'uuid-local', session_db_id: null });
  });
});
