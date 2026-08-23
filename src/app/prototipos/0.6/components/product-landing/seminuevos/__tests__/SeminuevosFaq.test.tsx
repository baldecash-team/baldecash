import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SeminuevosFaq } from '../SeminuevosFaq';

const data = {
  items: [
    { id: '1', question: '¿Puedo elegir el equipo?', answer: 'Sí, tras la aprobación.', category: 'General' },
    { id: '2', question: '¿Tienen garantía?', answer: 'Depende del grado.', category: 'Garantía' },
  ],
};

describe('SeminuevosFaq', () => {
  it('no renderiza nada si no hay preguntas', () => {
    const { container } = render(<SeminuevosFaq data={{ items: [] }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('no renderiza nada si data es null', () => {
    const { container } = render(<SeminuevosFaq data={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('lista las preguntas que vienen de BD', () => {
    render(<SeminuevosFaq data={data} />);
    expect(screen.getByRole('heading', { name: 'Preguntas frecuentes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /¿Puedo elegir el equipo\?/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /¿Tienen garantía\?/ })).toBeInTheDocument();
  });

  it('arranca con todas cerradas y abre al tocar', async () => {
    render(<SeminuevosFaq data={data} />);
    const primera = screen.getByRole('button', { name: /¿Puedo elegir el equipo\?/ });
    expect(primera).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(primera);
    expect(primera).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Sí, tras la aprobación.')).toBeVisible();
  });

  it('permite varias abiertas a la vez (no es acordeón exclusivo)', async () => {
    render(<SeminuevosFaq data={data} />);
    const a = screen.getByRole('button', { name: /¿Puedo elegir el equipo\?/ });
    const b = screen.getByRole('button', { name: /¿Tienen garantía\?/ });
    await userEvent.click(a);
    await userEvent.click(b);
    expect(a).toHaveAttribute('aria-expanded', 'true');
    expect(b).toHaveAttribute('aria-expanded', 'true');
  });
});
