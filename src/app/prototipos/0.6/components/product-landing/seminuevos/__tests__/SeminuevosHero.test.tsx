import { render, screen } from '@testing-library/react';
import { SeminuevosHero } from '../SeminuevosHero';

describe('SeminuevosHero', () => {
  it('muestra el copy del prototipo', () => {
    render(<SeminuevosHero catalogUrl="/seminuevos/catalogo" />);
    expect(screen.getByText('Exclusivo')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Equipos seminuevos en cuotas sin intereses/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Elige el modelo y fináncialo en BaldeCash.')).toBeInTheDocument();
  });

  it('el CTA apunta al catálogo de la landing', () => {
    render(<SeminuevosHero catalogUrl="/seminuevos/catalogo" />);
    expect(screen.getByRole('link', { name: /Ver catálogo/i }))
      .toHaveAttribute('href', '/seminuevos/catalogo');
  });

  it('pinta las laptops SVG cuando no hay banner', () => {
    const { container } = render(<SeminuevosHero catalogUrl="/x" />);
    expect(container.querySelectorAll('[data-testid="hero-laptop"]')).toHaveLength(4);
  });
});
