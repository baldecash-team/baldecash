/// <reference types="jest" />
/**
 * BAL-4964 (F5) — `SeccionPlegable`: se cierra al salir con todo completo,
 * "Editar" la reabre, con error se abre, la que tiene el foco no se cierra y
 * una no plegable nunca se cierra.
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createPortal } from 'react-dom';
import { SeccionPlegable, abrirSeccionDe, compensarAncla, DURACION_CIERRE_MS } from '../SeccionPlegable';

/** Un calendario y un tooltip que se pintan en `document.body` (portal). */
function Emergentes() {
  return (
    <>
      {createPortal(<input aria-label="Día del calendario" />, document.body)}
      {createPortal(<div data-testid="tooltip">Ayuda</div>, document.body)}
    </>
  );
}

/** `matchMedia` de mentira: celular y/o menos movimiento. */
function simularPantalla({ celular, menosMovimiento }: { celular: boolean; menosMovimiento: boolean }) {
  window.matchMedia = jest.fn((q: string) => ({
    matches: q.includes('max-width') ? celular : q.includes('reduced-motion') ? menosMovimiento : false,
    media: q,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

function Pantalla({
  completa = true,
  plegable = true,
  conError = false,
  conEmergentes = false,
}: {
  completa?: boolean;
  plegable?: boolean;
  conError?: boolean;
  conEmergentes?: boolean;
}) {
  return (
    <div>
      <SeccionPlegable
        codigo="tus_estudios"
        titulo="Tus estudios"
        plegable={plegable}
        completa={completa}
        resumen="Universidad del Pacífico · Ing. Empresarial · 8vo ciclo"
        conError={conError}
      >
        <div data-campo="institution">
          <input aria-label="Institución" />
        </div>
        <div data-campo="semester" data-estado={conError ? 'error' : undefined}>
          <input aria-label="Ciclo" />
        </div>
        {conEmergentes && <Emergentes />}
      </SeccionPlegable>
      <input aria-label="Fuera" />
    </div>
  );
}

const seccion = (c: HTMLElement) => c.querySelector('[data-seccion="tus_estudios"]') as HTMLElement;

/** Foco adentro y después afuera (Tab). */
function entrarYSalir() {
  act(() => screen.getByLabelText('Institución').focus());
  act(() => screen.getByLabelText('Fuera').focus());
  // La salida se confirma después de que el foco termine de moverse.
  act(() => {
    jest.runOnlyPendingTimers();
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  window.scrollBy = jest.fn();
});
const matchMediaOriginal = window.matchMedia;
afterEach(() => {
  jest.useRealTimers();
  window.matchMedia = matchMediaOriginal;
});

describe('SeccionPlegable', () => {
  it('tiene título y, abierta, muestra sus campos', () => {
    const { container } = render(<Pantalla />);
    expect(screen.getByRole('heading', { name: 'Tus estudios' })).toBeInTheDocument();
    expect(seccion(container)).toHaveAttribute('data-cerrada', 'false');
    expect(screen.getByLabelText('Institución')).toBeVisible();
  });

  it('con todo completo y el foco afuera, se cierra con su resumen y "Editar"', () => {
    const { container } = render(<Pantalla />);
    entrarYSalir();
    expect(seccion(container)).toHaveAttribute('data-cerrada', 'true');
    expect(screen.getByText('Universidad del Pacífico · Ing. Empresarial · 8vo ciclo')).toBeInTheDocument();
    const editar = screen.getByRole('button', { name: 'Editar Tus estudios' });
    expect(editar).toHaveAttribute('aria-expanded', 'false');
    expect(editar).toHaveAttribute('aria-controls', 'seccion-tus_estudios-contenido');
    expect(editar.className).toContain('min-h-[44px]');
    // Los campos siguen montados (estado y guía), pero ocultos.
    expect(container.querySelector('[data-campo="institution"]')).not.toBeNull();
    expect(container.querySelector('#seccion-tus_estudios-contenido')).toHaveAttribute('hidden');
  });

  it('"Editar" la reabre y pone el foco en su primer campo', () => {
    const { container } = render(<Pantalla />);
    entrarYSalir();
    fireEvent.click(screen.getByRole('button', { name: 'Editar Tus estudios' }));
    expect(seccion(container)).toHaveAttribute('data-cerrada', 'false');
    expect(screen.getByLabelText('Institución')).toHaveFocus();
  });

  it('incompleta no se cierra al salir', () => {
    const { container } = render(<Pantalla completa={false} />);
    entrarYSalir();
    expect(seccion(container)).toHaveAttribute('data-cerrada', 'false');
  });

  it('la que tiene el foco no se cierra (moverse entre sus campos)', () => {
    const { container } = render(<Pantalla />);
    act(() => screen.getByLabelText('Institución').focus());
    act(() => screen.getByLabelText('Ciclo').focus());
    expect(seccion(container)).toHaveAttribute('data-cerrada', 'false');
  });

  it('tocar afuera con el puntero mientras el foco sigue adentro no la cierra', () => {
    const { container } = render(<Pantalla />);
    act(() => screen.getByLabelText('Institución').focus());
    fireEvent.pointerDown(document.body);
    fireEvent.pointerUp(document.body);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    // El input sigue con el foco (jsdom no lo mueve al tocar el body).
    expect(seccion(container)).toHaveAttribute('data-cerrada', 'false');
  });

  it('una no plegable nunca se cierra', () => {
    const { container } = render(<Pantalla plegable={false} />);
    entrarYSalir();
    expect(seccion(container)).toHaveAttribute('data-cerrada', 'false');
    expect(screen.queryByRole('button', { name: /Editar/ })).not.toBeInTheDocument();
  });

  it('con error al continuar, se abre sola', () => {
    const { container, rerender } = render(<Pantalla />);
    entrarYSalir();
    expect(seccion(container)).toHaveAttribute('data-cerrada', 'true');
    rerender(<Pantalla conError />);
    expect(seccion(container)).toHaveAttribute('data-cerrada', 'false');
    // Corregido el error, sigue abierta mientras la persona está ahí.
    rerender(<Pantalla />);
    expect(seccion(container)).toHaveAttribute('data-cerrada', 'false');
  });

  it('tocar afuera con el puntero (foco ya fuera del campo) la cierra después del clic', () => {
    const { container } = render(<Pantalla />);
    act(() => screen.getByLabelText('Institución').focus());
    act(() => screen.getByLabelText('Institución').blur());
    const fuera = screen.getByLabelText('Fuera');
    fireEvent.pointerDown(fuera);
    fireEvent.pointerUp(fuera);
    // Todavía no: se espera a que termine el clic.
    expect(seccion(container)).toHaveAttribute('data-cerrada', 'false');
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(seccion(container)).toHaveAttribute('data-cerrada', 'true');
  });

  it('si deja de estar completa (se destapó otro obligatorio), se abre sola', () => {
    const { container, rerender } = render(<Pantalla />);
    entrarYSalir();
    rerender(<Pantalla completa={false} />);
    expect(seccion(container)).toHaveAttribute('data-cerrada', 'false');
    rerender(<Pantalla />);
    expect(seccion(container)).toHaveAttribute('data-cerrada', 'false');
  });

  it('la guía la abre con abrirSeccionDe', () => {
    const { container } = render(<Pantalla />);
    entrarYSalir();
    const campo = container.querySelector('[data-campo="semester"]');
    let abrio = false;
    act(() => {
      abrio = abrirSeccionDe(campo);
    });
    expect(abrio).toBe(true);
    expect(seccion(container)).toHaveAttribute('data-cerrada', 'false');
    // Abierta, ya no hay nada que abrir.
    expect(abrirSeccionDe(campo)).toBe(false);
  });

  it('al cerrarse corrige el scroll para que el campo tocado no se mueva', () => {
    render(<Pantalla />);
    const fuera = screen.getByLabelText('Fuera');
    let top = 500;
    fuera.getBoundingClientRect = () => ({ top } as DOMRect);
    act(() => screen.getByLabelText('Institución').focus());
    act(() => fuera.focus());
    act(() => {
      jest.runOnlyPendingTimers();
      top = 380; // la sección de arriba se encogió 120px (se mide al cerrar)
    });
    expect(window.scrollBy).toHaveBeenCalledWith(0, -120);
  });

  it('con el calendario o el tooltip abiertos (portales fuera de la sección) no se cierra', () => {
    const { container } = render(<Pantalla conEmergentes />);
    act(() => screen.getByLabelText('Institución').focus());
    // El foco pasa al calendario, que está en document.body.
    act(() => screen.getByLabelText('Día del calendario').focus());
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(seccion(container)).toHaveAttribute('data-cerrada', 'false');
    // Un toque en el tooltip (también en document.body), con el foco perdido.
    act(() => screen.getByLabelText('Día del calendario').blur());
    const tooltip = screen.getByTestId('tooltip');
    fireEvent.pointerDown(tooltip);
    fireEvent.pointerUp(tooltip);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(seccion(container)).toHaveAttribute('data-cerrada', 'false');
    // Salir de verdad sí la cierra.
    act(() => screen.getByLabelText('Institución').focus());
    act(() => screen.getByLabelText('Fuera').focus());
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(seccion(container)).toHaveAttribute('data-cerrada', 'true');
  });

  it('el título es el mismo h2 abierta o cerrada', () => {
    render(<Pantalla />);
    const antes = screen.getByRole('heading', { level: 2, name: 'Tus estudios' });
    entrarYSalir();
    const despues = screen.getByRole('heading', { level: 2, name: 'Tus estudios' });
    expect(despues).toBe(antes);
  });

  it('al abrirse por error, la trae a la vista sin animación si se pidió menos movimiento', () => {
    simularPantalla({ celular: false, menosMovimiento: true });
    const scrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    const { rerender } = render(<Pantalla />);
    entrarYSalir();
    rerender(<Pantalla conError />);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'center', behavior: 'auto' });
  });

  describe('cierre animado en el celular', () => {
    /** Alto de la sección: 300 abierta, 60 cerrada, o el que fije la animación. */
    function medir(container: HTMLElement) {
      const sec = seccion(container);
      const alto = () =>
        sec.style.height ? parseFloat(sec.style.height) : sec.getAttribute('data-cerrada') === 'true' ? 60 : 300;
      sec.getBoundingClientRect = () => ({ top: 100, height: alto() } as DOMRect);
      // "Fuera" está justo debajo de la sección; el scroll lo mueve.
      let scroll = 0;
      (window.scrollBy as jest.Mock).mockImplementation((_x: number, y: number) => {
        scroll += y;
      });
      const fuera = screen.getByLabelText('Fuera');
      fuera.getBoundingClientRect = () => ({ top: 100 + alto() - scroll } as DOMRect);
      return { sec, topDeFuera: () => fuera.getBoundingClientRect().top };
    }

    it('se encoge de a pocos y el campo tocado no se mueve', () => {
      simularPantalla({ celular: true, menosMovimiento: false });
      const { container } = render(<Pantalla />);
      const { sec, topDeFuera } = medir(container);
      expect(topDeFuera()).toBe(400);
      entrarYSalir();
      expect(sec).toHaveAttribute('data-cerrada', 'true');
      // Arranca con el alto de abierta.
      expect(sec.style.height).toBe('300px');
      expect(sec.style.overflow).toBe('hidden');
      act(() => {
        jest.advanceTimersByTime(DURACION_CIERRE_MS / 2);
      });
      const medio = parseFloat(sec.style.height);
      expect(medio).toBeGreaterThan(60);
      expect(medio).toBeLessThan(300);
      expect(Math.abs(topDeFuera() - 400)).toBeLessThanOrEqual(2);
      act(() => {
        jest.advanceTimersByTime(DURACION_CIERRE_MS);
      });
      // Terminó: sin alto fijo, y el campo sigue donde estaba.
      expect(sec.style.height).toBe('');
      expect(sec.style.overflow).toBe('');
      expect(Math.abs(topDeFuera() - 400)).toBeLessThanOrEqual(2);
    });

    it('con menos movimiento: sin animación, pero el scroll se corrige de una', () => {
      simularPantalla({ celular: true, menosMovimiento: true });
      const { container } = render(<Pantalla />);
      const { sec, topDeFuera } = medir(container);
      entrarYSalir();
      expect(sec.style.height).toBe('');
      expect(window.scrollBy).toHaveBeenCalledWith(0, -240);
      expect(topDeFuera()).toBe(400);
    });

    it('en escritorio no hay animación (como antes)', () => {
      simularPantalla({ celular: false, menosMovimiento: false });
      const { container } = render(<Pantalla />);
      const { sec, topDeFuera } = medir(container);
      entrarYSalir();
      expect(sec.style.height).toBe('');
      expect(topDeFuera()).toBe(400);
    });

    it('si se reabre a mitad de la animación, suelta el alto fijo', () => {
      simularPantalla({ celular: true, menosMovimiento: false });
      const { container } = render(<Pantalla />);
      const { sec } = medir(container);
      entrarYSalir();
      act(() => {
        jest.advanceTimersByTime(50);
      });
      fireEvent.click(screen.getByRole('button', { name: 'Editar Tus estudios' }));
      expect(sec).toHaveAttribute('data-cerrada', 'false');
      expect(sec.style.height).toBe('');
    });
  });

  it('compensarAncla mueve el scroll lo que se corrió el elemento', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    el.getBoundingClientRect = () => ({ top: 250 } as DOMRect);
    compensarAncla(el, 300);
    expect(window.scrollBy).toHaveBeenCalledWith(0, -50);
    (window.scrollBy as jest.Mock).mockClear();
    compensarAncla(el, 250);
    expect(window.scrollBy).not.toHaveBeenCalled();
    el.remove();
  });
});

describe('SeccionPlegable — ícono y descripción de la sección (prototipo de Brenda)', () => {
  it('pinta el círculo con el ícono de la BD y la descripción bajo el título', () => {
    const { container } = render(
      <SeccionPlegable codigo="dir" titulo="Dirección de tu casa" icono="house" descripcion="Donde vives ahora." plegable={false} completa={false} resumen="">
        <input aria-label="calle" />
      </SeccionPlegable>,
    );
    expect(container.querySelector('[data-icono-seccion="house"] svg')).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'Dirección de tu casa' })).toBeInTheDocument();
    expect(screen.getByText('Donde vives ahora.')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Dirección de tu casa' })).toBeInTheDocument();
  });

  it('un ícono que la web no conoce no deja un círculo vacío', () => {
    const { container } = render(
      <SeccionPlegable codigo="x" titulo="Tus estudios" icono="cohete" plegable={false} completa={false} resumen="">
        <input aria-label="a" />
      </SeccionPlegable>,
    );
    expect(container.querySelector('[data-icono-seccion]')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Tus estudios' })).toBeInTheDocument();
  });
});
