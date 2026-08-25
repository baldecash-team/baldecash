import { render, screen } from '@testing-library/react';
import { SeminuevosHero } from '../SeminuevosHero';

describe('SeminuevosHero', () => {
  // El copy del hero se dibuja según la pieza que haya detrás: la de móvil es
  // solo fondo (sin una palabra) y sin este bloque la landing abriría sin
  // título, sin promesa y sin botón; la de desktop ya trae el texto compuesto y
  // repetirlo lo duplicaría. Por eso el bloque existe siempre en el DOM y se
  // esconde con `md:hidden` a partir de 768px (BAL-3288).
  it('muestra el copy del hero, oculto solo desde el breakpoint de escritorio', () => {
    render(<SeminuevosHero catalogUrl="/seminuevos/catalogo" />);

    const copy = screen.getByTestId('hero-copy');
    expect(copy).toBeVisible();
    // jsdom no evalúa media queries: lo que se comprueba es que el corte esté
    // declarado, no el pixel exacto donde ocurre.
    expect(copy.className).toContain('md:hidden');
  });

  it('el copy trae el h1, el subtítulo y el CTA al catálogo', () => {
    render(<SeminuevosHero catalogUrl="/seminuevos/catalogo" />);

    // El <h1> de la landing vive acá: si el bloque desaparece, la página se
    // queda sin ninguno.
    expect(
      screen.getByRole('heading', { level: 1, name: /Equipos seminuevos en cuotas sin intereses/i })
    ).toBeVisible();
    expect(screen.getByText('Exclusivo')).toBeVisible();
    expect(screen.getByRole('link', { name: /Ver catálogo/i }))
      .toHaveAttribute('href', '/seminuevos/catalogo');
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

    // El <img> es el caso por defecto: móvil. Se comprueba el prefijo y no el
    // nombre completo porque las piezas llevan hash de contenido
    // (`hero-mobile-<hash>.webp`): al reemplazar la imagen cambia la URL para
    // saltar el caché, y clavar el hash aquí volvería rojo el test en cada
    // cambio de arte sin que nada esté roto.
    expect(container.querySelector('picture img')?.getAttribute('src'))
      .toMatch(/\/hero-mobile[-.][^/]*\.webp$/);

    // Con banner, las laptops decorativas no se pintan.
    expect(container.querySelectorAll('[data-testid="hero-laptop"]')).toHaveLength(0);
  });
});
