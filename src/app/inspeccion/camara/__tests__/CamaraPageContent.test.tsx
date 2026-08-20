// Import ANTES que `../CamaraPageContent` a propósito: `jest.mock` de abajo
// queda hoisteado por encima de todos los imports (`babel-plugin-jest-hoist`),
// y el factory referencia `mockFakePusher` — pero el `require` real de este
// módulo tiene que haber corrido para cuando `../CamaraPageContent` (que
// importa `usePresenceChannel`, que importa `pusher-js`) dispare el factory.
// Si este import queda después, el factory revienta con
// "Cannot access '_fakePusher' before initialization" (orden de ejecución
// real de los `require()` transpilados, no una regla estética).
import { FakePusher as mockFakePusher } from '../../_test-support/fakePusher';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
// Se testea `CamaraPageContent` directo, NO `page.tsx`: `page.tsx` es solo
// un wrapper de `next/dynamic(..., { ssr: false })` (ver su doc-comment) —
// probarlo agregaría el mecanismo de carga diferida de Next a la ecuación
// sin aportar cobertura sobre la lógica real de la vista.
import CamaraPageContent from '../CamaraPageContent';
import { getDeviceSession, setDeviceSession } from '../../_lib/deviceSession';
import type { UploadQueueEstado } from '../../_lib/uploadQueue';

jest.mock('pusher-js', () => ({ __esModule: true, default: mockFakePusher }));

/**
 * `uploadQueue` mockeado por completo (F4 Task 4) — a propósito, NO la cola
 * real de `_lib/uploadQueue.ts`. Esta vista solo tiene que probar LA
 * INTEGRACIÓN (qué le manda a `encolar()`, qué hace con lo que `suscribir()`
 * le reporta), no la mecánica interna de la cola — eso ya lo cubre
 * `uploadQueue.test.ts` de punta a punta (Task 3). Usar la cola real acá
 * obligaría a simular upload-url/PUT-a-S3/complete por cada test Y, peor,
 * el singleton real persiste estado ENTRE tests de este mismo archivo (no
 * hay forma de resetearlo) — un test dejaría la cola "llena" para el
 * siguiente. Todas las funciones quedan como `jest.fn()` para poder inspeccionar
 * cómo las llamó cada test, y `mock` es el prefijo que exige
 * babel-plugin-jest-hoist para que el factory (hoisteado por encima de los
 * imports) pueda referenciar código declarado fuera de él.
 */
jest.mock('../../_lib/uploadQueue', () => ({
  __esModule: true,
  encolar: jest.fn(() => true),
  suscribir: jest.fn(() => jest.fn()),
  reintentar: jest.fn(() => 0),
  descartar: jest.fn(() => true),
  listarFallidos: jest.fn(() => []),
  uploadQueue: {
    estadoActual: jest.fn(() => ({
      enVuelo: 0,
      pendientes: 0,
      fallidos: 0,
      llena: false,
      motivoLlena: null,
    })),
  },
}));

import * as uploadQueueMock from '../../_lib/uploadQueue';

/** Estado "vacío" de referencia — mismo shape que devuelve por default el
 * mock de `uploadQueue.estadoActual()` de arriba. */
function estadoSubidaVacio(): UploadQueueEstado {
  return { enVuelo: 0, pendientes: 0, fallidos: 0, llena: false, motivoLlena: null };
}

/** Toma el callback que la vista pasó al `suscribir()` mockeado (la última
 * suscripción activa, por si un test remonta el componente) y lo invoca
 * dentro de `act()` — así se simula, sin la cola real, que el estado de
 * subida cambió (una subida que arrancó, un fallo, la cola llena). */
function emitirEstadoSubida(estado: UploadQueueEstado) {
  const suscribirMock = uploadQueueMock.suscribir as jest.Mock;
  const llamadas = suscribirMock.mock.calls;
  const cb = llamadas[llamadas.length - 1][0] as (e: UploadQueueEstado) => void;
  act(() => cb(estado));
}

/**
 * Fakes mínimos de `getUserMedia` / `MediaRecorder` para las pruebas de
 * captura (F2 Task 3). Réplica reducida de los de
 * `_lib/__tests__/useKioskRecorder.test.ts` — acá no hace falta simular el
 * ciclo completo de grabación, solo "armar" y el `track.ended` externo que
 * lleva a "caída", que es lo que la vista necesita reflejar.
 */
class FakeMediaStreamTrack extends EventTarget {
  readyState: 'live' | 'ended' = 'live';
  stop = jest.fn(() => {
    this.readyState = 'ended';
  });

  constructor(public kind: 'video' | 'audio') {
    super();
  }

  simulateEnded() {
    this.readyState = 'ended';
    this.dispatchEvent(new Event('ended'));
  }
}

class FakeMediaStream {
  constructor(private tracks: FakeMediaStreamTrack[]) {}

  getTracks() {
    return this.tracks;
  }
}

class FakeMediaRecorder extends EventTarget {
  static isTypeSupported = jest.fn((type: string) => type === 'video/webm');

  state: 'inactive' | 'recording' = 'inactive';
  mimeType = 'video/webm';
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;

  constructor(
    public stream: FakeMediaStream,
    public options?: MediaRecorderOptions
  ) {
    super();
  }

  start = jest.fn(() => {
    this.state = 'recording';
  });

  stop = jest.fn(() => {
    this.state = 'inactive';
    this.ondataavailable?.({ data: new Blob(['x'], { type: this.mimeType }) });
    this.onstop?.();
  });
}

let getUserMedia: jest.Mock;
let videoTrack: FakeMediaStreamTrack;

function setDeviceSessionCamara() {
  setDeviceSession({
    deviceId: 'dev-01',
    token: 'tok-01',
    stationId: 'est-01',
    kind: 'camara',
    label: 'techo',
  });
}

/** Router mínimo de `fetch` para los endpoints que esta vista llama en F3:
 * `GET /inspections/time` (useServerClock), `POST /inspections/{id}/ack`,
 * `GET /inspections/stations/{id}/state` (resync al reconectar — C4) y
 * `POST /inspections/devices/estado` (reporte de captura — F3 Task 5 / I3).
 * `serverTimeMs` es una función (no un valor fijo) para poder devolver
 * `Date.now()` en cada muestra y así, sin red real ni delay artificial,
 * terminar con un RTT/offset ≈ 0 — suficiente para probar la lógica de
 * programación sin acoplarse a la fórmula de `useServerClock` (esa ya tiene
 * su propio test dedicado). Compartido entre describes (movido a scope de
 * archivo): C1/C2/I5/C4/I3 lo necesitan igual que "comandos remotos". */
function instalarFetchInspeccion(stateResponse: unknown = {
  camera_labels: ['techo'],
  devices: [],
  active_inspection: null,
}) {
  global.fetch = jest.fn((url: RequestInfo | URL) => {
    const u = String(url);
    if (u.includes('/inspections/time')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ server_time_ms: Date.now() }),
      });
    }
    if (u.includes('/ack')) {
      return Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
    }
    if (u.includes('/devices/estado')) {
      return Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
    }
    if (u.includes('/state')) {
      return Promise.resolve({ ok: true, json: async () => stateResponse });
    }
    return Promise.reject(new Error(`fetch inesperado en la prueba: ${u}`));
  }) as unknown as typeof fetch;
}

async function armarCamara() {
  render(<CamaraPageContent />);
  fireEvent.click(screen.getByRole('button', { name: /armar cámara/i }));
  await waitFor(() => {
    expect(screen.getByText('ARMADA')).toBeInTheDocument();
  });
  // Sin esto, `offsetMs` podría seguir en su valor inicial (0) "por
  // casualidad" en vez de por haber terminado de muestrear — nos aseguramos
  // de que las 5 muestras de useServerClock ya salieron (y `clockListo` es
  // `true`) antes de simular el cmd.start.
  await waitFor(() => {
    const llamadas = (global.fetch as jest.Mock).mock.calls.filter(([u]) =>
      String(u).includes('/inspections/time')
    );
    expect(llamadas.length).toBe(5);
  });
}

function conectarCanal() {
  const pusher = mockFakePusher.instances[0];
  act(() => {
    pusher.connection.emit('state_change', { current: 'connected' });
    pusher.channel.emit('pusher:subscription_succeeded');
  });
  return pusher;
}

