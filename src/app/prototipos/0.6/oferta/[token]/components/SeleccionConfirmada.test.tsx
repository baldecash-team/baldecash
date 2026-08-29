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

/**
 * BAL-3471 — el copy debe DERIVAR del tipo de oferta aceptada.
 *
 * El bug: la pantalla era una sola para los tres tipos y afirmaba "Has
 * realizado el cambio de equipo", titulaba "Tu nuevo equipo" y prometía
 * "Recibirás el contrato por WhatsApp para firmarlo y coordinar la entrega".
 * Un cliente que solo sumó un accesorio leía las tres cosas, y ninguna había
 * pasado: su solicitud seguía en evaluación.
 */
describe('SeleccionConfirmada — copy por tipo de oferta (BAL-3471)', () => {
  const base: ChosenSummary = {
    name: 'HP 250 G8 Notebook PC',
    monthly: 89,
    termMonths: 24,
    paymentFrequency: 'mensual',
    userName: 'Belen abigail Jara Yapias',
    previous: null,
  };

  it('accesorios: dice "modificado tu solicitud" y NO habla de cambio de equipo', () => {
    mockMatchMedia(true);
    render(<SeleccionConfirmada chosen={base} variant="accesorios" />);

    expect(
      screen.getByText('Has modificado tu solicitud exitosamente, te seguiremos evaluando.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/cambio de equipo/i)).not.toBeInTheDocument();
    // El equipo no cambió → la tarjeta no puede titularse "Tu nuevo equipo".
    expect(screen.queryByText(/Tu nuevo equipo/i)).not.toBeInTheDocument();
    expect(screen.getByText('Tu equipo')).toBeInTheDocument();
  });

  it('accesorios: saluda al cliente por su nombre', () => {
    mockMatchMedia(true);
    render(<SeleccionConfirmada chosen={base} variant="accesorios" />);
    expect(screen.getByText('¡Felicidades, Belen abigail Jara Yapias!')).toBeInTheDocument();
  });

  it('equipo: mantiene el copy de cambio de equipo y la etiqueta "Tu nuevo equipo"', () => {
    mockMatchMedia(true);
    const conCambio: ChosenSummary = {
      ...base,
      previous: { name: 'Laptop ExpertBook', monthly: 179, term: 24, paymentFrequency: 'mensual' },
    };
    render(<SeleccionConfirmada chosen={conCambio} variant="equipo" />);

    expect(screen.getByText(/Has realizado el cambio de equipo correctamente/)).toBeInTheDocument();
    expect(screen.getByText('Tu nuevo equipo')).toBeInTheDocument();
    expect(screen.getByText('Equipo anterior')).toBeInTheDocument();
  });

  it('condiciones: habla de condiciones actualizadas, sin "nuevo equipo"', () => {
    mockMatchMedia(true);
    render(<SeleccionConfirmada chosen={base} variant="condiciones" />);

    expect(
      screen.getByText('Has actualizado las condiciones de tu solicitud, te seguiremos evaluando.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Tu nuevo equipo/i)).not.toBeInTheDocument();
  });

  it('NINGÚN tipo promete contrato ni entrega: la solicitud sigue en evaluación', () => {
    mockMatchMedia(true);
    const conCambio: ChosenSummary = {
      ...base,
      previous: { name: 'Laptop ExpertBook', monthly: 179, term: 24, paymentFrequency: 'mensual' },
    };
    const casos: Array<[string, ChosenSummary, 'accesorios' | 'equipo' | 'condiciones']> = [
      ['accesorios', base, 'accesorios'],
      ['equipo', conCambio, 'equipo'],
      ['condiciones', base, 'condiciones'],
    ];

    for (const [nombre, chosen, variant] of casos) {
      const { unmount } = render(<SeleccionConfirmada chosen={chosen} variant={variant} />);
      expect(screen.queryByText(/contrato/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/firmarlo/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/coordinar la entrega/i)).not.toBeInTheDocument();
      // Lo que sí se afirma: que la evaluación continúa.
      expect(screen.getByText(/te avisaremos por WhatsApp/i)).toBeInTheDocument();
      unmount();
      void nombre;
    }
  });

  it('sin variant: deriva "equipo" solo si el anterior es OTRO equipo', () => {
    mockMatchMedia(true);
    const mismoEquipo: ChosenSummary = {
      ...base,
      // El backend manda `requested_product` aunque el equipo no haya cambiado.
      previous: { name: 'HP 250 G8 Notebook PC', monthly: 89, term: 24, paymentFrequency: 'mensual' },
    };
    render(<SeleccionConfirmada chosen={mismoEquipo} />);

    expect(screen.queryByText(/cambio de equipo/i)).not.toBeInTheDocument();
    // No se pinta la comparación "anterior → nuevo" contra sí mismo.
    expect(screen.queryByText('Equipo anterior')).not.toBeInTheDocument();
  });
});
