'use client';

/**
 * CopiaHomePromoBanner — barra de promoción (ej. "EQUIPO SEMI NUEVO") para las
 * cards del catálogo copia-home (mobile y desktop). Renderiza el template de
 * `product.promotion` con los colores/ícono que envía el backend, igual que la
 * PromotionalProductCard estándar, para que las promociones sean visibles en
 * las variantes seminuevo. Devuelve null si el producto no tiene promoción.
 */

import React from 'react';
import {
  Recycle, Flame, Zap, Star, Gift, Trophy, Heart, Sparkles, Crown, Rocket,
  PartyPopper, Bell, BadgePercent, ShoppingCart, Timer, Megaphone, ThumbsUp,
  Award, CircleDollarSign, Ticket, Tag, TrendingDown, Shield, Eye, Siren,
  type LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  recycle: Recycle, fire: Flame, lightning: Zap, star: Star, gift: Gift, trophy: Trophy,
  heart: Heart, sparkles: Sparkles, crown: Crown, rocket: Rocket, party: PartyPopper,
  bell: Bell, percent: BadgePercent, cart: ShoppingCart, timer: Timer, megaphone: Megaphone,
  thumbsup: ThumbsUp, award: Award, dollar: CircleDollarSign, ticket: Ticket, tag: Tag,
  trending: TrendingDown, shield: Shield, eye: Eye, siren: Siren,
};

interface PromoTemplateLike {
  bannerText?: string;
  bannerBgColor?: string | null;
  bannerTextColor?: string | null;
  bannerIcon?: string | null;
}

/** Alto fijo del banner (para reservar el mismo espacio en cards sin promo). */
export const PROMO_BANNER_HEIGHT = 42;

interface Props {
  promotion?: { template?: PromoTemplateLike | null } | null;
  /** Redondea las esquinas superiores (para que calce con el radio de la card). */
  radiusTop?: boolean;
  style?: React.CSSProperties;
}

export function CopiaHomePromoBanner({ promotion, radiusTop = true, style }: Props) {
  const t = promotion?.template;
  if (!t) return null;
  const Icon = t.bannerIcon ? ICON_MAP[t.bannerIcon] : null;
  return (
    <div
      style={{
        background: t.bannerBgColor || '#4654CD',
        color: t.bannerTextColor || '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: PROMO_BANNER_HEIGHT,
        padding: '0 12px',
        fontWeight: 800,
        fontSize: 13,
        letterSpacing: '0.5px',
        borderTopLeftRadius: radiusTop ? 16 : 0,
        borderTopRightRadius: radiusTop ? 16 : 0,
        ...style,
      }}
    >
      {Icon && <Icon size={16} />}
      <span>{t.bannerText || 'OFERTA'}</span>
      {Icon && <Icon size={16} />}
    </div>
  );
}

export default CopiaHomePromoBanner;
