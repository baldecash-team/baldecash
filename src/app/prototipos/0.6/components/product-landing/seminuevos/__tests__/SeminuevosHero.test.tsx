import { render, screen } from '@testing-library/react';
import { SeminuevosHero } from '../SeminuevosHero';

describe('SeminuevosHero', () => {
  // El copy se dibuja SIEMPRE: las dos piezas de Haru son solo fondo, sin texto
  // incrustado. Lo que cambia con el viewport es dónde se apoya — centrado
  // arriba en móvil, a la izquierda en escritorio, que es la mitad que la pieza
  // apaisada deja libre (BAL-3288).
  it('muestra el copy del hero en los dos viewports', () => {
    render(<SeminuevosHero catalogUrl="/seminuevos/catalogo" />);

    const copy = screen.getByTestId('hero-copy');
    expect(copy).toBeVisible();
    // Ya no se esconde en escritorio: esa clase era del estado anterior, cuando
    // la pieza de desktop traía el texto dentro de la imagen.
    expect(copy.className).not.toContain('md:hidden');
  });

  it('en escritorio el copy se alinea a la izquierda y no ocupa todo el ancho', () => {
    render(<SeminuevosHero catalogUrl="/seminuevos/catalogo" />);

    // jsdom no evalúa media queries: se comprueba que las reglas estén
    // declaradas, no el pixel donde se aplican. Sin ellas el texto quedaría
    // centrado sobre las laptops de la pieza.
    const copy = screen.getByTestId('hero-copy');
    expect(copy.className).toContain('md:text-left');
    expect(copy.className).toContain('md:max-w-[46%]');
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
    // Mismo criterio que el <img> de abajo: las dos piezas llevan hash de
    // contenido, así que se casa el patrón y no el nombre exacto.
    expect(source?.getAttribute('srcSet')).toMatch(/\/hero-desktop[-.][^/]*\.webp$/);

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
