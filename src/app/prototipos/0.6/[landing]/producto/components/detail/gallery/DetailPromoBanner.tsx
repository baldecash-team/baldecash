'use client';

/**
 * DetailPromoBanner — el sello de promoción en la ficha del producto (BAL-3922).
 *
 * El backend ya mandaba `product.promotion` en el detalle público, pero el
 * front lo descartaba: el mismo equipo salía con sello en el catálogo y sin
 * sello en su propia página. Este componente pinta ESE sello, con el texto,
 * los colores y el ícono de la plantilla — exactamente los mismos datos y el
 * mismo criterio que usa la card del catálogo (`ProductCard`), de donde se
 * reutiliza el mapa de íconos para que no se abran dos catálogos de íconos.
 *
 * Va como barra superior de la caja de galería, o sea arriba del todo de la
 * ficha: no compite con el precio ni con el botón de compra (que viven en la
 * columna derecha) y el `overflow-hidden` de la caja ya le da las esquinas
 * redondeadas. Sin plantilla devuelve null y la página queda igual que antes.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { PROMO_BANNER_ICONS } from '@/app/prototipos/0.6/[landing]/catalogo/components/catalog/cards/ProductCard';
import type { ProductPromotion } from '../../../types/detail';

interface Props {
  promotion?: ProductPromotion | null;
}

export const DetailPromoBanner: React.FC<Props> = ({ promotion }) => {
  const t = promotion?.template;
  // Sin plantilla no hay nada que pintar: una barra con los colores por defecto
  // y la palabra "OFERTA" sería un sello que nadie configuró.
  if (!t) return null;

  // Mismos respaldos que la card del catálogo: si el admin dejó un color en
  // blanco, cae al primario de la landing en vez de a un hex quemado.
  const bg = t.bannerBgColor || 'var(--color-primary)';
  const fg = t.bannerTextColor || '#FFFFFF';
  const Icon = t.bannerIcon ? PROMO_BANNER_ICONS[t.bannerIcon] : null;

  return (
    <div
      data-testid="detail-promo-banner"
      className="w-full px-4 py-2.5 flex items-center justify-center gap-2.5"
      style={{
        background: `linear-gradient(135deg, ${bg} 0%, ${bg}cc 50%, ${bg} 100%)`,
        backgroundColor: bg,
        color: fg,
      }}
    >
      {Icon && (
        <motion.div
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon className="w-5 h-5" color={fg} />
        </motion.div>
      )}
      <span
        className="text-base font-black tracking-widest uppercase text-center"
        style={{ color: fg, textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}
      >
        {t.bannerText}
      </span>
      {Icon && (
        <motion.div
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon className="w-5 h-5" color={fg} />
        </motion.div>
      )}
    </div>
  );
};

export default DetailPromoBanner;