/**
 * Arma la cámara con fake timers YA activos (a diferencia de `armarCamara`,
 * que asume timers reales y usa `waitFor` — `waitFor` pollea con
 * `setTimeout`, así que bajo fake timers se cuelga si nadie los avanza).
 * Necesaria para los tests de heartbeat (I3): el `setInterval` del
 * heartbeat tiene que registrarse CON fake timers activos para que
 * `jest.advanceTimersByTime` lo alcance — si se arma con timers reales y
 * recién después se llama `jest.useFakeTimers()`, ese `setInterval` ya
 * quedó atado al reloj real y avanzar timers fake no lo toca (mismo
 * mecanismo, en la otra dirección, que ya usa `useKioskRecorder.test.ts`
 * para C3b: `jest.useFakeTimers()` ANTES de armar, y `await act(async () =>
 * {...})` en vez de `waitFor` para dejar resolver la promesa de
 * `getUserMedia()`).
 */
async function armarConFakeTimersActivos() {
  render(<CamaraPageContent />);
  fireEvent.click(screen.getByRole('button', { name: /armar cámara/i }));
  await act(async () => {
    // getUserMedia() mockeado resuelve en un solo hop de microtask; unas
    // cuantas vueltas de sobra no hacen daño y evitan quedar cortos.
    for (let i = 0; i < 5; i += 1) {
      await Promise.resolve();
    }
  });
  expect(screen.getByText('ARMADA')).toBeInTheDocument();
}

