import { render, screen } from '@testing-library/react';
import { SeminuevosHero } from '../SeminuevosHero';

describe('SeminuevosHero', () => {
  // El copy del hero está OCULTO por pedido de producto (MOSTRAR_COPY_HERO):
  // el banner de Haru ya trae su texto y se superponían. El bloque sigue en el
  // DOM con `hidden`, así que se comprueba que no sea accesible, no que no
  // exista -- si mañana se reactiva, estos tests avisan.
  it('mantiene oculto el copy del hero', () => {
    render(<SeminuevosHero catalogUrl="/seminuevos/catalogo" />);
    expect(screen.queryByText('Exclusivo')).not.toBeVisible();
    expect(
      screen.queryByRole('heading', { name: /Equipos seminuevos en cuotas sin intereses/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Ver catálogo/i })).not.toBeInTheDocument();
  });

  it('el CTA conserva el href del catálogo para cuando se reactive', () => {
    const { container } = render(<SeminuevosHero catalogUrl="/seminuevos/catalogo" />);
    expect(container.querySelector('a[href="/seminuevos/catalogo"]')).toBeInTheDocument();
  });

  // El banner de Haru ya está en S3, así que las laptops SVG son el fallback y
  // no el estado normal. Lo que se prueba ahora es el banner responsive: son
  // dos archivos con proporciones distintas y el navegador tiene que bajar solo
  // el que toca, no los dos (BAL-3317).
  it('sirve el banner de desktop y el de móvil por separado', () => {
    const { container } = render(<SeminuevosHero catalogUrl="/x" />);

    const source = container.querySelector('picture source');
    expect(source).toHaveAttribute('media', '(min-width: 768px)');
    expect(source?.getAttribute('srcSet')).toContain('hero-desktop.webp');

    // El <img> es el caso por defecto: móvil.
    expect(container.querySelector('picture img'))
      .toHaveAttribute('src', expect.stringContaining('hero-mobile.webp'));

    // Con banner, las laptops decorativas no se pintan.
    expect(container.querySelectorAll('[data-testid="hero-laptop"]')).toHaveLength(0);
  });
});
