/**
 * Puente con GA4 y evento de control.
 *
 * El id de sesión lo produce el servidor, así que hay una carrera: si todavía
 * no llegó al navegador cuando sale `sesion_vinculada`, el dato se pierde para
 * TODA la sesión (hoy solo el 58% de las sesiones se puede unir con GA4). Al
 * fijarlo como propiedad de usuario queda pegado a todos los eventos
 * siguientes, así que basta con que llegue uno.
 *
 * `ga_link_sent` es la copia al backend propio: sin ella no se puede
 * distinguir "el evento no se generó" de "se generó pero lo bloquearon".
 */
import React from 'react';
import { render, act } from '@testing-library/react';
import { EventTrackerProvider } from '../EventTrackerContext';
import type { TrackingEvent } from '../../../../services/eventsApi';

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(global as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub;

jest.mock('next/navigation', () => ({ usePathname: () => '/solicitar' }));

// El id de medición viene de una variable de entorno que solo existe en el
// despliegue: se fija acá para que el test no dependa del `.env` de la máquina.
jest.mock('@/lib/ga', () => ({ GA_MEASUREMENT_ID: 'G-TEST123' }));

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

function eventosEmitidos(): TrackingEvent[] {
  return mockSend.mock.calls.flatMap((call) => call[1] as TrackingEvent[]);
}

function montarYVaciar() {
  const utils = render(
    <EventTrackerProvider>
      <div />
    </EventTrackerProvider>
  );
  act(() => {
    jest.advanceTimersByTime(6000);
  });
  return utils;
}

type Ventana = Window & { gtag?: jest.Mock; dataLayer?: unknown[] };

describe('puente de sesión con GA4', () => {
  let gtag: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    mockSend.mockClear();
    gtag = jest.fn();
    (window as Ventana).gtag = gtag;
    (window as Ventana).dataLayer = [];
  });

  afterEach(() => {
    jest.useRealTimers();
    delete (window as Ventana).gtag;
  });

  it('fija el id de sesión como propiedad de usuario, no solo en un evento', () => {
    mockSession = { sessionUuid: 'uuid-up', isNewSession: true, sessionId: 204477 };
    montarYVaciar();

    expect(gtag).toHaveBeenCalledWith('set', 'user_properties', {
      session_db_id: '204477',
    });
  });

  it('lo manda también como user_id nativo', () => {
    mockSession = { sessionUuid: 'uuid-uid', isNewSession: true, sessionId: 555 };
    montarYVaciar();

    const config = gtag.mock.calls.find((c) => c[0] === 'config');
    expect(config).toBeDefined();
    expect(config?.[2]).toMatchObject({ user_id: '555' });
  });

  it('conserva el evento sesion_vinculada, para poder comparar la cobertura', () => {
    mockSession = { sessionUuid: 'uuid-conv', isNewSession: true, sessionId: 12 };
    montarYVaciar();

    expect(gtag).toHaveBeenCalledWith(
      'event',
      'sesion_vinculada',
      expect.objectContaining({ session_db_id: 12 })
    );
  });

  it('emite ga_link_sent al backend propio con el mismo id', () => {
    mockSession = { sessionUuid: 'uuid-control', isNewSession: true, sessionId: 321 };
    montarYVaciar();

    const control = eventosEmitidos().find((e) => e.event_type === 'ga_link_sent');
    expect(control).toBeDefined();
    expect(control?.properties).toMatchObject({ session_db_id: 321 });
    expect(typeof control?.properties?.ts).toBe('number');
  });

  it('también vincula una sesión recuperada de localStorage', () => {
    // sesion_vinculada solo sale en sesiones nuevas; la propiedad de usuario
    // tiene que fijarse igual, si no las recargas quedan anónimas para GA4.
    mockSession = { sessionUuid: 'uuid-recuperada', isNewSession: false, sessionId: 900 };
    montarYVaciar();

    expect(gtag).toHaveBeenCalledWith('set', 'user_properties', {
      session_db_id: '900',
    });
    expect(eventosEmitidos().some((e) => e.event_type === 'ga_link_sent')).toBe(true);
  });

  it('no hace nada mientras el backend no devolvió el id', () => {
    mockSession = { sessionUuid: 'uuid-sin-id', isNewSession: true, sessionId: null };
    montarYVaciar();

    expect(gtag.mock.calls.some((c) => c[0] === 'set')).toBe(false);
    expect(eventosEmitidos().some((e) => e.event_type === 'ga_link_sent')).toBe(false);
  });

  it('no lo repite si el provider se vuelve a montar en la misma carga', () => {
    mockSession = { sessionUuid: 'uuid-remount-ga', isNewSession: true, sessionId: 4242 };
    const { unmount } = montarYVaciar();
    unmount();
    montarYVaciar();

    expect(gtag.mock.calls.filter((c) => c[0] === 'set')).toHaveLength(1);
    expect(eventosEmitidos().filter((e) => e.event_type === 'ga_link_sent')).toHaveLength(1);
  });

  it('encola en el dataLayer cuando gtag.js todavía no cargó', () => {
    delete (window as Ventana).gtag;
    mockSession = { sessionUuid: 'uuid-encolado-ga', isNewSession: true, sessionId: 606 };

    montarYVaciar();

    const encolados = ((window as Ventana).dataLayer ?? []) as IArguments[];
    const set = encolados.find((p) => p?.[0] === 'set' && p?.[1] === 'user_properties');
    expect(set).toBeDefined();
    expect(set?.[2]).toMatchObject({ session_db_id: '606' });
  });

  it('no rompe el flujo si gtag lanza', () => {
    (window as Ventana).gtag = jest.fn(() => {
      throw new Error('bloqueado por una extensión');
    });
    mockSession = { sessionUuid: 'uuid-error-ga', isNewSession: true, sessionId: 13 };

    expect(() => montarYVaciar()).not.toThrow();
    // Y el control igual viaja al backend propio: ese es justamente su sentido.
    expect(eventosEmitidos().some((e) => e.event_type === 'ga_link_sent')).toBe(true);
  });
});

describe('evento error', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockSend.mockClear();
    (window as Ventana).dataLayer = [];
    mockSession = { sessionUuid: 'uuid-error', isNewSession: false, sessionId: 1 };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('reporta la URL completa del bundle, más el archivo y el release', () => {
    render(
      <EventTrackerProvider>
        <div />
      </EventTrackerProvider>
    );

    act(() => {
      window.dispatchEvent(
        new ErrorEvent('error', {
          message: 'TypeError: undefined is not an object',
          filename:
            'https://www.baldecash.com/_next/static/chunks/2fccd770fe1ab1d1.js?dpl=dpl_mCfAff67GCe5LzLw6osxsvmEyVcS',
          lineno: 1,
          colno: 1142,
        })
      );
      jest.advanceTimersByTime(6000);
    });

    const evento = eventosEmitidos().find((e) => e.event_type === 'error');
    expect(evento?.properties).toMatchObject({
      source: 'https://www.baldecash.com/_next/static/chunks/2fccd770fe1ab1d1.js',
      file: '2fccd770fe1ab1d1.js',
      release: 'dpl_mCfAff67GCe5LzLw6osxsvmEyVcS',
      error_type: 'runtime',
    });
    // La regresión que se está arreglando: llegaba `tps://…`.
    expect(evento?.properties?.source).not.toMatch(/^tps:/);
  });
});
