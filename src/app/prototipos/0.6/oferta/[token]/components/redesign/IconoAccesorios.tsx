/**
 * IconoAccesorios — ilustración compuesta de varios accesorios (BAL-2183,
 * feedback Emilio: "en añadir accesorios debería haber una imagen con varios
 * accesorios").
 *
 * SVG inline (sin assets externos, respeta el CSP y el no-emoji): audífonos,
 * teclado, mouse y mochila agrupados, en la paleta índigo/teal del rediseño.
 * Puramente presentacional.
 */
import { OFERTA_COLORS } from './ofertaTheme';

export function IconoAccesorios({ size = 52 }: { size?: number }) {
  const indigo = OFERTA_COLORS.primary;
  const teal = OFERTA_COLORS.tealBrand;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      role="img"
    >
      {/* Audífonos (arriba izquierda) */}
      <path
        d="M14 30v-4a10 10 0 0 1 20 0v4"
        stroke={indigo}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="11.5" y="29" width="6" height="9" rx="2.4" fill={indigo} />
      <rect x="30.5" y="29" width="6" height="9" rx="2.4" fill={indigo} />

      {/* Mouse (arriba derecha) */}
      <rect x="43" y="16" width="13" height="19" rx="6.5" fill={teal} />
      <path d="M49.5 20v5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />

      {/* Teclado (centro-abajo) */}
      <rect x="10" y="43" width="30" height="14" rx="3" fill="#fff" stroke={indigo} strokeWidth="2.2" />
      <path
        d="M14 47h2M19 47h2M24 47h2M29 47h2M34 47h2M16 51h16"
        stroke={indigo}
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Mochila (abajo derecha) */}
      <path
        d="M45 45a7 7 0 0 1 14 0v10a2 2 0 0 1-2 2H47a2 2 0 0 1-2-2V45Z"
        fill={teal}
      />
      <path d="M49 45v-2a3 3 0 0 1 6 0v2" stroke="#fff" strokeWidth="1.8" fill="none" />
      <rect x="48.5" y="49" width="7" height="5" rx="1.4" fill="#fff" />
    </svg>
  );
}
