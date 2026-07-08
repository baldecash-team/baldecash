/**
 * OfertaHeader — header del flujo de oferta rediseñado (BAL-2184).
 *
 * Logo BaldeCash bicolor centrado: ícono de "caja/balde" en índigo + teal,
 * seguido de "Balde" (índigo `indigoBrand`) + "Cash" (teal `tealBrand`) en
 * Baloo 2 800. Copiado 1:1 del SVG del mock
 * (docs/superpowers/design-refs/mock-index.html, líneas ~52-53).
 *
 * Puramente presentacional: sin lógica, sin fetch, sin props.
 */
import { OFERTA_COLORS } from './ofertaTheme';

export function OfertaHeader() {
  return (
    <header className="flex h-14 flex-none items-center justify-center gap-[7px] border-b border-[#F1F2F7]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="2"
          y="6"
          width="20"
          height="14"
          rx="3.5"
          fill={OFERTA_COLORS.lilac}
          stroke={OFERTA_COLORS.tealBrand}
          strokeWidth="1.7"
        />
        <path
          d="M2 9h13a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H2"
          fill="#fff"
          stroke={OFERTA_COLORS.tealBrand}
          strokeWidth="1.7"
        />
        <circle cx="16" cy="13" r="1.7" fill={OFERTA_COLORS.primary} />
      </svg>
      <span
        className="font-['Baloo_2',_sans-serif] text-[20px] font-extrabold tracking-[-0.01em]"
      >
        <span style={{ color: OFERTA_COLORS.indigoBrand }}>Balde</span>
        <span style={{ color: OFERTA_COLORS.tealBrand }}>Cash</span>
      </span>
    </header>
  );
}
