import React from 'react';

interface HeroOverlayProps {
  /** Si es true no se renderiza nada. */
  hidden?: boolean;
  /**
   * Intensidad del gradiente. Los heroes venian con valores distintos y se
   * conservan para no cambiar el aspecto de ninguno:
   *   default -> ConvenioHero (via-black/70)
   *   soft    -> HeroBanner y LeadHeroBanner (via-black/65)
   */
  variant?: 'default' | 'soft';
}

const GRADIENTS: Record<'default' | 'soft', string> = {
  default: 'bg-gradient-to-r from-black/85 via-black/70 to-black/20 sm:to-transparent',
  soft: 'bg-gradient-to-r from-black/85 via-black/65 to-black/20 sm:to-transparent',
};

export const HeroOverlay: React.FC<HeroOverlayProps> = ({ hidden, variant = 'default' }) => {
  if (hidden) return null;
  return <div data-testid="hero-overlay" className={`absolute inset-0 ${GRADIENTS[variant]}`} />;
};

export default HeroOverlay;
