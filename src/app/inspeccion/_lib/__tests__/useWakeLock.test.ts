/**
 * `useWakeLock` — mantiene la pantalla del kiosco encendida mientras la
 * cámara está armada/grabando (spec, plan F2 Task 2).
 *
 * El detalle que hace o rompe esto: el sistema SUELTA el wake lock solo
 * cuando el documento pasa a background (cambio de app, bloqueo de
 * pantalla) y NO lo vuelve a pedir al volver. Si el hook no escucha
 * `visibilitychange` y re-pide el lock, la estación funciona perfecto hasta
 * la primera vez que alguien mira otra app en ese teléfono — y desde ahí la
 * pantalla se apaga sola sin que nada lo detecte en una prueba corta.
 *
 * jsdom no implementa `navigator.wakeLock`: se stubea acá con un fake
 * mínimo que da control manual sobre cuándo resuelve `request()` y permite
 * simular el `release` espontáneo que dispara el sistema operativo.
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWakeLock } from '../useWakeLock';

class FakeWakeLockSentinel extends EventTarget {
  released = false;
  release = jest.fn(async () => {
    this.released = true;
    this.dispatchEvent(new Event('release'));
  });

  /** El sistema operativo suelta el lock por fuera de este hook (pantalla a
   * background) sin pasar por `release()` — dispara el evento directo. */
  simulateSystemRelease() {
    this.released = true;
    this.dispatchEvent(new Event('release'));
  }
}

let request: jest.Mock;
let lastSentinel: FakeWakeLockSentinel;
let visibilityState: 'visible' | 'hidden';

function setVisibility(state: 'visible' | 'hidden') {
  visibilityState = state;
  document.dispatchEvent(new Event('visibilitychange'));
}

function installWakeLockApi() {
  request = jest.fn().mockImplementation(() => {
    lastSentinel = new FakeWakeLockSentinel();
    return Promise.resolve(lastSentinel);
  });

  Object.defineProperty(navigator, 'wakeLock', {
    configurable: true,
    value: { request },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  visibilityState = 'visible';
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => visibilityState,
  });
  installWakeLockApi();
});

afterEach(() => {
  // @ts-expect-error -- limpiar el stub entre tests.
  delete navigator.wakeLock;
});

