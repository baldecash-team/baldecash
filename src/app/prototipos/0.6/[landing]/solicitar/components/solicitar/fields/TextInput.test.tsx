/**
 * Tests for TextInput — rueda del mouse no debe cambiar el valor (BAL-4344)
 *
 * Un input type="number" enfocado cambia su valor cuando el usuario sigue
 * girando la rueda del mouse para scrollear la página (medido en producción:
 * tipeó 500 → giró la rueda hacia abajo → quedó en 499). La solución estándar
 * es sacarle el foco al input en el wheel: eso deja que la página siga
 * scrolleando y, al no estar enfocado, el navegador ya no cambia el valor.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextInput } from './TextInput';

describe('TextInput — wheel sobre input numérico', () => {
  it('un input type="number" enfocado pierde el foco al recibir wheel (y por lo tanto no cambia el valor)', () => {
    render(
      <TextInput id="monto" label="Monto" type="number" value="500" onChange={jest.fn()} />
    );

    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    input.focus();
    expect(input).toHaveFocus();

    fireEvent.wheel(input, { deltaY: 100 });

    expect(input).not.toHaveFocus();
  });

  it('un input type="text" enfocado mantiene el foco al recibir wheel (comportamiento normal, sin cambios)', () => {
    render(
      <TextInput id="nombre" label="Nombre" type="text" value="Juan" onChange={jest.fn()} />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    input.focus();
    expect(input).toHaveFocus();

    fireEvent.wheel(input, { deltaY: 100 });

    expect(input).toHaveFocus();
  });

  it('sigue llamando a un onWheel provisto por quien use el componente', () => {
    const onWheel = jest.fn();
    render(
      <TextInput
        id="monto"
        label="Monto"
        type="number"
        value="500"
        onChange={jest.fn()}
        onWheel={onWheel}
      />
    );

    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    fireEvent.wheel(input, { deltaY: 100 });

    expect(onWheel).toHaveBeenCalledTimes(1);
  });

  it('ArrowUp en un input numérico no es bloqueado por el manejador de wheel', () => {
    const onKeyDown = jest.fn();
    render(
      <TextInput
        id="monto"
        label="Monto"
        type="number"
        value="500"
        onChange={jest.fn()}
      />
    );

    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    input.addEventListener('keydown', onKeyDown);
    input.focus();

    fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' });

    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(input).toHaveFocus();
  });
});
