import React from 'react';
import { render, screen } from '@testing-library/react';
import CatalogBanner from '../CatalogBanner';

// `matchMedia` no existe en jsdom. `estrecho` decide si la media query de móvil
// hace match, que es lo que elige cuál de los dos enlaces se usa.
function mockMatchMedia(estrecho: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: estrecho,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

describe('CatalogBanner', () => {
  const defaultProps = {
    desktopImageUrl: 'https://cdn.example.com/desktop.webp',
    mobileImageUrl: 'https://cdn.example.com/mobile.webp',
  };

  // Por defecto, pantalla ancha: es el caso que asumen los tests de siempre.
  beforeEach(() => mockMatchMedia(false));

  it('renders picture element with desktop and mobile sources', () => {
    const { container } = render(<CatalogBanner {...defaultProps} />);

    const picture = container.querySelector('picture');
    expect(picture).toBeInTheDocument();

    const sources = container.querySelectorAll('source');
    expect(sources).toHaveLength(2);

    const mobileSource = container.querySelector('source[media="(max-width: 768px)"]');
    expect(mobileSource).toHaveAttribute('srcset', defaultProps.mobileImageUrl);

    const desktopSource = container.querySelector('source[media="(min-width: 769px)"]');
    expect(desktopSource).toHaveAttribute('srcset', defaultProps.desktopImageUrl);
  });

  it('renders img with alt text', () => {
    render(<CatalogBanner {...defaultProps} />);
    const img = screen.getByAltText('Banner promocional');
    expect(img).toBeInTheDocument();
  });

  // Este test ya existía y fallaba en `main`: pedía `loading="lazy"` y el
  // componente no lo tenía. Se arregla el COMPONENTE, no el test: el banner
  // vive debajo del fold y no debe competir por ancho de banda con el catálogo.
  it('renders img with lazy loading', () => {
    render(<CatalogBanner {...defaultProps} />);
    const img = screen.getByAltText('Banner promocional');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('uses desktop image as img src fallback', () => {
    render(<CatalogBanner {...defaultProps} />);
    const img = screen.getByAltText('Banner promocional');
    expect(img).toHaveAttribute('src', defaultProps.desktopImageUrl);
  });

  // Sin imagen de móvil NO se emite el <source> de móvil: con un srcSet vacío
  // el navegador no resuelve nada, `onLoad` nunca dispara y el skeleton se
  // queda animando indefinidamente. Sin el source, el <img> sirve la de
  // desktop en todos los tamaños (BAL-3320).
  it('omite el source de móvil cuando no hay imagen de móvil', () => {
    const { container } = render(
      <CatalogBanner {...defaultProps} mobileImageUrl="" />
    );
    expect(container.querySelector('source[media="(max-width: 768px)"]')).not.toBeInTheDocument();
    expect(container.querySelector('source[media="(min-width: 769px)"]')).toBeInTheDocument();
    expect(screen.getByAltText('Banner promocional'))
      .toHaveAttribute('src', defaultProps.desktopImageUrl);
  });

  // Banner solo-móvil: la pieza que entregó diseño es vertical (700×1197) y
  // estirada a 1920px se vería deforme, así que en desktop no se muestra.
  describe('solo imagen de móvil', () => {
    const soloMovil = { desktopImageUrl: '', mobileImageUrl: 'https://cdn.example.com/mobile.webp' };

    it('omite el source de desktop', () => {
      const { container } = render(<CatalogBanner {...soloMovil} />);
      expect(container.querySelector('source[media="(min-width: 769px)"]')).not.toBeInTheDocument();
      expect(container.querySelector('source[media="(max-width: 768px)"]')).toBeInTheDocument();
    });

    it('usa la imagen de móvil como src base', () => {
      render(<CatalogBanner {...soloMovil} />);
      expect(screen.getByAltText('Banner promocional'))
        .toHaveAttribute('src', soloMovil.mobileImageUrl);
    });

    it('se oculta desde el breakpoint de escritorio', () => {
      render(<CatalogBanner {...soloMovil} />);
      expect(screen.getByTestId('catalog-banner').className).toContain('md:hidden');
    });

    it('tambien se oculta cuando el banner es un enlace', () => {
      render(<CatalogBanner {...soloMovil} linkUrl="/x" />);
      expect(screen.getByTestId('catalog-banner-link').className).toContain('md:hidden');
    });

    // El skeleton reserva alto con proporción apaisada; con una pieza vertical
    // eso haría saltar el catálogo al cargar la imagen.
    it('no reserva alto con la proporcion apaisada', () => {
      const { container } = render(<CatalogBanner {...soloMovil} />);
      expect(container.querySelector('.catalog-banner-skeleton')).not.toBeInTheDocument();
    });

    // Con las dos imágenes el comportamiento de siempre no cambia.
    it('con ambas imagenes NO se oculta en desktop', () => {
      render(<CatalogBanner {...defaultProps} />);
      expect(screen.getByTestId('catalog-banner').className).not.toContain('md:hidden');
    });
  });

  describe('sin enlace', () => {
    it('no se envuelve en <a>: un banner decorativo no debe anunciarse como clicable', () => {
      const { container } = render(<CatalogBanner {...defaultProps} />);
      expect(container.querySelector('a')).not.toBeInTheDocument();
      expect(screen.getByTestId('catalog-banner')).toBeInTheDocument();
    });

    it('tampoco con linkUrl vacío', () => {
      const { container } = render(<CatalogBanner {...defaultProps} linkUrl="" />);
      expect(container.querySelector('a')).not.toBeInTheDocument();
    });
  });

  describe('con enlace', () => {
    it('envuelve el banner en <a> con el href', () => {
      render(
        <CatalogBanner {...defaultProps} linkUrl="/prototipos/0.6/reacondicionados#que-es" />
      );
      const link = screen.getByTestId('catalog-banner-link');
      expect(link).toHaveAttribute('href', '/prototipos/0.6/reacondicionados#que-es');
      // Misma pestaña salvo que se pida lo contrario.
      expect(link).not.toHaveAttribute('target');
    });

    it('con target=_blank agrega rel=noopener noreferrer', () => {
      render(
        <CatalogBanner {...defaultProps} linkUrl="https://baldecash.com" linkTarget="_blank" />
      );
      const link = screen.getByTestId('catalog-banner-link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
      expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
    });

    it('usa alt_text como texto del enlace cuando viene', () => {
      // «Banner promocional» no dice a dónde lleva; con enlace, el alt ES el
      // texto del enlace para un lector de pantalla.
      render(
        <CatalogBanner
          {...defaultProps}
          linkUrl="/x"
          altText="Conoce qué es un equipo seminuevo"
        />
      );
      expect(screen.getByAltText('Conoce qué es un equipo seminuevo')).toBeInTheDocument();
    });

    it('cae al alt por defecto si alt_text viene vacío', () => {
      render(<CatalogBanner {...defaultProps} linkUrl="/x" altText="   " />);
      expect(screen.getByAltText('Banner promocional')).toBeInTheDocument();
    });
  });

  describe('seguridad', () => {
    // La URL viene de BD, un campo de texto libre del admin. Sin validar, un
    // `javascript:` guardado ahí se ejecuta al hacer clic (XSS almacenado).
    it('no crea el enlace si la URL tiene un esquema peligroso', () => {
      const { container } = render(
        <CatalogBanner {...defaultProps} linkUrl="javascript:alert(1)" />
      );
      expect(container.querySelector('a')).not.toBeInTheDocument();
      // Y la imagen se sigue viendo: el banner no desaparece por eso.
      expect(screen.getByAltText('Banner promocional')).toBeInTheDocument();
    });

    it('no crea el enlace con una URL protocol-relative', () => {
      const { container } = render(
        <CatalogBanner {...defaultProps} linkUrl="//evil.com" />
      );
      expect(container.querySelector('a')).not.toBeInTheDocument();
    });
  });

  // Un destino por pieza: el asesor puede mandar al visitante de escritorio a
  // un filtro y al de móvil a otro.
  describe('destino distinto por viewport', () => {
    const conLinks = {
      ...defaultProps,
      landing: 'seminuevos',
      desktopLinkUrl: 'catalogo?device=laptop',
      mobileLinkUrl: 'catalogo?device=celular',
    };

    it('en pantalla ancha usa el enlace de desktop', () => {
      mockMatchMedia(false);
      render(<CatalogBanner {...conLinks} />);
      expect(screen.getByTestId('catalog-banner-link'))
        .toHaveAttribute('href', '/prototipos/0.6/seminuevos/catalogo?device=laptop');
    });

    it('en pantalla angosta usa el enlace de movil', () => {
      mockMatchMedia(true);
      render(<CatalogBanner {...conLinks} />);
      expect(screen.getByTestId('catalog-banner-link'))
        .toHaveAttribute('href', '/prototipos/0.6/seminuevos/catalogo?device=celular');
    });

    // Un banner clicable en desktop y muerto en móvil se leería como un bug.
    it('sin enlace de movil propio, en movil cae al de desktop', () => {
      mockMatchMedia(true);
      render(
        <CatalogBanner
          {...defaultProps}
          landing="seminuevos"
          desktopLinkUrl="catalogo"
          mobileLinkUrl=""
        />
      );
      expect(screen.getByTestId('catalog-banner-link'))
        .toHaveAttribute('href', '/prototipos/0.6/seminuevos/catalogo');
    });

    it('sin ningun enlace sigue sin envolverse en <a>', () => {
      const { container } = render(
        <CatalogBanner {...defaultProps} landing="seminuevos" />
      );
      expect(container.querySelector('a')).not.toBeInTheDocument();
      expect(screen.getByTestId('catalog-banner')).toBeInTheDocument();
    });

    // El orden importa: transformConfigHref primero, safeLinkUrl despues. Si se
    // invierte, `catalogo` no pasa el filtro y el enlace desaparece en silencio.
    it('resuelve el href relativo ANTES de sanitizarlo', () => {
      render(
        <CatalogBanner {...defaultProps} landing="seminuevos" desktopLinkUrl="catalogo" />
      );
      expect(screen.getByTestId('catalog-banner-link'))
        .toHaveAttribute('href', '/prototipos/0.6/seminuevos/catalogo');
    });

    // transformConfigHref no conoce `javascript:`, asi que le antepondria el
    // home de la landing y el resultado --al empezar con '/'-- pasaria
    // safeLinkUrl sin problema. Por eso el esquema se mira tambien en crudo.
    it('descarta un javascript: guardado en el campo nuevo', () => {
      const { container } = render(
        <CatalogBanner
          {...defaultProps}
          landing="seminuevos"
          desktopLinkUrl="javascript:alert(1)"
        />
      );
      expect(container.querySelector('a')).not.toBeInTheDocument();
      expect(screen.getByAltText('Banner promocional')).toBeInTheDocument();
    });

    it('descarta data: y vbscript:', () => {
      for (const malo of ['data:text/html,<script>x</script>', 'vbscript:msgbox(1)']) {
        const { container, unmount } = render(
          <CatalogBanner {...defaultProps} landing="seminuevos" desktopLinkUrl={malo} />
        );
        expect(container.querySelector('a')).not.toBeInTheDocument();
        unmount();
      }
    });

    // `tel:` y `mailto:` tampoco generan enlace, y es a proposito: safeLinkUrl
    // solo admite internas y http(s) (ver su docstring). Un banner del catalogo
    // que dispare una llamada no es un caso de uso pedido; si algun dia lo es,
    // el cambio va en safeLinkUrl, no aca. Se deja el test para que ese dia se
    // vea como una decision y no como una regresion.
    it('tel: y mailto: tampoco generan enlace', () => {
      for (const esquema of ['tel:+51999888777', 'mailto:hola@baldecash.com']) {
        const { container, unmount } = render(
          <CatalogBanner {...defaultProps} landing="seminuevos" desktopLinkUrl={esquema} />
        );
        expect(container.querySelector('a')).not.toBeInTheDocument();
        // La imagen se sigue viendo: el banner no desaparece por eso.
        expect(screen.getByAltText('Banner promocional')).toBeInTheDocument();
        unmount();
      }
    });

    it('deja intacto un enlace externo', () => {
      render(
        <CatalogBanner
          {...defaultProps}
          landing="seminuevos"
          desktopLinkUrl="https://baldecash.com/promo"
        />
      );
      expect(screen.getByTestId('catalog-banner-link'))
        .toHaveAttribute('href', 'https://baldecash.com/promo');
    });

    // `linkUrl` es el campo viejo; los banners guardados antes lo usan.
    it('sigue respetando el linkUrl anterior cuando no hay campos nuevos', () => {
      render(
        <CatalogBanner {...defaultProps} landing="seminuevos" linkUrl="/prototipos/0.6/x#y" />
      );
      expect(screen.getByTestId('catalog-banner-link'))
        .toHaveAttribute('href', '/prototipos/0.6/x#y');
    });
  });
});
