/**
 * Logo BaldeCash en SVG vectorial (mejora #9): reemplaza el PNG grande de baja resolución.
 * Escala con `className` (controla la altura). Isotipo de balde + wordmark en la fuente de marca.
 */
interface BaldeCashLogoProps {
  className?: string;
  /** Color del wordmark y el isotipo. Por defecto, el primario de marca. */
  color?: string;
  title?: string;
}

export function BaldeCashLogo({
  className = 'h-7 w-auto',
  color = '#4654CD',
  title = 'BaldeCash',
}: BaldeCashLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 196 44"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      {/* Isotipo: balde (trapecio) con asa */}
      <g fill="none" stroke={color} strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round">
        {/* Asa */}
        <path d="M13 13a9 9 0 0 1 18 0" />
        {/* Cuerpo del balde (trapecio) */}
        <path d="M9 13h26l-3.2 23.5a2 2 0 0 1-2 1.7H14.2a2 2 0 0 1-2-1.7L9 13z" fill={color} stroke="none" />
        {/* Brillo */}
        <path d="M17 19l-1.4 13" stroke="#ffffff" strokeWidth="2.4" opacity="0.6" />
      </g>
      {/* Wordmark */}
      <text
        x="46"
        y="30"
        fill={color}
        fontFamily="'Baloo 2', 'Asap', system-ui, sans-serif"
        fontSize="26"
        fontWeight="800"
        letterSpacing="-0.5"
      >
        baldecash
      </text>
    </svg>
  );
}
