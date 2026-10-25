/**
 * Verificación final (BAL-4969): el aviso de error del envío ya no se va solo
 * a los 4 s; se queda hasta que la persona lo cierra (o vuelve a enviar).
 */
import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { AvisoV2 } from '../AvisoV2';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('AvisoV2 · error persistente', () => {
  it('un error no se cierra solo; con «Cerrar aviso» sí', () => {
    const onClose = jest.fn();
    render(<AvisoV2 message="Tuvimos un problema de nuestro lado." type="error" isVisible onClose={onClose} duration={4000} />);
    act(() => jest.advanceTimersByTime(60000));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar aviso' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('un aviso que no es error sí se cierra solo', () => {
    const onClose = jest.fn();
    render(<AvisoV2 message="Hay campos incompletos" type="warning" isVisible onClose={onClose} duration={4000} />);
    act(() => jest.advanceTimersByTime(4000));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('AvisoV2 · Diseño 1 (BAL-5008)', () => {
  it('con diseno={1} usa los colores del Toast de Diseño 1 y mantiene la accesibilidad', () => {
    render(<AvisoV2 diseno={1} message="Hay campos incompletos" type="warning" isVisible onClose={jest.fn()} />);
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('data-aviso-d1');
    expect(region).not.toHaveAttribute('data-aviso-v2');
    expect(region.innerHTML).toMatch(/bg-amber-50/);
    expect(region.innerHTML).not.toMatch(/Asap/);
    const cerrar = screen.getByRole('button', { name: 'Cerrar aviso' });
    expect(cerrar.className).toMatch(/h-11/);
    expect(cerrar.className).toMatch(/w-11/);
  });
});
