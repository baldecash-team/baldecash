/**
 * QA en celular de Diseño 2 (BAL-4969): los arreglos de la hoja del seguro
 * (bug 1), del buscador con el teclado abierto (bug 2) y de las zonas
 * táctiles de 44×44 (bug 8 del reporte). La dirección sin Maps se prueba en
 * `AddressAutocompleteField.localError.test.tsx`.
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// La hoja usa `useDragControls`, que el mock global de framer-motion no trae.
jest.mock('framer-motion', () => {
  const sinPropsDeMotion = (Tag: string) =>
    // eslint-disable-next-line react/display-name
    React.forwardRef<HTMLElement, Record<string, unknown>>(({ children, ...props }, ref) => {
      const limpias: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) {
        if (['initial', 'animate', 'exit', 'transition', 'drag', 'dragControls', 'dragConstraints', 'dragElastic', 'onDragEnd'].includes(k)) continue;
        limpias[k] = v;
      }
      return React.createElement(Tag, { ...limpias, ref }, children as React.ReactNode);
    });
  return {
    motion: { div: sinPropsDeMotion('div') },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useDragControls: () => ({ start: jest.fn() }),
    useReducedMotion: () => false,
  };
});
jest.mock('@/app/prototipos/_shared', () => ({ useIsMobile: () => true }));
jest.mock('next/navigation', () => ({ useParams: () => ({ landing: 'pago-diferido' }) }));

import { InsuranceDetailModal } from '@/app/prototipos/0.6/[landing]/solicitar/components/upsell/InsuranceDetailModal';
import { SelectInput } from '@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/fields/SelectInput';
import { CamposV2Provider } from '@/app/prototipos/0.6/components/diseno-2/campos/estilosV2';
import { ALTO_MAX_LISTA, ALTO_MIN_LISTA } from '@/app/prototipos/0.6/components/diseno-2/campos/useBuscadorSobreElTeclado';
import { NavbarWishlistButton, NavbarCartButton } from '@/app/prototipos/0.6/[landing]/catalogo/components/catalog/NavbarActions';
import type { InsurancePlan } from '@/app/prototipos/0.6/[landing]/solicitar/types/upsell';

const PLAN = {
  id: '14', code: 'INS-GE', name: 'Garantía Extendida Laptop 24M', description: 'Garantía', monthlyPrice: 20, totalPrice: 480,
  paymentMonths: 24, insuranceType: 'garantia_extendida', tier: 'basic', isRecommended: false, coverage: [], exclusions: [],
  durationMonths: 24, provider: { name: 'Insurama', code: 'INSURAMA' }, imageUrl: null,
} as unknown as InsurancePlan;

// La hoja devuelve el scroll al cerrar; jsdom no implementa `scrollTo`.
beforeAll(() => {
  window.scrollTo = jest.fn() as unknown as typeof window.scrollTo;
});

/** Cuadra un rAF con los timers falsos. */
function correrFrames() {
  act(() => {
    jest.advanceTimersByTime(50);
  });
}

