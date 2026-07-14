/**
 * SeleccionConfirmada — la sección "Tu pedido incluye" es colapsable (feedback
 * Marco/Emilio): header con toggle + chevron, la lista de items colapsa, pero la
 * "Cuota total" queda SIEMPRE visible.
 */
import { render, screen, fireEvent } from '@testing-library/react';

import { SeleccionConfirmada, type ChosenSummary } from './SeleccionConfirmada';

// El componente decide el default del colapsable con matchMedia (desktop abierto).
// jsdom no lo implementa → mock configurable por test.
function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
      onchange: null,
    }),
  });
}

const chosenConAddons: ChosenSummary = {
  name: 'iPad 11 pulgadas',
  monthly: 124,
  termMonths: 24,
  paymentFrequency: 'mensual',
  userName: 'Anghelo',
  previous: { name: 'Laptop ExpertBook', monthly: 179, term: 24, paymentFrequency: 'mensual' },
  accessories: [{ id: '1', name: 'Mochila Nova', monthly: 0, includedFree: true }],
  insurances: [
    { id: '14', name: 'Garantía Extendida', monthly: 20 },
    { id: '16', name: 'Seguro Contra Robo', monthly: 11 },
  ],
};

describe('SeleccionConfirmada — "Tu pedido incluye" colapsable', () => {
  it('muestra el header con el toggle y el conteo de items (1 equipo + 3 add-ons)', () => {
    mockMatchMedia(true);
    render(<SeleccionConfirmada chosen={chosenConAddons} />);
    // equipo + 1 accesorio + 2 seguros = 4
    expect(screen.getByText(/Tu pedido incluye \(4\)/i)).toBeInTheDocument();
  });

  it('en desktop (matchMedia true) el desglose arranca EXPANDIDO', () => {
    mockMatchMedia(true);
    render(<SeleccionConfirmada chosen={chosenConAddons} />);
    const toggle = screen.getByRole('button', { name: /Tu pedido incluye/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('en mobile (matchMedia false) el desglose arranca COLAPSADO', () => {
    mockMatchMedia(false);
    render(<SeleccionConfirmada chosen={chosenConAddons} />);
    const toggle = screen.getByRole('button', { name: /Tu pedido incluye/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('el toggle alterna aria-expanded al hacer click', () => {
    mockMatchMedia(false); // arranca colapsado
    render(<SeleccionConfirmada chosen={chosenConAddons} />);
    const toggle = screen.getByRole('button', { name: /Tu pedido incluye/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('la "Cuota total" queda SIEMPRE visible, aun con el desglose colapsado', () => {
    mockMatchMedia(false); // colapsado
    render(<SeleccionConfirmada chosen={chosenConAddons} />);
    expect(screen.getByText('Cuota total')).toBeInTheDocument();
    // total = 124 + 0 + 20 + 11 = 155
    expect(screen.getByText(/S\/155/)).toBeInTheDocument();
  });

  it('sin add-ons NO se renderiza la sección "Tu pedido incluye"', () => {
    mockMatchMedia(true);
    const sinAddons: ChosenSummary = { ...chosenConAddons, accessories: [], insurances: [] };
    render(<SeleccionConfirmada chosen={sinAddons} />);
    expect(screen.queryByText(/Tu pedido incluye/i)).not.toBeInTheDocument();
  });
});
