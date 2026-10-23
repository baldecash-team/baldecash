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
