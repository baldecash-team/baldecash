import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

/**
 * Verificacion de RENDER del calendario: que los dias realmente salgan
 * deshabilitados o no segun date_range.
 *
 * El test hermano (DateInput.test.tsx) prueba la regla pura; este prueba que
 * la regla llegue al DOM en la vista de dias. Hacen falta los dos: la regla
 * podria ser correcta y no estar cableada a los botones.
 *
 * El Popover de NextUI no renderiza en jsdom (el mock global de framer-motion
 * no cubre LazyMotion), asi que se mockea a un passthrough. Es el minimo
 * necesario para que la grilla de dias exista en el DOM.
 */
jest.mock('@nextui-org/react', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => (
    <button onClick={onPress}>{children}</button>
  ),
}));

import { DateInput } from './DateInput';

const HOY = new Date();
const ESTE_MES_TIENE_MANANA = new Date(HOY.getFullYear(), HOY.getMonth() + 1, 0).getDate() > HOY.getDate();
const ESTE_MES_TIENE_AYER = HOY.getDate() > 1;

/** El boton del dia N dentro de la grilla del calendario. */
function dia(n: number): HTMLButtonElement | undefined {
  return Array.from(document.querySelectorAll('button')).find(
    (b) => b.textContent?.trim() === String(n) && b.className.includes('aspect-square')
  ) as HTMLButtonElement | undefined;
}

function montar(dateRange: 'past' | 'future' | 'any' | undefined) {
  const props: Record<string, unknown> = {
    id: 'f',
    label: 'Fecha',
    value: '',
    onChange: jest.fn(),
    defaultYearOffset: 0, // abrir en el mes actual
  };
  if (dateRange) props.dateRange = dateRange;
  return render(<DateInput {...(props as never)} />);
}

describe('DateInput — la regla llega al DOM', () => {
  it("'past' deshabilita el boton de manana", () => {
    if (!ESTE_MES_TIENE_MANANA) return;
    montar('past');
    expect(dia(HOY.getDate() + 1)).toBeDisabled();
  });

  it("'past' deja habilitado el boton de ayer", () => {
    if (!ESTE_MES_TIENE_AYER) return;
    montar('past');
    expect(dia(HOY.getDate() - 1)).not.toBeDisabled();
  });

  it("'future' deja habilitado el boton de manana", () => {
    if (!ESTE_MES_TIENE_MANANA) return;
    montar('future');
    expect(dia(HOY.getDate() + 1)).not.toBeDisabled();
  });

  it("'future' deshabilita el boton de ayer", () => {
    if (!ESTE_MES_TIENE_AYER) return;
    montar('future');
    expect(dia(HOY.getDate() - 1)).toBeDisabled();
  });

  it("'any' deja habilitados ayer y manana", () => {
    if (!ESTE_MES_TIENE_AYER || !ESTE_MES_TIENE_MANANA) return;
    montar('any');
    expect(dia(HOY.getDate() - 1)).not.toBeDisabled();
    expect(dia(HOY.getDate() + 1)).not.toBeDisabled();
  });

  it('sin la prop se comporta como past (no-rotura)', () => {
    if (!ESTE_MES_TIENE_MANANA) return;
    montar(undefined);
    expect(dia(HOY.getDate() + 1)).toBeDisabled();
  });

  it('hoy queda habilitado en los 3 modos', () => {
    for (const modo of ['past', 'future', 'any'] as const) {
      const { unmount } = montar(modo);
      expect(dia(HOY.getDate())).not.toBeDisabled();
      unmount();
    }
  });
});
