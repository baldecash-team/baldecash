import React from 'react';
import { render, screen } from '@testing-library/react';
import { HeroBackgroundImage } from '../HeroBackgroundImage';

const base = { src: 'https://s3/desktop.webp', alt: 'Portada', posX: 79, posY: 45, zoom: 1 };

describe('HeroBackgroundImage', () => {
  it('con imagen de celular: <picture> con la de celular hasta 639px', () => {
    const { container } = render(<HeroBackgroundImage {...base} mobileSrc="https://s3/mobile.webp" />);
    const sources = container.querySelectorAll('picture source');
    expect(sources).toHaveLength(2);
    expect(sources[0]).toHaveAttribute('media', '(max-width: 639px)');
    expect(sources[0]).toHaveAttribute('srcset', 'https://s3/mobile.webp');
    expect(sources[1]).toHaveAttribute('media', '(min-width: 640px)');
    expect(sources[1]).toHaveAttribute('srcset', 'https://s3/desktop.webp');
  });

  it('aplica posición y zoom al <img>', () => {
    render(<HeroBackgroundImage {...base} mobileSrc="https://s3/mobile.webp" zoom={1.2} />);
    const img = screen.getByTestId('hero-bg-img');
    expect(img.style.objectPosition).toBe('79% 45%');
    expect(img.style.transform).toBe('scale(1.2)');
  });

  it('zoom 1: sin transform', () => {
    render(<HeroBackgroundImage {...base} mobileSrc="https://s3/mobile.webp" />);
    expect(screen.getByTestId('hero-bg-img').style.transform).toBe('');
  });

  it('sin imagen de celular: no hay <picture>', () => {
    const { container } = render(<HeroBackgroundImage {...base} />);
    expect(container.querySelector('picture')).toBeNull();
    expect(container.querySelector('img')).not.toBeNull();
  });
});
