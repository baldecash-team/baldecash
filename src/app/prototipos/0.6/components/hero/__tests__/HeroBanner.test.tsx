import React from 'react';
import { render, screen } from '@testing-library/react';
import { HeroBanner } from '../HeroBanner';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className, style, onError, ...rest }: React.ImgHTMLAttributes<HTMLImageElement> & { src: string; priority?: boolean; fill?: boolean; sizes?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} style={style} onError={onError} data-testid="next-image" {...rest} />
  ),
}));

// Mock EventTrackerContext (optional dependency)
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => null,
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const baseProps = {
  headline: 'Tu laptop ideal',
  subheadline: 'Cuotas desde S/99',
  minQuota: 99,
  imageSrc: 'https://cdn.example.com/desktop.webp',
  primaryCta: { text: 'Ver productos', href: '#catalogo', variant: 'primary' as const },
  landing: 'test',
};

describe('HeroBanner — imagen de fondo', () => {
  describe('sin imagen mobile independiente', () => {
    it('renderiza next/image cuando solo hay imageSrc', () => {
      const { container } = render(<HeroBanner {...baseProps} />);
      expect(container.querySelector('[data-testid="next-image"]')).toBeInTheDocument();
      expect(container.querySelector('picture')).not.toBeInTheDocument();
    });

    it('no renderiza nada de imagen si no hay imageSrc', () => {
      const { container } = render(<HeroBanner {...baseProps} imageSrc={undefined} />);
      expect(container.querySelector('[data-testid="next-image"]')).not.toBeInTheDocument();
      expect(container.querySelector('picture')).not.toBeInTheDocument();
    });
  });

  describe('con imagen mobile independiente', () => {
    const propsWithMobile = {
      ...baseProps,
      mobileImageSrc: 'https://cdn.example.com/mobile.webp',
    };

    it('renderiza elemento <picture> cuando hay mobileImageSrc', () => {
      const { container } = render(<HeroBanner {...propsWithMobile} />);
      expect(container.querySelector('picture')).toBeInTheDocument();
    });

    it('NO renderiza next/image cuando hay mobileImageSrc', () => {
      const { container } = render(<HeroBanner {...propsWithMobile} />);
      expect(container.querySelector('[data-testid="next-image"]')).not.toBeInTheDocument();
    });

    it('source mobile usa max-width: 639px con la URL mobile', () => {
      const { container } = render(<HeroBanner {...propsWithMobile} />);
      const mobileSource = container.querySelector('source[media="(max-width: 639px)"]');
      expect(mobileSource).toBeInTheDocument();
      expect(mobileSource).toHaveAttribute('srcset', 'https://cdn.example.com/mobile.webp');
    });

    it('source desktop usa min-width: 640px con la URL desktop', () => {
      const { container } = render(<HeroBanner {...propsWithMobile} />);
      const desktopSource = container.querySelector('source[media="(min-width: 640px)"]');
      expect(desktopSource).toBeInTheDocument();
      expect(desktopSource).toHaveAttribute('srcset', 'https://cdn.example.com/desktop.webp');
    });

    it('img fallback usa la URL desktop como src', () => {
      render(<HeroBanner {...propsWithMobile} />);
      const img = screen.getByAltText('Estudiantes trabajando');
      expect(img).toHaveAttribute('src', 'https://cdn.example.com/desktop.webp');
    });

    it('aplica objectPosition correctamente al img de picture', () => {
      render(
        <HeroBanner
          {...propsWithMobile}
          imagePositionX={30}
          imagePositionY={70}
        />
      );
      const img = screen.getByAltText('Estudiantes trabajando');
      expect(img).toHaveStyle({ objectPosition: '30% 70%' });
    });

    it('aplica transform scale cuando zoom es distinto de 1', () => {
      render(
        <HeroBanner
          {...propsWithMobile}
          imageZoom={1.5}
        />
      );
      const img = screen.getByAltText('Estudiantes trabajando');
      expect(img).toHaveStyle({ transform: 'scale(1.5)' });
    });

    it('no aplica transform cuando zoom es 1', () => {
      render(
        <HeroBanner
          {...propsWithMobile}
          imageZoom={1.0}
        />
      );
      const img = screen.getByAltText('Estudiantes trabajando');
      // transform should be undefined/not set when zoom === 1
      expect(img.style.transform).toBeFalsy();
    });
  });

  describe('retrocompatibilidad', () => {
    it('si mobileImageSrc es undefined usa next/image (comportamiento anterior)', () => {
      const { container } = render(<HeroBanner {...baseProps} mobileImageSrc={undefined} />);
      expect(container.querySelector('[data-testid="next-image"]')).toBeInTheDocument();
      expect(container.querySelector('picture')).not.toBeInTheDocument();
    });
  });
});
