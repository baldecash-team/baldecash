/**
 * BadgeAprobada — pill verde "Aprobada" con check (BAL-2184).
 *
 * Copiado 1:1 del mock (docs/superpowers/design-refs/mock-index.html,
 * líneas ~62-64): fondo `greenBadgeBg`, texto `greenDark`, ícono de check.
 *
 * Puramente presentacional, sin props ni lógica.
 */
import { Check } from 'lucide-react';

import { OFERTA_COLORS } from './ofertaTheme';

export function BadgeAprobada() {
  return (
    <span
      className="inline-flex items-center gap-[5px] rounded-full px-[13px] py-1.5 text-[13px] font-semibold"
      style={{ backgroundColor: OFERTA_COLORS.greenBadgeBg, color: OFERTA_COLORS.greenDark }}
    >
      <Check className="h-3.5 w-3.5" strokeWidth={2.6} style={{ color: OFERTA_COLORS.greenDark }} />
      Aprobada
    </span>
  );
}
