/**
 * Menor 9 (BAL-4969): `movimiento.ts` es la única fuente de
 * `prefers-reduced-motion` del kit de Diseño 2.
 */
import { renderHook, act } from '@testing-library/react';
import {
  DURACION_SALIDA_MS,
  prefiereMenosMovimiento,
  useMenosMovimiento,
  usePulsoAlCambiar,
  useSalidaAnimada,
} from '../movimiento';

const original = window.matchMedia;
let oyente: ((e: { matches: boolean }) => void) | null = null;

function simular(reducido: boolean) {
  window.matchMedia = jest.fn((query: string) => ({
    matches: query.includes('prefers-reduced-motion') && reducido,
    media: query,
    addEventListener: (_: string, fn: (e: { matches: boolean }) => void) => {
      oyente = fn;
    },
    removeEventListener: () => {
      oyente = null;
    },
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  window.matchMedia = original;
  oyente = null;
});

describe('movimiento', () => {
  it('prefiereMenosMovimiento lee la preferencia', () => {
    simular(true);
    expect(prefiereMenosMovimiento()).toBe(true);
    simular(false);
    expect(prefiereMenosMovimiento()).toBe(false);
  });

  it('useMenosMovimiento sigue la preferencia y sus cambios', () => {
    simular(true);
    const { result, unmount } = renderHook(() => useMenosMovimiento());
    expect(result.current).toBe(true);
    simular(false);
    act(() => oyente?.({ matches: false }));
    expect(result.current).toBe(false);
    unmount();
    expect(oyente).toBeNull();
  });

  it('M-4: navegador con la API vieja (addListener/removeListener) también sigue los cambios', () => {
    let viejo: ((e: { matches: boolean }) => void) | null = null;
    let reducido = true;
    window.matchMedia = jest.fn((query: string) => ({
      matches: query.includes('prefers-reduced-motion') && reducido,
      media: query,
      addListener: (fn: (e: { matches: boolean }) => void) => {
        viejo = fn;
      },
      removeListener: () => {
        viejo = null;
      },
    })) as unknown as typeof window.matchMedia;
    const { result, unmount } = renderHook(() => useMenosMovimiento());
    expect(result.current).toBe(true);
    expect(viejo).not.toBeNull();
    reducido = false;
    act(() => viejo?.({ matches: false }));
    expect(result.current).toBe(false);
    unmount();
    expect(viejo).toBeNull();
  });

  it('sin matchMedia (navegador raro) no rompe: false', () => {
    window.matchMedia = (() => {
      throw new Error('no hay');
    }) as unknown as typeof window.matchMedia;
    expect(prefiereMenosMovimiento()).toBe(false);
    const { result } = renderHook(() => useMenosMovimiento());
    expect(result.current).toBe(false);
  });

  describe('usePulsoAlCambiar (BAL-4969, transiciones de Brenda)', () => {
    it('no pulsa al montar; cada cambio alterna A/B para repetir el pulso', () => {
      simular(false);
      const { result, rerender } = renderHook(({ v }) => usePulsoAlCambiar(v), { initialProps: { v: 100 } });
      expect(result.current).toBe('');
      rerender({ v: 100 });
      expect(result.current).toBe('');
      rerender({ v: 120 });
      expect(result.current).toBe('d2-pulso-a');
      rerender({ v: 90 });
      expect(result.current).toBe('d2-pulso-b');
      rerender({ v: 90 });
      expect(result.current).toBe('d2-pulso-b');
    });

    it('con menos movimiento nunca pulsa', () => {
      simular(true);
      const { result, rerender } = renderHook(({ v }) => usePulsoAlCambiar(v), { initialProps: { v: 1 } });
      rerender({ v: 2 });
      expect(result.current).toBe('');
    });
  });

  describe('useSalidaAnimada', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('marca "saliendo" y avisa al terminar la animación, una sola vez', () => {
      simular(false);
      const alTerminar = jest.fn();
      const { result } = renderHook(() => useSalidaAnimada());
      act(() => {
        result.current[1](alTerminar);
      });
      expect(result.current[0]).toBe(true);
      // Una segunda llamada mientras sale no hace nada.
      act(() => {
        expect(result.current[1](alTerminar)).toBe(false);
      });
      expect(alTerminar).not.toHaveBeenCalled();
      act(() => jest.advanceTimersByTime(DURACION_SALIDA_MS));
      expect(alTerminar).toHaveBeenCalledTimes(1);
      expect(result.current[0]).toBe(false);
    });

    it('con menos movimiento avisa de una, sin animar', () => {
      simular(true);
      const alTerminar = jest.fn();
      const { result } = renderHook(() => useSalidaAnimada());
      act(() => {
        result.current[1](alTerminar);
      });
      expect(alTerminar).toHaveBeenCalledTimes(1);
      expect(result.current[0]).toBe(false);
    });

    it('si se desmonta a mitad, no avisa', () => {
      simular(false);
      const alTerminar = jest.fn();
      const { result, unmount } = renderHook(() => useSalidaAnimada());
      act(() => {
        result.current[1](alTerminar);
      });
      unmount();
      jest.advanceTimersByTime(DURACION_SALIDA_MS * 2);
      expect(alTerminar).not.toHaveBeenCalled();
    });
  });
});
