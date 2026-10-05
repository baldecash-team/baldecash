import React from 'react';
import { render, screen } from '@testing-library/react';
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

  it('la imagen nunca es clickeable (BAL-2782: sin flags sueltos, sin UI para configurarlo)', () => {
    render(<LeadHeroBanner heroContent={baseHero()} bannerImages={imgs} landing="x" />);
    expect(screen.queryByTestId('hero-image-cta')).not.toBeInTheDocument();
  });

  it('muestra el marquee de marcas cuando hay brands', async () => {
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
});
