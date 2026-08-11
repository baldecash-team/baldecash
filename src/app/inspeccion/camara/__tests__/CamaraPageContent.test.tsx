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
});
