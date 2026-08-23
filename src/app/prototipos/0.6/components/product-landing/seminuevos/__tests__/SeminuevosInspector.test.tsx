import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SeminuevosInspector } from '../SeminuevosInspector';

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

describe('SeminuevosInspector', () => {
  it('arranca en la primera pieza y grado A', () => {
    render(<SeminuevosInspector />);
    expect(screen.getByTestId('insp-badge')).toHaveTextContent('Carcasa · Grado A');
    expect(screen.getByTestId('insp-counter')).toHaveTextContent('1 / 8');
  });

  it('cambia de grado al tocar una pill', async () => {
    render(<SeminuevosInspector />);
    await userEvent.click(screen.getByRole('button', { name: 'Grado B' }));
    expect(screen.getByTestId('insp-badge')).toHaveTextContent('Carcasa · Grado B');
  });

  it('cambia de pieza al tocar una tab', async () => {
    render(<SeminuevosInspector />);
    await userEvent.click(screen.getByRole('button', { name: 'Teclado' }));
    expect(screen.getByTestId('insp-badge')).toHaveTextContent('Teclado · Grado A');
    expect(screen.getByTestId('insp-counter')).toHaveTextContent('4 / 8');
  });

  it('avanza y retrocede de forma circular', async () => {
    render(<SeminuevosInspector />);
    // Desde la primera, "Anterior" lleva a la última.
    await userEvent.click(screen.getByRole('button', { name: /Anterior/i }));
    expect(screen.getByTestId('insp-counter')).toHaveTextContent('8 / 8');
    expect(screen.getByTestId('insp-badge')).toHaveTextContent('Batería · Grado A');
    // Desde la última, "Siguiente" vuelve a la primera.
    await userEvent.click(screen.getByRole('button', { name: /Siguiente/i }));
    expect(screen.getByTestId('insp-counter')).toHaveTextContent('1 / 8');
  });

  it('apunta el asset a la combinación pieza-grado', async () => {
    render(<SeminuevosInspector />);
    await userEvent.click(screen.getByRole('button', { name: 'Grado C' }));
    await userEvent.click(screen.getByRole('button', { name: 'Pantalla' }));
    expect(screen.getByRole('img')).toHaveAttribute(
      'src', expect.stringContaining('pantalla-c.webp')
    );
  });

  it('marca la pieza y el grado activos con aria-pressed', async () => {
    render(<SeminuevosInspector />);
    expect(screen.getByRole('button', { name: 'Grado A' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Grado B' }));
    expect(screen.getByRole('button', { name: 'Grado A' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Grado B' })).toHaveAttribute('aria-pressed', 'true');
  });
});
