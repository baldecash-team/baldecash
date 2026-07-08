/**
 * MontoHero — bloque héroe del monto aprobado (BAL-2184).
 *
 * Fondo lila (`lilac`), etiqueta "TU MONTO APROBADO" en teal con tracking
 * amplio, y el monto en Baloo 2 800 46px índigo + "/mes" en gris medio.
 * Copiado 1:1 del mock (docs/superpowers/design-refs/mock-index.html,
 * líneas ~68-71).
 *
 * Puramente presentacional: recibe el monto ya calculado, no formatea moneda
 * ni hace fetch.
 */
import { OFERTA_COLORS } from './ofertaTheme';

interface MontoHeroProps {
  /** Monto mensual aprobado, ya en soles (sin formatear). */
  monto: number;
}

export function MontoHero({ monto }: MontoHeroProps) {
  const montoFormateado = Math.round(monto).toLocaleString('es-PE');

  return (
    <div
      className="rounded-[22px] px-6 py-[22px]"
      style={{ backgroundColor: OFERTA_COLORS.lilac }}
    >
      <div
        className="text-[11.5px] font-bold tracking-[.11em]"
        style={{ color: OFERTA_COLORS.tealBrand }}
      >
        TU MONTO APROBADO
      </div>
      <div
        className="mt-1.5 font-['Baloo_2',_sans-serif] text-[46px] font-extrabold leading-none"
        style={{ color: OFERTA_COLORS.primary }}
      >
        S/{montoFormateado}
        <span
          className="text-[22px] font-semibold"
          style={{ color: OFERTA_COLORS.textMid }}
        >
          /mes
        </span>
      </div>
    </div>
  );
}
