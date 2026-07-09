/**
 * MontoAprobadoBar — bloque héroe del monto aprobado con barra de progreso
 * (BAL-2183, feedback Emilio).
 *
 * Fondo lila + monto aprobado grande (índigo, Baloo 2). La barra da CONTEXTO
 * útil: cuánto del monto aprobado usa el equipo destacado (recomendado en Caso
 * 4, exclusiva en Caso 5) y cuánto le queda para accesorios.
 *   - `usadoEquipo` presente → barra proporcional (usado/aprobado) + "te quedan
 *     S/X para accesorios".
 *   - `usadoEquipo` ausente/null → barra llena decorativa, sin restante.
 *
 * (Antes comparaba contra la cuota del equipo PEDIDO, que casi siempre es menor
 * al aprobado y no comunicaba nada útil — se reemplazó por la del destacado.)
 *
 * Puramente presentacional. No hace fetch.
 */
import { OFERTA_COLORS } from './ofertaTheme';

interface MontoAprobadoBarProps {
  /** Monto mensual aprobado, en soles. */
  aprobado: number;
  /** Cuota mensual del equipo destacado (recomendado/exclusiva). La barra
   *  muestra cuánto de tu monto usa ese equipo. Null → barra llena decorativa. */
  usadoEquipo?: number | null;
}

export function MontoAprobadoBar({ aprobado, usadoEquipo }: MontoAprobadoBarProps) {
  const fmt = (n: number) => Math.round(n).toLocaleString('es-PE');
  const tieneEquipo = usadoEquipo != null && usadoEquipo > 0 && aprobado > 0;
  const usado = tieneEquipo ? Math.min(usadoEquipo!, aprobado) : aprobado;
  const restante = tieneEquipo ? Math.max(0, aprobado - usadoEquipo!) : 0;
  const pct = aprobado > 0 ? Math.min(100, Math.round((usado / aprobado) * 100)) : 100;

  return (
    <div className="rounded-xl px-5 py-3.5 sm:px-6 sm:py-[22px]" style={{ backgroundColor: OFERTA_COLORS.lilac }}>
      <div
        className="text-[11.5px] font-bold tracking-[.11em]"
        style={{ color: OFERTA_COLORS.tealBrand }}
      >
        TU MONTO APROBADO
      </div>
      <div
        className="mt-1 font-['Baloo_2',_sans-serif] text-[34px] font-extrabold leading-none sm:mt-1.5 sm:text-[46px]"
        style={{ color: OFERTA_COLORS.primary }}
      >
        S/{fmt(aprobado)}
        <span className="text-[18px] font-semibold sm:text-[22px]" style={{ color: OFERTA_COLORS.textMid }}>
          /mes
        </span>
      </div>

      {/* Barra de progreso: cuánto usa el equipo destacado */}
      <div
        className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full sm:mt-4"
        style={{ backgroundColor: '#fff' }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: OFERTA_COLORS.primary }}
        />
      </div>

      {tieneEquipo ? (
        <p className="mt-2 text-[12px] leading-snug" style={{ color: OFERTA_COLORS.textMid }}>
          Este equipo usa{' '}
          <span className="font-bold" style={{ color: OFERTA_COLORS.textStrong }}>S/{fmt(usadoEquipo!)}</span>
          {restante > 0 ? (
            <>
              {' '}· te quedan{' '}
              <span className="font-bold" style={{ color: OFERTA_COLORS.greenDark }}>S/{fmt(restante)}</span>
              {' '}para accesorios
            </>
          ) : (
            <> de tu monto aprobado</>
          )}
        </p>
      ) : null}
    </div>
  );
}
