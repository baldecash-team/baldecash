/**
 * ModalV2 (BAL-5203, punto 10): el modal base de Diseño 2 con el estándar del
 * «Detalle del financiamiento» de la ficha. Franja con ícono, título y
 * cerrar; foco adentro y de vuelta; Escape solo del de más arriba; arrastre
 * de la manija en celular; salida animada salvo con menos movimiento.
 */
import React, { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { FileText } from 'lucide-react';
import { ModalV2, UMBRAL_ARRASTRE_V2 } from '../ModalV2';
import { DURACION_SALIDA_MS } from '../movimiento';

function medios({ celular = false, menos = false } = {}) {
  window.matchMedia = jest.fn().mockImplementation((q: string) => ({
    matches: (q.includes('reduce') && menos) || (q.includes('max-width') && celular),
    media: q,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })) as unknown as typeof window.matchMedia;
}

function Pantalla({ onCerrar = jest.fn(), conHijo = false }: { onCerrar?: jest.Mock; conHijo?: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const [hijo, setHijo] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setAbierto(true)}>Abrir</button>
      <ModalV2
        abierto={abierto}
        onCerrar={(m) => {
          onCerrar(m);
          setAbierto(false);
        }}
        icono={FileText}
        titulo="Detalle"
        subtitulo="Información completa"
        pie={<button type="button" onClick={() => setAbierto(false)}>Cerrar</button>}
      >
        <button type="button" onClick={() => setHijo(true)}>Abrir hijo</button>
      </ModalV2>
      {conHijo && (
        <ModalV2 abierto={hijo} onCerrar={() => setHijo(false)} icono={FileText} titulo="Hijo" capa={1010}>
          <input aria-label="Código" />
        </ModalV2>
      )}
    </>
  );
}

// jsdom no trae PointerEvent: sin esto el evento llega sin `clientY`.
beforeAll(() => {
  if (typeof window.PointerEvent === 'undefined') {
    class PointerEventDePrueba extends MouseEvent {
      pointerId: number;
      constructor(tipo: string, init: PointerEventInit = {}) {
        super(tipo, init);
        this.pointerId = init.pointerId ?? 0;
      }
    }
    (window as unknown as { PointerEvent: unknown }).PointerEvent = PointerEventDePrueba;
  }
});

beforeEach(() => medios());

describe('ModalV2', () => {
  it('es un diálogo modal con la franja (ícono, título, subtítulo y cerrar) en un portal', () => {
    render(<Pantalla />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    const dialogo = screen.getByRole('dialog', { name: 'Detalle' });
    expect(dialogo).toHaveAttribute('aria-modal', 'true');
    expect(dialogo).toHaveAccessibleDescription('Información completa');
    expect(dialogo.querySelector('[data-franja-v2]')).toHaveClass('bg-[var(--d2-cabecera-inicio)]', 'md:rounded-none', 'rounded-xl', 'mx-4');
    expect(dialogo).toHaveClass('rounded-t-3xl', 'md:rounded-2xl');
    // El cerrar de la franja y el «Cerrar» del pie.
    expect(screen.getAllByRole('button', { name: 'Cerrar' })).toHaveLength(2);
    expect(dialogo).toHaveFocus();
  });

  it('Escape cierra, la salida espera la animación y el foco vuelve a quien lo abrió', () => {
    jest.useFakeTimers();
    const onCerrar = jest.fn();
    render(<Pantalla onCerrar={onCerrar} />);
    const abrir = screen.getByRole('button', { name: 'Abrir' });
    abrir.focus();
    fireEvent.click(abrir);
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(onCerrar).toHaveBeenCalledWith('escape');
    expect(screen.getByRole('dialog').className).toContain('d2-modal-sale');
    act(() => {
      jest.advanceTimersByTime(DURACION_SALIDA_MS + 10);
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(abrir).toHaveFocus();
    jest.useRealTimers();
  });

  it('con menos movimiento se va de una', () => {
    medios({ menos: true });
    render(<Pantalla />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Cerrar' })[1]);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('apilados: Escape cierra solo el de arriba', () => {
    medios({ menos: true });
    const onCerrar = jest.fn();
    render(<Pantalla onCerrar={onCerrar} conHijo />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    fireEvent.click(screen.getByRole('button', { name: 'Abrir hijo' }));
    expect(screen.getByRole('dialog', { name: 'Hijo' })).toBeInTheDocument();
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(screen.queryByRole('dialog', { name: 'Hijo' })).toBeNull();
    expect(screen.getByRole('dialog', { name: 'Detalle' })).toBeInTheDocument();
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('celular: arrastrar la manija más del umbral cierra; menos, vuelve a su lugar', () => {
    medios({ celular: true, menos: true });
    const onCerrar = jest.fn();
    render(<Pantalla onCerrar={onCerrar} />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    const manija = document.querySelector('[data-manija-v2]') as HTMLElement;

    fireEvent.pointerDown(manija, { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(manija, { clientY: 100 + UMBRAL_ARRASTRE_V2 - 20, pointerId: 1 });
    expect(screen.getByRole('dialog').style.transform).toBe(`translateY(${UMBRAL_ARRASTRE_V2 - 20}px)`);
    fireEvent.pointerUp(manija, { clientY: 100 + UMBRAL_ARRASTRE_V2 - 20, pointerId: 1 });
    expect(onCerrar).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog').style.transform).toBe('');

    fireEvent.pointerDown(manija, { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(manija, { clientY: 100 + UMBRAL_ARRASTRE_V2 + 30, pointerId: 1 });
    fireEvent.pointerUp(manija, { clientY: 100 + UMBRAL_ARRASTRE_V2 + 30, pointerId: 1 });
    expect(onCerrar).toHaveBeenCalledWith('arrastre');
  });

  it('el cerrar de la franja tiene zona táctil de 44 px', () => {
    render(<Pantalla />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    const franja = document.querySelector('[data-franja-v2]') as HTMLElement;
    const x = franja.querySelector('button') as HTMLElement;
    expect(x).toHaveClass('h-7', 'w-7', 'before:h-11', 'before:w-11');
  });
});
