/**
 * BAL-3880 — dos cosas se rompían antes de este ticket:
 *
 * 1. `handleCardClick` reemplazaba la selección en vez de acumularla
 *    (`onChange([value])`), pese a que URL, API, estado y backend ya son
 *    multi-valor de punta a punta. Marcar dos usos dejaba solo el último.
 * 2. En mobile no había forma de mostrar las 4 cards como chips en una
 *    fila: el preset `features.has_usage_chips` es nuevo y opt-in (default
 *    apagado), así que sin él el catálogo se ve exactamente igual que hoy.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickUsageCards } from '../QuickUsageCards';
import { UsageType } from '../../../types/catalog';

// NextUI's Ripple (montado por Card isPressable y por Chip clickeable) usa
// el namespace `m` de framer-motion, que jest.setup.js no mockea (solo
// mockea `motion`). Sin este mock, un click en jsdom revienta con
// "Cannot read properties of undefined (reading 'span')" — nada que ver con
// la lógica que este archivo prueba.
jest.mock('@nextui-org/ripple', () => ({
  Ripple: () => null,
  useRipple: () => ({ ripples: [], onClear: jest.fn(), onPress: jest.fn() }),
}));

describe('QuickUsageCards — multi-select', () => {
  it('marcar dos cards deja las dos activas', async () => {
    const user = userEvent.setup();
    let selected: UsageType[] = [];
    const onChange = jest.fn((next: UsageType[]) => {
      selected = next;
    });

    const { rerender } = render(<QuickUsageCards selected={selected} onChange={onChange} />);

    await user.click(screen.getByText('Para estudiar'));
    expect(onChange).toHaveBeenLastCalledWith(['estudios']);
    rerender(<QuickUsageCards selected={selected} onChange={onChange} />);

    await user.click(screen.getByText('Para jugar'));
    expect(onChange).toHaveBeenLastCalledWith(['estudios', 'gaming']);
  });

  it('desmarcar uno deja el otro activo', async () => {
    const user = userEvent.setup();
    let selected: UsageType[] = ['estudios', 'gaming'];
    const onChange = jest.fn((next: UsageType[]) => {
      selected = next;
    });

    const { rerender } = render(<QuickUsageCards selected={selected} onChange={onChange} />);

    await user.click(screen.getByText('Para estudiar'));
    expect(onChange).toHaveBeenLastCalledWith(['gaming']);
    rerender(<QuickUsageCards selected={selected} onChange={onChange} />);

    expect(onChange).not.toHaveBeenCalledWith([]);
  });
});

describe('QuickUsageCards — preset features.has_usage_chips (mobile)', () => {
  it('preset ausente: se ven las cards 2x2 de siempre, sin chips', () => {
    render(<QuickUsageCards selected={[]} onChange={jest.fn()} />);

    // La card clásica trae la descripción larga; el chip no.
    expect(screen.getByText('Clases online, investigación y proyectos')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Estudiar' })).not.toBeInTheDocument();
  });

  it('preset en true: aparecen los 4 chips, uno por uso', () => {
    render(<QuickUsageCards selected={[]} onChange={jest.fn()} chipsEnMobile />);

    expect(screen.getByRole('button', { name: 'Estudiar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trabajar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Jugar' })).toBeInTheDocument();
  });

  it('el chip recorta el prefijo "Para" del label del backend', () => {
    render(<QuickUsageCards selected={[]} onChange={jest.fn()} chipsEnMobile />);

    // Las cards clásicas siguen en el DOM (se ocultan con la clase `hidden`
    // md:grid, no se desmontan), así que "Para estudiar" también existe ahí.
    // Lo que prueba el recorte es que el CHIP -un <button>- lea "Estudiar".
    expect(screen.getByRole('button', { name: 'Estudiar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Para estudiar' })).not.toBeInTheDocument();
  });

  it('aria-pressed refleja si el chip está activo', () => {
    render(<QuickUsageCards selected={['estudios']} onChange={jest.fn()} chipsEnMobile />);

    expect(screen.getByRole('button', { name: 'Estudiar' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Crear' })).toHaveAttribute('aria-pressed', 'false');
  });
});
