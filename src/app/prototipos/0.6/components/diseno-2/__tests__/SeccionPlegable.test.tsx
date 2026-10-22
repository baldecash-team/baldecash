/// <reference types="jest" />
/**
 * BAL-4964 (F5) — `SeccionPlegable`: se cierra al salir con todo completo,
 * "Editar" la reabre, con error se abre, la que tiene el foco no se cierra y
 * una no plegable nunca se cierra.
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SeccionPlegable, abrirSeccionDe } from '../SeccionPlegable';

function Pantalla({
  completa = true,
  plegable = true,
  conError = false,
}: {
  completa?: boolean;
  plegable?: boolean;
  conError?: boolean;
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
}

beforeEach(() => {
  jest.useFakeTimers();
  window.scrollBy = jest.fn();
});
afterEach(() => {
  jest.useRealTimers();
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
    act(() => {
      fuera.focus();
      top = 380; // la sección de arriba se encogió 120px
    });
    expect(window.scrollBy).toHaveBeenCalledWith(0, -120);
  });
});
