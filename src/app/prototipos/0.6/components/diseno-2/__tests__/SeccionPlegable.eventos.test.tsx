/// <reference types="jest" />
/**
 * BAL-5207 — `SeccionPlegable` emite `form_section_toggle` con `section_code`
 * y `abierto` cuando la persona la abre («Editar») o la cierra (sale de una
 * sección completa). La apertura automática —la guía de campos
 * (`abrirSeccionDe`), un error al continuar o un obligatorio nuevo— no es un
 * gesto de la persona y no se registra.
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SeccionPlegable, abrirSeccionDe } from '../SeccionPlegable';

const track = jest.fn();
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track, flush: jest.fn() }),
}));

function Pantalla({ completa = true, conError = false, plegable = true }: { completa?: boolean; conError?: boolean; plegable?: boolean }) {
  return (
    <div>
      <SeccionPlegable
        codigo="tus_estudios"
        titulo="Tus estudios"
        plegable={plegable}
        completa={completa}
        resumen="Universidad del Pacífico"
        conError={conError}
      >
        <input aria-label="Institución" />
      </SeccionPlegable>
      <input aria-label="Fuera" />
    </div>
  );
}

function entrarYSalir() {
  act(() => screen.getByLabelText('Institución').focus());
  act(() => screen.getByLabelText('Fuera').focus());
  act(() => {
    jest.runOnlyPendingTimers();
  });
}

const llamadas = () => track.mock.calls.filter((c) => c[0] === 'form_section_toggle').map((c) => c[1]);

beforeEach(() => {
  jest.useFakeTimers();
  window.scrollBy = jest.fn();
  track.mockClear();
});
afterEach(() => {
  jest.useRealTimers();
});

describe('SeccionPlegable — form_section_toggle (BAL-5207)', () => {
  it('cerrarse al salir emite abierto: false; «Editar» emite abierto: true', () => {
    render(<Pantalla />);
    entrarYSalir();
    expect(llamadas()).toEqual([{ section_code: 'tus_estudios', abierto: false }]);
    fireEvent.click(screen.getByRole('button', { name: 'Editar Tus estudios' }));
    expect(llamadas()).toEqual([
      { section_code: 'tus_estudios', abierto: false },
      { section_code: 'tus_estudios', abierto: true },
    ]);
  });

  it('ya cerrada, pasar con Tab por su «Editar» y salir no emite otro cierre', () => {
    render(<Pantalla />);
    entrarYSalir();
    act(() => screen.getByRole('button', { name: 'Editar Tus estudios' }).focus());
    act(() => screen.getByLabelText('Fuera').focus());
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(llamadas()).toEqual([{ section_code: 'tus_estudios', abierto: false }]);
  });

  it('la guía la abre con abrirSeccionDe: no emite', () => {
    const { container } = render(<Pantalla />);
    entrarYSalir();
    track.mockClear();
    act(() => {
      abrirSeccionDe(container.querySelector('[data-seccion="tus_estudios"] input'));
    });
    expect(screen.getByLabelText('Institución')).toBeVisible();
    expect(llamadas()).toEqual([]);
  });

  it('abrirse sola por un error al continuar: no emite', () => {
    const { rerender } = render(<Pantalla />);
    entrarYSalir();
    track.mockClear();
    rerender(<Pantalla conError />);
    expect(screen.getByLabelText('Institución')).toBeVisible();
    expect(llamadas()).toEqual([]);
  });

  it('incompleta o no plegable: salir no la cierra y no emite', () => {
    const { unmount } = render(<Pantalla completa={false} />);
    entrarYSalir();
    unmount();
    render(<Pantalla plegable={false} />);
    entrarYSalir();
    expect(llamadas()).toEqual([]);
  });
});
