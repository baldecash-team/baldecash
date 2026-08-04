import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeroImageCta } from '../HeroImageCta';

describe('HeroImageCta', () => {
  it('enabled=false renderiza los children sin rol de boton', () => {
    render(<HeroImageCta enabled={false}><span>contenido</span></HeroImageCta>);
    expect(screen.getByText('contenido')).toBeInTheDocument();
    expect(screen.queryByTestId('hero-image-cta')).not.toBeInTheDocument();
  });

  it('enabled=true expone rol de boton y dispara onActivate al click', () => {
    const onActivate = jest.fn();
    render(
      <HeroImageCta enabled onActivate={onActivate} label="Ver equipos">
        <span>contenido</span>
      </HeroImageCta>,
    );
    const el = screen.getByTestId('hero-image-cta');
    expect(el).toHaveAttribute('role', 'button');
    expect(el).toHaveAttribute('aria-label', 'Ver equipos');
    fireEvent.click(el);
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('responde a Enter y Espacio', () => {
    const onActivate = jest.fn();
    render(<HeroImageCta enabled onActivate={onActivate}><span>c</span></HeroImageCta>);
    const el = screen.getByTestId('hero-image-cta');
    fireEvent.keyDown(el, { key: 'Enter' });
    fireEvent.keyDown(el, { key: ' ' });
    expect(onActivate).toHaveBeenCalledTimes(2);
  });

  it('ignora otras teclas', () => {
    const onActivate = jest.fn();
    render(<HeroImageCta enabled onActivate={onActivate}><span>c</span></HeroImageCta>);
    fireEvent.keyDown(screen.getByTestId('hero-image-cta'), { key: 'a' });
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('conserva el className recibido y agrega cursor-pointer', () => {
    render(<HeroImageCta enabled className="absolute inset-0"><span>c</span></HeroImageCta>);
    const cls = screen.getByTestId('hero-image-cta').className;
    expect(cls).toContain('absolute inset-0');
    expect(cls).toContain('cursor-pointer');
  });

  it('sin onActivate ni href no rompe al activarse', () => {
    render(<HeroImageCta enabled><span>c</span></HeroImageCta>);
    expect(() => fireEvent.click(screen.getByTestId('hero-image-cta'))).not.toThrow();
  });
});
