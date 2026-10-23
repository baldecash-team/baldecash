/**
 * «Mostrar contador de caracteres» por campo (BAL-4960).
 *
 * `showCounter` llega de la foto como `show_counter` (paso > banco, ya
 * resuelto en ws2). Sin valor (`undefined`/`null`) cada diseño hace lo de
 * siempre: Diseño 1 muestra «12/50», Diseño 2 no. `true` lo muestra y `false`
 * lo oculta en los dos. El límite (`maxLength` del input) se respeta SIEMPRE:
 * esto solo decide si se ve el número.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { TextInput } from './TextInput';
import { CamposV2Provider } from '@/app/prototipos/0.6/components/diseno-2/campos/estilosV2';

type Valor = boolean | null | undefined;

function montar({ v2, showCounter, pista }: { v2: boolean; showCounter: Valor; pista?: string | null }) {
  const campo = (
    <TextInput
      id="nombre"
      label="Nombre"
      value="Ana"
      onChange={jest.fn()}
      maxLength={50}
      showCounter={showCounter}
      pista={pista}
    />
  );
  return render(v2 ? <CamposV2Provider>{campo}</CamposV2Provider> : campo);
}

const contador = () => screen.queryByText('3/50');

describe('TextInput — contador de caracteres (BAL-4960)', () => {
  it.each([
    // diseño, valor, ¿se ve?
    ['Diseño 1', false, undefined, true],
    ['Diseño 1', false, null, true],
    ['Diseño 2', true, undefined, false],
    ['Diseño 2', true, null, false],
    ['Diseño 1', false, true, true],
    ['Diseño 1', false, false, false],
    ['Diseño 2', true, true, true],
    ['Diseño 2', true, false, false],
  ] as const)('%s con show_counter=%s → contador visible: %s', (_d, v2, showCounter, visible) => {
    montar({ v2, showCounter });
    if (visible) expect(contador()).toBeInTheDocument();
    else expect(contador()).toBeNull();
  });

  it.each([
    [false, undefined], [false, true], [false, false],
    [true, undefined], [true, true], [true, false],
  ] as const)('el límite se respeta siempre (v2=%s, show_counter=%s)', (v2, showCounter) => {
    montar({ v2, showCounter });
    expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '50');
  });

  it('sin máximo no hay contador aunque esté en true', () => {
    render(<TextInput id="n" label="N" value="Ana" onChange={jest.fn()} showCounter />);
    expect(screen.queryByText(/\/\d+$/)).toBeNull();
  });

  it('Diseño 2: el contador va a la derecha, en la misma fila que la pista y con su estilo', () => {
    montar({ v2: true, showCounter: true, pista: 'Como aparece en tu DNI' });
    const pista = screen.getByText('Como aparece en tu DNI');
    const numero = screen.getByText('3/50');
    expect(pista.parentElement).toBe(numero.parentElement);
    expect(pista.parentElement).toHaveClass('justify-between');
    expect(numero.className).toContain('text-[13px]');
    expect(numero).toHaveAttribute('data-contador', 'nombre');
  });

  it('Diseño 2 con contador y sin pista: el contador queda solo, a la derecha', () => {
    montar({ v2: true, showCounter: true });
    expect(screen.getByText('3/50').parentElement).toHaveClass('justify-between');
  });

  it('Diseño 2 con pista y contador apagado: la pista se ve igual', () => {
    montar({ v2: true, showCounter: false, pista: 'Como aparece en tu DNI' });
    expect(screen.getByText('Como aparece en tu DNI')).toHaveAttribute('data-pista', 'nombre');
    expect(contador()).toBeNull();
  });
});
