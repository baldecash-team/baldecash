import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeadHeroBanner } from '../LeadHeroBanner';
import type { HeroContent } from '../../../types/hero';

// Mock window.matchMedia (jsdom no lo implementa)
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

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve({ brands: [] }) }),
  ) as unknown as typeof fetch;
});

const baseHero = (over: Partial<HeroContent> = {}): HeroContent => ({
  headline: 'Financia tu laptop',
  subheadline: 'Sub',
  primaryCta: { text: 'Solicitar', href: '#', variant: 'primary' },
  trustSignals: [],
  minQuota: 0,
  quotaSuffix: '/mes',
  ...over,
}) as HeroContent;

const imgs = [{ url: 'https://s3/desktop.webp' }];

describe('LeadHeroBanner — flags de hero', () => {
  it('por defecto muestra overlay y contenido', () => {
    render(<LeadHeroBanner heroContent={baseHero()} bannerImages={imgs} landing="x" />);
    expect(screen.getByTestId('hero-overlay')).toBeInTheDocument();
    expect(screen.getByText('Financia tu laptop')).toBeInTheDocument();
  });

  it('hideOverlay oculta el overlay', () => {
    render(<LeadHeroBanner heroContent={baseHero({ hideOverlay: true })} bannerImages={imgs} landing="x" />);
    expect(screen.queryByTestId('hero-overlay')).not.toBeInTheDocument();
  });

  it('hideContent oculta el headline', () => {
    render(<LeadHeroBanner heroContent={baseHero({ hideContent: true })} bannerImages={imgs} landing="x" />);
    expect(screen.queryByText('Financia tu laptop')).not.toBeInTheDocument();
  });

  it('imageIsCta hace la imagen clickeable y dispara onCtaClick', () => {
    const onCtaClick = jest.fn();
    render(
      <LeadHeroBanner
        heroContent={baseHero({ imageIsCta: true, hideContent: true })}
        bannerImages={imgs}
        landing="x"
        onCtaClick={onCtaClick}
      />,
    );
    fireEvent.click(screen.getByTestId('hero-image-cta'));
    expect(onCtaClick).toHaveBeenCalledTimes(1);
  });

  it('muestra el marquee de marcas cuando hay brands y no hay hideContent', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({ brands: [{ id: 1, name: 'HP', logo_url: 'https://s3/hp.png' }] }),
      }),
    ) as unknown as typeof fetch;

    render(<LeadHeroBanner heroContent={baseHero()} bannerImages={imgs} landing="x" />);

    const marquees = await screen.findAllByText('Marcas disponibles');
    expect(marquees.length).toBeGreaterThanOrEqual(1);
  });

  it('hideContent oculta el marquee de marcas aunque existan brands', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({ brands: [{ id: 1, name: 'HP', logo_url: 'https://s3/hp.png' }] }),
      }),
    ) as unknown as typeof fetch;

    render(<LeadHeroBanner heroContent={baseHero({ hideContent: true })} bannerImages={imgs} landing="x" />);

    // Espera a que el fetch de brands resuelva antes de asertar la ausencia.
    await screen.findByTestId('hero-overlay');
    expect(screen.queryByText('Marcas disponibles')).not.toBeInTheDocument();
  });

  it('imageIsCta responde a teclado (Enter y Espacio) disparando onCtaClick', () => {
    const onCtaClick = jest.fn();
    render(
      <LeadHeroBanner
        heroContent={baseHero({ imageIsCta: true, hideContent: true })}
        bannerImages={imgs}
        landing="x"
        onCtaClick={onCtaClick}
      />,
    );
    const cta = screen.getByTestId('hero-image-cta');

    fireEvent.keyDown(cta, { key: 'Enter' });
    expect(onCtaClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(cta, { key: ' ' });
    expect(onCtaClick).toHaveBeenCalledTimes(2);
  });
});
