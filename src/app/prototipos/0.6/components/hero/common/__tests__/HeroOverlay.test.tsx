import React from 'react';
import { render, screen } from '@testing-library/react';
import { HeroOverlay } from '../HeroOverlay';

describe('HeroOverlay', () => {
  it('por defecto renderiza el overlay', () => {
    render(<HeroOverlay />);
    expect(screen.getByTestId('hero-overlay')).toBeInTheDocument();
  });

  it('hidden=true no renderiza nada', () => {
    render(<HeroOverlay hidden />);
    expect(screen.queryByTestId('hero-overlay')).not.toBeInTheDocument();
  });

  it('hidden=false renderiza el overlay', () => {
    render(<HeroOverlay hidden={false} />);
    expect(screen.getByTestId('hero-overlay')).toBeInTheDocument();
  });

  it('variant default usa el gradiente de convenio (via-black/70)', () => {
    render(<HeroOverlay />);
    expect(screen.getByTestId('hero-overlay').className).toContain('via-black/70');
  });

  it('variant soft usa el gradiente de lead/institucional (via-black/65)', () => {
    render(<HeroOverlay variant="soft" />);
    expect(screen.getByTestId('hero-overlay').className).toContain('via-black/65');
  });
});
