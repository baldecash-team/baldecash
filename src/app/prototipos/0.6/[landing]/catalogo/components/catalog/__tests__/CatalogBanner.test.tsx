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

  it('does not render any link wrapper', () => {
    const { container } = render(<CatalogBanner {...defaultProps} />);
    const link = container.querySelector('a');
    expect(link).not.toBeInTheDocument();
  });
});
