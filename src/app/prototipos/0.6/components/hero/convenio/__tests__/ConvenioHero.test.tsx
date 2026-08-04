import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConvenioHero } from '../ConvenioHero';
import type { HeroContent, AgreementData } from '../../../../types/hero';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false, media: query, onchange: null,
    addListener: jest.fn(), removeListener: jest.fn(),
    addEventListener: jest.fn(), removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const push = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: (...args: unknown[]) => push(...args) }),
}));

const baseHero = (over: Partial<HeroContent> = {}): HeroContent => ({
  headline: 'Financia tu equipo ideal',
  subheadline: 'Sin historial crediticio',
  badgeText: 'Convenio UPN',
  primaryCta: { text: 'Ver equipos disponibles', href: 'catalogo', variant: 'primary' },
  trustSignals: [],
  minQuota: 0,
  quotaSuffix: '/mes',
  backgroundImage: 'https://s3/hero.webp',
  ...over,
}) as HeroContent;

const agreement = { id: 1 } as AgreementData;

const renderHero = (over: Partial<HeroContent> = {}) =>
  render(<ConvenioHero heroContent={baseHero(over)} agreementData={agreement} landing="upn" />);

beforeEach(() => push.mockClear());

describe('ConvenioHero — switch de contenido', () => {
  it('sin el campo: overlay, textos y sin imagen clickeable (no-regresion)', () => {
    renderHero();
    expect(screen.getByTestId('hero-overlay')).toBeInTheDocument();
    expect(screen.getByText('Financia tu equipo ideal')).toBeInTheDocument();
    expect(screen.getByText('Ver equipos disponibles')).toBeInTheDocument();
    expect(screen.queryByTestId('hero-image-cta')).not.toBeInTheDocument();
  });

  it('showHeroContent=true se comporta igual que sin el campo', () => {
    renderHero({ showHeroContent: true });
    expect(screen.getByTestId('hero-overlay')).toBeInTheDocument();
    expect(screen.getByText('Financia tu equipo ideal')).toBeInTheDocument();
  });

  it('showHeroContent=false: sin overlay, sin textos, imagen clickeable', () => {
    renderHero({ showHeroContent: false });
    expect(screen.queryByTestId('hero-overlay')).not.toBeInTheDocument();
    expect(screen.queryByText('Financia tu equipo ideal')).not.toBeInTheDocument();
    expect(screen.queryByText('Sin historial crediticio')).not.toBeInTheDocument();
    expect(screen.queryByText('Convenio UPN')).not.toBeInTheDocument();
    expect(screen.queryByText('Ver equipos disponibles')).not.toBeInTheDocument();
    expect(screen.getByTestId('hero-image-cta')).toBeInTheDocument();
  });

  it('con el switch apagado, click en la imagen navega al destino del CTA', () => {
    renderHero({ showHeroContent: false });
    fireEvent.click(screen.getByTestId('hero-image-cta'));
    expect(push).toHaveBeenCalledWith('/prototipos/0.6/upn/catalogo');
  });

  it('con el switch apagado responde a Enter', () => {
    renderHero({ showHeroContent: false });
    fireEvent.keyDown(screen.getByTestId('hero-image-cta'), { key: 'Enter' });
    expect(push).toHaveBeenCalledTimes(1);
  });

  it('sin imagen de fondo no hay wrapper clickeable', () => {
    renderHero({ showHeroContent: false, backgroundImage: undefined });
    expect(screen.queryByTestId('hero-image-cta')).not.toBeInTheDocument();
  });

  it('los flags sueltos siguen funcionando de forma independiente', () => {
    renderHero({ hideOverlay: true });
    expect(screen.queryByTestId('hero-overlay')).not.toBeInTheDocument();
    expect(screen.getByText('Financia tu equipo ideal')).toBeInTheDocument();
  });
});