describe('Bug 1 · hoja "¿Qué cubre?" en celular', () => {
  function Hoja({ abierta, onClose = jest.fn() }: { abierta: boolean; onClose?: () => void }) {
    return (
      <div data-testid="contenido-del-paso" style={{ position: 'relative', zIndex: 10 }}>
        <button type="button">¿Qué cubre?</button>
        <InsuranceDetailModal plan={PLAN} isOpen={abierta} onClose={onClose} isSelected={false} onToggle={jest.fn()} />
      </div>
    );
  }

  it('va en un portal a <body> (fuera del contexto z-10 del paso), como diálogo modal', () => {
    render(<Hoja abierta />);
    const hoja = screen.getByRole('dialog');
    expect(hoja).toHaveAttribute('aria-modal', 'true');
    expect(hoja).toHaveAccessibleName();
    expect(screen.getByTestId('contenido-del-paso')).not.toContainElement(hoja);
    expect(hoja.parentElement).toBe(document.body);
  });

  it('Escape la cierra', () => {
    const onClose = jest.fn();
    render(<Hoja abierta onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('el foco entra a la hoja al abrir y vuelve al botón que la abrió al cerrar', () => {
    jest.useFakeTimers();
    try {
      const { rerender } = render(<Hoja abierta={false} />);
      const disparador = screen.getByRole('button', { name: '¿Qué cubre?' });
      disparador.focus();
      rerender(<Hoja abierta />);
      correrFrames();
      expect(screen.getByRole('dialog')).toHaveFocus();
      rerender(<Hoja abierta={false} />);
      expect(disparador).toHaveFocus();
    } finally {
      jest.useRealTimers();
    }
  });

  it('"Cerrar" (28 px a la vista) tiene zona táctil de 44×44', () => {
    render(<Hoja abierta />);
    const cerrar = screen.getByRole('button', { name: 'Cerrar' });
    expect(cerrar.className).toContain('before:h-11');
    expect(cerrar.className).toContain('before:w-11');
    expect(cerrar.className).toContain('w-7 h-7');
  });
});

describe('Bug 2 · buscador de Diseño 2 con el teclado abierto', () => {
  const OPCIONES = Array.from({ length: 8 }, (_, i) => ({ value: String(i + 1), label: `Universidad ${i + 1}` }));
  let scrollIntoView: jest.Mock;
  let vv: { height: number; offsetTop: number; listeners: Record<string, Array<() => void>> };

  beforeEach(() => {
    jest.useFakeTimers();
    scrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    vv = { height: 440, offsetTop: 0, listeners: {} };
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: {
        get height() { return vv.height; },
        get offsetTop() { return vv.offsetTop; },
        addEventListener: (t: string, f: () => void) => { (vv.listeners[t] ||= []).push(f); },
        removeEventListener: (t: string, f: () => void) => { vv.listeners[t] = (vv.listeners[t] || []).filter((g) => g !== f); },
      },
    });
    // La lista arranca en y=250 (bajo el input del buscador, ya arriba).
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const top = this.hasAttribute('data-lista-buscador') ? 250 : 0;
      return { top, bottom: top, left: 0, right: 0, width: 0, height: 0, x: 0, y: top, toJSON: () => ({}) } as DOMRect;
    });
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    delete (window as { visualViewport?: unknown }).visualViewport;
  });

  function abrir(v2 = true) {
    const campo = (
      <SelectInput id="institution" label="Institución" value="" onChange={jest.fn()} options={OPCIONES} searchable />
    );
    render(v2 ? <CamposV2Provider>{campo}</CamposV2Provider> : campo);
    fireEvent.click(screen.getByRole('button', { name: /Institución|Selecciona/ }));
    correrFrames();
  }

  it('al abrir, el foco va al buscador y el campo sube al borde de arriba (block: start, sin animación)', () => {
    abrir();
    expect(screen.getByPlaceholderText(/Buscar|Escribe/)).toHaveFocus();
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'auto' });
    // Lo que sube es el campo entero, con margen para la cabecera fija.
    const campo = scrollIntoView.mock.instances[0] as HTMLElement;
    expect(campo.id).toBe('institution');
    expect(campo.style.scrollMarginTop).toBe('70px');
  });

  it('la lista mide lo que queda visible sobre el teclado (visualViewport) y se ajusta si el teclado cambia', () => {
    abrir();
    const lista = document.querySelector<HTMLElement>('[data-lista-buscador]')!;
    // 440 visibles − 250 (arriba de la lista) − 8 de margen.
    expect(lista.style.maxHeight).toBe('182px');

    // El teclado crece: quedan 300 visibles → 42 libres → el mínimo.
    vv.height = 300;
    act(() => vv.listeners.resize?.forEach((f) => f()));
    expect(lista.style.maxHeight).toBe(`${ALTO_MIN_LISTA}px`);
    expect(scrollIntoView).toHaveBeenCalledTimes(2);

    // Sin teclado (mucho espacio): no pasa del alto de siempre.
    vv.height = 900;
    act(() => vv.listeners.resize?.forEach((f) => f()));
    expect(lista.style.maxHeight).toBe(`${ALTO_MAX_LISTA}px`);
  });

  it('Diseño 1 no cambia: ni scroll ni alto calculado', () => {
    abrir(false);
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(document.querySelector<HTMLElement>('[data-lista-buscador]')!.style.maxHeight).toBe('');
  });

  it('la "×" para limpiar (20 px a la vista) tiene zona táctil de 44×44 en Diseño 2', () => {
    render(
      <CamposV2Provider>
        <SelectInput id="carrera" label="Carrera" value="1" onChange={jest.fn()} options={OPCIONES} />
      </CamposV2Provider>
    );
    const limpiar = screen.getByRole('button', { name: 'Limpiar Carrera' });
    expect(limpiar.className).toContain('before:h-11');
    expect(limpiar.className).toContain('w-5 h-5');
  });
});

describe('Bug 8 · zonas táctiles del catálogo', () => {
  it('favoritos y carrito de la cabecera (40×40) tienen zona táctil de 44×44 sin cambiar su tamaño', () => {
    render(
      <>
        <NavbarWishlistButton id="fav" count={0} onClick={jest.fn()} />
        <NavbarCartButton id="carrito" count={2} onClick={jest.fn()} />
      </>
    );
    for (const id of ['fav', 'carrito']) {
      const b = document.getElementById(id)!;
      expect(b.className).toContain('before:h-11');
      expect(b.className).toContain('w-10 h-10');
      expect(b.className).toContain('relative');
    }
  });
});
