/**
 * BAL-4959 (hallazgo de la revisión de accesibilidad): `TransicionPaso` es un
 * diálogo (role=dialog aria-modal) y mientras está visible el foco queda
 * atrapado adentro (Tab no se escapa a la página de atrás) y vuelve a donde
 * estaba al terminar — el mismo patrón que ya usa `LoQuieroModal`.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TransicionPaso } from '../TransicionPaso';

describe('TransicionPaso — foco atrapado', () => {
  it('es un diálogo modal y el foco entra al botón "Continuar"', () => {
    render(<TransicionPaso pasos={['Paso 1', 'Paso 2']} pasoCompletado={1} onComplete={jest.fn()} />);
    const dialogo = screen.getByRole('dialog');
    expect(dialogo).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('button', { name: 'Continuar' })).toHaveFocus();
  });

  it('Tab desde el único foco posible (el botón) se queda adentro: no se escapa', () => {
    render(<TransicionPaso pasos={['Paso 1', 'Paso 2']} pasoCompletado={1} onComplete={jest.fn()} />);
    const boton = screen.getByRole('button', { name: 'Continuar' });
    expect(boton).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab' });
    // Único elemento enfocable: Tab vuelve a él mismo, nunca sale del diálogo.
    expect(boton).toHaveFocus();
  });

  it('al desmontarse (terminó o se saltó) el foco vuelve a donde estaba antes', () => {
    const fueraDelModal = document.createElement('button');
    fueraDelModal.textContent = 'Fuera';
    document.body.appendChild(fueraDelModal);
    fueraDelModal.focus();
    expect(fueraDelModal).toHaveFocus();

    const { unmount } = render(
      <TransicionPaso pasos={['Paso 1', 'Paso 2']} pasoCompletado={1} onComplete={jest.fn()} />,
    );
    expect(fueraDelModal).not.toHaveFocus();

    unmount();
    expect(fueraDelModal).toHaveFocus();
    fueraDelModal.remove();
  });

  it('Escape termina la transición (avisa onComplete una sola vez)', () => {
    const onComplete = jest.fn();
    render(<TransicionPaso pasos={['Paso 1', 'Paso 2']} pasoCompletado={1} onComplete={onComplete} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
