/**
 * Menor 9 (BAL-4969): `movimiento.ts` es la única fuente de
 * `prefers-reduced-motion` del kit de Diseño 2.
 */
import { renderHook, act } from '@testing-library/react';
import { prefiereMenosMovimiento, useMenosMovimiento } from '../movimiento';

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

  it('sin matchMedia (navegador raro) no rompe: false', () => {
    window.matchMedia = (() => {
      throw new Error('no hay');
    }) as unknown as typeof window.matchMedia;
    expect(prefiereMenosMovimiento()).toBe(false);
    const { result } = renderHook(() => useMenosMovimiento());
    expect(result.current).toBe(false);
  });
});