describe('CamaraPageContent', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/inspeccion/camara');
    mockFakePusher.instances.length = 0;
    // Configurado por defecto en TODAS las pruebas de este archivo, no solo
    // en la de "canal caido": sin esto, cualquier prueba que llegue al
    // render principal (incluida C2, arriba) dispara la rama
    // `missing_config` de `usePresenceChannel`, que resuelve en un microtask
    // fuera de cualquier `act()` de la prueba y ensucia la consola con el
    // warning de React (no es un fallo, pero tampoco hace falta arrastrarlo).
    process.env.NEXT_PUBLIC_PUSHER_KEY = 'test-key';
    process.env.NEXT_PUBLIC_PUSHER_CLUSTER = 'test-cluster';

    videoTrack = new FakeMediaStreamTrack('video');
    const audioTrack = new FakeMediaStreamTrack('audio');
    getUserMedia = jest.fn().mockImplementation(() =>
      Promise.resolve(new FakeMediaStream([videoTrack, audioTrack]))
    );
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    });
    (global as unknown as { MediaRecorder: unknown }).MediaRecorder = FakeMediaRecorder;

    // jsdom no implementa `HTMLMediaElement.play` — sin esto,
    // `videoRef.current.play?.().catch(...)` (dentro de `armar()`) explota
    // porque jsdom SÍ define `play` (tira "not implemented"), así que el
    // optional chaining no lo salva. Mismo fix que `useKioskRecorder.test.ts`.
    Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: jest.fn().mockResolvedValue(undefined),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as { fetch?: unknown }).fetch;
    delete process.env.NEXT_PUBLIC_PUSHER_KEY;
    delete process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    // `jest.restoreAllMocks()` de arriba no toca los `jest.fn()` que vienen
    // del factory de `jest.mock('../../_lib/uploadQueue', …)` (no son spies
    // de `jest.spyOn`) — sin este `clearAllMocks()`, las llamadas de un test
    // (cuántas veces se llamó `encolar`, con qué args) se acumularían en el
    // siguiente. `clearAllMocks` limpia `.mock.calls` pero preserva la
    // implementación default (`() => true`, `() => jest.fn()`, etc.) — no
    // hace falta reconfigurarla en cada test que no la necesita.
    jest.clearAllMocks();
    // `clearAllMocks` no toca `mockReturnValue`/`mockReturnValueOnce` ya
    // configurados (eso lo hace `mockReset`, no `mockClear`) — se
    // restablecen los defaults acá a mano para que un test que los cambia
    // (p.ej. "cola llena por fallidos") no se filtre al siguiente.
    (uploadQueueMock.encolar as jest.Mock).mockReturnValue(true);
    (uploadQueueMock.reintentar as jest.Mock).mockReturnValue(0);
    (uploadQueueMock.descartar as jest.Mock).mockReturnValue(true);
    (uploadQueueMock.listarFallidos as jest.Mock).mockReturnValue([]);
    (uploadQueueMock.uploadQueue.estadoActual as jest.Mock).mockReturnValue(estadoSubidaVacio());
  });

  it('C2: con sesion existente y ?p= nuevo en la URL, gana el codigo — limpia el parametro sincronicamente y canjea', async () => {
    setDeviceSession({
      deviceId: 'dev-viejo',
      token: 'tok-viejo',
      stationId: 'est-01',
      kind: 'camara',
      label: 'techo',
    });
    window.history.replaceState({}, '', '/inspeccion/camara?p=NUEVO1');

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        device_id: 'dev-viejo',
        station_id: 'est-02',
        kind: 'camara',
        label: 'pared',
        token: 'tok-nuevo',
      }),
    }) as unknown as typeof fetch;

    render(<CamaraPageContent />);

    // El parametro se limpia YA — sincronicamente, sin esperar la respuesta
    // de red. Antes del fix, la rama "ya hay sesion" ni intentaba limpiar
    // (el replaceState solo vivia en el .then() del canje) y el codigo se
    // quedaba pegado en la URL indefinidamente.
    expect(window.location.search).toBe('');

    await waitFor(() => {
      expect(getDeviceSession()?.token).toBe('tok-nuevo');
    });
    expect(getDeviceSession()?.stationId).toBe('est-02');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/inspections/pair'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('sin sesion y sin ?p=, no queda "Vinculando…" colgado: pasa directo a "no vinculado"', () => {
    render(<CamaraPageContent />);

    // Con el lazy init, no hay nada que esperar: session=null y
    // vinculando=false desde el primer render, sin flash de "Vinculando…".
    expect(screen.getByText('Dispositivo no vinculado')).toBeInTheDocument();
    expect(screen.queryByText('Vinculando…')).not.toBeInTheDocument();
  });

  it('con sesion guardada de kind "escaner" (sin ?p= en la URL), no monta el kiosco: avisa el rol actual y como cambiarlo', () => {
    setDeviceSession({
      deviceId: 'dev-01',
      token: 'tok-01',
      stationId: 'est-01',
      kind: 'escaner',
      label: null,
    });

    render(<CamaraPageContent />);

    // Ni el kiosco de camara ("CONECTADA"/"SIN CONEXION") ni la pantalla
    // generica de "no vinculado" — este dispositivo SI esta vinculado, solo
    // que con el otro rol.
    expect(screen.queryByText('CONECTADA')).not.toBeInTheDocument();
    expect(screen.queryByText('SIN CONEXIÓN')).not.toBeInTheDocument();
    expect(screen.queryByText('Dispositivo no vinculado')).not.toBeInTheDocument();

    expect(screen.getByText(/vinculado como escáner/i)).toBeInTheDocument();
    expect(screen.getByText(/est-01/)).toBeInTheDocument();
    expect(screen.getByText(/volver a vincularlo/i)).toBeInTheDocument();
  });

  it('el boton de re-vinculacion limpia la sesion existente y vuelve al estado "no vinculado"', () => {
    setDeviceSession({
      deviceId: 'dev-01',
      token: 'tok-01',
      stationId: 'est-01',
      kind: 'escaner',
      label: null,
    });

    render(<CamaraPageContent />);

    fireEvent.click(screen.getByRole('button', { name: /re-vincular/i }));

    expect(getDeviceSession()).toBeNull();
    expect(screen.getByText('Dispositivo no vinculado')).toBeInTheDocument();
  });

  describe('captura (F2 Task 3)', () => {
    it('con la captura "inactiva", muestra el boton de armado', () => {
      setDeviceSessionCamara();

      render(<CamaraPageContent />);

      expect(screen.getByRole('button', { name: /armar cámara/i })).toBeInTheDocument();
      // El gesto avisa que va a pedir permiso — no es un boton mudo.
      expect(screen.getByText(/permiso de cámara/i)).toBeInTheDocument();
      expect(screen.queryByText('ARMADA')).not.toBeInTheDocument();
    });

    it('tras armar, muestra "ARMADA" y el elemento de video', async () => {
      setDeviceSessionCamara();

      render(<CamaraPageContent />);

      fireEvent.click(screen.getByRole('button', { name: /armar cámara/i }));

      await waitFor(() => {
        expect(screen.getByText('ARMADA')).toBeInTheDocument();
      });
      expect(getUserMedia).toHaveBeenCalledTimes(1);
      expect(document.querySelector('video')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /armar cámara/i })).not.toBeInTheDocument();
      // Sin `?debug=1`, el botón de prueba de grabado NO existe — no solo
      // está oculto por CSS. Ver la prueba del gate más abajo.
      expect(screen.queryByRole('button', { name: /grabar \(prueba\)/i })).not.toBeInTheDocument();
    });

    it('sin ?debug=1, los botones temporales de prueba no estan en el DOM; con ?debug=1, si', async () => {
      setDeviceSessionCamara();

      const { unmount } = render(<CamaraPageContent />);
      fireEvent.click(screen.getByRole('button', { name: /armar cámara/i }));
      await waitFor(() => {
        expect(screen.getByText('ARMADA')).toBeInTheDocument();
      });
      // Gate cerrado por defecto: ni el botón de "grabar" ni, si de algún
      // modo se llegara a "grabando", el de "detener" deberían poder
      // aparecer nunca sin el query param.
      expect(screen.queryByRole('button', { name: /grabar \(prueba\)/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /detener \(prueba\)/i })).not.toBeInTheDocument();
      unmount();

      window.history.replaceState({}, '', '/inspeccion/camara?debug=1');
      render(<CamaraPageContent />);
      fireEvent.click(screen.getByRole('button', { name: /armar cámara/i }));
      await waitFor(() => {
        expect(screen.getByText('ARMADA')).toBeInTheDocument();
      });

      const grabarPrueba = screen.getByRole('button', { name: /grabar \(prueba\)/i });
      expect(grabarPrueba).toBeInTheDocument();

      fireEvent.click(grabarPrueba);
      await waitFor(() => {
        expect(screen.getByText('GRABANDO')).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /detener \(prueba\)/i })).toBeInTheDocument();
    });

    it('en "caida" muestra el estado y un boton de rearme que funciona', async () => {
      setDeviceSessionCamara();

      render(<CamaraPageContent />);
      fireEvent.click(screen.getByRole('button', { name: /armar cámara/i }));
      await waitFor(() => {
        expect(screen.getByText('ARMADA')).toBeInTheDocument();
      });

      // Llamada entrante / otra app toma la cámara — el hook lo refleja como
      // "caida" via el evento `ended` del track (ver useKioskRecorder.ts).
      act(() => {
        videoTrack.simulateEnded();
      });

      expect(screen.getByText(/CAÍDA/)).toBeInTheDocument();
      const rearmar = screen.getByRole('button', { name: /rearmar/i });
      expect(rearmar).toBeInTheDocument();

      fireEvent.click(rearmar);

      await waitFor(() => {
        expect(screen.getByText('ARMADA')).toBeInTheDocument();
      });
      expect(getUserMedia).toHaveBeenCalledTimes(2);
    });

    it('captura y canal son independientes: "ARMADA" con el canal caido muestra ambos estados, uno no tapa al otro', async () => {
      // Canal caido por `pusher:subscription_error` (token invalido /
      // estacion ajena) — mismo mecanismo que el I1/I2 de
      // `EscanerPageContent.test.tsx`, para no depender del microtask de
      // `missing_config` que dispara fuera de cualquier `act()`.
      setDeviceSessionCamara();

      render(<CamaraPageContent />);

      const pusher = mockFakePusher.instances[0];
      act(() => {
        pusher.channel.emit('pusher:subscription_error', { status: 401 });
      });

      await waitFor(() => {
        expect(screen.getByText(/No se pudo autorizar el canal/)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /armar cámara/i }));

      await waitFor(() => {
        expect(screen.getByText('ARMADA')).toBeInTheDocument();
      });
      // El canal sigue mostrando su propio problema — "ARMADA" no lo tapa
      // ni lo reemplaza, y viceversa: son dos jerarquías de mensaje aparte.
      expect(screen.getByText(/No se pudo autorizar el canal/)).toBeInTheDocument();
    });
  });

  describe('reporta estado de captura por REST (F3 Task 5, rediseño post-revisión)', () => {
    // El flanco `connected` dispara el resync de `/state` (F3 Task 4) —
    // sin `fetch` mockeado, ese `catch(() => {})` no alcanza a cubrir un
    // `fetch` global inexistente en jsdom (ReferenceError, no un rechazo).
    // El mismo mock sirve para `POST /inspections/devices/estado`: acá no
    // hace falta distinguir la respuesta por URL, ningún test de este
    // describe lee el body de la respuesta.
    beforeEach(() => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) }) as unknown as typeof fetch;
    });

    function llamadasEstado() {
      return (global.fetch as jest.Mock).mock.calls.filter(([u]: [string]) =>
        String(u).includes('/inspections/devices/estado')
      );
    }

    // F4 Task 5: el reporte de `capture_state` ahora SIEMPRE viaja con el
    // snapshot de la cola de subida (`uploadQueue.estadoActual()`) pegado —
    // ver el doc-comment del `useEffect` combinado en `CamaraPageContent`.
    // Sin ninguna subida en curso (el caso de todos estos tests: la cámara
    // recién arma, nunca grabó nada) ese snapshot es siempre este mismo
    // objeto "vacío".
    const COLA_VACIA = { en_vuelo: 0, pendientes: 0, fallidos: 0, llena: false, motivo_llena: null };

    it('no reporta nada mientras esta "inactiva" (antes de armar) — no en cada cambio trivial', () => {
      setDeviceSessionCamara();
      render(<CamaraPageContent />);

      expect(llamadasEstado()).toHaveLength(0);
    });

    it('arma la camara: POST /inspections/devices/estado {estado: "armada", cola} con el token de la sesion', async () => {
      setDeviceSessionCamara();
      render(<CamaraPageContent />);

      fireEvent.click(screen.getByRole('button', { name: /armar cámara/i }));
      await waitFor(() => {
        expect(screen.getByText('ARMADA')).toBeInTheDocument();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/inspections/devices/estado'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'X-Device-Token': 'tok-01' }),
          body: JSON.stringify({ estado: 'armada', cola: COLA_VACIA }),
        })
      );
    });

    it('una cámara caída reporta "caida" por REST — el semáforo del escáner debe apagarse', async () => {
      setDeviceSessionCamara();
      render(<CamaraPageContent />);

      fireEvent.click(screen.getByRole('button', { name: /armar cámara/i }));
      await waitFor(() => {
        expect(screen.getByText('ARMADA')).toBeInTheDocument();
      });
      (global.fetch as jest.Mock).mockClear();

      act(() => {
        videoTrack.simulateEnded();
      });

      await waitFor(() => {
        expect(llamadasEstado()).toHaveLength(1);
      });
      expect(llamadasEstado()[0][1]).toEqual(
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ estado: 'caida', cola: COLA_VACIA }),
        })
      );
    });

    it('rearmar tras "caida" vuelve a reportar "armada" (el rearme ES un armado — misma funcion)', async () => {
      setDeviceSessionCamara();
      render(<CamaraPageContent />);

      fireEvent.click(screen.getByRole('button', { name: /armar cámara/i }));
      await waitFor(() => {
        expect(screen.getByText('ARMADA')).toBeInTheDocument();
      });
      act(() => {
        videoTrack.simulateEnded();
      });
      expect(screen.getByText(/CAÍDA/)).toBeInTheDocument();
      (global.fetch as jest.Mock).mockClear();

      fireEvent.click(screen.getByRole('button', { name: /rearmar/i }));
      await waitFor(() => {
        expect(screen.getByText('ARMADA')).toBeInTheDocument();
      });

      expect(llamadasEstado()).toHaveLength(1);
      expect(llamadasEstado()[0][1]).toEqual(
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ estado: 'armada', cola: COLA_VACIA }),
        })
      );
    });

    it('reporta independientemente del canal de Pusher: funciona aunque la suscripcion nunca se confirme', async () => {
      setDeviceSessionCamara();
      // Sin conectar el canal a propósito — ni `state_change` ni
      // `pusher:subscription_succeeded`. El reporte de estado de captura es
      // un POST normal (spec §6: confirmaciones suben por REST), no
      // depende de que el canal de Pusher esté vivo.
      render(<CamaraPageContent />);

      fireEvent.click(screen.getByRole('button', { name: /armar cámara/i }));
      await waitFor(() => {
        expect(screen.getByText('ARMADA')).toBeInTheDocument();
      });

      expect(llamadasEstado()).toHaveLength(1);
    });
  });

  describe('comandos remotos (F3 Task 4)', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('cmd.start con start_at futuro dispara la grabación EN ESE INSTANTE, no al recibirlo', async () => {
      setDeviceSessionCamara();
      instalarFetchInspeccion();

      await armarCamara();
      const pusher = conectarCanal();

      jest.useFakeTimers();
      const startAt = Date.now() + 1500;

      act(() => {
        pusher.channel.emit('cmd.start', { inspection_id: 42, start_at: startAt, seq: 1, take_number: 1 });
      });

      // El ack sale YA, antes de que arranque la grabación — el escáner
      // espera esto para saber que el mensaje llegó, no que ya está
      // grabando. `listo: true` (fix C2/I5 post-review): la cámara está
      // armada y el reloj ya calibró (armarCamara espera las 5 muestras).
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/inspections/42/ack'),
        expect.objectContaining({ method: 'POST', body: JSON.stringify({ seq: 1, listo: true }) })
      );
      expect(screen.getByText('ARMADA')).toBeInTheDocument();

      // Todavía no llegó el instante absoluto: no debe haber empezado a
      // grabar solo porque llegó el mensaje.
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.queryByText('GRABANDO')).not.toBeInTheDocument();

      // Recién ahora, en el instante `start_at` (corregido por el offset).
      act(() => {
        jest.advanceTimersByTime(600);
      });
      expect(screen.getByText('GRABANDO')).toBeInTheDocument();
    });

    it('REGLA CRÍTICA: un cmd.start con el mismo seq entregado dos veces (redelivery de Pusher) no graba dos veces ni ackea dos veces', async () => {
      setDeviceSessionCamara();
      instalarFetchInspeccion();

      await armarCamara();
      const pusher = conectarCanal();

      jest.useFakeTimers();
      const startAt = Date.now() + 1500;
      const payload = { inspection_id: 42, start_at: startAt, seq: 1, take_number: 1 };

      act(() => {
        pusher.channel.emit('cmd.start', payload);
        pusher.channel.emit('cmd.start', { ...payload });
      });

      const acks = (global.fetch as jest.Mock).mock.calls.filter(([u]) =>
        String(u).includes('/ack')
      );
      expect(acks).toHaveLength(1);

      act(() => {
        jest.advanceTimersByTime(1500);
      });
      expect(screen.getByText('GRABANDO')).toBeInTheDocument();

      // Sigue habiendo un solo ack tras el instante de arranque — la
      // segunda entrega no coló un segundo ack tardío.
      expect(
        (global.fetch as jest.Mock).mock.calls.filter(([u]) => String(u).includes('/ack'))
      ).toHaveLength(1);
    });

    it('cmd.stop detiene la grabación en curso y vuelve a ARMADA', async () => {
      setDeviceSessionCamara();
      instalarFetchInspeccion();

      await armarCamara();
      const pusher = conectarCanal();

      jest.useFakeTimers();
      const startAt = Date.now() + 1500;
      act(() => {
        pusher.channel.emit('cmd.start', { inspection_id: 42, start_at: startAt, seq: 1, take_number: 1 });
      });
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      expect(screen.getByText('GRABANDO')).toBeInTheDocument();

      act(() => {
        pusher.channel.emit('cmd.stop', { inspection_id: 42, seq: 2 });
      });
      // Conteo regresivo de parada (`STOP_COUNTDOWN_MS`): la cámara sigue
      // grabando hasta que llega a cero — recién ahí vuelve a ARMADA.
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(screen.getByText('ARMADA')).toBeInTheDocument();
    });

    // Fix post-review (C4): el nombre original de este test decía
    // "resincroniza" pero solo contaba llamadas a `fetch` — la respuesta se
    // pedía y se tiraba (`.catch()` sin `.then()`), así que un GET disparado
    // y jamás leído pasaba esta prueba igual. Este test SOLO prueba la
    // cadencia del GET (una vez por flanco de reconexión, incluida la
    // primera) — el comportamiento real sobre la respuesta (arrancar a
    // grabar si hacía falta, o parar si ya no) tiene sus propios tests en
    // el describe "resync real contra /state (C4)" más abajo.
    it('al reconectar, pide GET /inspections/stations/{id}/state una vez por flanco (sin probar qué hace con la respuesta)', async () => {
      setDeviceSessionCamara();
      instalarFetchInspeccion();

      await armarCamara();
      const pusher = conectarCanal();

      // Primera conexión: ya debería haber resincronizado una vez.
      await waitFor(() => {
        const llamadas = (global.fetch as jest.Mock).mock.calls.filter(([u]) =>
          String(u).includes('/stations/est-01/state')
        );
        expect(llamadas.length).toBe(1);
      });

      // Se cae la conexión...
      act(() => {
        pusher.connection.emit('state_change', { current: 'connecting' });
      });

      // ...y vuelve: pusher-js re-suscribe el canal solo, lo que dispara
      // `pusher:subscription_succeeded` de nuevo — Pusher no garantiza
      // entrega mientras estuvo caída, así que hay que resincronizar otra
      // vez.
      act(() => {
        pusher.connection.emit('state_change', { current: 'connected' });
        pusher.channel.emit('pusher:subscription_succeeded');
      });

      await waitFor(() => {
        const llamadas = (global.fetch as jest.Mock).mock.calls.filter(([u]) =>
          String(u).includes('/stations/est-01/state')
        );
        expect(llamadas.length).toBe(2);
      });
    });
  });

  describe('C1 (CRÍTICO, fix post-review): cmd.stop/cmd.abort cancelan el arranque programado', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('REGLA CRÍTICA: un cmd.abort que llega ANTES del instante de arranque cancela el timer — la cámara NO graba', async () => {
      setDeviceSessionCamara();
      instalarFetchInspeccion();
      await armarCamara();
      const pusher = conectarCanal();

      jest.useFakeTimers();
      act(() => {
        pusher.channel.emit('cmd.start', {
          inspection_id: 42, start_at: Date.now() + 1500, seq: 1, take_number: 1,
        });
      });

      // El abort llega a los 500ms — exactamente el camino degradado normal
      // que describe la review: el timeout de 1,5s del escáner coincide con
      // el `_START_DELAY_MS` del backend, así que el abort suele llegar
      // JUSTO antes del instante de arranque, no en un caso raro.
      act(() => {
        jest.advanceTimersByTime(500);
      });
      act(() => {
        pusher.channel.emit('cmd.abort', { inspection_id: 42, seq: 2 });
      });

      // Se cumplen los 1500ms totales — el instante en el que, sin el fix,
      // el timer disparaba igual.
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.queryByText('GRABANDO')).not.toBeInTheDocument();
      expect(screen.getByText('ARMADA')).toBeInTheDocument();
    });

    it('un cmd.stop que llega ANTES del instante de arranque tambien cancela el timer', async () => {
      setDeviceSessionCamara();
      instalarFetchInspeccion();
      await armarCamara();
      const pusher = conectarCanal();

      jest.useFakeTimers();
      act(() => {
        pusher.channel.emit('cmd.start', {
          inspection_id: 42, start_at: Date.now() + 1500, seq: 1, take_number: 1,
        });
      });
      act(() => {
        jest.advanceTimersByTime(500);
      });
      act(() => {
        pusher.channel.emit('cmd.stop', { inspection_id: 42, seq: 2 });
      });
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.queryByText('GRABANDO')).not.toBeInTheDocument();
      expect(screen.getByText('ARMADA')).toBeInTheDocument();
    });

    it('el fix evita la cámara zombi: tras un abort a mitad de camino, la SIGUIENTE inspección legítima sí graba', async () => {
      setDeviceSessionCamara();
      instalarFetchInspeccion();
      await armarCamara();
      const pusher = conectarCanal();

      jest.useFakeTimers();
      act(() => {
        pusher.channel.emit('cmd.start', {
          inspection_id: 42, start_at: Date.now() + 1500, seq: 1, take_number: 1,
        });
      });
      act(() => {
        jest.advanceTimersByTime(500);
      });
      act(() => {
        pusher.channel.emit('cmd.abort', { inspection_id: 42, seq: 2 });
      });
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.queryByText('GRABANDO')).not.toBeInTheDocument();

      // Sin el fix, `grabar()` del PRIMER `cmd.start` disparaba igual acá
      // (el timer nunca se canceló) y dejaba `activeRecordingRef` ocupado —
      // el `grabar()` de esta segunda inspección salía temprano y no grababa
      // nada, aunque el ack sí salía (cámara "zombi": ackea todo, graba
      // nada). Con el fix, no hay grabación huérfana que bloquee esta.
      act(() => {
        pusher.channel.emit('cmd.start', {
          inspection_id: 43, start_at: Date.now() + 1500, seq: 1, take_number: 1,
        });
      });
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(screen.getByText('GRABANDO')).toBeInTheDocument();
    });
  });

  describe('C2 / I5 (CRÍTICO, fix post-review): el ack informa si esta cámara puede grabar', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('REGLA CRÍTICA: cámara sin armar (inactiva) — ackea listo:false y NO programa grabación', async () => {
      setDeviceSessionCamara();
      instalarFetchInspeccion();
      render(<CamaraPageContent />);
      const pusher = conectarCanal();

      // Sin armar a propósito. Se espera a que el reloj SÍ esté calibrado
      // (5 muestras) para aislar el efecto de "no armada" del de I5 (reloj
      // no listo), que tiene su propio test más abajo.
      await waitFor(() => {
        const llamadas = (global.fetch as jest.Mock).mock.calls.filter(([u]) =>
          String(u).includes('/inspections/time')
        );
        expect(llamadas.length).toBe(5);
      });

      jest.useFakeTimers();
      act(() => {
        pusher.channel.emit('cmd.start', {
          inspection_id: 42, start_at: Date.now() + 1500, seq: 1, take_number: 1,
        });
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/inspections/42/ack'),
        expect.objectContaining({ body: JSON.stringify({ seq: 1, listo: false }) })
      );

      act(() => {
        jest.advanceTimersByTime(1500);
      });
      expect(screen.queryByText('GRABANDO')).not.toBeInTheDocument();
    });

    it('REGLA CRÍTICA: cámara "caída" tras un track.ended real — ackea listo:false y NO programa grabación', async () => {
      setDeviceSessionCamara();
      instalarFetchInspeccion();
      await armarCamara();
      act(() => {
        videoTrack.simulateEnded();
      });
      expect(screen.getByText(/CAÍDA/)).toBeInTheDocument();

      const pusher = conectarCanal();
      jest.useFakeTimers();
      act(() => {
        pusher.channel.emit('cmd.start', {
          inspection_id: 42, start_at: Date.now() + 1500, seq: 1, take_number: 1,
        });
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/inspections/42/ack'),
        expect.objectContaining({ body: JSON.stringify({ seq: 1, listo: false }) })
      );

      act(() => {
        jest.advanceTimersByTime(1500);
      });
      expect(screen.queryByText('GRABANDO')).not.toBeInTheDocument();
      expect(screen.getByText(/CAÍDA/)).toBeInTheDocument();
    });

    it('I5: con el reloj SIN calibrar todavía (0 de 5 muestras resueltas), ackea listo:false y NO programa grabación', async () => {
      setDeviceSessionCamara();
      // `/inspections/time` nunca resuelve: `clockListo` se queda en
      // `false` para siempre, simulando la ventana real de varios segundos
      // que describe la review (offsetMs arranca en 0, las 5 muestras son
      // secuenciales).
      global.fetch = jest.fn((url: RequestInfo | URL) => {
        const u = String(url);
        if (u.includes('/inspections/time')) return new Promise(() => {});
        if (u.includes('/ack')) return Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
        if (u.includes('/devices/estado')) return Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
        if (u.includes('/state')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ camera_labels: ['techo'], devices: [], active_inspection: null }),
          });
        }
        return Promise.reject(new Error(`fetch inesperado en la prueba: ${u}`));
      }) as unknown as typeof fetch;

      render(<CamaraPageContent />);
      fireEvent.click(screen.getByRole('button', { name: /armar cámara/i }));
      await waitFor(() => {
        expect(screen.getByText('ARMADA')).toBeInTheDocument();
      });

      const pusher = conectarCanal();
      jest.useFakeTimers();
      act(() => {
        pusher.channel.emit('cmd.start', {
          inspection_id: 42, start_at: Date.now() + 1500, seq: 1, take_number: 1,
        });
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/inspections/42/ack'),
        expect.objectContaining({ body: JSON.stringify({ seq: 1, listo: false }) })
      );

      act(() => {
        jest.advanceTimersByTime(1500);
      });
      expect(screen.queryByText('GRABANDO')).not.toBeInTheDocument();
    });
  });

  describe('resync real contra /state (C4, CRÍTICO, fix post-review)', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('REGLA CRÍTICA: si /state dice que hay una inspección "created"/"recording" con start_at ya pasado (se perdió el cmd.start), la cámara ackea y arranca a grabar sola', async () => {
      setDeviceSessionCamara();
      instalarFetchInspeccion(); // primera conexión: sin inspección activa
      await armarCamara();
      conectarCanal();

      await waitFor(() => {
        expect(
          (global.fetch as jest.Mock).mock.calls.some(([u]) => String(u).includes('/stations/est-01/state'))
        ).toBe(true);
      });

      // Se cae la conexión justo cuando se emitió `cmd.start` (nunca le
      // llegó) y para cuando reconecta, el backend ya la reporta en curso.
      instalarFetchInspeccion({
        camera_labels: ['techo'],
        devices: [],
        active_inspection: {
          id: 99, serial: 'SN-1', status: 'recording',
          start_at: Date.now() - 1000, seq: 1, take_number: 1,
        },
      });

      const pusher = mockFakePusher.instances[0];
      act(() => {
        pusher.connection.emit('state_change', { current: 'connecting' });
      });
      act(() => {
        pusher.connection.emit('state_change', { current: 'connected' });
        pusher.channel.emit('pusher:subscription_succeeded');
      });

      await waitFor(() => {
        expect(screen.getByText('GRABANDO')).toBeInTheDocument();
      });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/inspections/99/ack'),
        expect.objectContaining({ body: JSON.stringify({ seq: 1, listo: true }) })
      );
    });

    it('REGLA CRÍTICA: si /state dice que la inspección ya no está en curso (uploading) y la cámara seguía "grabando", la para (se perdió el cmd.stop)', async () => {
      setDeviceSessionCamara();
      instalarFetchInspeccion();
      await armarCamara();
      const pusher = conectarCanal();

      jest.useFakeTimers();
      act(() => {
        pusher.channel.emit('cmd.start', {
          inspection_id: 42, start_at: Date.now() + 1500, seq: 1, take_number: 1,
        });
      });
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      expect(screen.getByText('GRABANDO')).toBeInTheDocument();
      jest.useRealTimers();

      // Se pierde el cmd.stop: el backend ya transicionó a "uploading" pero
      // esta cámara sigue "grabando" localmente porque nunca le llegó el
      // mensaje. Se cae la conexión y vuelve.
      instalarFetchInspeccion({
        camera_labels: ['techo'],
        devices: [],
        active_inspection: { id: 42, serial: 'SN-1', status: 'uploading' },
      });
      // El resync dispara `manejarStop()`, que detiene de inmediato. El
      // resync en sí es asíncrono (`await fetch(...)` dentro del efecto), así
      // que hace falta un `act` async para dejar que ese `fetch` mockeado
      // resuelva y `manejarStop()` LLEGUE A CORRER. Los fake timers y el
      // avance de abajo quedan como margen para las promesas pendientes de
      // `detener()`, no para un conteo — ya no hay ninguno.
      jest.useFakeTimers();
      act(() => {
        pusher.connection.emit('state_change', { current: 'connecting' });
      });
      await act(async () => {
        pusher.connection.emit('state_change', { current: 'connected' });
        pusher.channel.emit('pusher:subscription_succeeded');
        await Promise.resolve();
        await Promise.resolve();
      });
      act(() => {
        jest.advanceTimersByTime(1500); // margen: la parada ya es inmediata
      });
      jest.useRealTimers();

      await waitFor(() => {
        expect(screen.getByText('ARMADA')).toBeInTheDocument();
      });
      expect(screen.queryByText('GRABANDO')).not.toBeInTheDocument();
    });

    it('sin ninguna inspección en curso, no hace nada nuevo (no rompe el camino feliz de una cámara recién armada)', async () => {
      setDeviceSessionCamara();
      instalarFetchInspeccion(); // active_inspection: null
      await armarCamara();
      conectarCanal();

      await waitFor(() => {
        expect(
          (global.fetch as jest.Mock).mock.calls.some(([u]) => String(u).includes('/stations/est-01/state'))
        ).toBe(true);
      });

      expect(screen.getByText('ARMADA')).toBeInTheDocument();
      expect(screen.queryByText('GRABANDO')).not.toBeInTheDocument();
    });
  });

  describe('I3 (fix post-review): heartbeat y re-reporte del estado de captura al reconectar', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('al reconectar, re-reporta el estado de captura actual (armada) — no depende de una transición nueva', async () => {
      setDeviceSessionCamara();
      instalarFetchInspeccion();
      await armarCamara();
      const pusher = conectarCanal();
      // El reporte de "armarse" ya salió antes de conectar el canal (no
      // depende de él) — se limpia para aislar el re-reporte del RECONNECT.
      (global.fetch as jest.Mock).mockClear();

      act(() => {
        pusher.connection.emit('state_change', { current: 'connecting' });
      });
      act(() => {
        pusher.connection.emit('state_change', { current: 'connected' });
        pusher.channel.emit('pusher:subscription_succeeded');
      });

      await waitFor(() => {
        const reportes = (global.fetch as jest.Mock).mock.calls.filter(
          ([u, init]: [string, RequestInit]) =>
            String(u).includes('/devices/estado') && init?.body === JSON.stringify({ estado: 'armada' })
        );
        expect(reportes.length).toBeGreaterThan(0);
      });
    });

    it('sin reconectar y sin cambiar de estado, el heartbeat periódico re-reporta antes de que el reporte original quede viejo', async () => {
      setDeviceSessionCamara();
      instalarFetchInspeccion();
      jest.useFakeTimers();
      await armarConFakeTimersActivos();
      (global.fetch as jest.Mock).mockClear();

      // Bastante más que el intervalo del heartbeat (10 min) pero bien por
      // debajo del umbral de vigencia del backend (30 min) — si el
      // heartbeat no existiera, acá no habría ningún reporte nuevo.
      act(() => {
        jest.advanceTimersByTime(11 * 60 * 1000);
      });

      const reportes = (global.fetch as jest.Mock).mock.calls.filter(
        ([u, init]: [string, RequestInit]) =>
          String(u).includes('/devices/estado') && init?.body === JSON.stringify({ estado: 'armada' })
      );
      expect(reportes.length).toBeGreaterThanOrEqual(1);
    });

    it('antes de cumplirse el intervalo del heartbeat, no vuelve a reportar', async () => {
      setDeviceSessionCamara();
      instalarFetchInspeccion();
      jest.useFakeTimers();
      await armarConFakeTimersActivos();
      (global.fetch as jest.Mock).mockClear();

      act(() => {
        jest.advanceTimersByTime(9 * 60 * 1000);
      });

      const reportes = (global.fetch as jest.Mock).mock.calls.filter(([u]) =>
        String(u).includes('/devices/estado')
      );
      expect(reportes).toHaveLength(0);
    });
  });

  describe('F4 Task 4: la cámara sube en segundo plano', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('al detener (cmd.stop), encola el blob de inmediato y vuelve a ARMADA sin esperar la subida', async () => {
      setDeviceSessionCamara();
      instalarFetchInspeccion();
      await armarCamara();
      const pusher = conectarCanal();

      jest.useFakeTimers();
      act(() => {
        pusher.channel.emit('cmd.start', {
          inspection_id: 42, start_at: Date.now() + 1500, seq: 1, take_number: 1,
        });
      });
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      expect(screen.getByText('GRABANDO')).toBeInTheDocument();

      act(() => {
        pusher.channel.emit('cmd.stop', { inspection_id: 42, seq: 2 });
      });
      // Conteo regresivo de parada: la cámara sigue grabando hasta el
      // final del conteo — recién ahí `detener()` corre de verdad.
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      // Vuelve a ARMADA YA (apenas el conteo llega a cero) — nada de esto
      // espera ninguna subida real: la cola está mockeada por completo,
      // sin red involucrada.
      expect(screen.getByText('ARMADA')).toBeInTheDocument();

      // `detener()` resuelve en un microtask (el `onstop` del
      // `MediaRecorder` fake corre sincrónicamente dentro de `stop()`, pero
      // la promesa de `detener()` recién se asienta después) — `waitFor`
      // deja que ese microtask drene antes de mirar `encolar`.
      await waitFor(() => {
        expect(uploadQueueMock.encolar).toHaveBeenCalledTimes(1);
      });
      const item = (uploadQueueMock.encolar as jest.Mock).mock.calls[0][0];
      expect(item).toEqual(
        expect.objectContaining({
          inspectionId: 42,
          takeNumber: 1,
          cameraLabel: 'techo',
          token: 'tok-01',
          mimeType: 'video/webm',
        })
      );
      expect(item.blob).toBeInstanceOf(Blob);
      // `duration_s` del endpoint `.../complete` sale de acá (pendiente que
      // dejó la Task 3) — no se afirma un valor exacto (depende de cómo
      // fake-timers modela `Date.now()`), solo que efectivamente viaja.
      expect(typeof item.durationMs).toBe('number');
    });

    it('cmd.abort a mitad de una grabación también encola lo que se alcanzó a grabar', async () => {
      setDeviceSessionCamara();
      instalarFetchInspeccion();
      await armarCamara();
      const pusher = conectarCanal();

      jest.useFakeTimers();
      act(() => {
        pusher.channel.emit('cmd.start', {
          inspection_id: 42, start_at: Date.now() + 1500, seq: 1, take_number: 1,
        });
      });
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      expect(screen.getByText('GRABANDO')).toBeInTheDocument();

      act(() => {
        pusher.channel.emit('cmd.abort', { inspection_id: 42, seq: 2 });
      });

      expect(screen.getByText('ARMADA')).toBeInTheDocument();
      await waitFor(() => {
        expect(uploadQueueMock.encolar).toHaveBeenCalledTimes(1);
      });
      expect((uploadQueueMock.encolar as jest.Mock).mock.calls[0][0]).toEqual(
        expect.objectContaining({ inspectionId: 42, takeNumber: 1 })
      );
    });

    it('REQUISITO CENTRAL: se puede empezar a grabar de nuevo con una subida en vuelo', async () => {
      setDeviceSessionCamara();
      instalarFetchInspeccion();
      await armarCamara();
      const pusher = conectarCanal();

      jest.useFakeTimers();
      act(() => {
        pusher.channel.emit('cmd.start', {
          inspection_id: 42, start_at: Date.now() + 1500, seq: 1, take_number: 1,
        });
      });
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      act(() => {
        pusher.channel.emit('cmd.stop', { inspection_id: 42, seq: 2 });
      });
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      expect(screen.getByText('ARMADA')).toBeInTheDocument();

      // La cola real, en este punto, tendría ese video "en vuelo" — se
      // simula acá porque la cola está mockeada.
      emitirEstadoSubida({ enVuelo: 1, pendientes: 0, fallidos: 0, llena: false, motivoLlena: null });

      // Con esa subida en curso (todavía no resolvió), arranca UNA
      // INSPECCIÓN DISTINTA — no debe bloquearse ni esperar nada.
      act(() => {
        pusher.channel.emit('cmd.start', {
          inspection_id: 43, start_at: Date.now() + 1500, seq: 1, take_number: 1,
        });
      });
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(screen.getByText('GRABANDO')).toBeInTheDocument();
      // Y el indicador de la subida anterior sigue ahí, sin que grabar de
      // nuevo lo haya tapado ni cancelado.
      expect(screen.getByText(/SUBIENDO/i)).toBeInTheDocument();
    });

    it('el indicador de subida y el de captura coexisten sin taparse: GRABANDO y una subida en curso a la vez', async () => {
      setDeviceSessionCamara();
      instalarFetchInspeccion();
      await armarCamara();
      const pusher = conectarCanal();

      jest.useFakeTimers();
      act(() => {
        pusher.channel.emit('cmd.start', {
          inspection_id: 42, start_at: Date.now() + 1500, seq: 1, take_number: 1,
        });
      });
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      expect(screen.getByText('GRABANDO')).toBeInTheDocument();

      emitirEstadoSubida({ enVuelo: 1, pendientes: 0, fallidos: 0, llena: false, motivoLlena: null });

      // Ninguno de los dos bloques tapa al otro — coexisten en pantalla.
      expect(screen.getByText('GRABANDO')).toBeInTheDocument();
      expect(screen.getByText(/SUBIENDO/i)).toBeInTheDocument();
    });

    it('distingue "llena por fallidos" (accionable) de "llena por subidas en curso" (solo esperar)', async () => {
      setDeviceSessionCamara();
      render(<CamaraPageContent />);

      // Llena solo por actividad normal: no hay nada que un operador tenga
      // que hacer, solo esperar a que drene.
      emitirEstadoSubida({ enVuelo: 2, pendientes: 0, fallidos: 0, llena: true, motivoLlena: 'subiendo' });
      expect(screen.getByText(/esperá/i)).toBeInTheDocument();
      expect(screen.queryByText(/fallaron/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /reintentar/i })).not.toBeInTheDocument();

      // Llena por fallidos: ES accionable — mensaje distinto Y un remedio
      // (reintentar/descartar) disponible en pantalla.
      (uploadQueueMock.listarFallidos as jest.Mock).mockReturnValue([
        { id: 10, item: {} },
        { id: 11, item: {} },
      ]);
      emitirEstadoSubida({ enVuelo: 0, pendientes: 0, fallidos: 2, llena: true, motivoLlena: 'fallidos' });
      expect(screen.getByText(/fallaron/i)).toBeInTheDocument();
      expect(screen.queryByText(/esperá/i)).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));
      expect(uploadQueueMock.reintentar).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: /descartar/i }));
      expect(uploadQueueMock.descartar).toHaveBeenCalledWith(10);
      expect(uploadQueueMock.descartar).toHaveBeenCalledWith(11);
    });

    it('dos cmd.start sobre la MISMA inspección (toma 2) encolan el take_number QUE TRAE EL PAYLOAD, 1 y 2', async () => {
      // Fix de review post-F4-Task-5 (C1, CRÍTICO): `take_number` viaja en
      // el payload de `cmd.start` — la cámara YA NO lo cuenta (ver
      // doc-comment de `ComandoStartPayload` en `useComandos.ts`). Este
      // test, junto con el de "toma se pierde un cmd.start" de acá abajo,
      // es la mitad front del par punta-a-punta que hubiera atrapado el
      // bug — la otra mitad es
      // `test_ciclo_completo_de_dos_tomas_cruza_todo_el_contrato_http` en
      // ws2 (`tests/api/routers/inspection/test_videos_api.py`).
      setDeviceSessionCamara();
      instalarFetchInspeccion();
      await armarCamara();
      const pusher = conectarCanal();

      jest.useFakeTimers();
      act(() => {
        pusher.channel.emit('cmd.start', {
          inspection_id: 42, start_at: Date.now() + 1500, seq: 1, take_number: 1,
        });
      });
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      act(() => {
        pusher.channel.emit('cmd.stop', { inspection_id: 42, seq: 2 });
      });
      act(() => {
        jest.advanceTimersByTime(1500); // margen: la parada ya es inmediata
      });
      await waitFor(() => expect(uploadQueueMock.encolar).toHaveBeenCalledTimes(1));

      // Toma 2 sobre la MISMA inspección (session.py, ws2: "una toma nueva
      // vuelve a emitir cmd.start sobre la MISMA inspección", con un `seq`
      // nuevo — nunca crea una inspección nueva).
      act(() => {
        pusher.channel.emit('cmd.start', {
          inspection_id: 42, start_at: Date.now() + 1500, seq: 3, take_number: 2,
        });
      });
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      act(() => {
        pusher.channel.emit('cmd.stop', { inspection_id: 42, seq: 4 });
      });
      act(() => {
        jest.advanceTimersByTime(1500); // margen: la parada ya es inmediata
      });
      await waitFor(() => expect(uploadQueueMock.encolar).toHaveBeenCalledTimes(2));

      const [[primerItem], [segundoItem]] = (uploadQueueMock.encolar as jest.Mock).mock.calls;
      expect(primerItem).toEqual(expect.objectContaining({ inspectionId: 42, takeNumber: 1 }));
      expect(segundoItem).toEqual(expect.objectContaining({ inspectionId: 42, takeNumber: 2 }));
    });

    it('REGLA CRÍTICA (C1): una cámara que se PIERDE un cmd.start sube la toma siguiente con el número correcto, no con el que le tocaría contando', async () => {
      // Reproduce el bug medido en la review: la cámara se cae (falla el
      // `track.ended`) justo cuando el servidor comanda la toma 2 — nunca
      // llega a verla. El backend sigue adelante igual (`POST /takes` no
      // exige quórum de acks) y comanda la toma 3. Antes del fix, esta
      // cámara contaba SUS PROPIOS `cmd.start` vistos (1 y "3" contados
      // como el segundo que ve = 2) y subía la toma 3 con la key de la
      // toma 2 — pisándola en S3 en silencio. Con el fix, usa el
      // `take_number` que trae el payload (3), sin importar cuántos se
      // haya perdido en el medio.
      setDeviceSessionCamara();
      instalarFetchInspeccion();
      await armarCamara();
      const pusher = conectarCanal();

      jest.useFakeTimers();
      // Toma 1: graba bien.
      act(() => {
        pusher.channel.emit('cmd.start', {
          inspection_id: 42, start_at: Date.now() + 1500, seq: 1, take_number: 1,
        });
      });
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      act(() => {
        pusher.channel.emit('cmd.stop', { inspection_id: 42, seq: 2 });
      });
      act(() => {
        jest.advanceTimersByTime(1500); // margen: la parada ya es inmediata
      });
      await waitFor(() => expect(uploadQueueMock.encolar).toHaveBeenCalledTimes(1));

      // La cámara se cae ANTES de que llegue el cmd.start de la toma 2 —
      // simulado acá simplemente NO emitiéndolo: la próxima señal que
      // recibe es directo la de la toma 3.
      act(() => {
        videoTrack.simulateEnded();
      });
      expect(screen.getByText('CÁMARA CAÍDA')).toBeInTheDocument();

      // El servidor comandó la toma 2 igual (esta cámara nunca la vio) y
      // ahora comanda la toma 3.
      act(() => {
        pusher.channel.emit('cmd.start', {
          inspection_id: 42, start_at: Date.now() + 1500, seq: 5, take_number: 3,
        });
      });
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      act(() => {
        pusher.channel.emit('cmd.stop', { inspection_id: 42, seq: 6 });
      });

      // Con la cámara caída, `puedeGrabar` es `false` (ackea `listo:false`)
      // — no llega a encolar nada para la toma 3 tampoco, así que el
      // conteo de `encolar` se queda en 1. El punto del test no es que
      // grabe estando caída, sino que cuando SÍ vuelva a poder grabar, use
      // el número correcto — se verifica rearmando a continuación.
      expect(uploadQueueMock.encolar).toHaveBeenCalledTimes(1);

      // El operador rearma el teléfono. El backend re-resincroniza vía
      // `/state` (mock `instalarFetchInspeccion`: `active_inspection: null`
      // acá, así que no hay nada que retomar) — este test se queda en
      // demostrar que un `cmd.start` CON `take_number` explícito nunca se
      // confunde con un conteo local, que es la raíz del bug. El próximo
      // `cmd.start` real (toma 4) prueba que el número sigue viniendo del
      // payload, no de cuántos vio esta cámara (que vio 2: toma 1 y toma
      // 3, y el backend le manda 4 — no "3").
      jest.useRealTimers();
      fireEvent.click(screen.getByRole('button', { name: /rearmar cámara/i }));
      await waitFor(() => expect(screen.getByText('ARMADA')).toBeInTheDocument());

      jest.useFakeTimers();
      act(() => {
        pusher.channel.emit('cmd.start', {
          inspection_id: 42, start_at: Date.now() + 1500, seq: 7, take_number: 4,
        });
      });
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      act(() => {
        pusher.channel.emit('cmd.stop', { inspection_id: 42, seq: 8 });
      });
      act(() => {
        jest.advanceTimersByTime(1500); // margen: la parada ya es inmediata
      });
      jest.useRealTimers();
      await waitFor(() => expect(uploadQueueMock.encolar).toHaveBeenCalledTimes(2));

      const segundo = (uploadQueueMock.encolar as jest.Mock).mock.calls[1][0];
      // El backend llama a esta toma "4" (se perdió la 2, grabó la 1 y la
      // 3... salvo que "3" tampoco grabó por estar caída, así que esta es
      // la SEGUNDA que efectivamente sube). Si la cámara siguiera contando
      // localmente, la llamaría "2" (su segundo `encolar()` real) — el
      // punto exacto del bug.
      expect(segundo.takeNumber).toBe(4);
    });

    it('un cmd.start sin take_number válido no graba (contrato roto, no se adivina)', async () => {
      // Coordinador (fix de review post-F4-Task-5): "si el payload no trae
      // el número, es un contrato roto y conviene que se note" — se
      // prefiere una cámara que no graba (visible: sigue mostrando ARMADA,
      // nunca GRABANDO) a que adivine un número que puede pisar evidencia.
      setDeviceSessionCamara();
      instalarFetchInspeccion();
      await armarCamara();
      const pusher = conectarCanal();
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      jest.useFakeTimers();
      act(() => {
        // Payload deliberadamente incompleto (sin `take_number`): el fake
        // de `channel.emit` no tipa el segundo argumento, así que esto
        // compila igual — es justo el caso que el fix tiene que blindar
        // en RUNTIME (contrato roto del lado del backend, o un mensaje
        // corrupto en tránsito).
        pusher.channel.emit('cmd.start', { inspection_id: 42, start_at: Date.now() + 1500, seq: 1 });
      });
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      jest.useRealTimers();

      expect(screen.queryByText('GRABANDO')).not.toBeInTheDocument();
      expect(screen.getByText('ARMADA')).toBeInTheDocument();
      expect(uploadQueueMock.encolar).not.toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });

    it('si encolar() rechaza por backpressure, no se pierde en silencio: la vista lo avisa', async () => {
      (uploadQueueMock.encolar as jest.Mock).mockReturnValueOnce(false);
      setDeviceSessionCamara();
      instalarFetchInspeccion();
      await armarCamara();
      const pusher = conectarCanal();

      jest.useFakeTimers();
      act(() => {
        pusher.channel.emit('cmd.start', {
          inspection_id: 42, start_at: Date.now() + 1500, seq: 1, take_number: 1,
        });
      });
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      act(() => {
        pusher.channel.emit('cmd.stop', { inspection_id: 42, seq: 2 });
      });
      act(() => {
        jest.advanceTimersByTime(1500); // margen: la parada ya es inmediata
      });

      await waitFor(() => {
        expect(screen.getByText(/se perdió/i)).toBeInTheDocument();
      });
    });
  });

  describe('cmd.photo — foto disparada desde el controlador', () => {
    beforeEach(() => {
      // jsdom no decodifica video ni rasteriza canvas: se stubea lo mínimo
      // para que `capturarFoto()` tenga un frame que dibujar.
      Object.defineProperty(window.HTMLVideoElement.prototype, 'videoWidth', {
        configurable: true,
        get: () => 1920,
      });
      Object.defineProperty(window.HTMLVideoElement.prototype, 'videoHeight', {
        configurable: true,
        get: () => 1920,
      });
      Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
        configurable: true,
        value: jest.fn(() => ({ drawImage: jest.fn() })),
      });
      Object.defineProperty(window.HTMLCanvasElement.prototype, 'toBlob', {
        configurable: true,
        value: jest.fn((cb: (b: Blob) => void, type?: string) => {
          cb(new Blob(['img'], { type: type ?? 'image/jpeg' }));
        }),
      });
    });

    it('encola la foto con el numero que mando el servidor y su miniatura', async () => {
      instalarFetchInspeccion();
      setDeviceSessionCamara();
      await armarCamara();
      conectarCanal();

      const pusher = mockFakePusher.instances[0];
      await act(async () => {
        pusher.channel.emit('cmd.photo', {
          inspection_id: 7,
          take_number: 1,
          photo_number: 2,
          capture_at: Date.now(),
        });
      });

      await waitFor(() => {
        expect(uploadQueueMock.encolar as jest.Mock).toHaveBeenCalledWith(
          expect.objectContaining({
            inspectionId: 7,
            takeNumber: 1,
            photoNumber: 2,
            cameraLabel: 'techo',
            thumbBlob: expect.any(Blob),
          })
        );
      });
    });

    it('mientras saca la foto lo dice en pantalla, en vez de seguir en ARMADA', async () => {
      // El disparo es casi instantaneo, asi que sin un aviso propio el
      // operador no tiene forma de saber que la foto salio: la pantalla
      // seguiria diciendo ARMADA de punta a punta y el unico feedback seria
      // el escaner, que esta del otro lado de la mesa.
      instalarFetchInspeccion();
      setDeviceSessionCamara();
      await armarCamara();
      conectarCanal();

      const pusher = mockFakePusher.instances[0];
      await act(async () => {
        pusher.channel.emit('cmd.photo', {
          inspection_id: 7,
          take_number: 1,
          photo_number: 1,
          capture_at: Date.now(),
        });
      });

      expect(screen.getByText(/FOTO/)).toBeInTheDocument();
      expect(screen.queryByText('ARMADA')).not.toBeInTheDocument();
    });

    it('el aviso de foto se apaga solo y la camara vuelve a ARMADA', async () => {
      instalarFetchInspeccion();
      setDeviceSessionCamara();
      await armarCamara();
      conectarCanal();

      const pusher = mockFakePusher.instances[0];
      await act(async () => {
        pusher.channel.emit('cmd.photo', {
          inspection_id: 7,
          take_number: 1,
          photo_number: 1,
          capture_at: Date.now(),
        });
      });
      expect(screen.queryByText('ARMADA')).not.toBeInTheDocument();

      await waitFor(
        () => {
          expect(screen.getByText('ARMADA')).toBeInTheDocument();
        },
        { timeout: 4000 }
      );
    }, 8000);

    it('sacar una foto no cambia el estado de captura que reporta al backend', async () => {
      // Lo que importa no es lo que dice la pantalla (eso ahora avisa el
      // disparo, a proposito) sino lo que VIAJA: `capture_state` es lo que lee
      // el pre-vuelo del escaner para decidir si la estacion esta lista. Si un
      // disparo lo moviera, la estacion se veria caerse cada vez que alguien
      // saca una foto.
      instalarFetchInspeccion();
      setDeviceSessionCamara();
      await armarCamara();
      conectarCanal();

      const estadosAntes = (global.fetch as jest.Mock).mock.calls
        .filter(([u]: [string]) => String(u).includes('/devices/estado'))
        .map(([, init]: [string, RequestInit]) => JSON.parse(String(init.body)).estado);

      const pusher = mockFakePusher.instances[0];
      await act(async () => {
        pusher.channel.emit('cmd.photo', {
          inspection_id: 7,
          take_number: 1,
          photo_number: 1,
          capture_at: Date.now(),
        });
      });

      await waitFor(() => {
        expect(uploadQueueMock.encolar as jest.Mock).toHaveBeenCalled();
      });

      const estadosDespues = (global.fetch as jest.Mock).mock.calls
        .filter(([u]: [string]) => String(u).includes('/devices/estado'))
        .map(([, init]: [string, RequestInit]) => JSON.parse(String(init.body)).estado);
      // Ningun estado NUEVO, y si hubo alguno reportado, sigue siendo 'armada'.
      expect(estadosDespues.slice(estadosAntes.length)).toEqual([]);
      expect(estadosDespues.every((e: string) => e === 'armada')).toBe(true);
    });
  });
});
