/**
 * MontoAprobadoBar — bloque héroe del monto aprobado con barra de progreso
 * (BAL-2183, feedback Emilio).
 *
 * Reusa el look del monto aprobado (fondo lila, monto grande índigo en Baloo 2)
 * y le agrega una barra de progreso:
 *   - Uso normal (dentro del monto): barra índigo hasta el % usado.
 *   - Exceso (la cuota del equipo pedido supera el aprobado, ej. 800 de 600):
 *     barra llena en ROJO + etiqueta "Usando S/800 de S/600" en rojo.
 *
 * Puramente presentacional: recibe monto aprobado y (opcional) el monto que el
 * estudiante quería gastar (cuota del equipo pedido). No hace fetch.
 */
import { OFERTA_COLORS } from './ofertaTheme';

const RED = '#DC2626';
const RED_SOFT = '#FEE2E2';

interface MontoAprobadoBarProps {
  /** Monto mensual aprobado, en soles. */
  aprobado: number;
  /** Cuota mensual del equipo que el estudiante pidió (lo que quería gastar).
   *  Si supera al aprobado, se muestra el exceso en rojo. Null → solo aprobado. */
  usado?: number | null;
}

export function MontoAprobadoBar({ aprobado, usado }: MontoAprobadoBarProps) {
  const fmt = (n: number) => Math.round(n).toLocaleString('es-PE');
  const excede = usado != null && usado > aprobado;
  // % de la barra: si excede, se llena al 100% (en rojo); si no, proporción usada.
  const pct =
    usado != null && aprobado > 0
      ? Math.min(100, Math.round((usado / aprobado) * 100))
      : 100;
  const barColor = excede ? RED : OFERTA_COLORS.primary;

  return (
    <div className="rounded-xl px-6 py-[22px]" style={{ backgroundColor: OFERTA_COLORS.lilac }}>
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
        S/{fmt(aprobado)}
        <span className="text-[22px] font-semibold" style={{ color: OFERTA_COLORS.textMid }}>
          /mes
        </span>
      </div>

      {/* Barra de progreso */}
      <div
        className="mt-4 h-2.5 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: '#fff' }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>

      {excede ? (
        <div
          className="mt-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
          style={{ backgroundColor: RED_SOFT, color: RED }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3 1.5 21h21L12 3Z" stroke={RED} strokeWidth="2" strokeLinejoin="round" />
            <path d="M12 10v4" stroke={RED} strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="12" cy="17.2" r="1.2" fill={RED} />
          </svg>
          El equipo que pediste cuesta S/{fmt(usado!)}/mes — se pasa de tu monto
        </div>
      ) : null}
    </div>
  );
}
