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
});
