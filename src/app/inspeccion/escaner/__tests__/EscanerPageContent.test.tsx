// Import ANTES que `../EscanerPageContent` a propósito — ver el comentario
// largo en `camara/__tests__/CamaraPageContent.test.tsx`: si queda después,
// el factory de `jest.mock` de abajo revienta con "Cannot access
// '_fakePusher' before initialization" (orden real de los `require()`
// transpilados).
import { FakePusher as mockFakePusher } from '../../_test-support/fakePusher';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
// Se testea `EscanerPageContent` directo, NO `page.tsx`: `page.tsx` es solo
// un wrapper de `next/dynamic(..., { ssr: false })` (ver su doc-comment).
import EscanerPageContent from '../EscanerPageContent';
import { getDeviceSession, setDeviceSession } from '../../_lib/deviceSession';

jest.mock('pusher-js', () => ({ __esModule: true, default: mockFakePusher }));

const FakePusher = mockFakePusher;

function mockFetchSequence(responses: Array<{ ok: boolean; json: () => Promise<unknown> }>) {
  let call = 0;
  global.fetch = jest.fn(() => {
    const r = responses[Math.min(call, responses.length - 1)];
    call += 1;
    return Promise.resolve(r);
  }) as unknown as typeof fetch;
}

describe('EscanerPageContent', () => {
  beforeEach(() => {
    localStorage.clear();
    FakePusher.instances.length = 0;
    window.history.replaceState({}, '', '/inspeccion/escaner');
    process.env.NEXT_PUBLIC_PUSHER_KEY = 'test-key';
    process.env.NEXT_PUBLIC_PUSHER_CLUSTER = 'test-cluster';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as { fetch?: unknown }).fetch;
    delete process.env.NEXT_PUBLIC_PUSHER_KEY;
    delete process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  });

  it('C2: con sesion existente y ?p= nuevo, gana el codigo — limpia el parametro sincronicamente y canjea', async () => {
    setDeviceSession({
      deviceId: 'dev-viejo',
      token: 'tok-viejo',
      stationId: 'est-01',
      kind: 'escaner',
      label: null,
    });
    window.history.replaceState({}, '', '/inspeccion/escaner?p=NUEVO1');

    mockFetchSequence([
      {
        ok: true,
        json: async () => ({
          device_id: 'dev-viejo',
          station_id: 'est-02',
          kind: 'escaner',
          label: null,
          token: 'tok-nuevo',
        }),
      },
      { ok: true, json: async () => ({ camera_labels: ['techo'] }) },
    ]);

    render(<EscanerPageContent />);

    // Igual que en camara/page.tsx: se limpia YA, sin esperar la red. Antes
    // del fix, la rama "ya hay sesion" de este archivo directamente no
    // tenia ningun replaceState — el ?p= quedaba pegado para siempre.
    expect(window.location.search).toBe('');

    await waitFor(() => {
      expect(getDeviceSession()?.token).toBe('tok-nuevo');
    });
    expect(getDeviceSession()?.stationId).toBe('est-02');
  });

  it('I1/I2: un error de canal tiene precedencia sobre "Faltan camaras" y "listo" exige estar conectado', async () => {
    setDeviceSession({
      deviceId: 'dev-01',
      token: 'tok-01',
      stationId: 'est-01',
      kind: 'escaner',
      label: null,
    });

    mockFetchSequence([{ ok: true, json: async () => ({ camera_labels: ['techo'] }) }]);

    render(<EscanerPageContent />);

    // Todavia sin channelError: banner "Faltan camaras" (no hay conexion
    // confirmada al canal, asi que `listo` tampoco puede ser true — I2).
    await waitFor(() => {
      expect(screen.getByText('Faltan cámaras — no se puede escanear')).toBeInTheDocument();
    });

    const pusher = FakePusher.instances[0];
    act(() => {
      pusher.channel.emit('pusher:subscription_error', { status: 401 });
    });

    // El banner grande pasa a explicar el error de canal — no puede seguir
    // afirmando "Faltan camaras" (I1): antes ambos mensajes convivian, uno
    // grande y falso, otro chico y verdadero.
    await waitFor(() => {
      expect(screen.queryByText('Faltan cámaras — no se puede escanear')).not.toBeInTheDocument();
      expect(screen.getByText(/No se pudo autorizar el canal/)).toBeInTheDocument();
    });
  });

  it('con sesion guardada de kind "camara" (sin ?p= en la URL), no monta el pre-vuelo: avisa el rol actual y como cambiarlo', () => {
    setDeviceSession({
      deviceId: 'dev-01',
      token: 'tok-01',
      stationId: 'est-01',
      kind: 'camara',
      label: 'techo',
    });

    render(<EscanerPageContent />);

    // Ni el pre-vuelo ("Pre-vuelo") ni la pantalla generica de "no
    // vinculado" — este dispositivo SI esta vinculado, con el otro rol.
    expect(screen.queryByText('Pre-vuelo')).not.toBeInTheDocument();
    expect(screen.queryByText('Escáner no vinculado')).not.toBeInTheDocument();

    expect(screen.getByText(/vinculado como cámara/i)).toBeInTheDocument();
    expect(screen.getByText(/est-01/)).toBeInTheDocument();
    expect(screen.getByText(/volver a vincularlo/i)).toBeInTheDocument();
  });

  it('el boton de re-vinculacion limpia la sesion existente y vuelve al estado "no vinculado"', () => {
    setDeviceSession({
      deviceId: 'dev-01',
      token: 'tok-01',
      stationId: 'est-01',
      kind: 'camara',
      label: 'techo',
    });

    render(<EscanerPageContent />);

    fireEvent.click(screen.getByRole('button', { name: /re-vincular/i }));

    expect(getDeviceSession()).toBeNull();
    expect(screen.getByText('Escáner no vinculado')).toBeInTheDocument();
  });

  describe('control de grabación (F3 Task 5)', () => {
    function setDeviceSessionEscaner() {
      setDeviceSession({
        deviceId: 'dev-esc',
        token: 'tok-esc',
        stationId: 'est-01',
        kind: 'escaner',
        label: null,
      });
    }

    /** Router mínimo de `fetch` para los endpoints que esta vista llama en
     * F3 Task 5: `GET /stations/{id}/state`, `POST /inspections` (crear),
     * `POST /inspections/{id}/abort` y `POST /inspections/{id}/stop`.
     * `stateResponse` es override-able para el test de resync — por defecto
     * no trae `devices`, así que el snapshot de captura no aporta nada y
     * los tests existentes siguen dependiendo solo del evento en vivo
     * (`conectarYListo`). */
    function instalarFetchEscaner(stateResponse: unknown = { camera_labels: ['techo'] }) {
      global.fetch = jest.fn((url: RequestInfo | URL) => {
        const u = String(url);
        if (u.includes('/stations/') && u.endsWith('/state')) {
          return Promise.resolve({ ok: true, json: async () => stateResponse });
        }
        if (u.endsWith('/abort')) {
          return Promise.resolve({ ok: true, json: async () => ({ inspection_id: 1, status: 'failed' }) });
        }
        if (u.endsWith('/stop')) {
          return Promise.resolve({ ok: true, json: async () => ({ inspection_id: 1, status: 'uploading' }) });
        }
        if (u.endsWith('/inspections')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ inspection_id: 1, start_at: Date.now() + 1500, seq: 1 }),
          });
        }
        return Promise.reject(new Error(`fetch inesperado en la prueba: ${u}`));
      }) as unknown as typeof fetch;
    }

    /** Deja el canal conectado, suscripto, y a la única cámara esperada
     * (`techo`) reportando `armada` — la condición de "pre-vuelo listo" tras
     * la review de F2 (ver `PreVuelo.tsx`, `estaListo`). */
    function conectarYListo() {
      const pusher = FakePusher.instances[0];
      pusher.channel.members.each.mockImplementation(
        (cb: (m: { id: string; info?: { kind?: string; label?: string | null } }) => void) => {
          cb({ id: 'dev-cam', info: { kind: 'camara', label: 'techo' } });
        }
      );
      act(() => {
        pusher.connection.emit('state_change', { current: 'connected' });
        pusher.channel.emit('pusher:subscription_succeeded');
        // Emitido por el BACKEND en producción (`station.py`, reemisión de
        // `POST /inspections/devices/estado`) — acá se simula tal cual
        // llega por el canal, sin importar quién lo disparó del otro lado.
        pusher.channel.emit('device.capture_state', { device_id: 'dev-cam', estado: 'armada' });
      });
      return pusher;
    }

    it('el boton de INICIAR esta deshabilitado si el pre-vuelo no esta listo', async () => {
      setDeviceSessionEscaner();
      instalarFetchEscaner();

      render(<EscanerPageContent />);

      // Sin cámaras reportando "armada" (mock de `members.each` sin
      // configurar, default vacío): el banner sigue en "Faltan cámaras" y
      // INICIAR debe estar deshabilitado aunque haya un serial cargado.
      await waitFor(() => {
        expect(screen.getByText('Faltan cámaras — no se puede escanear')).toBeInTheDocument();
      });
      fireEvent.change(screen.getByLabelText(/serial del equipo/i), {
        target: { value: 'SN-001' },
      });

      expect(screen.getByRole('button', { name: /^iniciar$/i })).toBeDisabled();
    });

    it('RESYNC (rediseño post-revisión): el snapshot de GET /state deja el pre-vuelo listo SIN esperar ningun evento en vivo del canal', async () => {
      setDeviceSessionEscaner();
      // `/state` ya trae `devices[].capture_state` — lo que reporta el
      // backend tras `POST /inspections/devices/estado`. El escáner que
      // recién carga (o se reconecta) lo recupera por REST, sin depender de
      // haber estado conectado al canal en el momento del reporte.
      instalarFetchEscaner({
        camera_labels: ['techo'],
        devices: [
          { device_id: 'dev-cam', kind: 'camara', label: 'techo', capture_state: 'armada' },
        ],
      });

      render(<EscanerPageContent />);
      const pusher = FakePusher.instances[0];
      // El canal SÍ tiene que estar conectado (member presente) — el
      // snapshot de `/state` cubre el `captureState`, no la presencia en sí.
      pusher.channel.members.each.mockImplementation(
        (cb: (m: { id: string; info?: { kind?: string; label?: string | null } }) => void) => {
          cb({ id: 'dev-cam', info: { kind: 'camara', label: 'techo' } });
        }
      );
      act(() => {
        pusher.connection.emit('state_change', { current: 'connected' });
        pusher.channel.emit('pusher:subscription_succeeded');
        // Deliberadamente SIN emitir `device.capture_state` — es justo lo
        // que el resync tiene que cubrir.
      });

      await waitFor(() => {
        expect(screen.getByText('Estación lista para escanear')).toBeInTheDocument();
      });
    });

    it('con el pre-vuelo listo pero sin serial cargado, INICIAR sigue deshabilitado', async () => {
      setDeviceSessionEscaner();
      instalarFetchEscaner();

      render(<EscanerPageContent />);
      conectarYListo();

      await waitFor(() => {
        expect(screen.getByText('Estación lista para escanear')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /^iniciar$/i })).toBeDisabled();
    });

    it('REGLA CRÍTICA: si no llegan los acks de todas las cámaras a tiempo, la inspección se aborta y se muestra un error visible', async () => {
      setDeviceSessionEscaner();
      instalarFetchEscaner();

      render(<EscanerPageContent />);
      conectarYListo();

      await waitFor(() => {
        expect(screen.getByText('Estación lista para escanear')).toBeInTheDocument();
      });
      fireEvent.change(screen.getByLabelText(/serial del equipo/i), {
        target: { value: 'SN-001' },
      });

      fireEvent.click(screen.getByRole('button', { name: /^iniciar$/i }));

      // Deliberadamente sin emitir `recording.started`: ninguna cámara
      // ackeó. El escáner NUNCA debe decir que grabó — a los ~1,5s debe
      // abortar por su cuenta y mostrarlo, no quedarse esperando para
      // siempre ni asumir que arrancó.
      await waitFor(
        () => {
          expect(
            (global.fetch as jest.Mock).mock.calls.some(([u]: [string]) => String(u).endsWith('/1/abort'))
          ).toBe(true);
        },
        { timeout: 3000 }
      );
      await waitFor(() => {
        expect(screen.getByText(/no llegó confirmación/i)).toBeInTheDocument();
      });

      // Vuelve a un estado operable: el botón se reactiva para reintentar
      // (no queda "iniciando" colgado para siempre).
      expect(screen.getByRole('button', { name: /^iniciar$/i })).not.toBeDisabled();
      expect(screen.queryByText('GRABANDO')).not.toBeInTheDocument();
    }, 6000);

    it('con los acks completos (recording.started), pasa a estado GRABANDO y aparece el boton de FINALIZAR', async () => {
      setDeviceSessionEscaner();
      instalarFetchEscaner();

      render(<EscanerPageContent />);
      const pusher = conectarYListo();

      await waitFor(() => {
        expect(screen.getByText('Estación lista para escanear')).toBeInTheDocument();
      });
      fireEvent.change(screen.getByLabelText(/serial del equipo/i), {
        target: { value: 'SN-001' },
      });

      fireEvent.click(screen.getByRole('button', { name: /^iniciar$/i }));

      await waitFor(() => {
        expect(
          (global.fetch as jest.Mock).mock.calls.some(([u]: [string]) => String(u).endsWith('/inspections'))
        ).toBe(true);
      });

      // La señal que hace avanzar al escáner es la de la API (Pusher), no
      // un timer propio — spec §6.1 regla 4.
      act(() => {
        pusher.channel.emit('recording.started', { inspection_id: 1 });
      });

      await waitFor(() => {
        expect(screen.getByText('GRABANDO')).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /^finalizar$/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^iniciar$/i })).not.toBeInTheDocument();

      // No debe haber abortado: los acks llegaron a tiempo.
      expect(
        (global.fetch as jest.Mock).mock.calls.some(([u]: [string]) => String(u).endsWith('/abort'))
      ).toBe(false);
    });

    it('FINALIZAR llama al endpoint de stop y vuelve a ofrecer INICIAR', async () => {
      setDeviceSessionEscaner();
      instalarFetchEscaner();

      render(<EscanerPageContent />);
      const pusher = conectarYListo();

      await waitFor(() => {
        expect(screen.getByText('Estación lista para escanear')).toBeInTheDocument();
      });
      fireEvent.change(screen.getByLabelText(/serial del equipo/i), {
        target: { value: 'SN-001' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^iniciar$/i }));

      await waitFor(() => {
        expect(
          (global.fetch as jest.Mock).mock.calls.some(([u]: [string]) => String(u).endsWith('/inspections'))
        ).toBe(true);
      });
      act(() => {
        pusher.channel.emit('recording.started', { inspection_id: 1 });
      });
      await waitFor(() => {
        expect(screen.getByText('GRABANDO')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /^finalizar$/i }));

      await waitFor(() => {
        expect(
          (global.fetch as jest.Mock).mock.calls.some(([u]: [string]) => String(u).endsWith('/1/stop'))
        ).toBe(true);
      });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^iniciar$/i })).toBeInTheDocument();
      });
      expect(screen.queryByText('GRABANDO')).not.toBeInTheDocument();
    });
  });
});
