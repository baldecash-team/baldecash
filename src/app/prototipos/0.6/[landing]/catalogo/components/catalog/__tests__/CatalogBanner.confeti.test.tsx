/**
 * BAL-3951 — confeti de la tira, configurable con un switch.
 *
 * Tres reglas que el diseño de Haru trae y que es fácil perder al portarlo:
 *  - apagado por defecto: las landings ya publicadas no estrenan animación;
 *  - nunca intercepta clics: la capa va con `pointer-events: none`, si no el
 *    banner deja de poder pulsarse mientras dura;
 *  - no sale a quien pidió reducir movimiento en su sistema.
 */
import { render, screen, act } from '@testing-library/react';
import CatalogBanner from '../CatalogBanner';

const CLASE_CAPA = '.catalog-banner-strip__confetti';

/** Guarda lo que el componente observa para poder dispararlo a mano. */
let alObservar: ((entradas: { isIntersecting: boolean }[]) => void) | null = null;

function mockIntersectionObserver() {
  alObservar = null;
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    class {
      constructor(cb: (entradas: { isIntersecting: boolean }[]) => void) {
        alObservar = cb;
      }
      observe() {}
      disconnect() {}
      unobserve() {}
    };
}

/** `matches` decide si el sistema pidió reducir movimiento. */
function mockReducedMotion(matches: boolean) {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? matches : false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
    onchange: null,
  })) as unknown as typeof window.matchMedia;
}

function pintarTira(extra: Record<string, unknown> = {}) {
  return render(
    <CatalogBanner
      desktopImageUrl=""
      mobileImageUrl=""
      bannerType="tira_remate"
      stripTitle="Gran remate"
      stripPriceText="Desde S/60 al mes"
      stripCtaText="Ver ofertas"
      stripCtaUrl="/reacondicionados/catalogo"
      {...extra}
    />
  );
}

/** Entra en pantalla y pasa el respiro de 400ms con el que se lanza. */
function entrarEnPantalla() {
  act(() => {
    alObservar?.([{ isIntersecting: true }]);
  });
  act(() => {
    jest.advanceTimersByTime(500);
  });
}

describe('BAL-3951 — confeti de la tira', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockIntersectionObserver();
    mockReducedMotion(false);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('apagado por defecto: sin el switch no se monta nada', () => {
    pintarTira();
    entrarEnPantalla();

    expect(document.querySelector(CLASE_CAPA)).toBeNull();
  });

  it('encendido: al entrar en pantalla aparecen las piezas', () => {
    pintarTira({ stripConfetti: true });
    entrarEnPantalla();

    const capa = document.querySelector(CLASE_CAPA);
    expect(capa).not.toBeNull();
    expect(capa!.querySelectorAll('i').length).toBeGreaterThan(0);
  });

  it('encendido pero fuera de pantalla: todavía no sale', () => {
    pintarTira({ stripConfetti: true });
    act(() => {
      alObservar?.([{ isIntersecting: false }]);
      jest.advanceTimersByTime(500);
    });

    expect(document.querySelector(CLASE_CAPA)).toBeNull();
  });

  it('no sale a quien pidió reducir movimiento, y la tira se ve igual', () => {
    mockReducedMotion(true);
    pintarTira({ stripConfetti: true });
    entrarEnPantalla();

    expect(document.querySelector(CLASE_CAPA)).toBeNull();
    // Lo que importa: el banner sigue ahí, solo sin animación.
    expect(screen.getByText('Gran remate')).toBeInTheDocument();
  });

  it('la capa se limpia sola: no deja nodos animándose', () => {
    pintarTira({ stripConfetti: true });
    entrarEnPantalla();
    expect(document.querySelector(CLASE_CAPA)).not.toBeNull();

    act(() => {
      jest.advanceTimersByTime(3300);
    });

    expect(document.querySelector(CLASE_CAPA)).toBeNull();
  });

  it('al desmontar no queda nada colgando', () => {
    const { unmount } = pintarTira({ stripConfetti: true });
    entrarEnPantalla();

    unmount();

    expect(document.querySelector(CLASE_CAPA)).toBeNull();
  });

  // El banner navega: si la capa tapara el <a>, el clic dejaría de llegar.
  it('el confeti no tapa el banner: la capa no intercepta clics', () => {
    pintarTira({ stripConfetti: true });
    entrarEnPantalla();

    const capa = document.querySelector(CLASE_CAPA);
    expect(capa).not.toBeNull();
    // La regla vive en el <style> del componente, que jsdom no computa: se
    // verifica que la clase con `pointer-events: none` esté declarada.
    const hojas = Array.from(document.querySelectorAll('style'))
      .map((s) => s.textContent ?? '')
      .join('\n');
    expect(hojas).toMatch(/__confetti\s*\{[^}]*pointer-events:\s*none/);
  });
});
