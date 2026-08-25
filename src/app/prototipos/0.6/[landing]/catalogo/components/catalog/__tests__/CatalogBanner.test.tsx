import React from 'react';
import { render, screen } from '@testing-library/react';
import CatalogBanner from '../CatalogBanner';

describe('CatalogBanner', () => {
  const defaultProps = {
    desktopImageUrl: 'https://cdn.example.com/desktop.webp',
    mobileImageUrl: 'https://cdn.example.com/mobile.webp',
  };

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
});
