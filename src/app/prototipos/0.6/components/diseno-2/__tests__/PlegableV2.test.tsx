import React, { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { PlegableV2 } from '../PlegableV2';
import { PLEGABLE_ABRIR, PLEGABLE_CERRAR } from '../movimiento';

/**
 * Desplegable animado de Diseño 2 (BAL-4959): abre y cierra con
 * `grid-template-rows`, el contenido se desmonta recién al terminar la
 * transición de cierre y con movimiento reducido no anima.
 */

function Prueba() {
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <button type="button" aria-expanded={abierto} aria-controls="plegable-prueba" onClick={() => setAbierto((v) => !v)}>
        Cambiar plazo o inicial
      </button>
      <PlegableV2 abierto={abierto} id="plegable-prueba">
        <p>Contenido del plazo</p>
      </PlegableV2>
    </>
  );
}

function simularMenosMovimiento(menos: boolean) {
  window.matchMedia = ((q: string) => ({
    matches: menos && q.includes('prefers-reduced-motion'),
    media: q,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

const original = window.matchMedia;

beforeEach(() => {
  // Los timers falsos de Jest también simulan requestAnimationFrame (~16 ms).
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
  window.matchMedia = original;
});

describe('PlegableV2', () => {
  it('aria-expanded sigue al estado y la caja con el id siempre existe', () => {
    simularMenosMovimiento(false);
    render(<Prueba />);
    const boton = screen.getByRole('button');
    expect(boton).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById('plegable-prueba')).toHaveAttribute('hidden');
    fireEvent.click(boton);
    expect(boton).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById('plegable-prueba')).not.toHaveAttribute('hidden');
  });

  it('abre de 0fr a 1fr y, al cerrar, desmonta recién cuando termina la transición', () => {
    simularMenosMovimiento(false);
    render(<Prueba />);
    const boton = screen.getByRole('button');
    const caja = () => document.getElementById('plegable-prueba') as HTMLDivElement;

    fireEvent.click(boton);
    // Mismo render: montado en 0fr; dos cuadros después, 1fr.
    expect(screen.getByText('Contenido del plazo')).toBeInTheDocument();
    expect(caja().style.gridTemplateRows).toBe('0fr');
    act(() => { jest.advanceTimersByTime(40); });
    expect(caja().style.gridTemplateRows).toBe('1fr');
    expect(caja().style.transition).toContain(`${PLEGABLE_ABRIR.ms}ms`);

    fireEvent.click(boton);
    // Cerrando: 0fr con la curva de cierre, el contenido sigue montado.
    expect(caja().style.gridTemplateRows).toBe('0fr');
    expect(caja().style.transition).toContain(`${PLEGABLE_CERRAR.ms}ms`);
    expect(screen.getByText('Contenido del plazo')).toBeInTheDocument();

    // Termina la transición de la altura: se desmonta.
    const fin = new Event('transitionend', { bubbles: true }) as Event & { propertyName?: string };
    Object.defineProperty(fin, 'propertyName', { value: 'grid-template-rows' });
    act(() => { caja().dispatchEvent(fin); });
    expect(screen.queryByText('Contenido del plazo')).not.toBeInTheDocument();
    expect(caja()).toHaveAttribute('hidden');
  });

  it('si no llega transitionend, se desmonta igual por el respaldo', () => {
    simularMenosMovimiento(false);
    render(<Prueba />);
    const boton = screen.getByRole('button');
    fireEvent.click(boton);
    act(() => { jest.advanceTimersByTime(40); });
    fireEvent.click(boton);
    expect(screen.getByText('Contenido del plazo')).toBeInTheDocument();
    act(() => { jest.advanceTimersByTime(PLEGABLE_CERRAR.ms + 100); });
    expect(screen.queryByText('Contenido del plazo')).not.toBeInTheDocument();
  });

  it('con movimiento reducido no anima: abre y cierra de una', () => {
    simularMenosMovimiento(true);
    render(<Prueba />);
    const boton = screen.getByRole('button');
    const caja = () => document.getElementById('plegable-prueba') as HTMLDivElement;
    fireEvent.click(boton);
    expect(caja().style.gridTemplateRows).toBe('1fr');
    expect(caja().style.transition).toBe('none');
    fireEvent.click(boton);
    expect(screen.queryByText('Contenido del plazo')).not.toBeInTheDocument();
  });
});
