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

jest.mock('pusher-js', () => ({ __esModule: true, default: mockFakePusher }));

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

    it('no reporta nada mientras esta "inactiva" (antes de armar) — no en cada cambio trivial', () => {
      setDeviceSessionCamara();
      render(<CamaraPageContent />);

      expect(llamadasEstado()).toHaveLength(0);
    });

    it('arma la camara: POST /inspections/devices/estado {estado: "armada"} con el token de la sesion', async () => {
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
          body: JSON.stringify({ estado: 'armada' }),
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
        expect.objectContaining({ method: 'POST', body: JSON.stringify({ estado: 'caida' }) })
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
        expect.objectContaining({ method: 'POST', body: JSON.stringify({ estado: 'armada' }) })
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
    /** Router mínimo de `fetch` para los tres endpoints que esta vista llama
     * en F3: `GET /inspections/time` (useServerClock), `POST
     * /inspections/{id}/ack` y `GET /inspections/stations/{id}/state`
     * (resync al reconectar). `serverTimeMs` es una función (no un valor
     * fijo) para poder devolver `Date.now()` en cada muestra y así, sin
     * red real ni delay artificial, terminar con un RTT/offset ≈ 0 —
     * suficiente para probar la lógica de programación sin acoplarse a la
     * fórmula de `useServerClock` (esa ya tiene su propio test dedicado). */
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
      // casualidad" en vez de por haber terminado de muestrear — nos
      // aseguramos de que las 5 muestras de useServerClock ya salieron
      // antes de simular el cmd.start.
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
        pusher.channel.emit('cmd.start', { inspection_id: 42, start_at: startAt, seq: 1 });
      });

      // El ack sale YA, antes de que arranque la grabación — el escáner
      // espera esto para saber que el mensaje llegó, no que ya está
      // grabando.
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/inspections/42/ack'),
        expect.objectContaining({ method: 'POST', body: JSON.stringify({ seq: 1 }) })
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
      const payload = { inspection_id: 42, start_at: startAt, seq: 1 };

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
        pusher.channel.emit('cmd.start', { inspection_id: 42, start_at: startAt, seq: 1 });
      });
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      expect(screen.getByText('GRABANDO')).toBeInTheDocument();

      act(() => {
        pusher.channel.emit('cmd.stop', { inspection_id: 42, seq: 2 });
      });

      expect(screen.getByText('ARMADA')).toBeInTheDocument();
    });

    it('al reconectar, consulta GET /inspections/stations/{id}/state para resincronizar', async () => {
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
});
