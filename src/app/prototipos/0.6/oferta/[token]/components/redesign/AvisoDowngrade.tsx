/**
 * AvisoDowngrade — aviso ámbar del Caso 4 (BAL-2184).
 *
 * Copiado 1:1 del mock (docs/superpowers/design-refs/mock-index.html,
 * líneas ~324-327): caja `amberBg`/`amberBorder`, ícono de triángulo de
 * alerta, mensaje empático explicando que el equipo pedido no está
 * disponible y que se preparó una opción que sí entra en su monto.
 *
 * Puramente presentacional: recibe el nombre del equipo pedido, sin fetch
 * ni lógica.
 */
import { OFERTA_COLORS } from './ofertaTheme';

export interface AvisoDowngradeProps {
  /** Nombre del equipo que el cliente pidió originalmente. */
  equipoPedido: string;
}

export function AvisoDowngrade({ equipoPedido }: AvisoDowngradeProps) {
  return (
    <div
      className="flex items-start gap-2.5 rounded-[14px] border px-[13px] py-[11px]"
      style={{ backgroundColor: OFERTA_COLORS.amberBg, borderColor: OFERTA_COLORS.amberBorder }}
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        className="mt-0.5 flex-none"
        aria-hidden="true"
      >
        <path d="M12 3 1.5 21h21L12 3Z" stroke="#B45309" strokeWidth="1.9" strokeLinejoin="round" />
        <path d="M12 10v4" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="17.2" r="1.2" fill="#B45309" />
      </svg>
      <p className="text-[12px] leading-[1.4]" style={{ color: '#B45309' }}>
        El equipo que pediste ({equipoPedido}) no está disponible por ahora. Te
        preparamos esta opción que sí entra en tu monto.
      </p>
    </div>
  );
}