describe('useWakeLock', () => {
  it('reporta soportado=true cuando navigator.wakeLock existe', () => {
    const { result } = renderHook(() => useWakeLock(false));
    expect(result.current.soportado).toBe(true);
  });

  it('no pide el lock mientras activo=false', () => {
    renderHook(() => useWakeLock(false));
    expect(request).not.toHaveBeenCalled();
  });

  it('pide el lock cuando activo pasa a true', async () => {
    const { result, rerender } = renderHook(({ activo }) => useWakeLock(activo), {
      initialProps: { activo: false },
    });

    rerender({ activo: true });

    await waitFor(() => expect(request).toHaveBeenCalledWith('screen'));
    await waitFor(() => expect(result.current.activo).toBe(true));
  });

  it('libera el lock cuando activo pasa a false', async () => {
    const { result, rerender } = renderHook(({ activo }) => useWakeLock(activo), {
      initialProps: { activo: true },
    });

    await waitFor(() => expect(result.current.activo).toBe(true));
    const sentinel = lastSentinel;

    rerender({ activo: false });

    await waitFor(() => expect(sentinel.release).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.activo).toBe(false));
  });

  it('libera el lock al desmontar, sin dejarlo colgado', async () => {
    const { result, unmount } = renderHook(() => useWakeLock(true));

    await waitFor(() => expect(result.current.activo).toBe(true));
    const sentinel = lastSentinel;

    unmount();

    expect(sentinel.release).toHaveBeenCalledTimes(1);
  });

  it('REGLA CRÍTICA: re-pide el lock cuando el documento vuelve a ser visible tras haber estado oculto', async () => {
    const { result } = renderHook(() => useWakeLock(true));

    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.activo).toBe(true));

    // El sistema operativo suelta el lock solo al pasar a background — el
    // hook no lo hace, pero el sentinel deja de estar vivo de todas formas.
    act(() => {
      setVisibility('hidden');
      lastSentinel.simulateSystemRelease();
    });

    await waitFor(() => expect(result.current.activo).toBe(false));

    act(() => {
      setVisibility('visible');
    });

    // Sin el listener de visibilitychange, esto se queda en 1 para siempre
    // y la pantalla del kiosco vuelve a apagarse sola.
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.activo).toBe(true));
  });

  it('no re-pide el lock al volver a visible si activo=false', async () => {
    renderHook(() => useWakeLock(false));

    act(() => {
      setVisibility('hidden');
    });
    act(() => {
      setVisibility('visible');
    });

    expect(request).not.toHaveBeenCalled();
  });

  it('donde la API no existe (soportado=false), no explota y activo queda en false', async () => {
    // @ts-expect-error -- simular un navegador sin Wake Lock API (iOS viejo).
    delete navigator.wakeLock;

    const { result, rerender, unmount } = renderHook(({ activo }) => useWakeLock(activo), {
      initialProps: { activo: false },
    });

    expect(result.current.soportado).toBe(false);
    expect(result.current.activo).toBe(false);

    expect(() => rerender({ activo: true })).not.toThrow();
    expect(result.current.activo).toBe(false);

    act(() => {
      setVisibility('hidden');
    });
    act(() => {
      setVisibility('visible');
    });

    expect(() => unmount()).not.toThrow();
  });

  it('si request() rechaza (batería baja, etc.), no rompe y activo queda en false', async () => {
    request.mockRejectedValueOnce(Object.assign(new Error('bajo batería'), { name: 'NotAllowedError' }));

    const { result } = renderHook(() => useWakeLock(true));

    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(result.current.activo).toBe(false);

    // Y sigue siendo usable después: un rechazo puntual no deja el hook roto.
    await waitFor(() => expect(result.current.soportado).toBe(true));
  });

  // Revisión de F2 (I1/I2): dos wake locks colgados encontrados ejecutando
  // probes. Los dos tests de acá abajo son esos probes convertidos en
  // regresión permanente.

  it('I1 — REGRESIÓN: si el componente se desmonta con un request() en vuelo, el sentinel que llega tarde se libera solo', async () => {
    // Control manual de CUÁNDO resuelve `request()` — necesitamos poder
    // desmontar ANTES de que la promesa se asiente.
    let resolveRequest!: (sentinel: FakeWakeLockSentinel) => void;
    request.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );

    const { unmount } = renderHook(() => useWakeLock(true));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));

    // Se desmonta con el `request()` todavía en vuelo — sin la fix, el
    // cleanup de acá no tiene nada que liberar (`sentinelRef` sigue null) y
    // cuando la respuesta llegue tarde, nadie más puede tocar este hook.
    unmount();

    const sentinelTardio = new FakeWakeLockSentinel();
    resolveRequest(sentinelTardio);

    // Con el bug, este sentinel queda vivo para siempre — 3 ciclos
    // montar/desmontar medidos = 3 locks pedidos, 0 liberados.
    await waitFor(() => expect(sentinelTardio.release).toHaveBeenCalledTimes(1));
  });

  it('I2 — REGRESIÓN: varios visibilitychange seguidos mientras hay un request() en vuelo no piden locks concurrentes', async () => {
    let resolveRequest!: (sentinel: FakeWakeLockSentinel) => void;
    request.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );

    const { result } = renderHook(() => useWakeLock(true));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));

    // El primer `request()` sigue sin resolver. Con la guarda vieja
    // (`!sentinelRef.current`, que recién se llena cuando la promesa
    // RESUELVE) cada transición a "visible" pedía un lock nuevo — medido:
    // 4 `visibilitychange` seguidos → 3 requests concurrentes, 2
    // irrecuperables.
    act(() => setVisibility('hidden'));
    act(() => setVisibility('visible'));
    act(() => setVisibility('hidden'));
    act(() => setVisibility('visible'));

    expect(request).toHaveBeenCalledTimes(1);

    // Y el único request en vuelo sigue resolviendo normalmente: no se
    // rompió nada por agregar la guarda.
    const sentinel = new FakeWakeLockSentinel();
    act(() => {
      resolveRequest(sentinel);
    });
    await waitFor(() => expect(result.current.activo).toBe(true));
    expect(request).toHaveBeenCalledTimes(1);
  });
});
