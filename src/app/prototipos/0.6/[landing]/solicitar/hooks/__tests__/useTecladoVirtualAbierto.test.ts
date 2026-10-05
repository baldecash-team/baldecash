/**
 * Deteccion del teclado virtual para esconder el CTA fijo mientras se escribe.
 *
 * Lo que estos tests protegen de verdad es la DISCRIMINACION: un teclado
 * (260-350 px) tiene que dar `true` y el colapso de la barra de URL de Safari
 * (60-100 px) tiene que dar `false`. Un hook que devuelva siempre `true` pasa
 * la mitad de los tests, asi que hay casos en los dos sentidos.
 *
 * Tambien se fija el fallback: sin `visualViewport` el hook devuelve `false`
 * (el CTA queda visible, como antes de este cambio) en vez de esconderse para
 * siempre.
 */
import { renderHook, act } from '@testing-library/react';
import { useTecladoVirtualAbierto } from '../useTecladoVirtualAbierto';

/** Alto del layout viewport; en iOS este NO cambia al abrir el teclado. */
const ALTO_LAYOUT = 780;

interface VVFalso {
  height: number;
  offsetTop: number;
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
  /** Dispara los listeners registrados, como haria el navegador. */
  emitir: (evento: 'resize' | 'scroll') => void;
}

function montarVisualViewport(alto: number, offsetTop = 0): VVFalso {
  const listeners: Record<string, Array<() => void>> = { resize: [], scroll: [] };
  const vv: VVFalso = {
    height: alto,
    offsetTop,
    addEventListener: jest.fn((ev: string, cb: () => void) => {
      listeners[ev]?.push(cb);
    }),
    removeEventListener: jest.fn((ev: string, cb: () => void) => {
      listeners[ev] = (listeners[ev] || []).filter((f) => f !== cb);
    }),
    emitir: (evento) => {
      (listeners[evento] || []).forEach((cb) => cb());
    },
  };
  Object.defineProperty(window, 'visualViewport', {
    value: vv,
    configurable: true,
    writable: true,
  });
  return vv;
}

beforeEach(() => {
  Object.defineProperty(window, 'innerHeight', {
    value: ALTO_LAYOUT,
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  Object.defineProperty(window, 'visualViewport', {
    value: undefined,
    configurable: true,
    writable: true,
  });
});

describe('useTecladoVirtualAbierto', () => {
  it('sin teclado, con el viewport completo, dice que NO hay teclado', () => {
    montarVisualViewport(ALTO_LAYOUT);
    const { result } = renderHook(() => useTecladoVirtualAbierto());
    expect(result.current).toBe(false);
  });

  it('con el teclado abierto (300 px ocupados) dice que SI hay teclado', () => {
    const vv = montarVisualViewport(ALTO_LAYOUT);
    const { result } = renderHook(() => useTecladoVirtualAbierto());
    expect(result.current).toBe(false);

    act(() => {
      vv.height = ALTO_LAYOUT - 300;
      vv.emitir('resize');
    });
    expect(result.current).toBe(true);
  });

  it('NO confunde el colapso de la barra de URL de Safari (90 px) con un teclado', () => {
    const vv = montarVisualViewport(ALTO_LAYOUT);
    const { result } = renderHook(() => useTecladoVirtualAbierto());

    act(() => {
      vv.height = ALTO_LAYOUT - 90;
      vv.emitir('resize');
    });
    expect(result.current).toBe(false);
  });

  it('con el viewport desplazado por iOS sigue detectando el teclado', () => {
    // iOS scrollea el visual viewport (offsetTop) para dejar ver el input
    // enfocado. Ese desplazamiento NO es espacio del teclado, asi que no puede
    // cancelar la deteccion: alto 480 con 300 px comidos -> hay teclado, con
    // offsetTop 0 o 40.
    const vv = montarVisualViewport(480, 40);
    const { result } = renderHook(() => useTecladoVirtualAbierto());
    expect(result.current).toBe(true);
    expect(vv.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('un offsetTop grande no apaga la deteccion (el CTA no reaparece bajo el teclado)', () => {
    // Regresion de un calculo previo que hacia `innerHeight - height - offsetTop`:
    // con el teclado abierto (alto 480) y la vista scrolleada 200 px daba
    // 780-480-200 = 100 < 150 -> decia "no hay teclado" y el CTA volvia a
    // pintarse justo detras del teclado. Debe seguir siendo true.
    montarVisualViewport(480, 200);
    const { result } = renderHook(() => useTecladoVirtualAbierto());
    expect(result.current).toBe(true);
  });

  it('al cerrarse el teclado vuelve a false', () => {
    const vv = montarVisualViewport(ALTO_LAYOUT - 320);
    const { result } = renderHook(() => useTecladoVirtualAbierto());
    expect(result.current).toBe(true);

    act(() => {
      vv.height = ALTO_LAYOUT;
      vv.emitir('resize');
    });
    expect(result.current).toBe(false);
  });

  it('sin visualViewport (navegador viejo o SSR) devuelve false, no se esconde para siempre', () => {
    Object.defineProperty(window, 'visualViewport', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    const { result } = renderHook(() => useTecladoVirtualAbierto());
    expect(result.current).toBe(false);
  });

  it('respeta un umbral propio', () => {
    const vv = montarVisualViewport(ALTO_LAYOUT);
    const { result } = renderHook(() => useTecladoVirtualAbierto(50));

    act(() => {
      vv.height = ALTO_LAYOUT - 90; // pasa 50 pero no 150
      vv.emitir('resize');
    });
    expect(result.current).toBe(true);
  });

  it('desengancha los listeners al desmontar', () => {
    const vv = montarVisualViewport(ALTO_LAYOUT);
    const { unmount } = renderHook(() => useTecladoVirtualAbierto());
    unmount();
    expect(vv.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(vv.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
