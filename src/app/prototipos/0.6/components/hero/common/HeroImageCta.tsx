'use client';

import React from 'react';

interface HeroImageCtaProps {
  /** Cuando es false no se altera nada: los children se renderizan tal cual. */
  enabled: boolean;
  /** Destino cuando no se pasa onActivate. */
  href?: string;
  /** Texto para lectores de pantalla. */
  label?: string;
  /** Handler propio del hero — permite trackear antes de navegar. */
  onActivate?: () => void;
  className?: string;
  children: React.ReactNode;
}

export const HeroImageCta: React.FC<HeroImageCtaProps> = ({
  enabled,
  href,
  label,
  onActivate,
  className = '',
  children,
}) => {
  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  const activate = () => {
    if (onActivate) {
      onActivate();
      return;
    }
    if (href && href !== '#') {
      window.location.href = href;
    }
  };

  return (
    <div
      data-testid="hero-image-cta"
      role="button"
      tabIndex={0}
      aria-label={label || 'Ver más'}
      className={`${className} cursor-pointer`.trim()}
      onClick={activate}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      }}
    >
      {children}
    </div>
  );
};

export default HeroImageCta;
